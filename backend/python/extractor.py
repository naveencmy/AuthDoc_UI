import pytesseract
from PIL import Image, ImageEnhance
import cv2
import numpy as np
import re

# ⚠️ Move this to env var in real prod
pytesseract.pytesseract.tesseract_cmd = r"D:\products\AuthDoc\tesseract\tesseract.exe"


# -----------------------------
# Image preprocessing
# -----------------------------
def preprocess_image(path: str):
    img = Image.open(path).convert("L")
    img = ImageEnhance.Contrast(img).enhance(2.5)
    img = np.array(img)
    img = cv2.fastNlMeansDenoising(img, None, 20, 7, 21)
    return img


def validate_image(img):
    h, w = img.shape
    if w < 800 or h < 1000:
        return False
    return True


# -----------------------------
# Helpers
# -----------------------------
def normalize(text: str):
    return re.sub(r"\s+", " ", text.replace("(", " ").replace(")", " "))


def to_float(v: str):
    return float(v.replace(",", "."))


# -----------------------------
# Field extraction
# -----------------------------
def extract_fields(text: str):
    text = normalize(text)

    def find(pattern):
        m = re.search(pattern, text, re.I)
        return m.group(1).strip() if m else None

    umis_no = find(r"UMIS\s*NO\s*[:\-]?\s*(\d+)")

    # GPA
    gpa_match = re.search(
        r"GRADE POINT AVERAGE\s*\(GPA\)[^0-9]*([\d]+[.,][\d]+)",
        text,
        re.I
    )
    gpa = to_float(gpa_match.group(1)) if gpa_match else None

    # CGPA
    cgpa_match = re.search(
        r"CUMULATIVE GRADE POINT AVERAGE\s*\(CGPA\)[^0-9]*([\d]+[.,][\d]+)",
        text,
        re.I
    )

    if cgpa_match:
        cgpa = to_float(cgpa_match.group(1))
    elif re.search(r"CGPA\s*[\*\.]{2,}", text):
        cgpa = "WITHHELD"
    else:
        cgpa = None

    # Subjects
    subjects = re.findall(
        r"\b([A-Z]{2,4}\d{2,4})\s+[A-Z &]+.*?\s+([A-Z]{1,2}\+?)",
        text
    )

    subject_grades = [{"code": c, "grade": g} for c, g in subjects]

    return {
        "umis_no": umis_no,
        "subject_grades": subject_grades,
        "gpa": gpa,
        "cgpa": cgpa
    }


# -----------------------------
# OCR entry point
# -----------------------------
def run_ocr(path: str):
    try:
        img = preprocess_image(path)

        if not validate_image(img):
            return {
                "umis_no": None,
                "subject_grades": [],
                "gpa": None,
                "cgpa": None
            }

        text = pytesseract.image_to_string(
            img,
            lang="eng",
            config="--oem 3 --psm 6"
        )

        return extract_fields(text)

    except Exception as e:
        print("OCR ERROR:", e)
        return {
            "umis_no": None,
            "subject_grades": [],
            "gpa": None,
            "cgpa": None
        }
