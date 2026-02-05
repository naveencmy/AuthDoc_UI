const { randomUUID } = require("crypto");
const store = require("../store/documentStore");
const { sendToOCR } = require("../services/pythonClient");
const { verify } = require("../services/verifier.service");

// Single ingest
exports.ingest = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  const document_id = randomUUID();

  try {
    const extracted = await sendToOCR(req.file);
    store.save(document_id, extracted);
  } catch {
    store.save(document_id, {});
  }

  res.status(201).json({ document_id });
};

// Batch ingest
exports.ingestBatch = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const docs = [];

  for (const file of req.files) {
    const document_id = randomUUID();
    const extracted = await sendToOCR(file);
    store.save(document_id, extracted);
    docs.push({ document_id });
  }

  res.status(201).json({ documents: docs });
};

// Verify
exports.verifySingle = (req, res) => {
  const { document_id } = req.body;

  const data = store.get(document_id);
  if (!data) {
    return res.status(404).json({ error: "Document not found" });
  }

  const result = verify(data);

  res.json({
    document_id,
    verification: result
  });
};
