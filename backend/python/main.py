from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
import tempfile
import shutil
import os
import logging

from extractor import run_ocr

# --- Logging ---
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format='{"timestamp":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}',
)
logger = logging.getLogger("authdoc.ocr")

app = FastAPI(title="AuthDoc OCR Service", version="1.0.0")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


# --- Health checks ---
@app.get("/healthz")
async def healthz():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/readyz")
async def readyz():
    return {"status": "ready"}


# --- Helpers ---
def save_temp_file(upload: UploadFile) -> str:
    suffix = os.path.splitext(upload.filename)[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(upload.file, tmp)
        return tmp.name


# --- Routes ---
@app.post("/extract")
async def extract_single(file: UploadFile = File(...)):
    path = save_temp_file(file)
    logger.info("ocr_started file=%s", file.filename)

    try:
        extracted = run_ocr(path)
    finally:
        os.remove(path)

    logger.info("ocr_completed file=%s fields=%d", file.filename, len(extracted))
    return extracted


@app.post("/extract/batch")
async def extract_batch(files: List[UploadFile] = File(...)):
    results = []

    for file in files:
        path = save_temp_file(file)

        try:
            extracted = run_ocr(path)
        finally:
            os.remove(path)

        results.append({
            "filename": file.filename,
            "extracted": extracted,
        })

    logger.info("ocr_batch_completed count=%d", len(results))
    return {"count": len(results), "documents": results}
