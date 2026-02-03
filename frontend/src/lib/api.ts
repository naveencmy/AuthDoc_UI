// AuthDoc API Service Layer (Production Grade)

/* ------------------------------------------------------------------ */
/* Base Configuration                                                  */
/* ------------------------------------------------------------------ */

const API_BASE_URL = 'http://localhost:3000/api';

/* ------------------------------------------------------------------ */
/* Domain Types (Canonical)                                            */
/* ------------------------------------------------------------------ */

export type VerificationStatus = 'VERIFIED' | 'FLAGGED' | 'MISSING';

export interface VerificationField {
  value: number | null;            // Contract-guaranteed
  status: VerificationStatus;      // Source of truth
  reason: string;                  // Human explanation
}

export interface VerificationResults {
  document_id: string;
  results: Record<string, VerificationField>;
}

export interface BatchCandidate {
  document_id: string;
  overall_status: VerificationStatus;
  fields: Record<string, VerificationStatus>;
}

export interface BatchVerificationResponse {
  candidates: BatchCandidate[];
}

export interface IngestResponse {
  document_id: string;
}

/* ------------------------------------------------------------------ */
/* Internal helper                                                     */
/* ------------------------------------------------------------------ */

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.error === 'string'
        ? data.error
        : response.statusText;

    throw new Error(message);
  }

  return data;
}

/* ------------------------------------------------------------------ */
/* API Calls                                                          */
/* ------------------------------------------------------------------ */

/**
 * Upload and ingest a document
 * Upload NEVER fails by contract
 */
export async function ingestDocument(file: File): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/ingest`, {
    method: 'POST',
    body: formData,
  });

  return parseJsonResponse<IngestResponse>(response);
}

/**
 * Verify a single document using a policy
 */
export async function verifyDocument(
  documentId: string,
  policyId: string = 'strict'
): Promise<VerificationResults> {
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      document_id: documentId,
      policy_id: policyId,
    }),
  });

  return parseJsonResponse<VerificationResults>(response);
}

/**
 * Batch verify multiple documents (summary only)
 */
export async function batchVerifyDocuments(
  documentIds: string[],
  policyId: string = 'strict'
): Promise<BatchVerificationResponse> {
  const response = await fetch(`${API_BASE_URL}/verify/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      document_ids: documentIds,
      policy_id: policyId,
    }),
  });

  return parseJsonResponse<BatchVerificationResponse>(response);
}

/**
 * Upload and verify multiple documents sequentially
 * Prototype-safe, DB-independent
 */
export async function uploadAndVerifyBatch(
  files: File[],
  policyId: string = 'strict',
  onProgress?: (current: number, total: number) => void
): Promise<BatchVerificationResponse> {
  const documentIds: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const { document_id } = await ingestDocument(files[i]);
    documentIds.push(document_id);
    onProgress?.(i + 1, files.length);
  }

  return batchVerifyDocuments(documentIds, policyId);
}
