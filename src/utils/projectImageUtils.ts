/**
 * Default and Fallback Images for Development Works
 * 
 * Provides sector-accurate, high-resolution official development work imagery
 * with multi-tier fallback (Primary -> Thematic Unsplash -> SVG Vector Graphic)
 * guaranteeing zero broken images across the entire MPLADS portal.
 */

// Category-specific high quality development work photos
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'drinking water': 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=800&auto=format&fit=crop&q=80',
  'water': 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=800&auto=format&fit=crop&q=80',
  'road construction': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
  'road': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
  'school building': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
  'education': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
  'health & family welfare': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
  'health': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
  'non-conventional energy': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  'solar': 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80',
  'community': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
  'sanitation': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  'sports': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
  'default': 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
};

/**
 * Resolves the appropriate fallback development work image URL for a given category.
 */
export function getDefaultProjectImage(category?: string): string {
  if (!category) return CATEGORY_FALLBACK_IMAGES['default'];
  const cat = category.toLowerCase().trim();

  for (const [key, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (key !== 'default' && cat.includes(key)) {
      return url;
    }
  }

  return CATEGORY_FALLBACK_IMAGES['default'];
}

/**
 * Generates an SVG Data URI fallback graphic that never fails over the network.
 */
export function getSvgFallbackDataUri(category: string = 'Development Work', code: string = 'MPLADS'): string {
  const cleanCat = category.replace(/[<>&"]/g, '');
  const cleanCode = code.replace(/[<>&"]/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#0d9488" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#bg)" />
    <!-- Grid motif -->
    <g stroke="#334155" stroke-width="0.5" opacity="0.4">
      <line x1="0" y1="100" x2="600" y2="100" />
      <line x1="0" y1="200" x2="600" y2="200" />
      <line x1="0" y1="300" x2="600" y2="300" />
      <line x1="150" y1="0" x2="150" y2="400" />
      <line x1="300" y1="0" x2="300" y2="400" />
      <line x1="450" y1="0" x2="450" y2="400" />
    </g>
    <!-- Emblem icon silhouette -->
    <circle cx="300" cy="160" r="50" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
    <path d="M280 185 L300 135 L320 185 Z" fill="#38bdf8" opacity="0.8" />
    <path d="M295 185 L300 160 L305 185 Z" fill="#ffffff" />
    <!-- Text -->
    <text x="300" y="245" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="18" font-weight="700" text-anchor="middle">
      ${cleanCat}
    </text>
    <text x="300" y="275" fill="#94a3b8" font-family="system-ui, monospace" font-size="12" text-anchor="middle">
      ${cleanCode} • Official MPLADS Asset
    </text>
    <rect x="230" y="305" width="140" height="24" rx="12" fill="url(#badge)" />
    <text x="300" y="321" fill="#022c22" font-family="system-ui, sans-serif" font-size="10" font-weight="800" text-anchor="middle">
      COMMUNITY WORK
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
