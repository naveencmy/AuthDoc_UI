import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ingestDocument } from '@/lib/api';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FileUploadZone } from '@/components/FileUploadZone';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const UploadPage = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /* Handlers                                                         */
  /* ---------------------------------------------------------------- */

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const documentIds: string[] = [];

      // Upload files ONE BY ONE (contract-correct)
      for (const file of files) {
        const { document_id } = await ingestDocument(file);
        documentIds.push(document_id);
      }

      // Navigate to results with collected document IDs
      navigate('/results', {
        state: { documentIds },
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-3xl">

          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">
              Batch Upload Academic Documents
            </h1>
            <p className="text-muted-foreground">
              Upload grade sheets for extraction and verification
            </p>
          </div>

          {/* Upload Card */}
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

          {/* Info */}
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
