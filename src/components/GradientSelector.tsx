import React from 'react';
import { Palette, Check, SlidersHorizontal, Sun, Moon, Sparkles } from 'lucide-react';
import { STUDIO_GRADIENTS, StudioGradientPreset } from '../utils/prompt';

interface GradientSelectorProps {
  selectedGradient: StudioGradientPreset;
  onSelectGradient: (preset: StudioGradientPreset) => void;
  applyContactShadow: boolean;
  applyVignette: boolean;
  isolateSubject: boolean;
  renderPedestal: boolean;
  renderFloorReflection: boolean;
  useAiGeneration: boolean;
  onToggleContactShadow: () => void;
  onToggleVignette: () => void;
  onToggleIsolateSubject: () => void;
  onTogglePedestal: () => void;
  onToggleFloorReflection: () => void;
  onToggleAiGeneration: () => void;
}

export const GradientSelector: React.FC<GradientSelectorProps> = ({
  selectedGradient,
  onSelectGradient,
  applyContactShadow,
  applyVignette,
  isolateSubject,
  renderPedestal,
  renderFloorReflection,
  useAiGeneration,
  onToggleContactShadow,
  onToggleVignette,
  onToggleIsolateSubject,
  onTogglePedestal,
  onToggleFloorReflection,
  onToggleAiGeneration,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Engine Mode */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Studio Render Engine
          </span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {useAiGeneration ? 'Cloud Gemini Gen' : '3D Commercial Engine'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            {useAiGeneration
              ? 'Calls Cloud Gemini model (requires paid tier key with image quota)'
              : 'Local high-res 3D studio synthesis (zero quota limits, 100% reliable)'}
          </span>
          <button
            type="button"
            onClick={onToggleAiGeneration}
            className="text-[10px] text-amber-400 hover:text-amber-300 underline underline-offset-2 ml-2 shrink-0 cursor-pointer"
          >
            Switch to {useAiGeneration ? '3D Studio' : 'Cloud AI'}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Commercial Studio Environment</h3>
            <p className="text-xs text-slate-400">Backdrop, 3D pedestal, and lighting</p>
          </div>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          5 Studio Presets
        </span>
      </div>

      {/* Preset List */}
      <div className="grid grid-cols-1 gap-2">
        {STUDIO_GRADIENTS.map((preset) => {
          const isSelected = preset.id === selectedGradient.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectGradient(preset)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Gradient swatch */}
              <div
                className="w-10 h-10 rounded-lg shrink-0 border border-white/20 shadow-inner flex items-center justify-center relative overflow-hidden"
                style={{ background: preset.gradientCss }}
              >
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium truncate ${isSelected ? 'text-amber-300 font-semibold' : 'text-white'}`}>
                    {preset.name}
                  </span>
                  {preset.id === 'slate-copper' && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                      Brand Match
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Commercial 3D Stage & Lighting Controls */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
          Commercial 3D Stage Controls
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800 cursor-pointer hover:bg-slate-800/40 transition">
            <input
              type="checkbox"
              checked={isolateSubject}
              onChange={onToggleIsolateSubject}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500/30"
            />
            <span className="text-slate-300 text-[11px]">Seamless Subject Cutout</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800 cursor-pointer hover:bg-slate-800/40 transition">
            <input
              type="checkbox"
              checked={renderPedestal}
              onChange={onTogglePedestal}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500/30"
            />
            <span className="text-slate-300 text-[11px]">3D Studio Pedestal</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800 cursor-pointer hover:bg-slate-800/40 transition">
            <input
              type="checkbox"
              checked={renderFloorReflection}
              onChange={onToggleFloorReflection}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500/30"
            />
            <span className="text-slate-300 text-[11px]">Glossy Floor Reflection</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800 cursor-pointer hover:bg-slate-800/40 transition">
            <input
              type="checkbox"
              checked={applyContactShadow}
              onChange={onToggleContactShadow}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500/30"
            />
            <span className="text-slate-300 text-[11px]">Contact Occlusion Shadow</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800 cursor-pointer hover:bg-slate-800/40 transition col-span-2">
            <input
              type="checkbox"
              checked={applyVignette}
              onChange={onToggleVignette}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500/30"
            />
            <span className="text-slate-300 text-[11px]">Overhead Softbox Spotlight & Cinematic Vignette</span>
          </label>
        </div>
      </div>
    </div>
  );
};
