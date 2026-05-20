import React from 'react';
import { Image, Upload, Square } from 'lucide-react';

const PRESET_COLORS = [
  '#000000', '#1a365d', '#003300', '#2d3748', '#4a5568', '#718096'
];

export function BackgroundSelector({ backgroundConfig, setBackgroundConfig }) {
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundConfig({ type: 'image', value: url });
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700">
      <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <Image className="w-4 h-4" /> Custom Background
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Upload Image</label>
          <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg shrink-0 cursor-pointer hover:border-blue-500 hover:bg-gray-700/50 transition">
            <span className="flex items-center gap-2 text-sm text-gray-300">
              <Upload className="w-4 h-4" /> Choose File
            </span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Solid Colors</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setBackgroundConfig({ type: 'color', value: color })}
                className={`w-10 h-10 rounded-full border-2 transition ${backgroundConfig.value === color ? 'border-blue-500' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}