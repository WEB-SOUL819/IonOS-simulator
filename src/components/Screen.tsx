import React, { useState, useEffect } from 'react';
import { Battery, Wifi, Bluetooth, HardDrive } from 'lucide-react';
import HomeApp from '../os/apps/HomeApp';
import SettingsApp from '../os/apps/SettingsApp';
import ChatbotApp from '../os/apps/ChatbotApp';
import NotesApp from '../os/apps/NotesApp';
import CalculatorApp from '../os/apps/CalculatorApp';
import FilesApp from '../os/apps/FilesApp';
import MusicApp from '../os/apps/MusicApp';
import WirelessApp from '../os/apps/WirelessApp';
import DashboardApp from '../os/apps/DashboardApp';
import EmulatorApp from '../os/apps/EmulatorApp';
import BrowserApp from '../os/apps/BrowserApp';
import DesktopApp from '../os/apps/DesktopApp';
import BruceApp from '../os/apps/BruceApp';
import MarauderApp from '../os/apps/MarauderApp';
import VideoApp from '../os/apps/VideoApp';
import ClockApp from '../os/apps/ClockApp';
import ConnectApp from '../os/apps/ConnectApp';
import DiagnosticsApp from '../os/apps/DiagnosticsApp';
import { Lock } from 'lucide-react';
import { useTheme } from '../os/hooks/useTheme';

export type AppState = 'boot' | 'pin' | 'desktop' | 'home' | 'settings' | 'chatbot' | 'music' | 'video' | 'files' | 'calculator' | 'wireless' | 'notes' | 'emulator' | 'browser' | 'dashboard' | 'bruce' | 'marauder' | 'clock' | 'connect' | 'diagnostics';

export default function Screen() {
  const { theme } = useTheme();
  const [app, setApp] = useState<AppState>('boot');
  const [bootProgress, setBootProgress] = useState(0);
  const [time, setTime] = useState('12:00');
  const [screenOff, setScreenOff] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const screenOffRef = React.useRef(false);

  useEffect(() => {
    let timeout = setTimeout(() => {
      setScreenOff(true);
      screenOffRef.current = true;
    }, 20000);

    const handleInput = (e: Event) => {
      if (screenOffRef.current) {
        setScreenOff(false);
        screenOffRef.current = false;
        e.stopPropagation();
      }
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setScreenOff(true);
        screenOffRef.current = true;
      }, 20000);
    };

    window.addEventListener('device-button-down', handleInput, true);
    return () => {
      window.removeEventListener('device-button-down', handleInput, true);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (app === 'boot') {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setBootProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          const requirePin = localStorage.getItem('ionos_require_pin') !== 'false';
          setTimeout(() => setApp(requirePin ? 'pin' : 'desktop'), 500);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [app]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      
      if (app === 'pin') {
        if (btn === 'up') setPin(p => p + '1');
        if (btn === 'down') setPin(p => p + '2');
        if (btn === 'left') setPin(p => p + '3');
        if (btn === 'right') setPin(p => p + '4');
        if (btn === 'a') setPin(p => p + '5');
        if (btn === 'b') setPin(p => p.slice(0, -1));
        if (btn === 'x') setPin(p => p + '6');
        if (btn === 'start') {
          const savedPin = localStorage.getItem('ionos_pin') || '1234';
          if (pin === savedPin) {
            setApp('desktop');
            setPin('');
            setPinError(false);
          } else {
            setPinError(true);
            setPin('');
            setTimeout(() => setPinError(false), 1000);
          }
        }
        return;
      }

      if (btn === 'menu') {
        setApp('home');
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [app, pin]);

  if (app === 'boot') {
    return (
      <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-purple-900/20" />
        <div className="flex flex-col items-center animate-pulse z-10">
          <img 
            src="https://storage.googleapis.com/a1aa/image/VdZq8B6m1Z1zZq8B6m1Z1zZq8B6m1Z1zZq8B6m1Z1zZq8B6m.jpg" 
            alt="ApeX Logo" 
            className="w-20 h-20 mb-4 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.5)] object-cover" 
            referrerPolicy="no-referrer" 
          />
          <div className="flex items-baseline mb-2 drop-shadow-lg">
            <h1 className="text-4xl font-black tracking-tight font-sans">Ape</h1>
            <h1 className="text-3xl font-light tracking-widest font-mono italic ml-1 text-blue-400">X</h1>
          </div>
        </div>
        <div className="absolute bottom-16 w-40 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden backdrop-blur-sm z-10 border border-white/5">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100" style={{ width: `${bootProgress}%` }} />
        </div>
        <div className="absolute bottom-6 text-[10px] text-zinc-500 font-sans tracking-widest uppercase z-10">
          Powered by IonOS
        </div>
      </div>
    );
  }

  if (app === 'pin') {
    return (
      <div className={`w-full h-full ${theme.wallpaper} flex flex-col items-center justify-center text-white relative`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        <div className="flex flex-col items-center gap-4 z-10 w-full px-6">
          <div className="text-5xl font-light tracking-wider mb-4 font-mono">{time}</div>
          <div className={`p-4 rounded-full mb-2 ${pinError ? 'bg-red-500/20' : 'bg-white/10'} backdrop-blur-md border border-white/10 transition-colors`}>
            <Lock size={24} className={pinError ? 'text-red-400 animate-pulse' : 'text-white'} />
          </div>
          <div className="flex gap-2 h-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full border border-white/50 transition-all ${i < pin.length ? 'bg-white scale-110' : 'bg-transparent'}`} />
            ))}
          </div>
          <div className="text-[10px] text-zinc-400 mt-2 text-center uppercase tracking-widest">
            <p>{pinError ? 'Incorrect PIN' : 'Enter PIN to unlock'}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-6 text-[9px] text-zinc-400 font-mono w-full max-w-[150px]">
            <div className="text-center bg-white/5 rounded py-1">UP: 1</div>
            <div className="text-center bg-white/5 rounded py-1">DN: 2</div>
            <div className="text-center bg-white/5 rounded py-1">LF: 3</div>
            <div className="text-center bg-white/5 rounded py-1">RT: 4</div>
            <div className="text-center bg-white/5 rounded py-1">A: 5</div>
            <div className="text-center bg-white/5 rounded py-1">X: 6</div>
          </div>
          <div className="text-[8px] text-zinc-500 mt-2 tracking-widest">START: Enter | B: Del</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${theme.wallpaper} flex flex-col text-white font-sans text-sm transition-colors duration-500`}>
      {/* Status Bar */}
      <div className={`h-5 ${theme.wallpaper} bg-opacity-90 flex items-center justify-between px-2 border-b border-white/10 shrink-0 text-[9px] font-mono backdrop-blur-sm`}>
        <div className="flex items-center gap-1.5">
          <Wifi size={10} className="text-white/70" />
          <Bluetooth size={10} className="text-white/70" />
          <HardDrive size={10} className="text-white/70" />
        </div>
        <div className="font-bold">{time}</div>
        <div className="flex items-center gap-1">
          <span>98%</span>
          <Battery size={10} className="text-white/70" />
        </div>
      </div>

      {/* App Content */}
      <div className={`flex-1 overflow-hidden relative ${theme.wallpaper}`}>
        {app === 'desktop' && <DesktopApp setApp={setApp} time={time} />}
        {app === 'home' && <HomeApp setApp={setApp} />}
        {app === 'settings' && <SettingsApp />}
        {app === 'chatbot' && <ChatbotApp setApp={setApp} />}
        {app === 'notes' && <NotesApp />}
        {app === 'calculator' && <CalculatorApp />}
        {app === 'files' && <FilesApp />}
        {app === 'music' && <MusicApp />}
        {app === 'video' && <VideoApp />}
        {app === 'wireless' && <WirelessApp />}
        {app === 'dashboard' && <DashboardApp />}
        {app === 'emulator' && <EmulatorApp />}
        {app === 'browser' && <BrowserApp />}
        {app === 'bruce' && <BruceApp setApp={setApp} />}
        {app === 'marauder' && <MarauderApp setApp={setApp} />}
        {app === 'clock' && <ClockApp />}
        {app === 'connect' && <ConnectApp />}
        {app === 'diagnostics' && <DiagnosticsApp />}
      </div>
      
      {/* Screen Timeout Overlay */}
      <div 
        className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-500 flex flex-col items-center justify-center ${screenOff ? 'opacity-100' : 'opacity-0'} ${localStorage.getItem('ionos_aod') !== 'false' ? 'bg-black/95' : 'bg-black'}`} 
      >
        {screenOff && localStorage.getItem('ionos_aod') !== 'false' && (
          <div className="flex flex-col items-center animate-[pulse_4s_ease-in-out_infinite] opacity-60">
            <div className="text-zinc-400 font-mono text-5xl tracking-widest font-light">
              {time}
            </div>
            <div className="flex items-center gap-2 mt-4 text-zinc-500 text-[10px] font-mono">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>98%</span>
                <Battery size={10} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
