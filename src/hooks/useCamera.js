import { useState, useEffect, useRef, useCallback } from 'react';

const RESOLUTION_CONSTRAINTS = {
  auto: {
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  '720p': {
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  '1080p': {
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  }
};

export function useCamera(resolution = '720p') {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setStream(null);
  }, []);

  const startCamera = useCallback(async (nextResolution = resolution) => {
    setIsLoading(true);
    setError(null);

    try {
      const selectedResolution = RESOLUTION_CONSTRAINTS[nextResolution] || RESOLUTION_CONSTRAINTS.auto;
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...selectedResolution,
          facingMode: 'user'
        },
        audio: false
      });

      stopCamera();
      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => {
          if (e.name !== 'AbortError') {
            throw e;
          }
        });
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      if (err.name !== 'AbortError') {
        setError("Failed to access webcam. Please ensure permissions are granted.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [resolution, stopCamera]);

  useEffect(() => {
    startCamera(resolution);
    return () => stopCamera();
  }, [resolution, startCamera, stopCamera]);

  return { stream, error, isLoading, videoRef, startCamera, stopCamera };
}
