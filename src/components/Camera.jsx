import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Radio, ShieldCheck, Sparkles } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { useRecorder } from '../hooks/useRecorder';
import { useSegmentation } from '../hooks/useSegmentation';
import { BackgroundSelector } from './BackgroundSelector';
import { ColorPickerPanel } from './ColorPickerPanel';
import { ControlsPanel } from './ControlsPanel';
import { EffectsPanel } from './EffectsPanel';
import { FiltersPanel } from './FiltersPanel';
import { RecordingPanel } from './RecordingPanel';
import { VideoCanvas } from './VideoCanvas';
import { captureCanvasImage } from '../utils/rendering';
import { createRecordingFileName, downloadBlob, formatRecordingTime } from '../utils/recording';

const DEFAULT_EFFECTS = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  beautifyEnabled: false,
  beautifyStrength: 18,
  lightingEnabled: true,
  lightingIntensity: 26,
  autoLighting: false,
  filter: 'none',
  mirror: true,
  beforeAfter: false,
  autoFraming: false,
  noiseSuppression: true,
  overlayEnabled: false,
  overlayColor: '#2563eb',
  overlayAlpha: 0.12,
  backgroundBlurStrength: 18
};

export function Camera() {
  const [resolution, setResolution] = useState('720p');
  const { stream, error, isLoading, videoRef } = useCamera(resolution);
  const recorder = useRecorder();
  const [backgroundConfig, setBackgroundConfigState] = useState({
    type: 'blur',
    value: null,
    blurAmount: 18
  });
  const [backgroundMedia, setBackgroundMedia] = useState({ image: null, video: null });
  const [effects, setEffects] = useState(DEFAULT_EFFECTS);
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [recentColors, setRecentColors] = useState([]);
  const [renderFps, setRenderFps] = useState(0);
  const [hasSegmentationMask, setHasSegmentationMask] = useState(false);
  const [recordingOptions, setRecordingOptions] = useState({
    fps: 30,
    quality: 'standard',
    maxDurationSeconds: 0
  });
  const [captureError, setCaptureError] = useState('');

  const canvasRef = useRef(null);
  const previewShellRef = useRef(null);
  const frameIdRef = useRef(0);
  const segmentationResultsRef = useRef(null);
  const hasSegmentationMaskRef = useRef(false);
  const objectUrlRef = useRef('');

  const setBackgroundConfig = useCallback((nextValue) => {
    setBackgroundConfigState((current) => {
      const next = typeof nextValue === 'function' ? nextValue(current) : nextValue;

      if (objectUrlRef.current && current.value === objectUrlRef.current && next.value !== objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = '';
      }

      return next;
    });
  }, []);

  const onResults = useCallback((results) => {
    segmentationResultsRef.current = results;

    if (!hasSegmentationMaskRef.current) {
      hasSegmentationMaskRef.current = true;
      setHasSegmentationMask(true);
    }
  }, []);

  const { isModelLoading, modelError, sendFrame } = useSegmentation(onResults);

  useEffect(() => {
    if (isModelLoading || error || modelError || !stream) return;

    const renderSegmentationLoop = async () => {
      if (videoRef.current?.readyState === 4) {
        await sendFrame(videoRef.current);
      }

      frameIdRef.current = requestAnimationFrame(renderSegmentationLoop);
    };

    frameIdRef.current = requestAnimationFrame(renderSegmentationLoop);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [isModelLoading, error, modelError, stream, sendFrame, videoRef]);

  useEffect(() => {
    let cancelled = false;
    let backgroundVideo;
    const { type, value } = backgroundConfig;

    setBackgroundMedia({ image: null, video: null });

    if (type === 'image' && value) {
      const image = new Image();
      image.onload = () => {
        if (!cancelled) {
          setBackgroundMedia({ image, video: null });
        }
      };
      image.src = value;
    }

    if (type === 'video' && value) {
      backgroundVideo = document.createElement('video');
      backgroundVideo.src = value;
      backgroundVideo.loop = true;
      backgroundVideo.muted = true;
      backgroundVideo.playsInline = true;
      backgroundVideo.onloadeddata = () => {
        if (!cancelled) {
          setBackgroundMedia({ image: null, video: backgroundVideo });
          backgroundVideo.play().catch(() => {});
        }
      };
    }

    return () => {
      cancelled = true;
      if (backgroundVideo) {
        backgroundVideo.pause();
        backgroundVideo.removeAttribute('src');
        backgroundVideo.load();
      }
    };
  }, [backgroundConfig]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleBackgroundFile = useCallback((file) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setBackgroundConfigState({
      type: file.type.startsWith('video/') ? 'video' : 'image',
      value: url,
      blurAmount: backgroundConfig.blurAmount || 18
    });
  }, [backgroundConfig.blurAmount]);

  const studioSettings = useMemo(() => ({
    ...effects,
    recordingActive: recorder.isRecording,
    backgroundBlurStrength: backgroundConfig.blurAmount || effects.backgroundBlurStrength,
    overlayColor: effects.overlayColor || selectedColor.slice(0, 7)
  }), [backgroundConfig.blurAmount, effects, recorder.isRecording, selectedColor]);

  const maxCanvasWidth = resolution === '1080p' ? 1920 : 1280;

  const startRecording = useCallback(() => {
    setEffects((current) => current.beforeAfter ? { ...current, beforeAfter: false } : current);
    recorder.startRecording(canvasRef.current, {
      ...recordingOptions,
      noiseSuppression: effects.noiseSuppression
    });
  }, [effects.noiseSuppression, recorder, recordingOptions]);

  const captureScreenshot = useCallback(async () => {
    setCaptureError('');

    try {
      const blob = await captureCanvasImage(canvasRef.current);
      downloadBlob(blob, createRecordingFileName('png'));
    } catch (screenError) {
      setCaptureError(screenError?.message || 'Unable to capture screenshot.');
    }
  }, []);

  const enterFullscreen = useCallback(() => {
    previewShellRef.current?.requestFullscreen?.();
  }, []);

  if (error) {
    return <div className="surface-message error">{error}</div>;
  }

  if (modelError) {
    return <div className="surface-message error">{modelError}</div>;
  }

  return (
    <div className="studio-layout">
      <section className="preview-column">
        <div className="studio-titlebar">
          <div>
            <span className="eyebrow">AI Webcam Studio</span>
            <h1>Realtime camera enhancement</h1>
          </div>
          <div className="status-strip">
            <span className={hasSegmentationMask ? 'status-pill online' : 'status-pill'}>
              <ShieldCheck className="h-4 w-4" />
              {hasSegmentationMask ? 'AI mask live' : 'AI warming up'}
            </span>
            <span className={recorder.isRecording ? 'status-pill recording' : 'status-pill'}>
              <Radio className="h-4 w-4" />
              {recorder.isRecording ? formatRecordingTime(recorder.elapsedMs) : 'Recorder ready'}
            </span>
          </div>
        </div>

        <div ref={previewShellRef} className="preview-shell">
          <video
            ref={videoRef}
            className="hidden"
            playsInline
            autoPlay
            muted
          />

          {(isLoading || isModelLoading) && (
            <div className="loading-overlay">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-300" />
              <span>{isLoading ? 'Starting camera...' : 'Loading AI segmentation...'}</span>
            </div>
          )}

          {recorder.isRecording && (
            <div className="recording-badge">
              <span />
              REC {formatRecordingTime(recorder.elapsedMs)}
            </div>
          )}

          <VideoCanvas
            ref={canvasRef}
            videoRef={videoRef}
            segmentationResultsRef={segmentationResultsRef}
            backgroundConfig={backgroundConfig}
            backgroundMedia={backgroundMedia}
            studioSettings={studioSettings}
            maxCanvasWidth={maxCanvasWidth}
            onFpsChange={setRenderFps}
          />

          <div className="preview-footer">
            <span><Sparkles className="h-4 w-4" /> Final composited canvas</span>
            <span>{backgroundConfig.type}</span>
          </div>
        </div>

        {(captureError || recorder.error) && (
          <div className="surface-message compact">{captureError || recorder.error}</div>
        )}
      </section>

      <aside className="settings-sidebar hide-scrollbar">
        <ControlsPanel
          effects={effects}
          setEffects={setEffects}
          resolution={resolution}
          setResolution={setResolution}
          renderFps={renderFps}
          onScreenshot={captureScreenshot}
          onFullscreen={enterFullscreen}
          isRecording={recorder.isRecording}
        />
        <RecordingPanel
          recorder={recorder}
          options={recordingOptions}
          setOptions={setRecordingOptions}
          onStart={startRecording}
        />
        <EffectsPanel
          effects={effects}
          setEffects={setEffects}
          backgroundConfig={backgroundConfig}
          setBackgroundConfig={setBackgroundConfig}
        />
        <FiltersPanel effects={effects} setEffects={setEffects} />
        <BackgroundSelector
          backgroundConfig={backgroundConfig}
          setBackgroundConfig={setBackgroundConfig}
          onBackgroundFile={handleBackgroundFile}
          selectedColor={selectedColor}
        />
        <ColorPickerPanel
          color={selectedColor}
          setColor={setSelectedColor}
          recentColors={recentColors}
          setRecentColors={setRecentColors}
          setBackgroundConfig={setBackgroundConfig}
          effects={effects}
          setEffects={setEffects}
        />
      </aside>
    </div>
  );
}
