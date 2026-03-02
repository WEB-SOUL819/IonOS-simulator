import React, { useState, useEffect } from 'react';
import { Wrench, Cpu, Battery, Monitor, FileText, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

type View = 'menu' | 'hardware' | 'button' | 'display' | 'battery' | 'logs';

const LOGS = [
  '[0.000] Booting IonOS...',
  '[0.045] CPU: ESP32-S3 (2 Cores)',
  '[0.120] RAM: 8MB PSRAM Detected',
  '[0.150] Display: ST7789 240x320',
  '[0.200] WiFi: Initialized (MAC: AB:CD:EF:01:02:03)',
  '[0.250] BT: BLE Stack Ready',
  '[0.300] Mounting Filesystem... OK',
  '[0.350] Loading Theme Engine...',
  '[0.400] System Ready.',
  '[12.500] User Input: Button A',
  '[15.200] App Launch: Diagnostics',
];

export default function DiagnosticsApp() {
  const { theme } = useTheme();
  const [view, setView] = useState<View>('menu');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Hardware Test State
  const [hwProgress, setHwProgress] = useState(0);
  const [hwStatus, setHwStatus] = useState<'testing' | 'pass' | 'fail'>('testing');
  
  // Button Test State
  const [lastButton, setLastButton] = useState<string | null>(null);
  const [testedButtons, setTestedButtons] = useState<string[]>([]);
  
  // Display Test State
  const [displayColor, setDisplayColor] = useState(0);
  const COLORS = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-white', 'bg-black'];

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      
      if (view === 'menu') {
        if (btn === 'down') setSelectedIndex(prev => Math.min(prev + 1, 4));
        else if (btn === 'up') setSelectedIndex(prev => Math.max(prev - 1, 0));
        else if (btn === 'start' || btn === 'x') {
            const views: View[] = ['hardware', 'button', 'display', 'battery', 'logs'];
            setView(views[selectedIndex]);
            // Reset states
            if (selectedIndex === 0) {
                setHwProgress(0);
                setHwStatus('testing');
            } else if (selectedIndex === 1) {
                setTestedButtons([]);
                setLastButton(null);
            } else if (selectedIndex === 2) {
                setDisplayColor(0);
            }
        } else if (btn === 'b') {
            // Exit app? No, handled by Screen.tsx usually, but here we can't exit app directly.
            // Just do nothing or maybe go back to home if we could.
        }
      }
      else if (view === 'hardware') {
        if (btn === 'b') setView('menu');
      }
      else if (view === 'button') {
        setLastButton(btn);
        if (!testedButtons.includes(btn)) {
            setTestedButtons(prev => [...prev, btn]);
        }
        if (btn === 'menu' && testedButtons.length > 3) setView('menu'); // Escape hatch
      }
      else if (view === 'display') {
        if (btn === 'start' || btn === 'x') {
            setDisplayColor(prev => (prev + 1) % COLORS.length);
        } else if (btn === 'b') {
            setView('menu');
        }
      }
      else if (view === 'battery' || view === 'logs') {
        if (btn === 'b') setView('menu');
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [view, selectedIndex, testedButtons]);

  // Hardware Test Simulation
  useEffect(() => {
    if (view === 'hardware' && hwStatus === 'testing') {
        const interval = setInterval(() => {
            setHwProgress(prev => {
                if (prev >= 100) {
                    setHwStatus('pass');
                    return 100;
                }
                return prev + 2;
            });
        }, 50);
        return () => clearInterval(interval);
    }
  }, [view, hwStatus]);

  if (view === 'display') {
    return (
        <div className={`w-full h-full ${COLORS[displayColor]} flex flex-col items-center justify-center`}>
            <div className="bg-black/50 text-white text-[8px] px-2 py-1 rounded">
                Press X to Cycle | B to Exit
            </div>
        </div>
    );
  }

  return (
    <div className={`w-full h-full ${theme.wallpaper} flex flex-col transition-colors duration-300`}>
      <div className={`h-8 ${theme.highlight} flex items-center px-3 border-b border-white/10 shrink-0 gap-2`}>
        <Wrench size={14} className={theme.accent.replace('text-', 'text-')} />
        <span className="text-xs font-bold text-white">Diagnostics</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {view === 'menu' && (
            <div className="flex flex-col gap-1">
                {[
                    { name: 'Hardware Test', icon: Cpu },
                    { name: 'Button Test', icon: CheckCircle },
                    { name: 'Display Test', icon: Monitor },
                    { name: 'Battery Info', icon: Battery },
                    { name: 'System Logs', icon: FileText },
                ].map((item, idx) => (
                    <div key={item.name} className={`flex items-center gap-3 p-3 rounded-lg ${idx === selectedIndex ? theme.highlight : 'bg-black/20'}`}>
                        <item.icon size={16} className="text-zinc-400" />
                        <span className={`text-xs font-bold ${theme.text}`}>{item.name}</span>
                    </div>
                ))}
            </div>
        )}

        {view === 'hardware' && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Cpu size={32} className={theme.accent.replace('text-', 'text-')} />
                <div className="w-full px-4">
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>System Check</span>
                        <span>{hwProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-100 ${theme.accent.replace('text-', 'bg-')}`} style={{ width: `${hwProgress}%` }} />
                    </div>
                </div>
                {hwStatus === 'pass' && (
                    <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle size={16} />
                        <span className="text-xs font-bold">ALL SYSTEMS GO</span>
                    </div>
                )}
                <div className="text-[9px] text-zinc-500 mt-4">B: Back</div>
            </div>
        )}

        {view === 'button' && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="text-xs text-zinc-400">Press all buttons</div>
                <div className="grid grid-cols-3 gap-2">
                    {['up', 'down', 'left', 'right', 'a', 'b', 'x', 'start', 'menu'].map(btn => (
                        <div 
                            key={btn} 
                            className={`w-12 h-8 rounded flex items-center justify-center text-[10px] font-bold border ${
                                testedButtons.includes(btn) 
                                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                                    : lastButton === btn 
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                            }`}
                        >
                            {btn.toUpperCase()}
                        </div>
                    ))}
                </div>
                <div className="text-[9px] text-zinc-500 mt-4">Hold MENU to Exit</div>
            </div>
        )}

        {view === 'battery' && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Battery size={48} className="text-green-500" />
                <div className="flex flex-col gap-2 w-full px-8">
                    <div className="flex justify-between text-xs text-zinc-300 border-b border-white/10 pb-1">
                        <span>Level</span>
                        <span className="font-bold text-green-400">98%</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-300 border-b border-white/10 pb-1">
                        <span>Voltage</span>
                        <span className="font-mono">4.18V</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-300 border-b border-white/10 pb-1">
                        <span>Health</span>
                        <span className="text-green-400">Good</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-300 border-b border-white/10 pb-1">
                        <span>Temp</span>
                        <span className="font-mono">32°C</span>
                    </div>
                </div>
                <div className="text-[9px] text-zinc-500 mt-4">B: Back</div>
            </div>
        )}

        {view === 'logs' && (
            <div className="flex flex-col h-full">
                <div className="flex-1 bg-black/50 rounded p-2 overflow-y-auto font-mono text-[9px] text-green-400">
                    {LOGS.map((log, i) => (
                        <div key={i} className="mb-0.5">{log}</div>
                    ))}
                </div>
                <div className="text-[9px] text-zinc-500 mt-2 text-center">B: Back</div>
            </div>
        )}
      </div>
    </div>
  );
}
