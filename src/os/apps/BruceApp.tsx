import React, { useState, useEffect } from 'react';
import { Terminal, Wifi, Bluetooth, Radio, Usb, Zap, ChevronRight } from 'lucide-react';

const MENU = [
  { name: 'WiFi', icon: Wifi, children: ['Scan APs', 'Deauth Attack', 'Beacon Spam'] },
  { name: 'Bluetooth', icon: Bluetooth, children: ['Scan BLE', 'Sour Apple', 'Samsung Spam'] },
  { name: 'BadUSB', icon: Usb, children: ['Execute Payload', 'Select Script'] },
  { name: 'RFID', icon: Radio, children: ['Read Card', 'Emulate Card'] },
  { name: 'IR', icon: Zap, children: ['Learn Signal', 'Transmit Signal'] },
  { name: 'Exit Bruce', icon: Terminal, children: [] }
];

export default function BruceApp({ setApp }: { setApp: any }) {
  const [booting, setBooting] = useState(true);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (booting) {
      const initLogs = [
        'Loading Bruce OS v1.2...',
        'Mounting SD Card... OK',
        'Initializing WiFi... OK',
        'Initializing BLE... OK',
        'Starting GUI...'
      ];
      let i = 0;
      const int = setInterval(() => {
        setBootLogs(prev => [...prev, initLogs[i]]);
        i++;
        if (i >= initLogs.length) {
          clearInterval(int);
          setTimeout(() => setBooting(false), 800);
        }
      }, 300);
      return () => clearInterval(int);
    }
  }, [booting]);

  useEffect(() => {
    if (activeTool) {
      setLogs([`Initializing ${activeTool}...`, 'Scanning channels...']);
      const interval = setInterval(() => {
        setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0,8)}] Target found / Packet injected...`].slice(-8));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [activeTool]);

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      if (booting) return;

      if (activeTool) {
        if (btn === 'menu' || btn === 'b') setActiveTool(null);
        return;
      }

      if (activeMenu) {
        const currentMenu = MENU.find(m => m.name === activeMenu);
        if (!currentMenu) return;

        if (btn === 'down') {
          setSelectedIndex(prev => Math.min(prev + 1, currentMenu.children.length - 1));
        } else if (btn === 'up') {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (btn === 'x' || btn === 'start') {
          setActiveTool(currentMenu.children[selectedIndex]);
        } else if (btn === 'b' || btn === 'menu') {
          setActiveMenu(null);
          setSelectedIndex(MENU.findIndex(m => m.name === activeMenu));
        }
        return;
      }

      // Main Menu
      if (btn === 'down') {
        setSelectedIndex(prev => Math.min(prev + 1, MENU.length - 1));
      } else if (btn === 'up') {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (btn === 'x' || btn === 'start') {
        if (MENU[selectedIndex].name === 'Exit Bruce') {
          setApp('home');
        } else {
          setActiveMenu(MENU[selectedIndex].name);
          setSelectedIndex(0);
        }
      } else if (btn === 'menu') {
        setApp('home');
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [selectedIndex, activeMenu, activeTool, booting, setApp]);

  if (booting) {
    return (
      <div className="w-full h-full bg-black text-green-500 font-mono flex flex-col p-2 text-[10px]">
        <div className="mb-4">
          <div className="font-bold">BRUCE OS</div>
          <div className="opacity-50">v1.2.0</div>
        </div>
        {bootLogs.map((log, i) => (
          <div key={i} className="mb-1">{log}</div>
        ))}
        {bootLogs.length === 5 && <div className="mt-2 animate-pulse">Ready.</div>}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black text-green-500 font-mono flex flex-col">
      <div className="h-8 border-b border-green-900 flex items-center px-2 shrink-0 bg-zinc-950">
        <Terminal size={12} className="mr-1.5" />
        <span className="text-[10px] font-bold tracking-widest">
          {activeMenu ? `BRUCE > ${activeMenu.toUpperCase()}` : 'BRUCE OS'}
        </span>
      </div>
      <div className="flex-1 p-2 overflow-hidden">
        {activeTool ? (
          <div className="h-full flex flex-col">
            <div className="text-[10px] mb-2 text-green-400">&gt; {activeTool}</div>
            <div className="flex-1 border border-green-900 p-1 text-[8px] overflow-hidden relative bg-zinc-950/50">
              {logs.map((log, i) => (
                <div key={i} className="opacity-80">{log}</div>
              ))}
              <div className="absolute bottom-1 left-1 bg-black px-1 text-green-600">[B] Stop</div>
            </div>
          </div>
        ) : activeMenu ? (
          <div className="flex flex-col gap-1">
            <div className="text-[8px] mb-2 opacity-70 uppercase tracking-widest border-b border-green-900/50 pb-1">Select Action</div>
            {MENU.find(m => m.name === activeMenu)?.children.map((item, i) => (
              <div key={i} className={`flex items-center gap-2 p-1.5 rounded-sm transition-colors ${i === selectedIndex ? 'bg-green-900 text-black font-bold' : ''}`}>
                <ChevronRight size={10} />
                <span className="text-[10px]">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="text-[8px] mb-2 opacity-70 uppercase tracking-widest border-b border-green-900/50 pb-1">Select Module</div>
            {MENU.map((item, i) => (
              <div key={i} className={`flex items-center gap-2 p-1.5 rounded-sm transition-colors ${i === selectedIndex ? 'bg-green-900 text-black font-bold' : ''}`}>
                <item.icon size={10} />
                <span className="text-[10px]">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
