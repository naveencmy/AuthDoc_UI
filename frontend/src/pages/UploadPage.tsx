import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { ingestDocument } from '@/lib/api';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FileUploadZone } from '@/components/FileUploadZone';
import { Button } from '@/components/ui/button';

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
      const documentIds: string[] = [];

      // Upload files one-by-one (contract-safe)
      for (const file of files) {
        const { document_id } = await ingestDocument(file);
        documentIds.push(document_id);
      }

      // 🔑 Persist batch IDs (CRITICAL FIX)
      sessionStorage.setItem(
        'authdoc:documentIds',
        JSON.stringify(documentIds)
      );

      // Navigate WITHOUT state
      navigate('/results');
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UploadPage;
