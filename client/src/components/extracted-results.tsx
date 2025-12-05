import React from 'react';
import Card from './ui/card';

type ExtractedResultsProps = {
  extracted: string;
  isLoading: boolean;
  error?: string | null;
};

const ExtractedResults: React.FC<ExtractedResultsProps> = ({
  extracted,
  isLoading,
  error,
}) => (
  <Card title="Extracted data" contentClassName="h-[520px] overflow-y-auto bg-slate-50">
    <div className="font-mono text-sm text-slate-800">
      {isLoading && <p>Processing document…</p>}
      {!isLoading && extracted && <pre className="whitespace-pre-wrap">{extracted}</pre>}
      {!isLoading && !extracted && !error && (
        <p className="text-slate-500">
          Run “Extract” to see the recognized text and structured data from your document.
        </p>
      )}
      {!isLoading && error && <p className="text-red-600">{error}</p>}
    </div>
  </Card>
);

export default ExtractedResults;

