import React from 'react';
import { Video, Image as ImageIcon, Droplets } from 'lucide-react';

export function ControlsPanel({ backgroundConfig, setBackgroundConfig }) {
  
  const handleBlurChange = (e) => {
    setBackgroundConfig({ type: 'blur', blurAmount: parseInt(e.target.value, 10) });
  };
  
  return (
    <div className="bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-700">
      <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <Video className="w-4 h-4" /> Background Effects
      </h3>
      
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => setBackgroundConfig({ type: 'none', value: null })}
          className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${backgroundConfig.type === 'none' ? 'bg-blue-600/20 border border-blue-500 text-blue-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
        >
          <Video className="w-5 h-5" />
          <span>Original Video</span>
        </button>

        <div className={`p-3 rounded-lg border ${backgroundConfig.type === 'blur' ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-700 border-transparent hover:bg-gray-600'}`}>
          <button 
            onClick={() => setBackgroundConfig({ type: 'blur', blurAmount: backgroundConfig.blurAmount || 10 })}
            className="w-full flex items-center gap-3 text-left mb-2 text-gray-300"
          >
            <Droplets className="w-5 h-5 text-current" />
            <span>Blur Background</span>
          </button>
          
          {backgroundConfig.type === 'blur' && (
            <div className="mt-4 px-2">
              <label className="text-xs text-gray-400 block mb-2">Blur Amount: {backgroundConfig.blurAmount}px</label>
              <input 
                type="range" 
                min="2" 
                max="25"
                value={backgroundConfig.blurAmount || 10}
                onChange={handleBlurChange}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}