import React, { useRef, useEffect } from 'react';
import { drawProcessedFrame } from '../utils/compositing';
import { calculateDimensions } from '../utils/rendering';

export function VideoCanvas({ videoRef, results, backgroundConfig, backgroundImage }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !videoRef.current) return;

    const ctx = canvas.getContext('2d');
    
    // Resize canvas once video metadata is loaded
    const video = videoRef.current;
    if (video.videoWidth) {
      const dims = calculateDimensions(video.videoWidth, video.videoHeight, 1280);
      if (canvas.width !== dims.width) {
        canvas.width = dims.width;
        canvas.height = dims.height;
      }
    }

    if (!results) {
      return;
    }

    // Pass the segmentation mask to the compositing utility
    drawProcessedFrame(
      ctx,
      video,
      results.segmentationMask,
      backgroundConfig,
      backgroundImage,
      canvas.width,
      canvas.height
    );
  }, [results, videoRef, backgroundConfig, backgroundImage]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full object-contain mirror-x"
      style={{ transform: "scaleX(-1)" }} 
    />
  );
}