import { applyBeautifyLayer } from './beautify';
import { buildCanvasFilter } from './filters';
import { applyAmbientTint, applyLightingOverlay, getLightingBoost } from './lighting';
import { drawCameraSource, drawMediaCover } from './rendering';

const personCanvas = document.createElement('canvas');
const backgroundCanvas = document.createElement('canvas');

function ensureCanvasSize(canvas, width, height) {
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function drawGradientBackground(ctx, width, height, config = {}) {
  const colors = config.colors || ['#07111f', '#0f766e', '#f97316'];
  const gradient = ctx.createLinearGradient(0, 0, width, height);

  colors.forEach((color, index) => {
    gradient.addColorStop(index / Math.max(colors.length - 1, 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawAnimatedBackground(ctx, width, height, settings = {}, frameTime = 0) {
  const primary = settings.overlayColor || '#38bdf8';
  const seconds = frameTime / 1000;

  ctx.fillStyle = '#080d18';
  ctx.fillRect(0, 0, width, height);

  const glowA = ctx.createRadialGradient(
    width * (0.36 + Math.sin(seconds * 0.35) * 0.08),
    height * (0.42 + Math.cos(seconds * 0.24) * 0.08),
    0,
    width * 0.42,
    height * 0.45,
    Math.max(width, height) * 0.72
  );

  glowA.addColorStop(0, `${primary}cc`);
  glowA.addColorStop(0.42, 'rgba(45, 212, 191, 0.36)');
  glowA.addColorStop(1, 'rgba(8, 13, 24, 0)');
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, width, height);

  const glowB = ctx.createRadialGradient(
    width * (0.72 + Math.cos(seconds * 0.28) * 0.1),
    height * (0.64 + Math.sin(seconds * 0.31) * 0.1),
    0,
    width * 0.72,
    height * 0.64,
    Math.max(width, height) * 0.62
  );

  glowB.addColorStop(0, 'rgba(244, 114, 182, 0.56)');
  glowB.addColorStop(0.5, 'rgba(59, 130, 246, 0.24)');
  glowB.addColorStop(1, 'rgba(8, 13, 24, 0)');
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, width, height);
}

function drawBackground(ctx, video, config, media, width, height, settings, frameTime) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  switch (config.type) {
    case 'blur': {
      const blurAmount = config.blurAmount || settings.backgroundBlurStrength || 18;
      ctx.filter = `${buildCanvasFilter(settings, getLightingBoost(settings))} blur(${blurAmount}px)`;
      drawCameraSource(ctx, video, width, height, settings);
      break;
    }
    case 'image': {
      if (media?.image) {
        drawMediaCover(ctx, media.image, width, height);
      } else {
        drawGradientBackground(ctx, width, height);
      }
      break;
    }
    case 'video': {
      if (media?.video && media.video.readyState >= 2) {
        drawMediaCover(ctx, media.video, width, height);
      } else {
        drawAnimatedBackground(ctx, width, height, settings, frameTime);
      }
      break;
    }
    case 'color': {
      ctx.fillStyle = config.value || settings.overlayColor || '#111827';
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'gradient': {
      drawGradientBackground(ctx, width, height, config);
      break;
    }
    case 'animated': {
      drawAnimatedBackground(ctx, width, height, settings, frameTime);
      break;
    }
    default: {
      ctx.filter = buildCanvasFilter(settings, getLightingBoost(settings));
      drawCameraSource(ctx, video, width, height, settings);
    }
  }

  ctx.restore();
}

function drawPerson(ctx, video, segmentationMask, width, height, settings) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  if (segmentationMask) {
    drawCameraSource(ctx, segmentationMask, width, height, settings);
    ctx.globalCompositeOperation = 'source-in';
  }

  ctx.filter = buildCanvasFilter(settings, getLightingBoost(settings));
  drawCameraSource(ctx, video, width, height, settings);
  ctx.filter = 'none';

  if (segmentationMask) {
    applyBeautifyLayer(
      ctx,
      (targetCtx) => drawCameraSource(targetCtx, video, width, height, settings),
      width,
      height,
      settings
    );
  }

  ctx.restore();
}

function drawBeforeAfter(ctx, video, width, height, settings) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width / 2, height);
  ctx.clip();
  ctx.filter = 'none';
  drawCameraSource(ctx, video, width, height, {
    ...settings,
    autoFraming: false
  });
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  ctx.fillRect(width / 2 - 1, 0, 2, height);
  ctx.font = `${Math.max(13, Math.round(width / 70))}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(4, 10, 20, 0.72)';
  ctx.fillRect(20, 20, 84, 30);
  ctx.fillRect(width / 2 + 20, 20, 74, 30);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Before', 34, 41);
  ctx.fillText('After', width / 2 + 34, 41);
  ctx.restore();
}

/**
 * Renders the final composited frame onto the canvas.
 *
 * The MediaRecorder captures this canvas, so every effect must land here rather
 * than on the raw webcam element.
 */
export function drawProcessedFrame(
  ctx,
  video,
  segmentationMask,
  backgroundConfig,
  backgroundMedia,
  width,
  height,
  settings = {},
  frameTime = performance.now()
) {
  if (!ctx || !video || video.readyState < 2 || !width || !height) {
    return;
  }

  ensureCanvasSize(personCanvas, width, height);
  ensureCanvasSize(backgroundCanvas, width, height);

  const personCtx = personCanvas.getContext('2d');
  const backgroundCtx = backgroundCanvas.getContext('2d');
  const hasReplacement = backgroundConfig?.type && backgroundConfig.type !== 'none';
  const shouldUseMask = Boolean(segmentationMask && hasReplacement);

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  if (shouldUseMask) {
    drawBackground(backgroundCtx, video, backgroundConfig, backgroundMedia, width, height, settings, frameTime);
    drawPerson(personCtx, video, segmentationMask, width, height, settings);
    ctx.drawImage(backgroundCanvas, 0, 0, width, height);
    ctx.drawImage(personCanvas, 0, 0, width, height);
  } else {
    ctx.filter = buildCanvasFilter(settings, getLightingBoost(settings));
    drawCameraSource(ctx, video, width, height, settings);
    ctx.filter = 'none';

    if (settings.beautifyEnabled) {
      applyBeautifyLayer(
        ctx,
        (targetCtx) => drawCameraSource(targetCtx, video, width, height, settings),
        width,
        height,
        settings
      );
    }
  }

  applyLightingOverlay(ctx, width, height, settings);
  applyAmbientTint(ctx, width, height, settings);

  if (settings.beforeAfter && !settings.recordingActive) {
    drawBeforeAfter(ctx, video, width, height, settings);
  }

  ctx.restore();
}
