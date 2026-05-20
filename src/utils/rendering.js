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