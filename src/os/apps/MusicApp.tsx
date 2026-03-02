import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

const TRACKS = [
  { title: 'Neon Horizon', artist: 'Synthwave', duration: '3:45' },
  { title: 'Midnight Drive', artist: 'Retrowave', duration: '4:12' },
  { title: 'Cyber City', artist: 'Vaporwave', duration: '2:58' }
];

export default function MusicApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setCurrentTrack(t => (t + 1) % TRACKS.length);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      if (btn === 'x' || btn === 'start') {
        setIsPlaying(prev => !prev);
      } else if (btn === 'right') {
        setCurrentTrack(prev => (prev + 1) % TRACKS.length);
        setProgress(0);
      } else if (btn === 'left') {
        setCurrentTrack(prev => (prev - 1 + TRACKS.length) % TRACKS.length);
        setProgress(0);
      } else if (btn === 'up') {
        setVolume(prev => Math.min(prev + 10, 100));
      } else if (btn === 'down') {
        setVolume(prev => Math.max(prev - 10, 0));
      } else if (btn === 'b') {
        setIsPlaying(false);
        setProgress(0);
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [currentTrack]);

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col relative overflow-hidden">
      {/* Volume Indicator */}
      <div className="absolute top-10 right-2 flex flex-col items-center gap-1 bg-zinc-800/80 p-1 rounded-full z-20 border border-zinc-700">
        <Volume2 size={10} className="text-zinc-400" />
        <div className="h-12 w-1.5 bg-zinc-950 rounded-full overflow-hidden flex flex-col justify-end">
          <div className="w-full bg-rose-500 transition-all duration-200" style={{ height: `${volume}%` }} />
        </div>
      </div>

      {/* Visualizer Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-end justify-center gap-1 pb-20">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="w-3 bg-rose-500 rounded-t-sm transition-all duration-200"
            style={{ 
              height: isPlaying ? `${Math.random() * 60 + 10}%` : '5%',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      <div className="h-8 bg-rose-600 flex items-center px-3 border-b border-rose-700 shrink-0 z-10">
        <div className="flex items-center gap-1.5 text-white">
          <Music size={12} />
          <span className="text-[10px] font-bold">Music Player</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="w-24 h-24 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 flex items-center justify-center mb-6 overflow-hidden relative">
          <div className={`absolute inset-0 bg-gradient-to-br from-rose-500/20 to-purple-500/20 ${isPlaying ? 'animate-spin-slow' : ''}`} />
          <Music size={32} className="text-rose-400 opacity-50" />
        </div>

        <div className="text-center mb-6 w-full px-4">
          <div className="text-sm font-bold text-white truncate">{TRACKS[currentTrack].title}</div>
          <div className="text-[10px] text-zinc-400 truncate">{TRACKS[currentTrack].artist}</div>
        </div>

        <div className="w-full px-4 mb-4">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[8px] text-zinc-500 font-mono">
            <span>0:{(progress * 2.25).toFixed(0).padStart(2, '0')}</span>
            <span>{TRACKS[currentTrack].duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 text-zinc-400">
          <SkipBack size={16} className="hover:text-white transition-colors" />
          <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/50">
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
          </div>
          <SkipForward size={16} className="hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
}
