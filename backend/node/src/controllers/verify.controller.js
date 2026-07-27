const { randomUUID } = require("crypto");
const store = require("../store/documentStore");
const { sendToOCR } = require("../services/pythonClient");
const { verify } = require("../services/verifier.service");
const { generateAudit } = require("../services/aiAuditService");

/* ------------------------------------------------------------------ */
/* Helper: Safe verification wrapper                                  */
/* ------------------------------------------------------------------ */

function safeVerify(data) {
  try {
    return verify(data);
  } catch (err) {
    return {
      overall_status: "FLAGGED",
      reason: "Verification engine error"
    };
  }
}

/* ------------------------------------------------------------------ */
/* Helper: Build field-level response                                 */
/* ------------------------------------------------------------------ */

function buildFieldResults(data, verification) {
  const status = verification.overall_status || "MISSING";
  const reason =
    verification.reason ||
    (verification.mismatches ? "Subject mismatches found" : "Not evaluated");

  return {
    gpa: {
      value: data.gpa ?? null,
      status,
      reason
    },
    cgpa: {
      value: data.cgpa ?? null,
      status,
      reason
    },
    umis_no: {
      value: data.umis_no ?? null,
      status: data.umis_no ? status : "MISSING",
      reason: data.umis_no
        ? "UMIS extracted"
        : "UMIS number not detected"
    }
  };
}

/* ------------------------------------------------------------------ */
/* Single Document Ingest                                             */
/* ------------------------------------------------------------------ */

exports.ingest = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "File is required"
      });
    }

    const document_id = randomUUID();

    let extracted = {};

    try {
      extracted = await sendToOCR(req.file);
    } catch {
      extracted = {};
    }

    store.save(document_id, extracted);

    return res.status(201).json({ document_id });

  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* Batch Document Ingest                                              */
/* ------------------------------------------------------------------ */

exports.ingestBatch = async (req, res, next) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded"
      });
    }

    const documents = [];

    for (const file of req.files) {
      const document_id = randomUUID();

      let extracted = {};

      try {
        extracted = await sendToOCR(file);
      } catch {
        extracted = {};
      }

      store.save(document_id, extracted);

      documents.push({ document_id });
    }

    return res.status(201).json({
      count: documents.length,
      documents
    });

  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ */
/* Verify Single Document                                             */
/* ------------------------------------------------------------------ */

exports.verifySingle = async (req, res, next) => {
  try {
    const { document_id } = req.body;

    if (!document_id) {
      return res.status(400).json({
        error: "document_id is required"
      });
    }

    const data = store.get(document_id);

    if (!data) {
      return res.status(404).json({
        error: "Document not found"
      });
    }

    const verification = safeVerify(data);

    const results = buildFieldResults(data, verification);

    const ai_audit = await generateAudit(verification);

    return res.json({
      document_id,
      results,            // ✅ THIS FIXES YOUR FRONTEND
      verification,
      ai_audit
    });

  } catch (err) {
    next(err);
  }
};



/* ------------------------------------------------------------------ */
/* Verify Batch Documents                                             */
/* ------------------------------------------------------------------ */

exports.verifyBatch = async (req, res, next) => {
  try {
    const { document_ids } = req.body;

    if (!document_ids || !Array.isArray(document_ids)) {
      return res.status(400).json({
        error: "document_ids must be an array"
      });
    }

    const candidates = [];

    for (const id of document_ids) {
      const data = store.get(id);

      if (!data) {
        candidates.push({
          document_id: id,
          overall_status: "MISSING"
        });
        continue;
      }

      const verification = safeVerify(data);

      candidates.push({
        document_id: id,
        overall_status: verification.overall_status
      });
    }

    return res.json({ candidates });

  } catch (err) {
    next(err);
  }
};