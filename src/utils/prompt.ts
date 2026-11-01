/**
 * Master Brand Prompt Configuration
 * Exactly as mandated by user specification.
 */

export const MASTER_BRAND_PROMPT = `Transform the uploaded product photo into a premium, professionally photographed commercial product image.

- Enhance lighting, sharpness, reflections, shadows, and overall presentation while preserving the product's original appearance, colours, proportions, and details.
- Create an elegant gradient background that complements the product's colours, using a modern, premium studio-photography aesthetic.
- Place the uploaded company logo neatly in the **top-right corner**.
- Keep the logo small and subtle, approximately **5–8% of the image width**, with sufficient padding from the edges.
- Maintain the logo's original design, colours, and proportions. It should look like a professional brand watermark without distracting from the product.
- Ensure balanced composition, realistic lighting, clean presentation, and high-quality finishing.

**Final output:** A realistic, high-end commercial product photograph suitable for professional marketing, catalogues, advertisements, and social media.

**Important:** Do not alter, redesign, distort, or invent any product features or logo elements.`;

export interface StudioGradientPreset {
  id: string;
  name: string;
  description: string;
  gradientCss: string;
  colorStops: [string, string, string?];
  darkBackground: boolean;
  accentColor: string;
}

export const STUDIO_GRADIENTS: StudioGradientPreset[] = [
  {
    id: 'slate-copper',
    name: 'Brand Signature (Slate & Copper)',
    description: 'Harmonious dark slate blue gradient with warm metallic copper rim glow matching the logo',
    gradientCss: 'radial-gradient(circle at 50% 38%, #283344 0%, #151b24 55%, #0b0e14 100%)',
    colorStops: ['#283344', '#151b24', '#0b0e14'],
    darkBackground: true,
    accentColor: '#e07a38',
  },
  {
    id: 'charcoal-luxe',
    name: 'Velvet Charcoal Studio',
    description: 'Deep high-end commercial studio ramp with focused overhead spotlight',
    gradientCss: 'radial-gradient(circle at 50% 30%, #32353b 0%, #1c1d22 50%, #0d0e11 100%)',
    colorStops: ['#32353b', '#1c1d22', '#0d0e11'],
    darkBackground: true,
    accentColor: '#94a3b8',
  },
  {
    id: 'pristine-white',
    name: 'Pristine Pure & Silk Soft',
    description: 'Ultra-clean commercial catalogue white with subtle platinum-to-porcelain gradient',
    gradientCss: 'radial-gradient(circle at 50% 35%, #ffffff 0%, #f1f3f6 60%, #e2e6eb 100%)',
    colorStops: ['#ffffff', '#f1f3f6', '#e2e6eb'],
    darkBackground: false,
    accentColor: '#475569',
  },
  {
    id: 'warm-champagne',
    name: 'Champagne & Amber Glow',
    description: 'Warm luxurious studio gradient with soft amber undertones for premium merchandise',
    gradientCss: 'radial-gradient(circle at 50% 35%, #3e3328 0%, #201a15 60%, #100d0a 100%)',
    colorStops: ['#3e3328', '#201a15', '#100d0a'],
    darkBackground: true,
    accentColor: '#f59e0b',
  },
  {
    id: 'cyber-indigo',
    name: 'Cyber Graphite & Indigo',
    description: 'Deep cobalt-indigo studio vignette for electronics and modern tech accessories',
    gradientCss: 'radial-gradient(circle at 50% 35%, #1e2640 0%, #111524 55%, #080b12 100%)',
    colorStops: ['#1e2640', '#111524', '#080b12'],
    darkBackground: true,
    accentColor: '#60a5fa',
  },
];

export const DEFAULT_LOGO_PATH = '/assets/aistudio/WhatsApp_Image_2026-11-01_at_13.33.39_4af04a57.jpeg';
