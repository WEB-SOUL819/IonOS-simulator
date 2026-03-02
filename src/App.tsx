import React, { useState } from 'react';
import DeviceSimulator from './components/DeviceSimulator';

export default function App() {
  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Main Pane: Simulator */}
      <div className="w-full h-full flex items-center justify-center bg-zinc-900 p-8 relative">
        <div className="absolute top-6 left-6 text-zinc-500 font-mono text-sm flex flex-col">
          <span className="text-zinc-300 font-bold">Apex V1 Simulator</span>
          <span>ESP32-S3 Target</span>
          <span>Use on-screen buttons to interact</span>
        </div>
        <DeviceSimulator />
      </div>
    </div>
  );
}
