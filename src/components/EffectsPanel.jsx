import React from 'react';
import { Aperture, LampDesk, RotateCcw, Sparkles, SunMedium, Wand2 } from 'lucide-react';

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
  overlayEnabled: false,
  overlayAlpha: 0.12
};

function RangeControl({ label, value, min, max, step = 1, suffix = '', onChange, onReset }) {
  return (
    <div className="range-control">
      <div className="range-label">
        <span>{label}</span>
        <button type="button" onClick={onReset} title={`Reset ${label}`}>
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="range-line">
        <input
          className="range-input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span>{value}{suffix}</span>
      </div>
    </div>
  );
}

export function EffectsPanel({ effects, setEffects, backgroundConfig, setBackgroundConfig }) {
  const updateEffects = (patch) => {
    setEffects((current) => ({
      ...current,
      ...patch
    }));
  };

  const resetImage = () => {
    setEffects((current) => ({
      ...current,
      ...DEFAULT_EFFECTS
    }));
  };

  return (
    <section className="studio-panel">
      <div className="panel-heading">
        <span className="panel-icon panel-icon-warm">
          <Wand2 className="h-4 w-4" />
        </span>
        <div>
          <h2>Enhancement</h2>
          <p>Live image and lighting controls</p>
        </div>
      </div>

      <div className="panel-toolbar">
        <button type="button" className="small-command" onClick={resetImage}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
        <button
          type="button"
          className={`small-command ${effects.autoLighting ? 'small-command-active' : ''}`}
          onClick={() => updateEffects({ autoLighting: !effects.autoLighting })}
        >
          <SunMedium className="h-4 w-4" />
          Auto light
        </button>
      </div>

      <RangeControl
        label="Brightness"
        min={-100}
        max={100}
        value={effects.brightness}
        onChange={(brightness) => updateEffects({ brightness })}
        onReset={() => updateEffects({ brightness: 0 })}
      />
      <RangeControl
        label="Contrast"
        min={-100}
        max={100}
        value={effects.contrast}
        onChange={(contrast) => updateEffects({ contrast })}
        onReset={() => updateEffects({ contrast: 0 })}
      />
      <RangeControl
        label="Saturation"
        min={-100}
        max={100}
        value={effects.saturation}
        onChange={(saturation) => updateEffects({ saturation })}
        onReset={() => updateEffects({ saturation: 0 })}
      />
      <RangeControl
        label="Sharpness"
        min={-100}
        max={100}
        value={effects.sharpness}
        onChange={(sharpness) => updateEffects({ sharpness })}
        onReset={() => updateEffects({ sharpness: 0 })}
      />

      <div className="feature-toggle">
        <button
          type="button"
          className={effects.beautifyEnabled ? 'active' : ''}
          onClick={() => updateEffects({ beautifyEnabled: !effects.beautifyEnabled })}
        >
          <Sparkles className="h-4 w-4" />
          Beautify
        </button>
        <button
          type="button"
          className={effects.lightingEnabled ? 'active' : ''}
          onClick={() => updateEffects({ lightingEnabled: !effects.lightingEnabled })}
        >
          <LampDesk className="h-4 w-4" />
          Studio light
        </button>
      </div>

      {effects.beautifyEnabled && (
        <RangeControl
          label="Beautify"
          min={0}
          max={100}
          value={effects.beautifyStrength}
          onChange={(beautifyStrength) => updateEffects({ beautifyStrength })}
          onReset={() => updateEffects({ beautifyStrength: 18 })}
        />
      )}

      {effects.lightingEnabled && (
        <RangeControl
          label="Lighting"
          min={0}
          max={100}
          value={effects.lightingIntensity}
          onChange={(lightingIntensity) => updateEffects({ lightingIntensity })}
          onReset={() => updateEffects({ lightingIntensity: 26 })}
        />
      )}

      <RangeControl
        label="Background blur"
        min={2}
        max={40}
        suffix="px"
        value={backgroundConfig.blurAmount || effects.backgroundBlurStrength || 18}
        onChange={(blurAmount) => setBackgroundConfig((current) => ({ ...current, type: 'blur', blurAmount }))}
        onReset={() => setBackgroundConfig((current) => ({ ...current, blurAmount: 18 }))}
      />

      <div className="effect-note">
        <Aperture className="h-4 w-4" />
        <span>All adjustments render into the final canvas.</span>
      </div>
    </section>
  );
}
