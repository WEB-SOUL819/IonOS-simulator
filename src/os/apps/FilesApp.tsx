import React, { useState, useEffect } from 'react';
import { Folder, FileText, Music, Image, File, ChevronRight, Share2, Copy, Trash2, Smartphone } from 'lucide-react';

const FILESYSTEM = [
  { name: 'apps', type: 'folder', children: [] },
  { name: 'music', type: 'folder', children: [
    { name: 'track1.wav', type: 'audio' },
    { name: 'track2.mp3', type: 'audio' }
  ]},
  { name: 'games', type: 'folder', children: [
    { name: 'mario.nes', type: 'game' },
    { name: 'pokemon.gba', type: 'game' }
  ]},
  { name: 'documents', type: 'folder', children: [
    { name: 'notes.txt', type: 'text' },
    { name: 'readme.md', type: 'text' }
  ]},
  { name: 'config', type: 'folder', children: [
    { name: 'settings.ini', type: 'text' }
  ]},
  { name: 'saves', type: 'folder', children: [] },
  { name: 'fonts', type: 'folder', children: [] }
];

export default function FilesApp() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [view, setView] = useState<'list' | 'menu' | 'sharing'>('list');
  const [menuIndex, setMenuIndex] = useState(0);
  const [toast, setToast] = useState('');
  const [shareProgress, setShareProgress] = useState(0);

  const MENU_OPTIONS = [
    { name: 'Share via BT', icon: Share2 },
    { name: 'Copy Name', icon: Copy },
    { name: 'Delete', icon: Trash2 }
  ];

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getCurrentDir = () => {
    let dir: any = FILESYSTEM;
    for (const p of currentPath) {
      const found = dir.find((d: any) => d.name === p);
      if (found && found.children) {
        dir = found.children;
      } else {
        return [];
      }
    }
    return dir;
  };

  const currentDir = getCurrentDir();

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      if (view === 'list') {
        if (btn === 'down') {
          setSelectedIndex(prev => Math.min(prev + 1, currentDir.length - 1));
        } else if (btn === 'up') {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (btn === 'x' || btn === 'start') {
          const selected = currentDir[selectedIndex];
          if (selected && selected.type === 'folder') {
            setCurrentPath(prev => [...prev, selected.name]);
            setSelectedIndex(0);
          } else if (selected) {
            setView('menu');
            setMenuIndex(0);
          }
        } else if (btn === 'b' || btn === 'left') {
          if (currentPath.length > 0) {
            setCurrentPath(prev => prev.slice(0, -1));
            setSelectedIndex(0);
          }
        }
      } else if (view === 'menu') {
        if (btn === 'down') setMenuIndex(prev => Math.min(prev + 1, MENU_OPTIONS.length - 1));
        else if (btn === 'up') setMenuIndex(prev => Math.max(prev - 1, 0));
        else if (btn === 'b') setView('list');
        else if (btn === 'x' || btn === 'start') {
          const option = MENU_OPTIONS[menuIndex].name;
          const selected = currentDir[selectedIndex];
          if (option === 'Copy Name') {
            localStorage.setItem('ionos_clipboard', selected.name);
            setToast('Copied to clipboard');
            setView('list');
          } else if (option === 'Share via BT') {
            setView('sharing');
            setShareProgress(0);
          } else if (option === 'Delete') {
            setToast('Cannot delete system file');
            setView('list');
          }
        }
      } else if (view === 'sharing') {
        if (btn === 'b') {
          setView('list');
        }
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [selectedIndex, currentPath, currentDir, view, menuIndex]);

  useEffect(() => {
    if (view === 'sharing') {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setShareProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setToast('File sent successfully');
            setView('list');
          }, 1000);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [view]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder size={12} className="text-amber-400" />;
      case 'audio': return <Music size={12} className="text-rose-400" />;
      case 'game': return <File size={12} className="text-purple-400" />;
      case 'text': return <FileText size={12} className="text-zinc-400" />;
      default: return <File size={12} className="text-zinc-400" />;
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col">
      <div className="h-8 bg-amber-600 flex items-center px-3 border-b border-amber-700 shrink-0">
        <div className="flex items-center gap-1.5 text-white">
          <Folder size={12} />
          <span className="text-[10px] font-bold truncate max-w-[180px]">
            /{currentPath.join('/')}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 relative">
        {toast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[9px] px-3 py-1 rounded-full shadow-lg border border-zinc-700 z-10 whitespace-nowrap">
            {toast}
          </div>
        )}
        
        {view === 'sharing' ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-4">
            <Smartphone size={32} className="text-blue-400 mb-4 animate-pulse" />
            <div className="text-[10px] text-zinc-300 font-bold mb-1">Sending File...</div>
            <div className="text-[8px] text-zinc-500 mb-4">{currentDir[selectedIndex]?.name}</div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-100" style={{ width: `${shareProgress}%` }} />
            </div>
            <div className="text-[8px] text-zinc-600 mt-4">Press B to cancel</div>
          </div>
        ) : view === 'menu' ? (
          <div className="w-full h-full flex flex-col">
            <div className="text-[10px] text-amber-400 font-bold mb-2 truncate border-b border-zinc-800 pb-1">
              {currentDir[selectedIndex]?.name}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {MENU_OPTIONS.map((opt, idx) => {
                const isSelected = idx === menuIndex;
                const Icon = opt.icon;
                return (
                  <div 
                    key={opt.name}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isSelected ? 'bg-amber-600 text-white' : 'text-zinc-300'}`}
                  >
                    <Icon size={12} />
                    <span className={`text-[10px] ${isSelected ? 'font-bold' : ''}`}>{opt.name}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-center text-[8px] text-zinc-500 font-bold mt-2">
              Press B to go back
            </div>
          </div>
        ) : currentDir.length === 0 ? (
          <div className="text-[10px] text-zinc-500 text-center mt-4 italic">Empty directory</div>
        ) : (
          currentDir.map((item: any, index: number) => {
            const isSelected = index === selectedIndex;
            return (
              <div 
                key={item.name} 
                className={`flex items-center justify-between px-2 py-1.5 rounded-md mb-1 transition-colors ${isSelected ? 'bg-amber-900/40 text-amber-100' : 'text-zinc-300'}`}
              >
                <div className="flex items-center gap-2">
                  {getIcon(item.type)}
                  <span className={`text-[10px] ${isSelected ? 'font-bold' : ''}`}>{item.name}</span>
                </div>
                {item.type === 'folder' && <ChevronRight size={10} className={isSelected ? 'text-amber-400' : 'text-zinc-600'} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
