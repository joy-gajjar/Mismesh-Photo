import React, { useRef, useState } from 'react';
import { UploadCloud, Plus, Image as ImageIcon, Sparkles, FolderUp } from 'lucide-react';
import { SAMPLE_PRODUCTS, SampleProduct } from '../utils/sampleProducts';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onAddSample: (sample: SampleProduct) => void;
  onAddAllSamples: () => void;
  totalImagesCount: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFilesSelected,
  onAddSample,
  onAddAllSamples,
  totalImagesCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer group ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
            : 'border-slate-700 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload multiple product photos"
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-amber-500/20 transition duration-200">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base font-semibold text-white tracking-tight">
            Drop product photos here or <span className="text-amber-400 underline decoration-amber-500/40 underline-offset-4">browse</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Upload multiple raw shots at once (PNG, JPG, WEBP). Studio lighting, elegant gradient backdrop, and your Top-Right brand watermark will be applied automatically.
          </p>

          <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Batch Processing</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">High-Resolution</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">5–8% Brand Watermark</span>
          </div>
        </div>
      </div>

      {/* Instant Demo Samples */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-slate-200">
            Test immediately with studio samples:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SAMPLE_PRODUCTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onAddSample(sample)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <Plus className="w-3 h-3 text-amber-400" />
              <span>{sample.name.split(' ')[0]} {sample.name.split(' ')[1] || ''}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={onAddAllSamples}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer"
          >
            <FolderUp className="w-3 h-3" />
            <span>Load All Samples</span>
          </button>
        </div>
      </div>
    </div>
  );
};
