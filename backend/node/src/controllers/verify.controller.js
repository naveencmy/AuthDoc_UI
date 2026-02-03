const { randomUUID } = require("crypto");
const policies = require("../config/policies.json");
const store = require("../store/documentStore");
const { sendToOCR } = require("../services/pythonClient");
const { verify } = require("../services/verifier.service");
const {
  mapSingleVerification
} = require("../utils/responseMapper");

/**
 * Ingest document → OCR → store extracted data
 */
exports.ingest = async (req, res) => {
  const documentId = randomUUID();

  if (!req.file) {
    return res.status(400).json({
      error: "File missing. Use multipart/form-data with key 'file'"
    });
  }

  try {
    const extracted = await sendToOCR(req.file);
    store.save(documentId, extracted);
  } catch (err) {
    console.error("OCR failed:", err.message);
    store.save(documentId, {});
  }

  res.status(201).json({ document_id: documentId });
};


/**
 * Single document verification (CLEAN RESPONSE)
 */
exports.verifySingle = (req, res) => {
  const { document_id, policy_id } = req.body;

  const policy = policies[policy_id];
  if (!policy) {
    return res.status(400).json({
      error: `Invalid policy_id: ${policy_id}`
    });
  }

  const data = store.get(document_id);
  if (!data) {
    return res.status(404).json({
      error: `Document not found: ${document_id}`
    });
  }

  // Internal full verification
  const results = verify(data, policy);

  // 🔥 Production response
  const response = mapSingleVerification(document_id, results);

  res.json(response);
};

/**
 * Batch verification (SUMMARY ONLY)
 */
exports.verifyBatch = (req, res) => {
  const { document_ids, policy_id } = req.body;

  const policy = policies[policy_id];
  if (!policy) {
    return res.status(400).json({
      error: `Invalid policy_id: ${policy_id}`
    });
  }

  const candidates = document_ids.map((id) => {
    const data = store.get(id) || {};
    const results = verify(data, policy);

    let overall_status = "VERIFIED";
    const fields = {};

    for (const field of policy.required_fields) {
      const status = results[field]?.status || "MISSING";
      fields[field] = status;

      if (status === "MISSING") overall_status = "MISSING";
      else if (status === "FLAGGED" && overall_status !== "MISSING") {
        overall_status = "FLAGGED";
      }
    }

    return {
      document_id: id,
      overall_status,
      fields
    };
  });

  res.json({ candidates });
};
