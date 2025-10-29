import { useRef, useState, useEffect, useCallback } from 'react';

import { Upload } from 'lucide-react';

import { Card } from '@components/ui/card';
import { cn } from '@utils/cn';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

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
    <div className="mb-12">
      <Card
        onClick={handleClick}
        className={cn(
          'flex min-h-[200px] cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-primary/5',
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
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drop XLSX file here, click to select, or paste from clipboard
          </p>
          <p className="text-xs text-muted-foreground">
            Only .xlsx files are supported
          </p>
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
