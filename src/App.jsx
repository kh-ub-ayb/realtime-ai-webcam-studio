import React from 'react';
import { Camera } from './components/Camera';
import { Layers } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-gray-800 shadow-md border-b border-gray-700 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              AI Background Effects
            </h1>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">
            Real-time Browser Compositing
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full p-4 md:p-8 flex-1 flex flex-col items-center justify-start max-w-7xl mx-auto">
        <div className="w-full mb-6">
          <h2 className="text-3xl font-semibold mb-2 text-white">Workspace Preview</h2>
          <p className="text-gray-400 text-sm">
            Everything runs locally in your browser using MediaPipe and Canvas API.
          </p>
        </div>
        
        <Camera />
      </main>
      
      {/* Footer */}
      <footer className="w-full p-4text-center text-gray-500 text-sm py-6 mt-auto">
        Powered by React, Vite, and MediaPipe Selfie Segmentation.
      </footer>
    </div>
  );
}

export default App;