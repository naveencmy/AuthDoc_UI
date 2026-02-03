from fastapi import FastAPI, UploadFile, File
import tempfile
import shutil
from extractor import run_ocr

app = FastAPI()


@app.post("/extract")
async def extract_document(file: UploadFile = File(...)):
    """
    Receives a document, runs OCR, returns extracted fields.
    """

    # Save file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
        shutil.copyfileobj(file.file, tmp)
        temp_path = tmp.name

    try:
        extracted_data = run_ocr(temp_path)
    except Exception as e:
        # OCR failure → return all fields as null (Node will mark MISSING)
        print("OCR ERROR:", e)
        extracted_data = {
            "student_name": None,
            "register_number": None,
            "programme_or_branch": None,
            "semester": None,
            "gpa": None,
            "cgpa": None,
            "result_status": None,
            "subject_grades": None
        }

    return extracted_data
