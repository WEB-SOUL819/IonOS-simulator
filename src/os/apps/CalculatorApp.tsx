import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon } from 'lucide-react';

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);

  const KEYBOARD_LAYOUT = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['C', '0', '=', '+']
  ];

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      if (btn === 'right') {
        setKbCol(prev => Math.min(prev + 1, KEYBOARD_LAYOUT[kbRow].length - 1));
      } else if (btn === 'left') {
        setKbCol(prev => Math.max(prev - 1, 0));
      } else if (btn === 'down') {
        setKbRow(prev => Math.min(prev + 1, KEYBOARD_LAYOUT.length - 1));
      } else if (btn === 'up') {
        setKbRow(prev => Math.max(prev - 1, 0));
      } else if (btn === 'x') {
        const key = KEYBOARD_LAYOUT[kbRow][kbCol];
        if (key === 'C') {
          setDisplay('0');
        } else if (key === '=') {
          try {
            // eslint-disable-next-line no-eval
            const result = eval(display);
            setDisplay(String(result));
          } catch (e) {
            setDisplay('Error');
          }
        } else {
          setDisplay(prev => prev === '0' || prev === 'Error' ? key : prev + key);
        }
      } else if (btn === 'b') {
        setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [display, kbRow, kbCol]);

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col">
      <div className="h-8 bg-emerald-600 flex items-center px-3 border-b border-emerald-700 shrink-0">
        <div className="flex items-center gap-1.5 text-white">
          <CalcIcon size={12} />
          <span className="text-[10px] font-bold">Calculator</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-4">
        <div className="h-16 bg-zinc-950 rounded-lg border border-zinc-800 flex items-end justify-end p-3 mb-4 shadow-inner">
          <span className="text-2xl font-mono text-emerald-400 tracking-wider truncate">{display}</span>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {KEYBOARD_LAYOUT.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-between gap-2 flex-1">
              {row.map((key, cIdx) => (
                <div 
                  key={cIdx} 
                  className={`flex-1 rounded-lg flex items-center justify-center text-sm font-bold shadow-md transition-colors ${
                    rIdx === kbRow && cIdx === kbCol 
                      ? 'bg-emerald-500 text-white' 
                      : ['/', '*', '-', '+', '='].includes(key)
                        ? 'bg-zinc-700 text-emerald-400'
                        : key === 'C'
                          ? 'bg-rose-900 text-rose-400'
                          : 'bg-zinc-800 text-zinc-200'
                  }`}
                >
                  {key}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
