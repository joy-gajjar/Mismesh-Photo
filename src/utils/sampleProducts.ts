/**
 * Sample test product photos for one-click testing and demonstration.
 */

export interface SampleProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  dataUrl: string;
}

// Generate realistic SVG-based commercial product photos with natural lighting and shadows
function generateProductSvg(type: 'watch' | 'perfume' | 'headphones' | 'gadget'): string {
  let inner = '';
  if (type === 'watch') {
    inner = `
      <defs>
        <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2a303c"/>
          <stop offset="85%" stop-color="#12161f"/>
          <stop offset="100%" stop-color="#0a0d13"/>
        </radialGradient>
        <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#94a3b8"/>
          <stop offset="25%" stop-color="#cbd5e1"/>
          <stop offset="50%" stop-color="#475569"/>
          <stop offset="75%" stop-color="#e2e8f0"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="strapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="50%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="#242730"/>
      <!-- Soft raw table surface -->
      <ellipse cx="400" cy="580" rx="260" ry="40" fill="rgba(0,0,0,0.35)" filter="blur(18px)"/>
      <!-- Straps -->
      <rect x="340" y="120" width="120" height="220" rx="16" fill="url(#strapGrad)"/>
      <rect x="340" y="460" width="120" height="220" rx="16" fill="url(#strapGrad)"/>
      <!-- Bezel & Watch Body -->
      <circle cx="400" cy="400" r="160" fill="url(#bezelGrad)"/>
      <circle cx="400" cy="400" r="142" fill="#0f172a"/>
      <circle cx="400" cy="400" r="136" fill="url(#dialGrad)"/>
      <!-- Dial details -->
      <circle cx="400" cy="400" r="130" stroke="#334155" stroke-width="2" fill="none"/>
      <!-- Indices -->
      <circle cx="400" cy="285" r="5" fill="#f8fafc"/>
      <circle cx="515" cy="400" r="5" fill="#f8fafc"/>
      <circle cx="400" cy="515" r="5" fill="#f8fafc"/>
      <circle cx="285" cy="400" r="5" fill="#f8fafc"/>
      <!-- Hands with copper orange accent -->
      <line x1="400" y1="400" x2="400" y2="310" stroke="#f8fafc" stroke-width="5" stroke-linecap="round"/>
      <line x1="400" y1="400" x2="465" y2="400" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
      <line x1="400" y1="400" x2="350" y2="450" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="400" cy="400" r="7" fill="#ea580c"/>
      <!-- Crown -->
      <rect x="560" y="385" width="18" height="30" rx="4" fill="#94a3b8"/>
    `;
  } else if (type === 'perfume') {
    inner = `
      <defs>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(241, 245, 249, 0.7)"/>
          <stop offset="35%" stop-color="rgba(226, 232, 240, 0.25)"/>
          <stop offset="70%" stop-color="rgba(148, 163, 184, 0.4)"/>
          <stop offset="100%" stop-color="rgba(255, 255, 255, 0.8)"/>
        </linearGradient>
        <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fdba74"/>
          <stop offset="50%" stop-color="#ea580c"/>
          <stop offset="100%" stop-color="#9a3412"/>
        </linearGradient>
        <linearGradient id="goldCap" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#d97706"/>
          <stop offset="30%" stop-color="#fef08a"/>
          <stop offset="70%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="#2d282e"/>
      <ellipse cx="400" cy="620" rx="200" ry="35" fill="rgba(0,0,0,0.4)" filter="blur(16px)"/>
      <!-- Glass Bottle -->
      <rect x="270" y="320" width="260" height="300" rx="28" fill="url(#liquidGrad)" opacity="0.85"/>
      <rect x="270" y="320" width="260" height="300" rx="28" fill="url(#glassGrad)"/>
      <rect x="270" y="320" width="260" height="300" rx="28" stroke="rgba(255,255,255,0.6)" stroke-width="3" fill="none"/>
      <!-- Bottle Neck -->
      <rect x="360" y="275" width="80" height="45" rx="6" fill="url(#goldCap)"/>
      <!-- Bottle Cap -->
      <rect x="340" y="170" width="120" height="105" rx="14" fill="url(#goldCap)"/>
      <!-- Label -->
      <rect x="315" y="420" width="170" height="90" rx="8" fill="#0f172a" stroke="#d97706" stroke-width="1.5"/>
      <text x="400" y="460" font-family="sans-serif" font-size="16" fill="#f8fafc" text-anchor="middle" letter-spacing="4">ÉLIXIR</text>
      <text x="400" y="482" font-family="sans-serif" font-size="11" fill="#cbd5e1" text-anchor="middle" letter-spacing="2">EAU DE PARFUM</text>
    `;
  } else if (type === 'headphones') {
    inner = `
      <defs>
        <linearGradient id="headband" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="50%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="metallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#64748b"/>
          <stop offset="50%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="#1e222a"/>
      <ellipse cx="400" cy="620" rx="220" ry="35" fill="rgba(0,0,0,0.4)" filter="blur(16px)"/>
      <!-- Arch -->
      <path d="M 230 400 A 170 180 0 0 1 570 400" stroke="url(#headband)" stroke-width="46" fill="none" stroke-linecap="round"/>
      <path d="M 230 400 A 170 180 0 0 1 570 400" stroke="#0f172a" stroke-width="38" fill="none" stroke-linecap="round"/>
      <!-- Left Ear Cup -->
      <g transform="translate(230, 430) rotate(-10)">
        <ellipse cx="0" cy="0" rx="65" ry="95" fill="#334155"/>
        <ellipse cx="0" cy="0" rx="55" ry="85" fill="#0f172a"/>
        <ellipse cx="0" cy="0" rx="35" ry="55" fill="url(#metallic)"/>
        <circle cx="0" cy="0" r="14" fill="#f97316"/>
      </g>
      <!-- Right Ear Cup -->
      <g transform="translate(570, 430) rotate(10)">
        <ellipse cx="0" cy="0" rx="65" ry="95" fill="#334155"/>
        <ellipse cx="0" cy="0" rx="55" ry="85" fill="#0f172a"/>
        <ellipse cx="0" cy="0" rx="35" ry="55" fill="url(#metallic)"/>
        <circle cx="0" cy="0" r="14" fill="#f97316"/>
      </g>
    `;
  } else {
    inner = `
      <defs>
        <linearGradient id="gadgetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="50%" stop-color="#1d4ed8"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="#20232a"/>
      <ellipse cx="400" cy="580" rx="200" ry="35" fill="rgba(0,0,0,0.4)" filter="blur(16px)"/>
      <rect x="290" y="240" width="220" height="340" rx="32" fill="#0f172a" stroke="#475569" stroke-width="4"/>
      <rect x="305" y="260" width="190" height="290" rx="20" fill="url(#gadgetGrad)"/>
      <circle cx="400" cy="380" r="50" fill="rgba(255,255,255,0.15)"/>
      <circle cx="400" cy="380" r="30" fill="rgba(255,255,255,0.25)"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">${inner}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'sample-chronograph',
    name: 'Precision Chronograph Watch',
    category: 'Luxury Timepiece',
    description: 'Stainless steel bezel with dual-tone subdials and slate sport strap',
    dataUrl: generateProductSvg('watch'),
  },
  {
    id: 'sample-perfume',
    name: 'Élixir Amber Flacon',
    category: 'Fragrance & Cosmetics',
    description: 'Crystal glass bottle with warm liquid tones and brushed gold cap',
    dataUrl: generateProductSvg('perfume'),
  },
  {
    id: 'sample-headphones',
    name: 'Acoustic Studio Wireless',
    category: 'Consumer Electronics',
    description: 'Over-ear planar magnetic headphones with anodized aluminum accents',
    dataUrl: generateProductSvg('headphones'),
  },
  {
    id: 'sample-gadget',
    name: 'Pocket Smart Hub',
    category: 'Smart Devices',
    description: 'Matte composite handheld terminal with radiant display gradient',
    dataUrl: generateProductSvg('gadget'),
  },
];
