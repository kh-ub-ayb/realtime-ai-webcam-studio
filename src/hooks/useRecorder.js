import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createRecordingFileName,
  createRecordingStream,
  downloadBlob,
  getSupportedMimeType,
  isRecordingSupported,
  RECORDING_QUALITY,
  stopMediaStream
} from '../utils/recording';

const INITIAL_STATE = {
  status: 'idle',
  error: '',
  elapsedMs: 0,
  previewUrl: '',
  mimeType: ''
};

export function useRecorder() {
  const [state, setState] = useState(INITIAL_STATE);
  const chunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const streamsRef = useRef(null);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const elapsedBeforePauseRef = useRef(0);
  const durationTimeoutRef = useRef(null);
  const previewUrlRef = useRef('');

  const supported = useMemo(() => isRecordingSupported(), []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearDurationTimeout = useCallback(() => {
    if (durationTimeoutRef.current) {
      window.clearTimeout(durationTimeoutRef.current);
      durationTimeoutRef.current = null;
    }
  }, []);

  const cleanupStreams = useCallback(() => {
    if (streamsRef.current) {
      stopMediaStream(streamsRef.current.combinedStream);
      stopMediaStream(streamsRef.current.microphoneStream);
      stopMediaStream(streamsRef.current.canvasStream);
      streamsRef.current = null;
    }
  }, []);

  const updateElapsed = useCallback(() => {
    setState((current) => ({
      ...current,
      elapsedMs: elapsedBeforePauseRef.current + Math.max(0, Date.now() - startedAtRef.current)
    }));
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    startedAtRef.current = Date.now();
    timerRef.current = window.setInterval(updateElapsed, 250);
    updateElapsed();
  }, [clearTimer, updateElapsed]);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
  }, []);

  const resetRecorder = useCallback(() => {
    clearTimer();
    clearDurationTimeout();
    cleanupStreams();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = 0;
    elapsedBeforePauseRef.current = 0;
  }, [cleanupStreams, clearDurationTimeout, clearTimer]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === 'inactive') {
      resetRecorder();
      setState((current) => ({ ...current, status: 'idle' }));
      return;
    }

    clearTimer();
    clearDurationTimeout();
    setState((current) => ({ ...current, status: 'stopping' }));

    try {
      recorder.stop();
    } catch (error) {
      resetRecorder();
      setState((current) => ({
        ...current,
        status: 'idle',
        error: error?.message || 'Recording could not be stopped.'
      }));
    }
  }, [clearDurationTimeout, clearTimer, resetRecorder]);

  const startRecording = useCallback(
    async (
      canvas,
      {
        fps = 30,
        quality = 'standard',
        maxDurationSeconds = 0,
        autoDownload = true,
        noiseSuppression = true
      } = {}
    ) => {
      if (!supported) {
        setState((current) => ({
          ...current,
          error: 'Recording is not supported in this browser.'
        }));
        return false;
      }

      if (mediaRecorderRef.current?.state === 'recording') {
        return false;
      }

      resetRecorder();
      revokePreviewUrl();
      setState({
        ...INITIAL_STATE,
        status: 'starting',
        previewUrl: ''
      });

      try {
        const streams = await createRecordingStream(canvas, fps, { noiseSuppression });
        const mimeType = getSupportedMimeType();
        const selectedQuality = RECORDING_QUALITY[quality] || RECORDING_QUALITY.standard;
        const recorderOptions = {
          videoBitsPerSecond: selectedQuality.videoBitsPerSecond,
          audioBitsPerSecond: 128_000
        };

        if (mimeType) {
          recorderOptions.mimeType = mimeType;
        }

        const recorder = new MediaRecorder(streams.combinedStream, recorderOptions);

        streamsRef.current = streams;
        chunksRef.current = [];
        mediaRecorderRef.current = recorder;
        elapsedBeforePauseRef.current = 0;

        recorder.ondataavailable = (event) => {
          if (event.data?.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onerror = (event) => {
          const message = event.error?.message || 'Recording failed.';
          resetRecorder();
          setState((current) => ({
            ...current,
            status: 'idle',
            error: message
          }));
        };

        recorder.onstop = () => {
          const type = recorder.mimeType || mimeType || 'video/webm';
          const blob = new Blob(chunksRef.current, { type });
          const previewUrl = blob.size > 0 ? URL.createObjectURL(blob) : '';

          if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
          }

          previewUrlRef.current = previewUrl;

          if (blob.size > 0 && autoDownload) {
            downloadBlob(blob, createRecordingFileName('webm'));
          }

          resetRecorder();
          setState((current) => ({
            ...current,
            status: 'idle',
            previewUrl,
            mimeType: type,
            error: blob.size > 0 ? '' : 'No recording data was captured.'
          }));
        };

        recorder.start(1_000);
        setState((current) => ({
          ...current,
          status: 'recording',
          error: '',
          mimeType: recorder.mimeType || mimeType || 'video/webm'
        }));
        startTimer();

        if (maxDurationSeconds > 0) {
          durationTimeoutRef.current = window.setTimeout(stopRecording, maxDurationSeconds * 1000);
        }

        return true;
      } catch (error) {
        resetRecorder();
        setState((current) => ({
          ...current,
          status: 'idle',
          error: error?.message || 'Unable to start recording.'
        }));
        return false;
      }
    },
    [resetRecorder, revokePreviewUrl, startTimer, stopRecording, supported]
  );

  const pauseRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== 'recording') {
      return;
    }

    elapsedBeforePauseRef.current += Math.max(0, Date.now() - startedAtRef.current);
    clearTimer();

    try {
      recorder.pause();
      setState((current) => ({
        ...current,
        status: 'paused',
        elapsedMs: elapsedBeforePauseRef.current
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error?.message || 'Unable to pause recording.'
      }));
    }
  }, [clearTimer]);

  const resumeRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state !== 'paused') {
      return;
    }

    try {
      recorder.resume();
      setState((current) => ({ ...current, status: 'recording' }));
      startTimer();
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error?.message || 'Unable to resume recording.'
      }));
    }
  }, [startTimer]);

  useEffect(() => {
    return () => {
      resetRecorder();
      revokePreviewUrl();
    };
  }, [resetRecorder, revokePreviewUrl]);

  return {
    ...state,
    supported,
    isRecording: state.status === 'recording' || state.status === 'paused' || state.status === 'starting' || state.status === 'stopping',
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearPreview: revokePreviewUrl
  };
}
