import React from 'react';
import Card from './ui/card';

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

type ExtractedResultsProps = {
  extracted: LayoutItem[];
  isLoading: boolean;
  error?: string | null;
};

const LayoutItemCard: React.FC<{ item: LayoutItem }> = ({ item }) => {
  const renderContent = () => {
    if (item.table_data && item.table_data.length > 0) {
      // Flatten all cells and organize by rowIndex and columnIndex
      const allCells: Array<{
        text: string;
        rowIndex: number;
        columnIndex: number;
        entityTypes?: string[];
        [key: string]: unknown;
      }> = [];
      
      item.table_data.forEach((row) => {
        row.forEach((cell) => {
          allCells.push(cell);
        });
      });
      
      // Find max row and column indices
      const maxRow = Math.max(...allCells.map((c) => c.rowIndex), 0);
      const maxCol = Math.max(...allCells.map((c) => c.columnIndex), 0);
      
      // Create a 2D grid organized by rowIndex and columnIndex
      const tableGrid: Array<Array<typeof allCells[0] | null>> = [];
      for (let r = 1; r <= maxRow; r++) {
        const row: Array<typeof allCells[0] | null> = [];
        for (let c = 1; c <= maxCol; c++) {
          const cell = allCells.find(
            (cell) => cell.rowIndex === r && cell.columnIndex === c
          );
          row.push(cell || null);
        }
        tableGrid.push(row);
      }
      
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <tbody>
              {tableGrid.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-slate-200">
                  {row.map((cell, colIdx) => {
                    if (!cell) {
                      return (
                        <td key={colIdx} className="px-3 py-2 text-left">
                          -
                        </td>
                      );
                    }
                    return (
                      <td
                        key={colIdx}
                        className="px-3 py-2 text-left"
                        style={{
                          fontWeight: cell.entityTypes?.includes('COLUMN_HEADER') ? '600' : 'normal',
                          backgroundColor: cell.entityTypes?.includes('COLUMN_HEADER')
                            ? 'rgb(241 245 249)'
                            : 'transparent',
                        }}
                      >
                        {cell.text || '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    if (item.text) {
      return (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {item.text}
        </p>
      );
    }
    
    return <p className="text-sm text-slate-400 italic">No content available</p>;
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-sm font-semibold text-slate-800">{item.type}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Page {item.page}</span>
          {item.confidence !== undefined && (
            <span className="rounded bg-slate-100 px-2 py-0.5">
              {item.confidence.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div className="mt-2">{renderContent()}</div>
    </div>
  );
};

const ExtractedResults: React.FC<ExtractedResultsProps> = ({
  extracted,
  isLoading,
  error,
}) => (
  <Card title="Extracted data" contentClassName="h-[520px] overflow-y-auto bg-slate-50">
    <div className="space-y-4">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="text-sm text-slate-600">Processing document…</p>
          </div>
        </div>
      )}
      
      {!isLoading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Error</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {!isLoading && !error && extracted.length > 0 && (
        <div className="space-y-3">
          {extracted.map((item, index) => (
            <LayoutItemCard key={index} item={item} />
          ))}
        </div>
      )}
      
      {!isLoading && !error && extracted.length === 0 && (
        <div className="flex items-center justify-center py-12 text-center">
          <p className="text-sm text-slate-500">
            Run "Extract" to see the recognized text and structured data from your document.
          </p>
        </div>
      )}
    </div>
  </Card>
);

export default ExtractedResults;

