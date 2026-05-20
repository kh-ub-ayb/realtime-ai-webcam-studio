export const FILTER_PRESETS = [
  { id: 'none', name: 'Clean', tone: {} },
  { id: 'warm', name: 'Warm', tone: { brightness: 4, contrast: 4, saturation: 10, sepia: 12, hueRotate: -4 } },
  { id: 'cool', name: 'Cool', tone: { brightness: 2, contrast: 3, saturation: 8, hueRotate: 12 } },
  { id: 'cinematic', name: 'Cinematic', tone: { brightness: -4, contrast: 18, saturation: -8, sepia: 12 } },
  { id: 'grayscale', name: 'Grayscale', tone: { grayscale: 100 } },
  { id: 'blackWhite', name: 'B&W', tone: { grayscale: 100, contrast: 32 } },
  { id: 'vintage', name: 'Vintage', tone: { brightness: 4, contrast: 8, saturation: -14, sepia: 48 } },
  { id: 'vivid', name: 'Vivid', tone: { contrast: 10, saturation: 34 } },
  { id: 'sharp', name: 'Sharp', tone: { contrast: 18, saturation: 5 } },
  { id: 'soft', name: 'Soft', tone: { brightness: 5, contrast: -8, saturation: -4, blur: 0.35 } },
  { id: 'neon', name: 'Neon', tone: { brightness: 3, contrast: 22, saturation: 55, hueRotate: 18 } },
  { id: 'cyberpunk', name: 'Cyberpunk', tone: { brightness: 2, contrast: 24, saturation: 45, hueRotate: 285 } }
];

export const PRESET_MODES = [
  {
    id: 'studio',
    name: 'Studio Mode',
    settings: {
      brightness: 8,
      contrast: 10,
      saturation: 8,
      sharpness: 12,
      beautifyEnabled: true,
      beautifyStrength: 18,
      lightingEnabled: true,
      lightingIntensity: 38,
      filter: 'none'
    }
  },
  {
    id: 'professional',
    name: 'Professional Mode',
    settings: {
      brightness: 2,
      contrast: 14,
      saturation: 2,
      sharpness: 18,
      beautifyEnabled: false,
      lightingEnabled: true,
      lightingIntensity: 28,
      filter: 'cinematic'
    }
  },
  {
    id: 'streaming',
    name: 'Streaming Mode',
    settings: {
      brightness: 10,
      contrast: 12,
      saturation: 18,
      sharpness: 14,
      beautifyEnabled: true,
      beautifyStrength: 16,
      lightingEnabled: true,
      lightingIntensity: 32,
      filter: 'vivid'
    }
  },
  {
    id: 'gaming',
    name: 'Gaming Mode',
    settings: {
      brightness: 6,
      contrast: 20,
      saturation: 28,
      sharpness: 20,
      beautifyEnabled: false,
      lightingEnabled: true,
      lightingIntensity: 20,
      filter: 'neon'
    }
  },
  {
    id: 'softLight',
    name: 'Soft Light Mode',
    settings: {
      brightness: 12,
      contrast: -2,
      saturation: 6,
      sharpness: -4,
      beautifyEnabled: true,
      beautifyStrength: 28,
      lightingEnabled: true,
      lightingIntensity: 45,
      filter: 'soft'
    }
  }
];

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getFilterPreset(id) {
  return FILTER_PRESETS.find((filter) => filter.id === id) || FILTER_PRESETS[0];
}

export function buildCanvasFilter(settings = {}, lightingBoost = {}) {
  const preset = getFilterPreset(settings.filter);
  const tone = preset.tone || {};
  const sharpnessBoost = (settings.sharpness || 0) * 0.28;

  const brightness = clamp(
    100 + (settings.brightness || 0) + (tone.brightness || 0) + (lightingBoost.brightness || 0),
    20,
    220
  );
  const contrast = clamp(
    100 + (settings.contrast || 0) + (tone.contrast || 0) + sharpnessBoost + (lightingBoost.contrast || 0),
    20,
    240
  );
  const saturation = clamp(
    100 + (settings.saturation || 0) + (tone.saturation || 0) + (lightingBoost.saturation || 0),
    0,
    280
  );
  const blur = Math.max(0, tone.blur || 0);
  const grayscale = clamp(tone.grayscale || 0, 0, 100);
  const sepia = clamp(tone.sepia || 0, 0, 100);
  const hueRotate = tone.hueRotate || 0;

  const filters = [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturation}%)`
  ];

  if (grayscale > 0) {
    filters.push(`grayscale(${grayscale}%)`);
  }

  if (sepia > 0) {
    filters.push(`sepia(${sepia}%)`);
  }

  if (hueRotate !== 0) {
    filters.push(`hue-rotate(${hueRotate}deg)`);
  }

  if (blur > 0) {
    filters.push(`blur(${blur}px)`);
  }

  return filters.join(' ');
}
