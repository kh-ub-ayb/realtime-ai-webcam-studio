import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { drawProcessedFrame } from '../utils/compositing';
import { calculateDimensions } from '../utils/rendering';

export const VideoCanvas = forwardRef(function VideoCanvas(
  {
    videoRef,
    segmentationResultsRef,
    backgroundConfig,
    backgroundMedia,
    studioSettings,
    maxCanvasWidth = 1280,
    onFpsChange
  },
  forwardedRef
) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const propsRef = useRef({
    backgroundConfig,
    backgroundMedia,
    studioSettings,
    maxCanvasWidth,
    onFpsChange
  });
  const fpsRef = useRef({
    frames: 0,
    lastTime: performance.now()
  });

  useImperativeHandle(forwardedRef, () => canvasRef.current);

  useEffect(() => {
    propsRef.current = {
      backgroundConfig,
      backgroundMedia,
      studioSettings,
      maxCanvasWidth,
      onFpsChange
    };
  }, [backgroundConfig, backgroundMedia, maxCanvasWidth, onFpsChange, studioSettings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });

    const render = (now) => {
      const video = videoRef.current;

      if (video?.videoWidth && video?.videoHeight) {
        const { backgroundConfig: currentBackgroundConfig, backgroundMedia: currentBackgroundMedia, studioSettings: currentStudioSettings, maxCanvasWidth: currentMaxCanvasWidth } = propsRef.current;
        const dims = calculateDimensions(video.videoWidth, video.videoHeight, currentMaxCanvasWidth);

        if (canvas.width !== dims.width || canvas.height !== dims.height) {
          canvas.width = dims.width;
          canvas.height = dims.height;
        }

        drawProcessedFrame(
          ctx,
          video,
          segmentationResultsRef.current?.segmentationMask,
          currentBackgroundConfig,
          currentBackgroundMedia,
          canvas.width,
          canvas.height,
          currentStudioSettings,
          now
        );
      }

      fpsRef.current.frames += 1;

      if (now - fpsRef.current.lastTime >= 700) {
        propsRef.current.onFpsChange?.(
          Math.round((fpsRef.current.frames * 1000) / (now - fpsRef.current.lastTime))
        );
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = now;
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [segmentationResultsRef, videoRef]);

  return (
    <canvas 
      ref={canvasRef} 
      className="h-full w-full object-contain"
      aria-label="Final processed webcam canvas"
    />
  );
});
