import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatsCard } from '@/components/StatsCard';

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

  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;

    const fetchVerification = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: documentId,
            policy_id: 'strict',
          }),
        });

        if (!res.ok) {
          throw new Error('Verification failed');
        }

        const json: VerifyResponse = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading verification…</p>
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-4xl">
          <h1 className="mb-6 text-2xl font-bold">
            Verification Details
          </h1>

          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(data.results).map(([field, result]) => (
              <StatsCard
                key={field}
                label={field.toUpperCase()}
                value={result.value ?? '—'}
                status={result.status}
                reason={result.reason}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DetailPage;
