import React from 'react';
import {
  Sparkles,
  Archive,
  Trash2,
  CheckCircle2,
  RefreshCw,
  FolderDown,
  Layers,
} from 'lucide-react';
import { ProductItem } from '../types';

interface BatchSummaryBarProps {
  items: ProductItem[];
  isProcessingBatch: boolean;
  onProcessAll: () => void;
  onDownloadZip: () => void;
  onClearQueue: () => void;
}

export const BatchSummaryBar: React.FC<BatchSummaryBarProps> = ({
  items,
  isProcessingBatch,
  onProcessAll,
  onDownloadZip,
  onClearQueue,
}) => {
  const total = items.length;
  const completed = items.filter((i) => i.status === 'completed').length;
  const pending = items.filter((i) => i.status === 'idle' || i.status === 'error').length;
  const processing = items.filter((i) => i.status === 'processing').length;

  if (total === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
      {/* Batch Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              Batch Queue: <span className="text-amber-400">{total} Items</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{completed} Completed</span>
              <span className="text-slate-600">•</span>
              <span>{pending} Pending</span>
              {processing > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400 font-medium">{processing} In Progress</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onClearQueue}
          disabled={isProcessingBatch}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition disabled:opacity-50 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>

        {completed > 0 && (
          <button
            type="button"
            onClick={onDownloadZip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
            title="Download all processed photographs as a ZIP archive"
          >
            <FolderDown className="w-4 h-4 text-amber-400" />
            <span>Download All ({completed} ZIP)</span>
          </button>
        )}

        <button
          type="button"
          onClick={onProcessAll}
          disabled={isProcessingBatch || pending === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          {isProcessingBatch ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Processing Queue...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>Process All ({pending} Photos)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
