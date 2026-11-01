import React from 'react';
import { Sparkles, FileText, ShieldCheck, Camera, Layers } from 'lucide-react';
import { DEFAULT_LOGO_PATH } from '../utils/prompt';

interface HeaderProps {
  onOpenPromptModal: () => void;
  processedCount: number;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPromptModal,
  processedCount,
  totalCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="w-11 h-11 rounded-xl p-0.5 bg-gradient-to-tr from-amber-600 via-slate-700 to-sky-500 shadow-md shadow-amber-950/20 overflow-hidden flex items-center justify-center">
              <img
                src={DEFAULT_LOGO_PATH}
                alt="Brand Watermark Logo"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 text-slate-950 ring-2 ring-slate-900" title="Fixed Brand Watermark Active">
              <ShieldCheck className="w-3 h-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                StudioBrand
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Commercial Studio
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Automatic studio gradient & commercial lighting</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300 font-medium">Top-Right Logo (5–8%)</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Master Prompt Inspector */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {totalCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Ready: <strong className="text-white">{processedCount}</strong> / {totalCount}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenPromptModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-slate-600 transition shadow-sm cursor-pointer"
            title="Inspect the exact system prompt always applied to your images"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Master Prompt</span>
          </button>
        </div>
      </div>
    </header>
  );
};
