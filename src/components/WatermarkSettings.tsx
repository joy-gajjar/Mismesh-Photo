import React from 'react';
import { ShieldCheck, Lock, Sliders, RotateCcw, Eye } from 'lucide-react';
import { DEFAULT_LOGO_PATH } from '../utils/prompt';

interface WatermarkSettingsProps {
  sizeRatio: number; // 0.05 to 0.08
  paddingRatio: number; // 0.02 to 0.06
  opacity: number; // 0.6 to 1.0
  onSizeChange: (val: number) => void;
  onPaddingChange: (val: number) => void;
  onOpacityChange: (val: number) => void;
  onReset: () => void;
}

export const WatermarkSettings: React.FC<WatermarkSettingsProps> = ({
  sizeRatio,
  paddingRatio,
  opacity,
  onSizeChange,
  onPaddingChange,
  onOpacityChange,
  onReset,
}) => {
  const sizePercent = Math.round(sizeRatio * 1000) / 10;
  const paddingPercent = Math.round(paddingRatio * 1000) / 10;
  const opacityPercent = Math.round(opacity * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Brand Watermark</h3>
            <p className="text-xs text-slate-400">Fixed Top-Right Corner Placement</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-amber-400 transition flex items-center gap-1 cursor-pointer"
          title="Reset to recommended default (6.5% size, 3.5% padding, 95% opacity)"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Logo & Mini Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
        {/* Logo Card */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shrink-0 p-1 flex items-center justify-center">
            <img
              src={DEFAULT_LOGO_PATH}
              alt="Brand Logo"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="text-xs">
            <div className="font-medium text-white flex items-center gap-1">
              Active Company Logo
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">3D Geometric M & Extruder</div>
            <div className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium mt-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              <Lock className="w-2.5 h-2.5" /> Top-Right Corner Locked
            </div>
          </div>
        </div>

        {/* Live Mockup representation */}
        <div className="relative aspect-video rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 overflow-hidden flex items-center justify-center">
          <span className="text-[10px] text-slate-500 font-medium">Product Area</span>
          {/* Top right watermark preview */}
          <div
            className="absolute rounded-full overflow-hidden transition-all duration-150"
            style={{
              top: `${paddingPercent * 2}%`,
              right: `${paddingPercent * 2}%`,
              width: `${Math.max(14, sizePercent * 2.8)}px`,
              height: `${Math.max(14, sizePercent * 2.8)}px`,
              opacity: opacity,
              boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
            }}
          >
            <img
              src={DEFAULT_LOGO_PATH}
              alt="Watermark Mockup"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Sliders strictly adhering to prompt constraints */}
      <div className="space-y-3.5 pt-1">
        {/* Size Slider (5% to 8%) */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <label htmlFor="watermark-size" className="font-medium text-slate-300 flex items-center gap-1.5">
              <span>Logo Size Ratio</span>
              <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                Prompt Rule: 5%–8%
              </span>
            </label>
            <span className="font-mono text-white text-xs">{sizePercent}%</span>
          </div>
          <input
            id="watermark-size"
            type="range"
            min="0.05"
            max="0.08"
            step="0.005"
            value={sizeRatio}
            onChange={(e) => onSizeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>5.0% (Subtle)</span>
            <span>6.5% (Recommended)</span>
            <span>8.0% (Prominent)</span>
          </div>
        </div>

        {/* Edge Padding */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <label htmlFor="watermark-padding" className="font-medium text-slate-300">
              Edge Padding
            </label>
            <span className="font-mono text-white text-xs">{paddingPercent}%</span>
          </div>
          <input
            id="watermark-padding"
            type="range"
            min="0.02"
            max="0.06"
            step="0.005"
            value={paddingRatio}
            onChange={(e) => onPaddingChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>2.0% (Tight)</span>
            <span>3.5% (Standard Studio)</span>
            <span>6.0% (Deep)</span>
          </div>
        </div>

        {/* Opacity */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <label htmlFor="watermark-opacity" className="font-medium text-slate-300">
              Watermark Opacity
            </label>
            <span className="font-mono text-white text-xs">{opacityPercent}%</span>
          </div>
          <input
            id="watermark-opacity"
            type="range"
            min="0.60"
            max="1.00"
            step="0.05"
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>60% (Ghost)</span>
            <span>95% (Solid Studio)</span>
            <span>100% (Opaque)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
