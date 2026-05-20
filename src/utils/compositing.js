/**
 * Renders the final composited frame onto the canvas.
 * 
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
 * @param {HTMLVideoElement} video - The source video element
 * @param {ImageBitmap|ImageData|null} segmentationMask - The mask returned by MediaPipe
 * @param {Object} backgroundConfig - The background settings (type, value, blurAmount)
 * @param {HTMLImageElement|null} backgroundImage - The loaded image element if type is 'image'
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function drawProcessedFrame(
  ctx,
  video,
  segmentationMask,
  backgroundConfig,
  backgroundImage,
  width,
  height
) {
  if (!ctx || !video || video.readyState !== 4) return;

  ctx.save();
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // No background effects, just draw the raw video
  if (backgroundConfig.type === 'none') {
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();
    return;
  }

  // Draw the segmentation mask
  if (segmentationMask) {
    // 1. Draw mask
    ctx.drawImage(segmentationMask, 0, 0, width, height);
    
    // 2. Composite the video (foreground) over the mask where mask is opaque
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(video, 0, 0, width, height);

    // 3. Composite the background behind the extracted foreground
    ctx.globalCompositeOperation = 'destination-over';
    
    if (backgroundConfig.type === 'blur') {
      ctx.filter = `blur(${backgroundConfig.blurAmount || 10}px)`;
      ctx.drawImage(video, 0, 0, width, height);
    } else if (backgroundConfig.type === 'image' && backgroundImage) {
      // Draw custom background image
      // Fit to cover
      const scale = Math.max(width / backgroundImage.width, height / backgroundImage.height);
      const x = (width / 2) - (backgroundImage.width / 2) * scale;
      const y = (height / 2) - (backgroundImage.height / 2) * scale;
      ctx.drawImage(backgroundImage, x, y, backgroundImage.width * scale, backgroundImage.height * scale);
    } else if (backgroundConfig.type === 'color') {
      ctx.fillStyle = backgroundConfig.value || '#000000';
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    // Fallback if mask is not ready but effect is selected
    ctx.drawImage(video, 0, 0, width, height);
  }

  ctx.restore();
}