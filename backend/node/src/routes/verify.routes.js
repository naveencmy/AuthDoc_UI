const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload.middleware");
const controller = require("../controllers/verify.controller");

router.post(
  "/ingest",
  upload.single("file"),
  controller.ingest
);

router.post("/verify", controller.verifySingle);
router.post("/verify/batch", controller.verifyBatch);

module.exports = router;
