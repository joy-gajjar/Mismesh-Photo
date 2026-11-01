import { StudioGradientPreset } from '../utils/prompt';

export type ProcessStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'error';

export interface ProductItem {
  id: string;
  name: string;
  fileSize: number;
  originalDataUrl: string;
  processedDataUrl?: string;
  status: ProcessStatus;
  statusMessage?: string;
  progress: number;
  error?: string;
  timestamp: number;
  width?: number;
  height?: number;
  gradientPresetId: string;
}

export interface ProcessingSettings {
  watermarkSizeRatio: number; // 0.05 to 0.08
  watermarkPaddingRatio: number; // 0.02 to 0.06
  watermarkOpacity: number; // 0.6 to 1.0
  watermarkPosition: 'top-right'; // Locked to top-right
  selectedGradient: StudioGradientPreset;
  applyStudioLighting: boolean;
  applyContactShadow: boolean;
  applyVignette: boolean;
  isolateSubject: boolean;
  renderPedestal: boolean;
  renderFloorReflection: boolean;
  useAiGeneration: boolean;
}
