import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Sparkles,
  UploadCloud,
  FileText,
  ShieldCheck,
  Palette,
  Layers,
  Info,
  CheckCircle2,
  FolderDown,
  Camera,
} from 'lucide-react';
import { ProductItem, ProcessingSettings } from './types';
import {
  MASTER_BRAND_PROMPT,
  STUDIO_GRADIENTS,
  DEFAULT_LOGO_PATH,
  StudioGradientPreset,
} from './utils/prompt';
import { SAMPLE_PRODUCTS, SampleProduct } from './utils/sampleProducts';
import { composeCommercialProduct, overlayWatermarkOnly } from './utils/imageCompositor';
import { Header } from './components/Header';
import { PromptModal } from './components/PromptModal';
import { WatermarkSettings } from './components/WatermarkSettings';
import { GradientSelector } from './components/GradientSelector';
import { ImageUploader } from './components/ImageUploader';
import { ProductCard } from './components/ProductCard';
import { ComparisonModal } from './components/ComparisonModal';
import { BatchSummaryBar } from './components/BatchSummaryBar';

export default function App() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [settings, setSettings] = useState<ProcessingSettings>({
    watermarkSizeRatio: 0.065, // 6.5% - within 5-8% prompt rule
    watermarkPaddingRatio: 0.035, // 3.5%
    watermarkOpacity: 0.95,
    watermarkPosition: 'top-right',
    selectedGradient: STUDIO_GRADIENTS[0], // Slate & Copper Brand Match
    applyStudioLighting: true,
    applyContactShadow: true,
    applyVignette: true,
    isolateSubject: true,
    renderPedestal: true,
    renderFloorReflection: true,
    useAiGeneration: false, // Default to high-res 3D Studio Engine to avoid free-tier 429 quota errors
  });

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [activeCompareItem, setActiveCompareItem] = useState<ProductItem | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Load initial demo products on first mount
  useEffect(() => {
    const initialItems: ProductItem[] = [
      {
        id: 'initial-watch',
        name: SAMPLE_PRODUCTS[0].name,
        fileSize: 48000,
        originalDataUrl: SAMPLE_PRODUCTS[0].dataUrl,
        status: 'idle',
        progress: 0,
        timestamp: Date.now(),
        gradientPresetId: STUDIO_GRADIENTS[0].id,
      },
      {
        id: 'initial-perfume',
        name: SAMPLE_PRODUCTS[1].name,
        fileSize: 52000,
        originalDataUrl: SAMPLE_PRODUCTS[1].dataUrl,
        status: 'idle',
        progress: 0,
        timestamp: Date.now() + 1,
        gradientPresetId: STUDIO_GRADIENTS[0].id,
      },
    ];
    setItems(initialItems);
  }, []);

  // Handle uploaded files asynchronously to ensure non-empty data URLs
  const handleFilesSelected = async (files: File[]) => {
    const filePromises = files.map((file, idx) => {
      return new Promise<ProductItem>((resolve) => {
        const id = `upload-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = (e.target?.result as string) || '';
          resolve({
            id,
            name: file.name,
            fileSize: file.size,
            originalDataUrl: dataUrl,
            status: 'idle',
            progress: 0,
            timestamp: Date.now() + idx,
            gradientPresetId: settings.selectedGradient.id,
          });
        };
        reader.onerror = () => {
          resolve({
            id,
            name: file.name,
            fileSize: file.size,
            originalDataUrl: '',
            status: 'error',
            error: 'Failed to read file',
            progress: 0,
            timestamp: Date.now() + idx,
            gradientPresetId: settings.selectedGradient.id,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const loadedItems = await Promise.all(filePromises);
    const validItems = loadedItems.filter((item) => Boolean(item.originalDataUrl));
    if (validItems.length > 0) {
      setItems((prev) => [...prev, ...validItems]);
    }
  };

  // Add individual sample
  const handleAddSample = (sample: SampleProduct) => {
    const newItem: ProductItem = {
      id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: sample.name,
      fileSize: 45000,
      originalDataUrl: sample.dataUrl,
      status: 'idle',
      progress: 0,
      timestamp: Date.now(),
      gradientPresetId: settings.selectedGradient.id,
    };
    setItems((prev) => [newItem, ...prev]);
  };

  // Add all samples
  const handleAddAllSamples = () => {
    const newItems: ProductItem[] = SAMPLE_PRODUCTS.map((sample, idx) => ({
      id: `sample-all-${Date.now()}-${idx}`,
      name: sample.name,
      fileSize: 45000 + idx * 5000,
      originalDataUrl: sample.dataUrl,
      status: 'idle',
      progress: 0,
      timestamp: Date.now() + idx,
      gradientPresetId: settings.selectedGradient.id,
    }));
    setItems((prev) => [...newItems, ...prev]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearQueue = () => {
    setItems([]);
  };

  // Process a single item through the commercial transformation pipeline
  const processSingleItem = async (id: string, currentSettings: ProcessingSettings) => {
    const target = items.find((i) => i.id === id);
    if (!target || !target.originalDataUrl) return;

    // Step 1: Initialize status
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              status: 'processing',
              progress: 25,
              statusMessage: 'Synthesizing studio gradient & lighting...',
            }
          : it
      )
    );

    try {
      let finalDataUrl: string = '';

      // Try server Gemini AI route first if enabled
      let geminiSuccess = false;
      if (currentSettings.useAiGeneration) {
        try {
          setItems((prev) =>
            prev.map((it) =>
              it.id === id
                ? {
                    ...it,
                    progress: 45,
                    statusMessage: 'Calling Gemini Studio Photography model...',
                  }
                : it
            )
          );

          const response = await fetch('/api/transform-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: target.originalDataUrl,
              gradientName: currentSettings.selectedGradient.name,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success && data.transformedImageUrl) {
            geminiSuccess = true;
            setItems((prev) =>
              prev.map((it) =>
                it.id === id
                  ? {
                      ...it,
                      progress: 90,
                      statusMessage: 'Gemini transformation complete! Applying brand watermark...',
                    }
                  : it
              )
            );

            finalDataUrl = await overlayWatermarkOnly(
              data.transformedImageUrl,
              DEFAULT_LOGO_PATH,
              currentSettings.watermarkSizeRatio,
              currentSettings.watermarkPaddingRatio,
              currentSettings.watermarkOpacity
            );
          }
        } catch {
          // Bypassed or quota limit: seamless fallback to 3D commercial studio engine
        }
      }

      // Render with 3D commercial studio engine
      if (!geminiSuccess) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  progress: 70,
                  statusMessage: 'Synthesizing 3D pedestal, floor reflection & studio lighting...',
                }
              : it
          )
        );

        const result = await composeCommercialProduct({
          productImageSrc: target.originalDataUrl,
          logoImageSrc: DEFAULT_LOGO_PATH,
          gradientPreset: currentSettings.selectedGradient,
          watermarkSizeRatio: currentSettings.watermarkSizeRatio,
          watermarkPaddingRatio: currentSettings.watermarkPaddingRatio,
          watermarkOpacity: currentSettings.watermarkOpacity,
          watermarkPosition: 'top-right',
          isolateSubject: currentSettings.isolateSubject,
          renderPedestal: currentSettings.renderPedestal,
          renderFloorReflection: currentSettings.renderFloorReflection,
          applyStudioLighting: currentSettings.applyStudioLighting,
          applyContactShadow: currentSettings.applyContactShadow,
          applyVignette: currentSettings.applyVignette,
        });

        finalDataUrl = result.dataUrl;
      }

      // Completed
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                status: 'completed',
                progress: 100,
                statusMessage: 'Ready for Commercial Marketing',
                processedDataUrl: finalDataUrl,
                gradientPresetId: currentSettings.selectedGradient.id,
              }
            : it
        )
      );
    } catch (err: any) {
      console.error('Error processing item:', err);
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                status: 'error',
                progress: 0,
                error: err.message || 'Processing failed',
                statusMessage: 'Failed to process',
              }
            : it
        )
      );
    }
  };

  // Process all pending items in batch
  const handleProcessAll = async () => {
    if (isProcessingBatch) return;
    setIsProcessingBatch(true);

    const pending = items.filter((i) => i.status === 'idle' || i.status === 'error');
    for (const item of pending) {
      await processSingleItem(item.id, settings);
    }

    setIsProcessingBatch(false);
  };

  // Download all completed outputs as a ZIP file
  const handleDownloadZip = async () => {
    const completed = items.filter((i) => i.status === 'completed' && i.processedDataUrl);
    if (completed.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder('commercial_product_photos');

    for (let i = 0; i < completed.length; i++) {
      const it = completed[i];
      if (it.processedDataUrl) {
        const base64Data = it.processedDataUrl.replace(/^data:image\/(png|jpeg);base64,/, '');
        const filename = `${it.name.replace(/\.[^/.]+$/, '')}_studio_commercial.png`;
        folder?.file(filename, base64Data, { base64: true });
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudioBrand_Commercial_Assets_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header */}
      <Header
        onOpenPromptModal={() => setIsPromptModalOpen(true)}
        processedCount={processedCount}
        totalCount={items.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-8">
        {/* Banner with prompt summary & brand watermark guarantee */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 flex items-center justify-center p-1.5">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Automated Commercial Product Studio
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Fixed Prompt Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Applies professional studio lighting, complementary gradient backdrop, and your company logo watermark permanently in the <strong>Top-Right corner (5–8% width)</strong> with balanced margins.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPromptModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inspect Prompt Rules</span>
            </button>
          </div>
        </div>

        {/* 2-Column Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Image Queue & Batch Actions (8 cols on lg) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Multi-Image Dropzone & Samples */}
            <ImageUploader
              onFilesSelected={handleFilesSelected}
              onAddSample={handleAddSample}
              onAddAllSamples={handleAddAllSamples}
              totalImagesCount={items.length}
            />

            {/* Batch Execution Bar */}
            <BatchSummaryBar
              items={items}
              isProcessingBatch={isProcessingBatch}
              onProcessAll={handleProcessAll}
              onDownloadZip={handleDownloadZip}
              onClearQueue={handleClearQueue}
            />

            {/* Products Grid */}
            {items.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Product Photos ({items.length})</span>
                  <span>Click any processed image to compare Before / After</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onProcess={(id) => processSingleItem(id, settings)}
                      onRemove={handleRemoveItem}
                      onOpenCompare={(it) => setActiveCompareItem(it)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
                <UploadCloud className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-slate-300">Queue is empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Drag and drop product images above or click sample buttons to load demo assets.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Watermark Controls & Studio Presets (5 cols on lg) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* Top-Right Watermark Settings (5-8% ratio locked) */}
            <WatermarkSettings
              sizeRatio={settings.watermarkSizeRatio}
              paddingRatio={settings.watermarkPaddingRatio}
              opacity={settings.watermarkOpacity}
              onSizeChange={(val) => setSettings((s) => ({ ...s, watermarkSizeRatio: val }))}
              onPaddingChange={(val) => setSettings((s) => ({ ...s, watermarkPaddingRatio: val }))}
              onOpacityChange={(val) => setSettings((s) => ({ ...s, watermarkOpacity: val }))}
              onReset={() =>
                setSettings((s) => ({
                  ...s,
                  watermarkSizeRatio: 0.065,
                  watermarkPaddingRatio: 0.035,
                  watermarkOpacity: 0.95,
                }))
              }
            />

            {/* Studio Photography Gradient Aesthetic */}
            <GradientSelector
              selectedGradient={settings.selectedGradient}
              onSelectGradient={(preset) =>
                setSettings((s) => ({ ...s, selectedGradient: preset }))
              }
              applyContactShadow={settings.applyContactShadow}
              applyVignette={settings.applyVignette}
              isolateSubject={settings.isolateSubject}
              renderPedestal={settings.renderPedestal}
              renderFloorReflection={settings.renderFloorReflection}
              useAiGeneration={settings.useAiGeneration}
              onToggleContactShadow={() =>
                setSettings((s) => ({ ...s, applyContactShadow: !s.applyContactShadow }))
              }
              onToggleVignette={() =>
                setSettings((s) => ({ ...s, applyVignette: !s.applyVignette }))
              }
              onToggleIsolateSubject={() =>
                setSettings((s) => ({ ...s, isolateSubject: !s.isolateSubject }))
              }
              onTogglePedestal={() =>
                setSettings((s) => ({ ...s, renderPedestal: !s.renderPedestal }))
              }
              onToggleFloorReflection={() =>
                setSettings((s) => ({ ...s, renderFloorReflection: !s.renderFloorReflection }))
              }
              onToggleAiGeneration={() =>
                setSettings((s) => ({ ...s, useAiGeneration: !s.useAiGeneration }))
              }
            />

            {/* Master Prompt Transparency Summary */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" /> Quality Guarantee
                </span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Top-Right Locked
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Brand watermark proportions are locked to the top-right corner between 5% and 8% image width. Original product geometry, materials, and colors are preserved with zero unwanted distortion.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Comparison Modal */}
      <ComparisonModal
        item={activeCompareItem}
        onClose={() => setActiveCompareItem(null)}
      />

      {/* Master Prompt Modal */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
      />
    </div>
  );
}
