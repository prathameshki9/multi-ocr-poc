import React from 'react';
import PreviouslyUploadedPanel from './previously-uploaded-panel';
import type { StoredDocument } from '@/utils/mockStorage';

type SidebarProps = {
    fileName: string | null;
    isLoading: boolean;
    error?: string | null;
    onFileChange: (file: File | null) => void;
    onExtract: () => void;
    onDocumentSelect: (doc: StoredDocument) => void;
    onDocumentDeleted: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({
    fileName,
    isLoading,
    error,
    onFileChange,
    onExtract,
    onDocumentSelect,
    onDocumentDeleted,
}) => {
    return (
        <aside className="z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-200 shadow-2xl">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 border-b border-slate-300 bg-slate-200 px-4 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-tight text-slate-900">OCR Tool</h1>
                        <p className="text-xs leading-tight text-slate-500">Extract & Visualize</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-5 p-4">
                    {/* Upload Section */}
                    <div>
                        <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                            Upload Document
                        </h2>
                        <div className="space-y-2.5">
                            {/* File Input - Much Smaller */}
                            <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-3 py-3 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50">
                                <input
                                    type="file"
                                    accept="application/pdf,image/*"
                                    onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                                    className="hidden"
                                />
                                <div>
                                    <svg className="mx-auto mb-1 h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-xs font-medium text-slate-700">
                                        Click to upload
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        PDF, PNG, JPG
                                    </p>
                                </div>
                            </label>

                            {/* Selected File Display - Smaller */}
                            {fileName && (
                                <div className="rounded-lg border border-slate-200 bg-white p-2">
                                    <div className="flex items-start gap-1.5">
                                        <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                        </svg>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-medium text-slate-800">
                                                {fileName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-2">
                                    <p className="text-xs text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Extract Button - Smaller */}
                            <button
                                onClick={onExtract}
                                disabled={isLoading || !fileName}
                                className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-1.5">
                                        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Extracting...
                                    </span>
                                ) : (
                                    'Extract Text'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Previously Uploaded Section */}
                    <div>
                        <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                            Recent Documents
                        </h2>
                        <PreviouslyUploadedPanel
                            onDocumentSelect={onDocumentSelect}
                            onDocumentDeleted={onDocumentDeleted}
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
