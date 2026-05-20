import React from 'react';
import { Camera } from './components/Camera';
import { Layers, RadioTower } from 'lucide-react';

function App() {
  return (
    <div className="app-shell min-h-screen text-slate-100">
      <header className="app-header">
        <div className="mx-auto flex w-full max-w-[1540px] items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="brand-kicker">Browser-native AI camera</p>
              <h1 className="brand-title">Realtime AI Webcam Studio</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 sm:flex">
            <RadioTower className="h-4 w-4 text-emerald-300" />
            Canvas, MediaPipe, MediaRecorder
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1540px] flex-1 px-4 py-5 md:px-6 md:py-7">
        <Camera />
      </main>

      <footer className="mx-auto w-full max-w-[1540px] px-4 pb-5 text-center text-xs text-slate-500 md:px-6">
        © 2026 Syed Khubayb Ur Rahman. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
