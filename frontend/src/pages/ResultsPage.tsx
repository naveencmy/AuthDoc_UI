import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatusBadge } from '@/components/StatusBadge';
import { batchVerifyDocuments } from '@/lib/api';
import type { VerificationStatus } from '@/lib/api';

interface BatchCandidate {
  document_id: string;
  overall_status: VerificationStatus;
  fields: Record<string, VerificationStatus>;
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const documentIds: string[] = location.state?.documentIds ?? [];

  const [candidates, setCandidates] = useState<BatchCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documentIds.length === 0) {
      setError('No documents to verify');
      setLoading(false);
      return;
    }

    batchVerifyDocuments(documentIds, 'strict')
      .then(res => setCandidates(res.candidates))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [documentIds]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="p-8 text-center">Verifying documents…</main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="p-8 text-center text-destructive">
          {error}
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-5xl">
          <h1 className="mb-6 text-2xl font-bold">
            Batch Verification Results
          </h1>

          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm">Document ID</th>
                  <th className="px-6 py-3 text-left text-sm">Overall Status</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => (
                  <tr
                    key={candidate.document_id}
                    onClick={() =>
                      navigate(`/results/${candidate.document_id}`)
                    }
                    className="cursor-pointer border-b hover:bg-secondary/30"
                  >
                    <td className="px-6 py-4 font-mono text-sm">
                      {candidate.document_id}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={candidate.overall_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResultsPage;
