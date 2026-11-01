import React, { useState } from 'react';
import { X, Check, Copy, Sparkles, Shield, Camera, Image as ImageIcon } from 'lucide-react';
import { MASTER_BRAND_PROMPT, DEFAULT_LOGO_PATH } from '../utils/prompt';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(MASTER_BRAND_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                Mandatory Master Prompt
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Always Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                This exact prompt is supplied to the transformation pipeline for every product image
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close prompt modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
            <img
              src={DEFAULT_LOGO_PATH}
              alt="Company Logo Watermark"
              className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
            />
            <div className="text-xs text-slate-300">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Persistent Brand Watermark
              </div>
              <p className="text-slate-400 mt-0.5">
                Every processed output is permanently marked with your uploaded company logo positioned in the <strong>Top-Right corner</strong> at <strong>5–8% width</strong> with balanced studio margin.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Full Prompt Text
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition font-medium cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Prompt'}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap select-all overflow-x-auto">
              {MASTER_BRAND_PROMPT}
            </pre>
          </div>

          {/* Key Rule Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <span className="font-medium text-white block mb-0.5">Studio Lighting & Background</span>
              <span className="text-slate-400">Gradient backdrop complementing product palette with contact shadows and reflections.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <span className="font-medium text-white block mb-0.5">Top-Right Brand Watermark</span>
              <span className="text-slate-400">Strictly locked at 5%–8% width with ample padding so it never obscures details.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <span className="font-medium text-white block mb-0.5">Zero Product Distortion</span>
              <span className="text-slate-400">Original colours, proportions, materials, and features remain completely untouched.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800">
              <span className="font-medium text-white block mb-0.5">Multi-Asset Consistency</span>
              <span className="text-slate-400">Processes batches uniformly for consistent lookbooks, catalogues, and socials.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
