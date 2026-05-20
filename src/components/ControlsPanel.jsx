import React from 'react';
import {
  Camera as CameraIcon,
  Expand,
  FlipHorizontal,
  Frame,
  Gauge,
  ImageDown,
  Mic2,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { PRESET_MODES } from '../utils/filters';

const RESOLUTIONS = [
  { id: 'auto', label: 'Auto' },
  { id: '720p', label: '720p' },
  { id: '1080p', label: '1080p' }
];

function ToggleButton({ active, disabled, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`control-button ${active ? 'control-button-active' : ''}`}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

export function ControlsPanel({
  effects,
  setEffects,
  resolution,
  setResolution,
  renderFps,
  onScreenshot,
  onFullscreen,
  isRecording
}) {
  const updateEffects = (patch) => {
    setEffects((current) => ({
      ...current,
      ...patch
    }));
  };

  const applyPreset = (preset) => {
    setEffects((current) => ({
      ...current,
      ...preset.settings
    }));
  };

  return (
    <section className="studio-panel">
      <div className="panel-heading">
        <span className="panel-icon">
          <SlidersHorizontal className="h-4 w-4" />
        </span>
        <div>
          <h2>Camera Studio</h2>
          <p>Professional preview controls</p>
        </div>
      </div>

      <div className="control-grid">
        <ToggleButton
          active={effects.mirror}
          icon={FlipHorizontal}
          label="Mirror"
          onClick={() => updateEffects({ mirror: !effects.mirror })}
        />
        <ToggleButton
          active={effects.autoFraming}
          icon={Frame}
          label="Auto frame"
          onClick={() => updateEffects({ autoFraming: !effects.autoFraming })}
        />
        <ToggleButton
          active={effects.beforeAfter}
          disabled={isRecording}
          icon={Gauge}
          label="Compare"
          onClick={() => updateEffects({ beforeAfter: !effects.beforeAfter })}
        />
        <ToggleButton
          active={effects.noiseSuppression}
          icon={Mic2}
          label="Noise"
          onClick={() => updateEffects({ noiseSuppression: !effects.noiseSuppression })}
        />
      </div>

      <div className="segmented-control" aria-label="Webcam resolution">
        {RESOLUTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setResolution(item.id)}
            className={resolution === item.id ? 'active' : ''}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="action-row">
        <button type="button" className="icon-action" onClick={onScreenshot} title="Capture screenshot">
          <ImageDown className="h-4 w-4" />
          <span>Shot</span>
        </button>
        <button type="button" className="icon-action" onClick={onFullscreen} title="Fullscreen preview">
          <Expand className="h-4 w-4" />
          <span>Full</span>
        </button>
        <div className="fps-pill" title="Canvas render FPS">
          <CameraIcon className="h-4 w-4" />
          <span>{renderFps || '--'} FPS</span>
        </div>
      </div>

      <div className="preset-list">
        {PRESET_MODES.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="preset-button"
            onClick={() => applyPreset(preset)}
          >
            <span>{preset.name}</span>
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
    </section>
  );
}
