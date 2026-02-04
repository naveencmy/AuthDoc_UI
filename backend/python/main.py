from fastapi import FastAPI, UploadFile, File
from typing import List
import tempfile
import shutil
import os

from extractor import run_ocr

app = FastAPI(title="AuthDoc OCR Service")


def save_temp_file(upload: UploadFile) -> str:
    """
    Save uploaded file to a unique temp path and return path.
    """
    suffix = os.path.splitext(upload.filename)[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(upload.file, tmp)
        return tmp.name


@app.post("/extract")
async def extract_single(file: UploadFile = File(...)):
    """
    OCR a SINGLE document.
    Used by Node.js ingestion.
    """
    path = save_temp_file(file)

    try:
        extracted = run_ocr(path)
    finally:
        os.remove(path)

    return extracted


@app.post("/extract/batch")
async def extract_batch(files: List[UploadFile] = File(...)):
    """
    OCR MULTIPLE documents safely.
    Each document is processed independently.
    """
    results = []

    for file in files:
        path = save_temp_file(file)

        try:
            extracted = run_ocr(path)
        finally:
            os.remove(path)

        results.append({
            "filename": file.filename,
            "extracted": extracted
        })

    return {
        "count": len(results),
        "documents": results
    }
