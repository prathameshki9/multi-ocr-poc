import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { LayoutItem } from '@/types/ocr';

// Configure PDF.js worker - use local worker file to avoid CORS issues
// The worker file is served from node_modules by Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

type DocumentCanvasViewerProps = {
    file?: File | null;
    previewUrl?: string | null;
    extractedData?: LayoutItem[];
    selectedItemIndex?: number | null;
    hoveredItemIndex?: number | null;
};

const DocumentCanvasViewer: React.FC<DocumentCanvasViewerProps> = ({
    file,
    previewUrl,
    extractedData = [],
    selectedItemIndex = null,
    hoveredItemIndex = null,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageData, setImageData] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(1);

    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 3;
    const ZOOM_STEP = 0.25;

    // Zoom controls
    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
    };

    const handleResetZoom = () => {
        setZoom(1);
    };

    // Convert PDF page to image
    const convertPdfPageToImage = async (pdfFile: File, pageNum: number): Promise<HTMLImageElement> => {
        try {
            console.log('Converting PDF page:', pageNum, 'File:', pdfFile.name);
            const arrayBuffer = await pdfFile.arrayBuffer();
            console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);

            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            console.log('PDF loaded, pages:', pdf.numPages);
            setTotalPages(pdf.numPages);

            const page = await pdf.getPage(pageNum);
            console.log('Page loaded:', pageNum);

            const viewport = page.getViewport({ scale: 2 }); // Higher scale for better quality
            console.log('Viewport created:', viewport.width, 'x', viewport.height);

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Could not get canvas context');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
            } as any).promise;

            console.log('Page rendered to canvas');

            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    console.log('Image created from canvas');
                    resolve(img);
                };
                img.onerror = (err) => {
                    console.error('Image creation failed:', err);
                    reject(err);
                };
                img.src = canvas.toDataURL();
            });
        } catch (error) {
            console.error('PDF conversion error:', error);
            throw error;
        }
    };

    // Load image from URL
    const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                setTotalPages(1);
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });
    };

    // Load and render document
    useEffect(() => {
        const loadDocument = async () => {
            if (!file || !previewUrl) {
                setImageData(null);
                setError(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                let img: HTMLImageElement;

                if (file.type === 'application/pdf') {
                    img = await convertPdfPageToImage(file, currentPage);
                } else {
                    img = await loadImageFromUrl(previewUrl);
                }

                setImageData(img);
            } catch (err) {
                console.error('Error loading document:', err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                setError(`Failed to load document: ${errorMessage}. Check console for details.`);
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
    }, [file, previewUrl, currentPage]);

    // Draw image and bounding boxes on canvas
    useEffect(() => {
        if (!canvasRef.current || !imageData || !containerRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate scale to fit container
        const containerWidth = containerRef.current.clientWidth - 40; // Account for padding
        const containerHeight = 1000; // Larger height for better readability
        const imageAspectRatio = imageData.width / imageData.height;
        const containerAspectRatio = containerWidth / containerHeight;

        let baseWidth, baseHeight;
        if (imageAspectRatio > containerAspectRatio) {
            baseWidth = containerWidth;
            baseHeight = containerWidth / imageAspectRatio;
        } else {
            baseHeight = containerHeight;
            baseWidth = containerHeight * imageAspectRatio;
        }

        // Apply zoom
        const drawWidth = baseWidth * zoom;
        const drawHeight = baseHeight * zoom;

        canvas.width = drawWidth;
        canvas.height = drawHeight;

        // Draw the image
        ctx.drawImage(imageData, 0, 0, drawWidth, drawHeight);

        // Draw bounding boxes - only show selected or hovered item
        extractedData.forEach((item, index) => {
            // Filter for current page
            if (item.page !== currentPage) return;

            if (!item.geometry?.BoundingBox) return;

            const isSelected = selectedItemIndex === index;
            const isHovered = hoveredItemIndex === index;

            // Only draw if this item is selected or hovered
            if (!isSelected && !isHovered) return;

            const bbox = item.geometry.BoundingBox;

            // Convert normalized coordinates to pixel coordinates with padding
            const padding = 2;
            const x = bbox.Left * drawWidth - padding;
            const y = bbox.Top * drawHeight - padding;
            const width = bbox.Width * drawWidth + (padding * 2);
            const height = bbox.Height * drawHeight + (padding * 2);

            // Draw only border - no fill (transparent inside)
            // Use green for hover if not selected, indigo for selected (selection logic overrides hover)
            // Or better: prioritize selection color, but maybe make hover distinct if we wanted both. 
            // Here requirement mimics "pick color for that as green" for hover.
            // If item is selected, it stays indigo. If hovered but not selected, it becomes green.

            ctx.lineWidth = 2;

            if (isSelected) {
                ctx.strokeStyle = '#4F46E5'; // Indigo border for selected
            } else if (isHovered) {
                ctx.strokeStyle = '#22c55e'; // Green border for hovered (green-500)
            }

            ctx.strokeRect(x, y, width, height);
        });
    }, [imageData, extractedData, currentPage, selectedItemIndex, hoveredItemIndex, zoom]);

    // Handle page navigation
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                        <p className="text-sm text-slate-600">Loading visualization...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex h-full items-center justify-center">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">Error</p>
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                    </div>
                </div>
            );
        }

        if (!file || !previewUrl) {
            return (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                    Upload a document and extract data to visualize bounding boxes
                </div>
            );
        }

        return (
            <div className="flex h-full flex-col gap-3">
                {/* Zoom Controls */}
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            disabled={zoom <= MIN_ZOOM}
                            className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Zoom Out"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            title="Reset Zoom"
                        >
                            {Math.round(zoom * 100)}%
                        </button>
                        <button
                            onClick={handleZoomIn}
                            disabled={zoom >= MAX_ZOOM}
                            className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Zoom In"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                    <span className="text-xs text-slate-500">Scroll to pan when zoomed</span>
                </div>

                {/* Canvas Container */}
                <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50">
                    <canvas
                        ref={canvasRef}
                        className="mx-auto"
                        style={{ maxWidth: zoom > 1 ? 'none' : '100%', height: 'auto' }}
                    />
                </div>

                {/* Page Navigation */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div ref={containerRef} className="h-full overflow-y-auto p-6">
            {renderContent()}
        </div>
    );
};

export default DocumentCanvasViewer;
