/**
 * Calculates correct dimension to maintain aspect ratio
 */
export function calculateDimensions(videoWidth, videoHeight, maxWidth) {
  if (!videoWidth || !videoHeight) return { width: 640, height: 480 };
  
  const ratio = videoHeight / videoWidth;
  const width = Math.min(videoWidth, maxWidth);
  const height = width * ratio;
  
  return { width, height };
}

export function drawMediaCover(ctx, media, width, height) {
  const sourceWidth = media?.videoWidth || media?.naturalWidth || media?.width;
  const sourceHeight = media?.videoHeight || media?.naturalHeight || media?.height;

  if (!sourceWidth || !sourceHeight) {
    return;
  }

  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  ctx.drawImage(media, x, y, drawWidth, drawHeight);
}

export function drawCameraSource(ctx, video, width, height, settings = {}) {
  const zoom = settings.autoFraming ? 1.08 : 1;
  const drawWidth = width * zoom;
  const drawHeight = height * zoom;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  ctx.save();

  if (settings.mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, x, y, drawWidth, drawHeight);
  ctx.restore();
}

export function captureCanvasImage(canvas) {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(new Error('The final preview canvas is not ready yet.'));
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Unable to capture the current frame.'));
      }
    }, 'image/png', 1);
  });
}
