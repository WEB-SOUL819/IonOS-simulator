import React, { useEffect } from 'react';
import { AppState } from '../../components/Screen';
import { useTheme } from '../hooks/useTheme';

export default function DesktopApp({ setApp, time }: { setApp: (app: AppState) => void, time: string }) {
  const { theme } = useTheme();

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      if (btn === 'x' || btn === 'menu' || btn === 'start') {
        setApp('home');
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [setApp]);

  return (
    <div className={`w-full h-full ${theme.wallpaper} flex flex-col items-center justify-center relative transition-colors duration-500`}>
      <div className={`text-5xl font-light mb-2 ${theme.text} tracking-wider drop-shadow-lg`}>{time}</div>
      <div className={`text-[10px] ${theme.accent} animate-pulse mt-4 font-bold tracking-widest`}>Press X to open Apps</div>
    </div>
  );
}
