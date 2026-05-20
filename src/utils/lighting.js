import { clamp } from './filters';

export function getLightingBoost(settings = {}) {
  if (!settings.lightingEnabled && !settings.autoLighting) {
    return {
      brightness: 0,
      contrast: 0,
      saturation: 0
    };
  }

  const intensity = clamp(settings.lightingIntensity || 0, 0, 100);
  const autoLift = settings.autoLighting ? 12 : 0;

  return {
    brightness: intensity * 0.34 + autoLift,
    contrast: intensity * 0.12,
    saturation: intensity * 0.06
  };
}

export function applyLightingOverlay(ctx, width, height, settings = {}) {
  if (!settings.lightingEnabled && !settings.autoLighting) {
    return;
  }

  const intensity = clamp((settings.lightingIntensity || 0) + (settings.autoLighting ? 12 : 0), 0, 100);

  if (intensity <= 0) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = clamp(intensity / 210, 0.04, 0.48);

  const light = ctx.createRadialGradient(
    width * 0.5,
    height * 0.28,
    Math.max(width, height) * 0.05,
    width * 0.5,
    height * 0.34,
    Math.max(width, height) * 0.82
  );

  light.addColorStop(0, 'rgba(255,255,255,0.92)');
  light.addColorStop(0.38, 'rgba(255,244,224,0.42)');
  light.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = clamp(intensity / 520, 0.02, 0.16);
  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    Math.max(width, height) * 0.25,
    width * 0.5,
    height * 0.45,
    Math.max(width, height) * 0.82
  );

  vignette.addColorStop(0, 'rgba(255,255,255,0)');
  vignette.addColorStop(1, 'rgba(12,18,31,0.8)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

export function applyAmbientTint(ctx, width, height, settings = {}) {
  if (!settings.overlayEnabled || !settings.overlayColor) {
    return;
  }

  const alpha = clamp(settings.overlayAlpha ?? 0.12, 0, 0.5);

  if (alpha <= 0) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = settings.overlayColor;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
