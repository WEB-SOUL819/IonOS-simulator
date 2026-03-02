import React, { useState } from 'react';
import Screen from './Screen';

export default function DeviceSimulator() {
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);

  const handleButtonDown = (btn: string) => {
    setButtonPressed(btn);
    window.dispatchEvent(new CustomEvent('device-button-down', { detail: btn }));
  };

  const handleButtonUp = (btn: string) => {
    setButtonPressed(null);
    window.dispatchEvent(new CustomEvent('device-button-up', { detail: btn }));
  };

  return (
    <div className="relative w-[340px] h-[680px] bg-zinc-800 rounded-[40px] shadow-2xl border-4 border-zinc-700 flex flex-col items-center p-6 pb-8 select-none">
      {/* Screen Bezel */}
      <div className="w-[260px] h-[340px] bg-black rounded-xl flex items-center justify-center mb-8 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] border border-zinc-900">
        {/* Actual Screen 240x320 */}
        <div className="w-[240px] h-[320px] bg-zinc-900 overflow-hidden relative rounded-sm">
          <Screen />
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex-1 flex flex-col justify-between px-4">
        {/* Top row controls */}
        <div className="flex justify-between items-center w-full px-2">
          {/* D-Pad */}
          <div className="relative w-24 h-24">
            <div 
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-t-lg cursor-pointer transition-colors ${buttonPressed === 'up' ? 'bg-zinc-500' : 'bg-zinc-600 hover:bg-zinc-500'}`}
              onMouseDown={() => handleButtonDown('up')} onMouseUp={() => handleButtonUp('up')} onMouseLeave={() => handleButtonUp('up')} 
            />
            <div 
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-b-lg cursor-pointer transition-colors ${buttonPressed === 'down' ? 'bg-zinc-500' : 'bg-zinc-600 hover:bg-zinc-500'}`}
              onMouseDown={() => handleButtonDown('down')} onMouseUp={() => handleButtonUp('down')} onMouseLeave={() => handleButtonUp('down')} 
            />
            <div 
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-l-lg cursor-pointer transition-colors ${buttonPressed === 'left' ? 'bg-zinc-500' : 'bg-zinc-600 hover:bg-zinc-500'}`}
              onMouseDown={() => handleButtonDown('left')} onMouseUp={() => handleButtonUp('left')} onMouseLeave={() => handleButtonUp('left')} 
            />
            <div 
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-r-lg cursor-pointer transition-colors ${buttonPressed === 'right' ? 'bg-zinc-500' : 'bg-zinc-600 hover:bg-zinc-500'}`}
              onMouseDown={() => handleButtonDown('right')} onMouseUp={() => handleButtonUp('right')} onMouseLeave={() => handleButtonUp('right')} 
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-600 shadow-inner" />
          </div>

          {/* Action Buttons */}
          <div className="relative w-24 h-24">
            <div 
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-sm font-bold shadow-md transition-colors ${buttonPressed === 'x' ? 'bg-blue-500 text-white' : 'bg-blue-600 text-blue-100 hover:bg-blue-500'}`}
              onMouseDown={() => handleButtonDown('x')} onMouseUp={() => handleButtonUp('x')} onMouseLeave={() => handleButtonUp('x')}
            >X</div>
            <div 
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-sm font-bold shadow-md transition-colors ${buttonPressed === 'b' ? 'bg-green-500 text-white' : 'bg-green-600 text-green-100 hover:bg-green-500'}`}
              onMouseDown={() => handleButtonDown('b')} onMouseUp={() => handleButtonUp('b')} onMouseLeave={() => handleButtonUp('b')}
            >B</div>
            <div 
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full cursor-pointer flex items-center justify-center text-sm font-bold shadow-md transition-colors ${buttonPressed === 'a' ? 'bg-red-500 text-white' : 'bg-red-600 text-red-100 hover:bg-red-500'}`}
              onMouseDown={() => handleButtonDown('a')} onMouseUp={() => handleButtonUp('a')} onMouseLeave={() => handleButtonUp('a')}
            >A</div>
          </div>
        </div>

        {/* Bottom row controls */}
        <div className="flex justify-center gap-10 mt-6">
          <div className="flex flex-col items-center gap-1">
            <div 
              className={`w-12 h-4 rounded-full cursor-pointer shadow-inner transition-colors ${buttonPressed === 'menu' ? 'bg-zinc-500' : 'bg-zinc-600 hover:bg-zinc-500'}`}
              onMouseDown={() => handleButtonDown('menu')} onMouseUp={() => handleButtonUp('menu')} onMouseLeave={() => handleButtonUp('menu')}
            />
            <span className="text-[9px] font-bold text-zinc-400 tracking-widest">MENU</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div 
              className={`w-12 h-4 rounded-full cursor-pointer shadow-inner transition-colors ${buttonPressed === 'start' ? 'bg-zinc-500' : 'bg-zinc-600 hover:bg-zinc-500'}`}
              onMouseDown={() => handleButtonDown('start')} onMouseUp={() => handleButtonUp('start')} onMouseLeave={() => handleButtonUp('start')}
            />
            <span className="text-[9px] font-bold text-zinc-400 tracking-widest">START</span>
          </div>
        </div>
      </div>
    </div>
  );
}
