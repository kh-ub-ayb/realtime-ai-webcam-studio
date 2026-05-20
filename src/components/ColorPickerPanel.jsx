import React, { useMemo, useState } from 'react';
import { HexAlphaColorPicker } from 'react-colorful';
import { Brush, Droplet, Plus, SwatchBook } from 'lucide-react';

const PRESET_COLORS = [
  '#0f172a',
  '#2563eb',
  '#14b8a6',
  '#f97316',
  '#e11d48',
  '#f8fafc',
  '#111827',
  '#7c3aed'
];

function normalizeHex(value) {
  const clean = value.replace(/[^0-9a-f]/gi, '').slice(0, 8);
  const targetLength = clean.length > 6 ? 8 : 6;
  return `#${clean.padEnd(targetLength, '0')}`;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '').padEnd(6, '0').slice(0, 6);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Number(value) || 0)).toString(16).padStart(2, '0'))
    .join('')}`;
}

export function ColorPickerPanel({
  color,
  setColor,
  recentColors,
  setRecentColors,
  setBackgroundConfig,
  effects,
  setEffects
}) {
  const [rgb, setRgb] = useState(hexToRgb(color));
  const alpha = useMemo(() => {
    const clean = color.replace('#', '');
    if (clean.length < 8) return 1;
    return Math.round((parseInt(clean.slice(6, 8), 16) / 255) * 100) / 100;
  }, [color]);

  const updateColor = (nextColor) => {
    const normalized = normalizeHex(nextColor);
    setColor(normalized);
    setRgb(hexToRgb(normalized));
  };

  const rememberColor = (nextColor = color) => {
    const baseColor = normalizeHex(nextColor).slice(0, 7);
    setRecentColors((current) => [baseColor, ...current.filter((item) => item !== baseColor)].slice(0, 8));
    return baseColor;
  };

  const applySolidBackground = () => {
    const selected = rememberColor();
    setBackgroundConfig((current) => ({
      ...current,
      type: 'color',
      value: selected
    }));
  };

  const applyOverlay = () => {
    const selected = rememberColor();
    setEffects((current) => ({
      ...current,
      overlayEnabled: true,
      overlayColor: selected,
      overlayAlpha: effects.overlayAlpha || 0.12
    }));
  };

  const updateRgb = (channel, value) => {
    const nextRgb = {
      ...rgb,
      [channel]: Number(value)
    };

    setRgb(nextRgb);
    setColor(rgbToHex(nextRgb));
  };

  return (
    <section className="studio-panel color-panel">
      <div className="panel-heading">
        <span className="panel-icon panel-icon-color">
          <SwatchBook className="h-4 w-4" />
        </span>
        <div>
          <h2>Color Picker</h2>
          <p>Backgrounds, tint, and ambient color</p>
        </div>
      </div>

      <HexAlphaColorPicker color={color} onChange={updateColor} />

      <div className="color-fields">
        <label>
          <span>Hex</span>
          <input value={color} onChange={(event) => updateColor(event.target.value)} />
        </label>
        <label>
          <span>Alpha</span>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={effects.overlayAlpha ?? alpha}
            onChange={(event) => setEffects((current) => ({ ...current, overlayAlpha: Number(event.target.value) }))}
          />
        </label>
      </div>

      <div className="rgb-grid">
        {['r', 'g', 'b'].map((channel) => (
          <label key={channel}>
            <span>{channel.toUpperCase()}</span>
            <input
              type="number"
              min="0"
              max="255"
              value={rgb[channel]}
              onChange={(event) => updateRgb(channel, event.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="swatch-row">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="color-swatch"
            style={{ backgroundColor: preset }}
            title={preset}
            onClick={() => updateColor(preset)}
          />
        ))}
      </div>

      {recentColors.length > 0 && (
        <div className="swatch-row recent">
          {recentColors.map((recent) => (
            <button
              key={recent}
              type="button"
              className="color-swatch"
              style={{ backgroundColor: recent }}
              title={recent}
              onClick={() => updateColor(recent)}
            />
          ))}
        </div>
      )}

      <div className="action-row">
        <button type="button" className="icon-action" onClick={applySolidBackground}>
          <Droplet className="h-4 w-4" />
          <span>Solid</span>
        </button>
        <button type="button" className="icon-action" onClick={applyOverlay}>
          <Brush className="h-4 w-4" />
          <span>Tint</span>
        </button>
        <button type="button" className="icon-action" onClick={() => rememberColor()}>
          <Plus className="h-4 w-4" />
          <span>Save</span>
        </button>
      </div>
    </section>
  );
}
