import React from 'react';
import {
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Split,
} from 'lucide-react';
import { ProductItem } from '../types';
import { formatBytes } from '../utils/watermark';
import { STUDIO_GRADIENTS } from '../utils/prompt';

interface ProductCardProps {
  item: ProductItem;
  onProcess: (id: string) => void;
  onRemove: (id: string) => void;
  onOpenCompare: (item: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onProcess,
  onRemove,
  onOpenCompare,
}) => {
  const gradient = STUDIO_GRADIENTS.find((g) => g.id === item.gradientPresetId) || STUDIO_GRADIENTS[0];

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.processedDataUrl) return;
    const a = document.createElement('a');
    a.href = item.processedDataUrl;
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_commercial_studio.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700/80 transition flex flex-col group">
      {/* Visual Canvas Area */}
      <div
        className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => {
          if (item.status === 'completed') {
            onOpenCompare(item);
          }
        }}
      >
        {(() => {
          const displaySrc =
            item.processedDataUrl && item.processedDataUrl.trim() !== ''
              ? item.processedDataUrl
              : item.originalDataUrl && item.originalDataUrl.trim() !== ''
              ? item.originalDataUrl
              : null;

          return displaySrc ? (
            <img
              src={displaySrc}
              alt={item.name}
              className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2 p-4">
              <div className="w-6 h-6 border-2 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
              <span className="text-[11px] text-slate-400">Loading image...</span>
            </div>
          );
        })()}

        {/* Status Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          {item.status === 'completed' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          )}
          {item.status === 'processing' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> Processing
            </span>
          )}
          {item.status === 'idle' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 backdrop-blur-md">
              <Clock className="w-3 h-3 text-slate-400" /> Raw Upload
            </span>
          )}
          {item.status === 'error' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-md">
              <AlertCircle className="w-3 h-3" /> Error
            </span>
          )}
        </div>

        {/* Top-Right Watermark indicator on hover when completed */}
        {item.status === 'completed' && (
          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono border border-amber-500/30">
            Watermark 5–8% OK
          </div>
        )}

        {/* Processing Overlay */}
        {item.status === 'processing' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20">
            <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-3" />
            <p className="text-xs font-semibold text-white tracking-wide">
              {item.statusMessage || 'Enhancing Commercial Photo...'}
            </p>
            <div className="w-48 bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-sky-400 h-1.5 transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{item.progress}%</span>
          </div>
        )}

        {/* Hover Quick Action Buttons on image */}
        {item.status === 'completed' && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 z-10 pointer-events-none">
            <span className="text-[11px] text-slate-300 flex items-center gap-1 font-medium bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
              <Split className="w-3 h-3 text-amber-400" /> Click to compare Before / After
            </span>
          </div>
        )}
      </div>

      {/* Info & Footer Actions */}
      <div className="p-3.5 flex flex-col justify-between flex-1 border-t border-slate-800/80">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-white truncate" title={item.name}>
              {item.name}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono shrink-0">
              {formatBytes(item.fileSize)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
              style={{ background: gradient.accentColor }}
            />
            <span className="text-[11px] text-slate-400 truncate">
              {gradient.name}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-1.5 mt-3 pt-2.5 border-t border-slate-800">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
              title="Remove image from queue"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {item.status === 'completed' && (
              <button
                type="button"
                onClick={() => onOpenCompare(item)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Open interactive Before / After slider"
              >
                <Split className="w-3.5 h-3.5 text-amber-400" />
                <span>Compare</span>
              </button>
            )}
          </div>

          <div>
            {item.status === 'completed' ? (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-sm cursor-pointer"
                title="Download commercial photograph"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            ) : item.status === 'idle' || item.status === 'error' ? (
              <button
                type="button"
                onClick={() => onProcess(item.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-800 hover:bg-amber-600 rounded-lg transition border border-slate-700 hover:border-amber-500 cursor-pointer"
                title="Transform with prompt & watermark"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Enhance</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
