import React, { useMemo } from 'react';
import Card from './ui/card';

type DocumentPreviewProps = {
  file?: File | null;
  previewUrl?: string | null;
};

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file, previewUrl }) => {
  const content = useMemo(() => {
    if (!previewUrl) {
      return (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
          Upload a PDF or image to preview it here.
        </div>
      );
    }

    if (file?.type === 'application/pdf') {
      return (
        <iframe
          title="Document preview"
          src={previewUrl}
          className="h-full w-full rounded-xl border bg-white"
        />
      );
    }

    return (
      <img
        src={previewUrl}
        alt={file?.name ?? 'Uploaded document'}
        className="h-full w-full rounded-xl border bg-white object-contain"
      />
    );
  }, [file?.name, file?.type, previewUrl]);

  return (
    <Card title="Document preview" contentClassName="h-[520px] p-0">
      <div className="h-full p-5">{content}</div>
    </Card>
  );
};

export default DocumentPreview;

