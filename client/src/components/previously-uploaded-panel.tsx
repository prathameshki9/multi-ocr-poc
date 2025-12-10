import React, { useState, useEffect } from 'react';
import Card from './ui/card';
import Button from './ui/button';
import { getAllDocuments, deleteDocument, type StoredDocument } from '@/utils/mockStorage';
import { cn } from '@/utils/utils';

type PreviouslyUploadedPanelProps = {
    onDocumentSelect?: (doc: StoredDocument) => void;
    onDocumentDeleted?: () => void;
};

const PreviouslyUploadedPanel: React.FC<PreviouslyUploadedPanelProps> = ({
    onDocumentSelect,
    onDocumentDeleted,
}) => {
    const [documents, setDocuments] = useState<StoredDocument[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

    // Load documents on mount and when dependencies change
    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = () => {
        const docs = getAllDocuments();
        setDocuments(docs);
    };

    const handleDelete = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();

        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                deleteDocument(id);
                loadDocuments();
                if (selectedDocId === id) {
                    setSelectedDocId(null);
                }
                onDocumentDeleted?.();
            } catch (error) {
                console.error('Failed to delete document:', error);
                alert('Failed to delete document. Please try again.');
            }
        }
    };

    const handleDocumentClick = (doc: StoredDocument) => {
        setSelectedDocId(doc.id);
        onDocumentSelect?.(doc);
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') {
            return (
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
            );
        }
        return (
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
        );
    };

    return (
        <Card title="Previously Uploaded Documents" contentClassName="space-y-3">
            {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg
                        className="mb-4 h-16 w-16 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-sm font-medium text-slate-600">No documents uploaded yet</p>
                    <p className="mt-1 text-xs text-slate-500">
                        Upload and extract a document to see it here
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-xs text-slate-500">
                        {documents.length} {documents.length === 1 ? 'document' : 'documents'} stored
                    </p>
                    <div className="max-h-96 space-y-2 overflow-y-auto">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => handleDocumentClick(doc)}
                                className={cn(
                                    'group flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:border-indigo-300 hover:bg-indigo-50/50',
                                    selectedDocId === doc.id
                                        ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                                        : 'border-slate-200 bg-white'
                                )}
                            >
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                    <div className="mt-0.5 flex-shrink-0">{getFileIcon(doc.fileName)}</div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-800">
                                            {doc.fileName}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Uploaded {formatDate(doc.uploadedAt)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={(e) => handleDelete(doc.id, e)}
                                    className={cn(
                                        'ml-3 flex-shrink-0 border-red-200 px-3 py-1.5 text-xs text-red-600 opacity-0 transition-opacity hover:border-red-300 hover:bg-red-50 hover:text-red-700 group-hover:opacity-100',
                                        selectedDocId === doc.id && 'opacity-100'
                                    )}
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    Delete
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default PreviouslyUploadedPanel;
