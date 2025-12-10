import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import Navbar from '@/components/navbar';
import UploadPanel from '@/components/upload-panel';
import DocumentPreview from '@/components/document-preview';
import ExtractedResults from '@/components/extracted-results';
import PreviouslyUploadedPanel from '@/components/previously-uploaded-panel';
import { saveDocument, base64ToFile, type StoredDocument } from '@/utils/mockStorage';

type LayoutItem = {
  type: string;
  page: number;
  confidence?: number;
  geometry?: unknown;
  text?: string;
  table_data?: Array<Array<{
    text: string;
    rowIndex: number;
    columnIndex: number;
    [key: string]: unknown;
  }>>;
};

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<LayoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (selected: File | null) => {
    setFile(selected);
    setExtracted([]);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  };

  const handleDocumentSelect = (doc: StoredDocument) => {
    try {
      const fileObj = base64ToFile(doc.fileData, doc.fileName);
      setFile(fileObj);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const newUrl = URL.createObjectURL(fileObj);
      setPreviewUrl(newUrl);

      setExtracted(doc.extractionResult as LayoutItem[]);
      setError(null);
    } catch (err) {
      console.error('Error loading previous document:', err);
      setError('Failed to load selected document.');
    }
  };

  const handleDocumentDeleted = () => {
    // Optional: Clear selection if the deleted doc was selected
    // For better UX, we might want to keep the current view or clear it.
    // Here we'll just leave the current view as is, unless the user selects another.
  };

  const handleExtract = async () => {
    if (!file) {
      setError('Please choose a PDF or image first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('http://127.0.0.1:8000/api/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Extract LayoutData from the response
      // Response structure: { message: { status, message, data: LayoutData[] } }
      const message = response.data?.message;
      const layoutData = message?.data || [];

      if (Array.isArray(layoutData)) {
        setExtracted(layoutData as LayoutItem[]);
        // Save to mock storage
        saveDocument(file, layoutData).catch((err) =>
          console.error('Failed to save to mock storage:', err)
        );
      } else {
        setExtracted([]);
        setError('Unexpected response format from server');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to extract text. Please try again.'
      );
      setExtracted([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <section id="upload" className="flex flex-col gap-6">
          <UploadPanel
            fileName={file?.name ?? null}
            isLoading={isLoading}
            error={error}
            onFileChange={handleFileChange}
            onExtract={handleExtract}
          />
          <PreviouslyUploadedPanel
            onDocumentSelect={handleDocumentSelect}
            onDocumentDeleted={handleDocumentDeleted}
          />
        </section>

        <section id="results" className="grid gap-6 md:grid-cols-2">
          <DocumentPreview file={file} previewUrl={previewUrl} />
          <ExtractedResults extracted={extracted} isLoading={isLoading} error={error} />
        </section>
      </main>
    </div>
  );
};

export default Home;

