import React from 'react';
import Button from './ui/button';
import Card from './ui/card';

type UploadPanelProps = {
  fileName: string | null;
  isLoading: boolean;
  error?: string | null;
  onFileChange: (file: File | null) => void;
  onExtract: () => void;
};

const UploadPanel: React.FC<UploadPanelProps> = ({
  fileName,
  isLoading,
  error,
  onFileChange,
  onExtract,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    onFileChange(selected);
  };

  return (
    <Card title="Upload a document" contentClassName="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Upload a document</h1>
          <p className="text-sm text-slate-500">
            Supported: PDF and common image formats (PNG, JPG).
          </p>
        </div>
        <div className="flex gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700">
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleInputChange}
              className="hidden"
            />
            Choose file
          </label>
          <Button type="button" onClick={onExtract} disabled={isLoading}>
            {isLoading ? 'Extracting…' : 'Extract'}
          </Button>
        </div>
      </div>
      <div className="text-sm text-slate-600">
        {fileName ? (
          <span className="font-medium text-slate-800">Selected: {fileName}</span>
        ) : (
          <span className="text-slate-500">No file selected yet.</span>
        )}
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </Card>
  );
};

export default UploadPanel;

