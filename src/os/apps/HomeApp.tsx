import React, { useState, useEffect } from 'react';
import { Settings, MessageSquare, Music, Folder, Calculator, Wifi, FileText, Gamepad2, Globe, Activity, Terminal, Skull, Film, Clock, Share2, Wrench } from 'lucide-react';
import { AppState } from '../../components/Screen';
import { useTheme } from '../hooks/useTheme';

const APPS = [
  { id: 'settings', name: 'Settings', icon: Settings, color: 'text-zinc-400' },
  { id: 'chatbot', name: 'IonBot', icon: MessageSquare, color: 'text-blue-400' },
  { id: 'music', name: 'Music', icon: Music, color: 'text-rose-400' },
  { id: 'video', name: 'Video', icon: Film, color: 'text-fuchsia-400' },
  { id: 'files', name: 'Files', icon: Folder, color: 'text-amber-400' },
  { id: 'calculator', name: 'Calc', icon: Calculator, color: 'text-emerald-400' },
  { id: 'clock', name: 'Clock', icon: Clock, color: 'text-red-400' },
  { id: 'connect', name: 'Connect', icon: Share2, color: 'text-teal-400' },
  { id: 'wireless', name: 'Wireless', icon: Wifi, color: 'text-cyan-400' },
  { id: 'notes', name: 'Notes', icon: FileText, color: 'text-yellow-400' },
  { id: 'emulator', name: 'Games', icon: Gamepad2, color: 'text-purple-400' },
  { id: 'browser', name: 'Browser', icon: Globe, color: 'text-indigo-400' },
  { id: 'dashboard', name: 'System', icon: Activity, color: 'text-zinc-400' },
  { id: 'diagnostics', name: 'Diag', icon: Wrench, color: 'text-gray-400' },
  { id: 'bruce', name: 'Bruce', icon: Terminal, color: 'text-green-500' },
  { id: 'marauder', name: 'Marauder', icon: Skull, color: 'text-orange-500' },
];

export default function HomeApp({ setApp }: { setApp: (app: AppState) => void }) {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      if (btn === 'right') {
        setSelectedIndex(prev => Math.min(prev + 1, APPS.length - 1));
      } else if (btn === 'left') {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (btn === 'down') {
        setSelectedIndex(prev => Math.min(prev + 3, APPS.length - 1));
      } else if (btn === 'up') {
        setSelectedIndex(prev => Math.max(prev - 3, 0));
      } else if (btn === 'x' || btn === 'start') {
        setApp(APPS[selectedIndex].id as AppState);
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [selectedIndex, setApp]);

  useEffect(() => {
    if (containerRef.current) {
      const selectedEl = containerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={`w-full h-full ${theme.wallpaper} flex flex-col p-3 transition-colors duration-500 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      <div className={`text-[10px] font-bold ${theme.accent} mb-4 px-1 shrink-0 z-10 tracking-widest uppercase`}>Applications</div>
      <div className="flex-1 overflow-y-auto pb-6 z-10 scrollbar-hide">
        <div ref={containerRef} className="grid grid-cols-3 gap-3">
        {APPS.map((app, index) => {
          const isSelected = index === selectedIndex;
          const Icon = app.icon;
          return (
            <div 
              key={app.id} 
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 ${isSelected ? `${theme.highlight} ring-2 ring-white/30 scale-110 shadow-lg shadow-black/50` : 'bg-black/30 hover:bg-black/40'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${isSelected ? 'bg-white/20' : 'bg-white/5'}`}>
                <Icon size={22} className={`${app.color} ${isSelected ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`} />
              </div>
              <div className={`text-[9px] font-semibold tracking-wide ${isSelected ? 'text-white' : theme.text} opacity-90`}>
                {app.name}
              </div>
            </div>
          );
        })}
        </div>
      </div>
      <div className="absolute bottom-2 left-0 w-full flex justify-center z-10">
        <div className="flex gap-1">
          {Array.from({ length: Math.ceil(APPS.length / 9) }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${Math.floor(selectedIndex / 9) === i ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
