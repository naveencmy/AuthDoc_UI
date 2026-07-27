# AuthDoc Backend

Dual-service backend: Node.js API server + Python OCR service.

## Architecture

```
Frontend → Node.js API → Python OCR Service
                ↓
        Verification Engine
                ↓
        Gemini AI Audit (optional)
```

## Services

### Node.js API (`backend/node/`)

| Component | Responsibility |
| :--- | :--- |
| Express server | REST endpoints, CORS, error handling |
| Multer middleware | File upload validation (type, size) |
| Verifier service | Rules-based grade verification |
| Python client | Forwards files to OCR service |
| AI audit service | Gemini-powered risk assessment |
| Document store | In-memory document cache |

**Run:**
```bash
cd backend/node
pnpm install
cp .env.example .env
pnpm dev
```

Server runs at `http://localhost:3000`.

### Python OCR Service (`backend/python/`)

| Component | Responsibility |
| :--- | :--- |
| FastAPI server | HTTP endpoints for OCR |
| Extractor | Tesseract + OpenCV image pipeline |
| Field parser | Regex-based grade extraction |

**Run:**
```bash
cd backend/python
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Service runs at `http://127.0.0.1:8000`.

## API Endpoints

### Node.js (port 3000)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/ingest` | Upload single document |
| POST | `/api/ingest/batch` | Upload multiple documents |
| POST | `/api/verify` | Verify single document |
| POST | `/api/verify/batch` | Batch verify documents |

### Python (port 8000)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/extract` | OCR single document |
| POST | `/extract/batch` | OCR multiple documents |

## Policy Configuration

Verification rules are defined in `src/config/policies.json`. Each entry maps a UMIS number to expected student data:

```json
{
  "UMIS_NUMBER": {
    "student_name": "STUDENT NAME",
    "subjects": {
      "SUBJECT_CODE": "EXPECTED_GRADE"
    }
  }
}
```

## Design Principles

- OCR output is treated as **untrusted candidate data**
- Missing data is **never guessed** — returned as `MISSING`
- All verification decisions are **explainable**
- System **never crashes** on OCR failure
- AI audit has a **local fallback** when Gemini is unavailable
