import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';

import { verifyDocument } from '@/lib/api';
import type { VerificationStatus } from '@/lib/api';

/* ------------------------------------------------------------------ */
/* Types – guaranteed by backend                                      */
/* ------------------------------------------------------------------ */

interface FieldResult {
  value: number | null;
  status: VerificationStatus;
  reason: string;
}

interface VerifyResponse {
  document_id: string;
  results: Record<string, FieldResult>;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

const DetailPage = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /* Fetch verification                                               */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!documentId) {
      setError('Invalid document ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    verifyDocument(documentId, 'strict')
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [documentId]);

  /* ---------------------------------------------------------------- */
  /* States                                                           */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading verification...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-destructive">{error ?? 'No data found'}</p>
        </main>
        <Footer />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-4xl">

          {/* Back */}
          <button
            onClick={() => navigate('/results')}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Batch Results
          </button>

          {/* Header */}
          <h1 className="mb-6 text-2xl font-bold">
            Verification Details
          </h1>

          {/* Field-level results */}
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="px-6 py-3 text-left text-sm text-muted-foreground">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-muted-foreground">
                    Extracted Value
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm text-muted-foreground">
                    Reason
                  </th>
                </tr>
              </thead>

              <tbody>
                {Object.entries(data.results).map(([field, result], index, arr) => (
                  <tr
                    key={field}
                    className={`border-b ${
                      index === arr.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium">
                      {field.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {result.value ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={result.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {result.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Back button */}
          <div className="mt-8">
            <Button variant="outline" onClick={() => navigate('/results')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Batch Results
            </Button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DetailPage;
