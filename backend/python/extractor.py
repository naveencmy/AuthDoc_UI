import pytesseract
from PIL import Image, ImageEnhance
import cv2
import numpy as np
import re

pytesseract.pytesseract.tesseract_cmd = r"D:\products\AuthDoc\tesseract\tesseract.exe"


def preprocess_image(path: str):
    img = Image.open(path).convert("L")

    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.5)

    img = np.array(img)

    img = cv2.fastNlMeansDenoising(img, None, 20, 7, 21)

    return img


def validate_image(img):
    h, w = img.shape
    if w < 800 or h < 1000:
        return False, "Image resolution too low for OCR"
    return True, None


def normalize(text: str):
    return re.sub(r"\s+", " ", text.replace("(", " ").replace(")", " "))

def to_float(value: str):
    return float(value.replace(",", "."))

def extract_fields(text: str):
    text = normalize(text)

    def find(pattern):
        m = re.search(pattern, text, re.I)
        return m.group(1).strip() if m else None

    gpa = re.search(
        r"(GPA|GEA|GRADE POINT AVERAGE|GRADE POINT AVORAG[E|O])[^0-9]{0,20}([\d]+[.,][\d]+)",
        text,
        re.I
        )

    cgpa = re.search(
    r"(CGPA|COPA|CUMULATIVE GRADE POINT AVERAGE|CUMULATIVE GRADE POINT AVORAG[E|O])[^0-9]{0,20}([\d]+[.,][\d]+)",
    text,re.I
    )
    subjects = re.findall(
    r"\b([A-Z]{2,4}\d{2,4})\s+[A-Z &]+\s+\d+\s+\d+\s+([A-Z+])",
    text
)

    subject_grades = [
    {"code": c, "grade": g}
    for c, g in subjects
]



    return {
        "student_name": find(r"NAME\s+OF\s+THE\s+CANDI[A-Z]{2,4}\s+([A-Z ]+)"),
        "register_number": find(r"REGISTER\s*NO\s*[:\-]?\s*([A-Z0-9]+)"),
        "programme_or_branch": find(r"PROGRAMME\s*&?\s*BRANCH\s*[:\-]?\s*([A-Z .]+)"),
        "semester": find(r"(FIRST|SECOND|THIRD|FOURTH)\s+SEMESTER"),
        "subject_grades": subject_grades if subject_grades else [],
        "gpa": to_float(gpa.group(2)) if gpa else None,
        "cgpa": to_float(cgpa.group(2)) if cgpa else None,

    }


def run_ocr(path: str):
    print(">>> OCR FUNCTION ENTERED <<<", path)

    try:
        img = preprocess_image(path)

        ok, err = validate_image(img)
        if not ok:
            return {"error": err}

        text = pytesseract.image_to_string(
            img,
            lang="eng",
            config="--oem 3 --psm 6"
        )

        print("==== OCR RAW TEXT START ====")
        print(text)
        print("==== OCR RAW TEXT END ====")

        return extract_fields(text)

    except Exception as e:
        print("OCR ERROR:", e)
        return {"error": "OCR failed"}
