import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCamera } from '../hooks/useCamera';
import { useSegmentation } from '../hooks/useSegmentation';
import { VideoCanvas } from './VideoCanvas';
import { BackgroundSelector } from './BackgroundSelector';
import { ControlsPanel } from './ControlsPanel';
import { Loader2 } from 'lucide-react';

export function Camera() {
  const { stream, error, isLoading, videoRef } = useCamera();
  const [backgroundConfig, setBackgroundConfig] = useState({ type: 'none', value: null, blurAmount: 10 });
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [latestResults, setLatestResults] = useState(null);
  
  const frameIdRef = useRef();

  // Handle results from MediaPipe
  const onResults = useCallback((results) => {
    setLatestResults(results);
  }, []);

  const { isModelLoading, modelError, sendFrame } = useSegmentation(onResults);

  // Video processing loop
  useEffect(() => {
    if (isModelLoading || error || modelError || !stream) return;

    const renderLoop = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        await sendFrame(videoRef.current);
      }
      frameIdRef.current = requestAnimationFrame(renderLoop);
    };

    frameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [isModelLoading, error, modelError, stream, sendFrame]);

  // Load custom background image
  useEffect(() => {
    if (backgroundConfig.type === 'image' && backgroundConfig.value) {
      const img = new Image();
      img.onload = () => setBackgroundImage(img);
      img.src = backgroundConfig.value;
    } else {
      setBackgroundImage(null);
    }
  }, [backgroundConfig]);

  if (error) {
    return <div className="text-red-500 p-4 rounded bg-red-900/20 max-w-lg mx-auto mt-10 text-center">{error}</div>;
  }
  
  if (modelError) {
    return <div className="text-red-500 p-4 rounded bg-red-900/20 max-w-lg mx-auto mt-10 text-center">{modelError}</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto w-full">
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          
          {/* Hidden video element used for stream source */}
          <video 
            ref={videoRef} 
            className="hidden" 
            playsInline 
            autoPlay 
            muted
          />

          {/* Loading States */}
          {(isLoading || isModelLoading) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
              <p>{isLoading ? 'Starting camera...' : 'Loading AI model...'}</p>
            </div>
          )}

          {/* Main output canvas */}
          <VideoCanvas 
            videoRef={videoRef}
            results={latestResults}
            backgroundConfig={backgroundConfig}
            backgroundImage={backgroundImage}
          />
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-6">
        <ControlsPanel 
          backgroundConfig={backgroundConfig} 
          setBackgroundConfig={setBackgroundConfig} 
        />
        <BackgroundSelector 
          backgroundConfig={backgroundConfig} 
          setBackgroundConfig={setBackgroundConfig} 
        />
      </div>
    </div>
  );
}