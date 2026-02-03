import { useCallback, useState } from 'react';
import { Cloud, FileUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFormats?: string[];
  maxFiles?: number;
  className?: string;
}

export function FileUploadZone({
  onFilesSelected,
  acceptedFormats = ['PDF', 'PNG', 'JPG', 'JPEG'],
  maxFiles = 20,
  className,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const acceptString = acceptedFormats
    .map((f) => `.${f.toLowerCase()}`)
    .join(',');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      setFiles(droppedFiles);
      onFilesSelected(droppedFiles);
    },
    [maxFiles, onFilesSelected]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
        ? Array.from(e.target.files).slice(0, maxFiles)
        : [];
      setFiles(selectedFiles);
      onFilesSelected(selectedFiles);
    },
    [maxFiles, onFilesSelected]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [files, onFilesSelected]
  );

  return (
    <div className={cn('space-y-4', className)}>
      <label
        className={cn(
          'flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          accept={acceptString}
          multiple
          onChange={handleFileSelect}
        />
        <Cloud className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="mb-1 text-lg font-medium text-foreground">
          Upload semester grade sheets
        </p>
        <p className="mb-2 text-sm text-muted-foreground">
          Drag and drop one or more files, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          Supported formats: {acceptedFormats.join(', ')}
        </p>
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <FileUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="rounded-full p-1 hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
