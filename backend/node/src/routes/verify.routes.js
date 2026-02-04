const express = require("express");
const router = express.Router();

const {
  singleUpload,
  batchUpload
} = require("../middleware/upload.middleware");

const controller = require("../controllers/verify.controller");

// Single document ingest
router.post(
  "/ingest",
  singleUpload,
  controller.ingest
);

// Batch document ingest
router.post(
  "/ingest/batch",
  batchUpload,
  controller.ingestBatch
);

router.post("/verify", controller.verifySingle);
router.post("/verify/batch", controller.verifyBatch);

module.exports = router;
