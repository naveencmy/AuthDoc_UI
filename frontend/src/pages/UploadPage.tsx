import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FileUploadZone } from '@/components/FileUploadZone';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

const UploadPage = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      let documentIds: string[] = [];

      // ─────────────────────────────────────────────
      // SINGLE FILE → /api/ingest
      // ─────────────────────────────────────────────
      if (files.length === 1) {
        const formData = new FormData();
        formData.append('file', files[0]);

        const res = await fetch(`${API_BASE_URL}/ingest`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        documentIds = [data.document_id];
      }

      // ─────────────────────────────────────────────
      // MULTIPLE FILES → /api/ingest/batch
      // ─────────────────────────────────────────────
      else {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });

        const res = await fetch(`${API_BASE_URL}/ingest/batch`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Batch upload failed');

        const data = await res.json();
        documentIds = data.documents.map(
          (d: { document_id: string }) => d.document_id
        );
      }

      // Navigate to batch results
      navigate('/results', {
        state: { documentIds },
      });

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-3xl">

          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">
              Batch Upload Academic Documents
            </h1>
            <p className="text-muted-foreground">
              Upload grade sheets for extraction and verification
            </p>
          </div>

          <div className="mb-8 rounded-xl border bg-card p-6 lg:p-8">
            <FileUploadZone onFilesSelected={handleFilesSelected} />

            {files.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button
                  size="lg"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="min-w-[180px]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    `Upload ${files.length} File${files.length > 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-4 font-semibold">
              What happens next?
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Files are uploaded and assigned document IDs</li>
              <li>2. AI extracts and verifies academic data</li>
              <li>3. Batch summary table is generated</li>
              <li>4. You can drill into any document for details</li>
            </ol>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadPage;
