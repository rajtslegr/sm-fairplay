import { useRef, useState, useEffect, useCallback } from 'react';

import { FileSpreadsheet, Plus, Trash2, Upload, X } from 'lucide-react';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { UploadedFileInfo } from '@store/useStore';
import { cn } from '@utils/cn';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFiles: UploadedFileInfo[];
  onRemoveFile: (fileName: string) => void;
  onReset: () => void;
  totalPlayers: number;
  totalMatches: number;
}

const FileUpload = ({
  onFileUpload,
  uploadedFiles,
  onRemoveFile,
  onReset,
  totalPlayers,
  totalMatches,
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const hasFiles = uploadedFiles.length > 0;

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragIn = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current += 1;
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const file = event.dataTransfer.files[0];
    if (
      file &&
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      onFileUpload(file);
    }
  };

  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i += 1) {
          if (items[i].kind === 'file') {
            const file = items[i].getAsFile();
            if (
              file &&
              file.type ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ) {
              onFileUpload(file);
              event.preventDefault();
              break;
            }
          }
        }
      }
    },
    [onFileUpload],
  );

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <div className="mb-12 w-full max-w-xl">
      {hasFiles && (
        <>
          <ul className="mb-3 space-y-2">
            {uploadedFiles.map((file) => (
              <li
                key={file.name}
                className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm"
              >
                <FileSpreadsheet className="size-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {file.playerCount} hráčů · {file.matchCount} zápasů
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(file.name)}
                  className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Odebrat ${file.name}`}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Celkem: {totalPlayers} hráčů · {totalMatches} zápasů
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="mr-1 size-3" />
              Zahodit vše
            </Button>
          </div>
        </>
      )}

      <Card
        onClick={handleClick}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-4 transition-colors hover:border-primary hover:bg-primary/5',
          hasFiles ? 'min-h-20' : 'min-h-50 p-6',
          {
            'border-primary bg-primary/10': isDragging,
            'border-border': !isDragging,
          },
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          {hasFiles ? (
            <>
              <Plus className="size-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Klikni nebo přetáhni další XLSX soubor
              </p>
            </>
          ) : (
            <>
              <Upload className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop XLSX file here, click to select, or paste from clipboard
              </p>
              <p className="text-xs text-muted-foreground">
                Only .xlsx files are supported
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx"
          className="hidden"
        />
      </Card>
    </div>
  );
};

export default FileUpload;
