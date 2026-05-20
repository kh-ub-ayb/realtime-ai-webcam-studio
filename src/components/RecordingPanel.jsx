import React from 'react';
import { Circle, Pause, Play, Square, Video } from 'lucide-react';
import { RECORDING_QUALITY, formatRecordingTime } from '../utils/recording';

const FPS_OPTIONS = [24, 30, 60];
const LIMIT_OPTIONS = [
  { value: 0, label: 'No limit' },
  { value: 60, label: '1 min' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' }
];

export function RecordingPanel({ recorder, options, setOptions, onStart }) {
  const isRecording = recorder.status === 'recording';
  const isPaused = recorder.status === 'paused';
  const isBusy = recorder.status === 'starting' || recorder.status === 'stopping';

  return (
    <section className="studio-panel recording-panel">
      <div className="panel-heading">
        <span className="panel-icon panel-icon-record">
          <Video className="h-4 w-4" />
        </span>
        <div>
          <h2>Recording</h2>
          <p>Canvas output plus microphone</p>
        </div>
      </div>

      <div className={`recording-status ${recorder.isRecording ? 'live' : ''}`}>
        <span className="record-dot" />
        <span>{recorder.isRecording ? recorder.status : 'ready'}</span>
        <strong>{formatRecordingTime(recorder.elapsedMs)}</strong>
      </div>

      <div className="recording-options">
        <label>
          <span>FPS</span>
          <select
            value={options.fps}
            disabled={recorder.isRecording}
            onChange={(event) => setOptions((current) => ({ ...current, fps: Number(event.target.value) }))}
          >
            {FPS_OPTIONS.map((fps) => (
              <option key={fps} value={fps}>{fps}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Quality</span>
          <select
            value={options.quality}
            disabled={recorder.isRecording}
            onChange={(event) => setOptions((current) => ({ ...current, quality: event.target.value }))}
          >
            {Object.entries(RECORDING_QUALITY).map(([id, quality]) => (
              <option key={id} value={id}>{quality.label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Limit</span>
          <select
            value={options.maxDurationSeconds}
            disabled={recorder.isRecording}
            onChange={(event) => setOptions((current) => ({ ...current, maxDurationSeconds: Number(event.target.value) }))}
          >
            {LIMIT_OPTIONS.map((limit) => (
              <option key={limit.value} value={limit.value}>{limit.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="recording-actions">
        {!recorder.isRecording && (
          <button
            type="button"
            className="record-start"
            disabled={!recorder.supported || isBusy}
            onClick={onStart}
          >
            <Circle className="h-4 w-4 fill-current" />
            Start
          </button>
        )}
        {recorder.isRecording && (
          <button
            type="button"
            className="record-stop"
            disabled={isBusy}
            onClick={recorder.stopRecording}
          >
            <Square className="h-4 w-4 fill-current" />
            Stop
          </button>
        )}
        {isRecording && (
          <button type="button" className="record-secondary" onClick={recorder.pauseRecording}>
            <Pause className="h-4 w-4" />
            Pause
          </button>
        )}
        {isPaused && (
          <button type="button" className="record-secondary" onClick={recorder.resumeRecording}>
            <Play className="h-4 w-4" />
            Resume
          </button>
        )}
      </div>

      {recorder.error && <div className="panel-error">{recorder.error}</div>}
      {!recorder.supported && <div className="panel-error">This browser does not support MediaRecorder canvas capture.</div>}

      {recorder.previewUrl && (
        <video className="record-preview" src={recorder.previewUrl} controls />
      )}
    </section>
  );
}
