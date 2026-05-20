import { useState, useEffect, useCallback, useRef } from 'react';
import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision';

export function useSegmentation(onResultsCallback) {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const segmenterRef = useRef(null);
  const callbackRef = useRef(onResultsCallback);
  const lastVideoTimeRef = useRef(-1);

  // Hidden canvas to construct the mask efficiently
  const maskCanvasRef = useRef(document.createElement('canvas'));
  const maskCtxRef = useRef(maskCanvasRef.current.getContext('2d', { willReadFrequently: true }));

  useEffect(() => {
    callbackRef.current = onResultsCallback;
  }, [onResultsCallback]);

  useEffect(() => {
    let active = true;

    async function initModel() {
      try {
        setIsModelLoading(true);
        
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        
        const imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          outputCategoryMask: false,
          outputConfidenceMasks: true
        });

        if (active) {
          segmenterRef.current = imageSegmenter;
          setIsModelLoading(false);
          setModelError(null);
          console.log("Tasks Vision Segmenter initialized successfully.");
        }
      } catch (err) {
        console.error("Failed to initialize Tasks Vision Segmenter:", err);
        if (active) {
          setModelError("Failed to load AI model.");
          setIsModelLoading(false);
        }
      }
    }

    initModel();

    return () => {
      active = false;
      if (segmenterRef.current) {
        try {
           segmenterRef.current.close();
        } catch(e) {}
      }
    };
  }, []);

  const sendFrame = useCallback((videoElement) => {
    if (!segmenterRef.current || !videoElement || videoElement.readyState !== 4) return;
    
    const currentTime = videoElement.currentTime;
    if (currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = currentTime;
      
      const startTimeMs = performance.now();
      
      try {
        const result = segmenterRef.current.segmentForVideo(videoElement, startTimeMs);
        
        if (result && result.confidenceMasks && result.confidenceMasks.length > 0) {
          // Process the confidence mask directly into our hidden canvas 
          const mask = result.confidenceMasks[0];
          
          if (maskCanvasRef.current.width !== mask.width || maskCanvasRef.current.height !== mask.height) {
            maskCanvasRef.current.width = mask.width;
            maskCanvasRef.current.height = mask.height;
          }

          // The mask is a Float32Array from 0.0 to 1.0
          const maskArray = mask.getAsFloat32Array();
          const imageData = maskCtxRef.current.createImageData(mask.width, mask.height);
          
          for (let i = 0; i < maskArray.length; i++) {
            const val = Math.round(maskArray[i] * 255);
            // set RGB to black, alpha to the mask confidence
            imageData.data[i * 4 + 0] = 0;
            imageData.data[i * 4 + 1] = 0;
            imageData.data[i * 4 + 2] = 0;
            imageData.data[i * 4 + 3] = val; // transparent where not person
          }

          maskCtxRef.current.putImageData(imageData, 0, 0);

          if (callbackRef.current) {
            // Pass the hidden canvas as the segmentationMask, exactly mimicking old SelfieSegmentation
            callbackRef.current({ segmentationMask: maskCanvasRef.current });
          }
        }
      } catch (e) {
        console.log("Segmentation error:", e);
      }
    }
  }, []);

  return { isModelLoading, modelError, sendFrame };
}