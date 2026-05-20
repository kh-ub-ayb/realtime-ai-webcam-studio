import { clamp } from './filters';

export function applyBeautifyLayer(ctx, drawVideoSource, width, height, settings = {}) {
  if (!settings.beautifyEnabled) {
    return;
  }

  const strength = clamp(settings.beautifyStrength || 0, 0, 100);

  if (strength <= 0) {
    return;
  }

  const softness = 0.45 + strength / 42;
  const softAlpha = clamp(strength / 310, 0.04, 0.32);
  const detailAlpha = clamp(strength / 700, 0.02, 0.12);

  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.globalAlpha = softAlpha;
  ctx.filter = `blur(${softness}px) brightness(103%) saturate(104%)`;
  drawVideoSource(ctx, width, height);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.globalAlpha = detailAlpha;
  ctx.filter = 'contrast(112%) saturate(104%)';
  drawVideoSource(ctx, width, height);
  ctx.restore();
}
