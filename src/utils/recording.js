const MIME_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=h264,opus',
  'video/webm'
];

export const RECORDING_QUALITY = {
  economy: {
    label: 'Economy',
    videoBitsPerSecond: 2_500_000
  },
  standard: {
    label: 'Standard',
    videoBitsPerSecond: 5_000_000
  },
  studio: {
    label: 'Studio',
    videoBitsPerSecond: 8_000_000
  }
};

export function isRecordingSupported() {
  return Boolean(
    typeof window !== 'undefined' &&
      window.MediaRecorder &&
      HTMLCanvasElement.prototype.captureStream &&
      navigator.mediaDevices?.getUserMedia
  );
}

export function getSupportedMimeType() {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return '';
  }

  return MIME_TYPES.find((mimeType) => window.MediaRecorder.isTypeSupported(mimeType)) || '';
}

export async function createRecordingStream(canvas, fps = 30, audioSettings = {}) {
  if (!canvas) {
    throw new Error('The final preview canvas is not ready yet.');
  }

  if (!canvas.captureStream) {
    throw new Error('Canvas recording is not supported in this browser.');
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone capture is not supported in this browser.');
  }

  const canvasStream = canvas.captureStream(fps);
  const canvasTrack = canvasStream.getVideoTracks()[0];

  if (!canvasTrack) {
    stopMediaStream(canvasStream);
    throw new Error('Unable to create a video track from the final canvas output.');
  }

  let microphoneStream;

  try {
    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: audioSettings.noiseSuppression ?? true,
        autoGainControl: true
      }
    });
  } catch (error) {
    stopMediaStream(canvasStream);

    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      throw new Error('Microphone permission was denied. Please allow microphone access to record audio.');
    }

    throw new Error('Unable to initialize microphone audio for recording.');
  }

  const combinedStream = new MediaStream([
    canvasTrack,
    ...microphoneStream.getAudioTracks()
  ]);

  return {
    canvasStream,
    microphoneStream,
    combinedStream
  };
}

export function stopMediaStream(stream) {
  stream?.getTracks?.().forEach((track) => {
    try {
      track.stop();
    } catch (error) {
      console.warn('Failed to stop media track:', error);
    }
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function createRecordingFileName(extension = 'webm') {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);

  return `ai-webcam-studio_${timestamp}.${extension}`;
}

export function formatRecordingTime(milliseconds = 0) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  }

  return [minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}
