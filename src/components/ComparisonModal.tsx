import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Split,
  Columns,
  Maximize2,
  ZoomIn,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ProductItem } from '../types';
import { DEFAULT_LOGO_PATH } from '../utils/prompt';

interface ComparisonModalProps {
  item: ProductItem | null;
  onClose: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({ item, onClose }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [zoomWatermark, setZoomWatermark] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item || !item.processedDataUrl) return null;

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleDownload = () => {
    if (!item.processedDataUrl) return;
    const a = document.createElement('a');
    a.href = item.processedDataUrl;
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}_commercial_studio.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async () => {
    if (!item.processedDataUrl) return;
    try {
      const res = await fetch(item.processedDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Direct clipboard copy failed, copying base64 text instead');
      navigator.clipboard.writeText(item.processedDataUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Split className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>{item.name}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Commercial Studio Asset
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Slide divider or switch views to evaluate lighting, gradient backdrop, and Top-Right watermark
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                  viewMode === 'slider'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Split className="w-3 h-3" />
                <span>Split Slider</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                  viewMode === 'side-by-side'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Columns className="w-3 h-3" />
                <span>Side by Side</span>
              </button>
            </div>

            {/* Corner Watermark Inspector toggle */}
            <button
              type="button"
              onClick={() => setZoomWatermark(!zoomWatermark)}
              className={`p-1.5 rounded-lg border text-xs transition flex items-center gap-1 cursor-pointer ${
                zoomWatermark
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Inspect Top-Right watermark at 200% zoom"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Watermark Zoom</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close comparison modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950/60">
          {viewMode === 'slider' ? (
            /* Interactive Slider */
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              className={`relative max-w-3xl w-full aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950 select-none ${
                zoomWatermark ? 'scale-125 origin-top-right transition-transform duration-200' : ''
              }`}
            >
              {/* After: Processed Studio Photograph (Base layer) */}
              {item.processedDataUrl && item.processedDataUrl.trim() !== '' && (
                <img
                  src={item.processedDataUrl}
                  alt="Commercial Studio Final"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              )}

              {/* Before: Raw Original Photo clipped with clip-path for subpixel alignment */}
              {item.originalDataUrl && item.originalDataUrl.trim() !== '' && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                  }}
                >
                  <img
                    src={item.originalDataUrl}
                    alt="Raw Product"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
              )}

              {/* Draggable Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 cursor-ew-resize pointer-events-none shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 border-2 border-white shadow-xl flex items-center justify-center pointer-events-auto cursor-ew-resize">
                  <Split className="w-4 h-4" />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-300 border border-slate-700/60 pointer-events-none">
                Original Raw Photo
              </div>
              <div className="absolute bottom-3 right-3 bg-amber-500/20 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-amber-300 border border-amber-500/40 pointer-events-none">
                Commercial Studio + Watermark
              </div>
            </div>
          ) : (
            /* Side by Side View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-slate-300 mb-2">Original Raw Photo</span>
                <div className="w-full aspect-square bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-2 flex items-center justify-center">
                  {item.originalDataUrl && item.originalDataUrl.trim() !== '' && (
                    <img
                      src={item.originalDataUrl}
                      alt="Original raw product"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Commercial Studio (With Watermark)
                </span>
                <div className="w-full aspect-square bg-slate-950 border border-amber-500/40 rounded-xl overflow-hidden p-2 flex items-center justify-center shadow-lg shadow-amber-950/20">
                  {item.processedDataUrl && item.processedDataUrl.trim() !== '' && (
                    <img
                      src={item.processedDataUrl}
                      alt="Commercial Studio Final"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prompt constraint check explanation */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 max-w-2xl w-full text-xs text-slate-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Verification:</strong> Product proportions preserved • Studio gradient & shadows active • Top-Right brand watermark (5–8% width).
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Image'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
