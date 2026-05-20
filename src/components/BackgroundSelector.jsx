import React, { useState } from 'react';
import { Clapperboard, Droplets, Image, PaintBucket, Upload, Wand2 } from 'lucide-react';

const GRADIENTS = [
  ['#07111f', '#0f766e', '#f97316'],
  ['#111827', '#2563eb', '#e11d48'],
  ['#020617', '#7c3aed', '#22c55e']
];

function BackgroundButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      className={`background-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

export function BackgroundSelector({
  backgroundConfig,
  setBackgroundConfig,
  onBackgroundFile,
  selectedColor
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (file) {
      onBackgroundFile(file);
    }
  };

  const handleFileUpload = (event) => {
    handleFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <section className="studio-panel">
      <div className="panel-heading">
        <span className="panel-icon panel-icon-cool">
          <Image className="h-4 w-4" />
        </span>
        <div>
          <h2>Backgrounds</h2>
          <p>Replacement, blur, color, and motion</p>
        </div>
      </div>

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-5 w-5" />
        <span>Drop image or video</span>
        <input type="file" accept="image/*,video/*" onChange={handleFileUpload} />
      </div>

      <div className="background-grid">
        <BackgroundButton
          active={backgroundConfig.type === 'none'}
          icon={Clapperboard}
          label="Original"
          onClick={() => setBackgroundConfig((current) => ({ ...current, type: 'none', value: null }))}
        />
        <BackgroundButton
          active={backgroundConfig.type === 'blur'}
          icon={Droplets}
          label="Blur"
          onClick={() => setBackgroundConfig((current) => ({ ...current, type: 'blur', blurAmount: current.blurAmount || 18 }))}
        />
        <BackgroundButton
          active={backgroundConfig.type === 'color'}
          icon={PaintBucket}
          label="Solid"
          onClick={() => setBackgroundConfig((current) => ({ ...current, type: 'color', value: selectedColor.slice(0, 7) }))}
        />
        <BackgroundButton
          active={backgroundConfig.type === 'animated'}
          icon={Wand2}
          label="Ambient"
          onClick={() => setBackgroundConfig((current) => ({ ...current, type: 'animated' }))}
        />
      </div>

      <div className="gradient-row">
        {GRADIENTS.map((colors) => (
          <button
            key={colors.join('-')}
            type="button"
            className={`gradient-swatch ${backgroundConfig.type === 'gradient' && backgroundConfig.colors?.join('-') === colors.join('-') ? 'active' : ''}`}
            style={{ background: `linear-gradient(135deg, ${colors.join(', ')})` }}
            onClick={() => setBackgroundConfig((current) => ({ ...current, type: 'gradient', colors }))}
            title="Gradient background"
          />
        ))}
      </div>
    </section>
  );
}
