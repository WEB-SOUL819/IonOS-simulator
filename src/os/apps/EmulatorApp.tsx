import React, { useState, useEffect } from 'react';
import { Gamepad2, Play, Folder } from 'lucide-react';

const ROMS = [
  { name: 'snake.nes', type: 'nes' },
  { name: 'mario.nes', type: 'nes' },
  { name: 'pokemon.gba', type: 'gba' },
  { name: 'tetris.gb', type: 'gb' },
  { name: 'zelda.snes', type: 'snes' }
];

export default function EmulatorApp() {
  const [state, setState] = useState<'menu' | 'playing'>('menu');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRom, setSelectedRom] = useState(ROMS[0]);

  // Snake Game State
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (state !== 'playing' || selectedRom.name !== 'snake.nes' || gameOver) return;
    
    const moveSnake = () => {
      setSnake(prev => {
        const head = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        
        // Wall collision
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
          setGameOver(true);
          return prev;
        }
        
        // Self collision
        if (prev.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];
        
        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
          });
        } else {
          newSnake.pop();
        }
        
        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [state, selectedRom, dir, food, gameOver]);

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      if (state === 'menu') {
        if (btn === 'down') {
          setSelectedIndex(prev => Math.min(prev + 1, ROMS.length - 1));
        } else if (btn === 'up') {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (btn === 'x' || btn === 'start') {
          setSelectedRom(ROMS[selectedIndex]);
          setState('playing');
          if (ROMS[selectedIndex].name === 'snake.nes') {
            setSnake([{ x: 10, y: 10 }]);
            setDir({ x: 1, y: 0 });
            setScore(0);
            setGameOver(false);
          }
        }
      } else if (state === 'playing') {
        if (btn === 'menu') {
          setState('menu');
        } else if (selectedRom.name === 'snake.nes') {
          if (gameOver && (btn === 'start' || btn === 'x' || btn === 'a')) {
            setSnake([{ x: 10, y: 10 }]);
            setDir({ x: 1, y: 0 });
            setScore(0);
            setGameOver(false);
          } else if (!gameOver) {
            if (btn === 'up' && dir.y !== 1) setDir({ x: 0, y: -1 });
            if (btn === 'down' && dir.y !== -1) setDir({ x: 0, y: 1 });
            if (btn === 'left' && dir.x !== 1) setDir({ x: -1, y: 0 });
            if (btn === 'right' && dir.x !== -1) setDir({ x: 1, y: 0 });
          }
        }
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [state, selectedIndex, selectedRom, gameOver, dir]);

  if (state === 'playing') {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-2 left-2 text-[8px] text-zinc-500 font-mono bg-black/50 px-1 rounded z-10">
          FPS: 60
        </div>
        
        {selectedRom.name === 'snake.nes' ? (
          <div className="w-full h-full relative bg-zinc-900 flex flex-col items-center justify-center">
            <div className="absolute top-2 right-2 text-green-500 font-mono text-[10px] font-bold">
              SCORE: {score}
            </div>
            <div className="w-[160px] h-[160px] bg-black border-2 border-zinc-700 relative">
              {snake.map((segment, i) => (
                <div 
                  key={i} 
                  className="absolute bg-green-500"
                  style={{ 
                    left: `${(segment.x / 20) * 100}%`, 
                    top: `${(segment.y / 20) * 100}%`, 
                    width: '5%', 
                    height: '5%' 
                  }} 
                />
              ))}
              <div 
                className="absolute bg-red-500 rounded-full"
                style={{ 
                  left: `${(food.x / 20) * 100}%`, 
                  top: `${(food.y / 20) * 100}%`, 
                  width: '5%', 
                  height: '5%' 
                }} 
              />
            </div>
            {gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
                <div className="text-red-500 font-bold mb-2">GAME OVER</div>
                <div className="text-white text-[10px] mb-4">SCORE: {score}</div>
                <div className="text-zinc-400 text-[8px] animate-pulse">Press START to Retry</div>
              </div>
            )}
          </div>
        ) : selectedRom.name === 'mario.nes' ? (
          <div className="w-full h-full relative bg-sky-400">
            {/* Simple Mario Mockup */}
            <div className="absolute bottom-0 w-full h-8 bg-amber-800 border-t-4 border-green-600"></div>
            <div className="absolute bottom-8 left-8 w-4 h-6 bg-red-600 rounded-t-sm">
              <div className="w-3 h-2 bg-amber-200 absolute top-1 left-1"></div>
            </div>
            <div className="absolute bottom-8 right-12 w-6 h-8 bg-green-500 border-2 border-black rounded-t-sm"></div>
            <div className="absolute top-8 left-12 w-8 h-4 bg-amber-500 border-2 border-black flex items-center justify-center text-[6px] font-bold">?</div>
            <div className="absolute top-4 right-4 text-white font-mono text-[8px] font-bold">
              MARIO<br/>000000
            </div>
          </div>
        ) : (
          <div className="text-zinc-600 animate-pulse text-center">
            <Gamepad2 size={48} className="mx-auto mb-4 opacity-50" />
            <div className="text-xs font-bold uppercase tracking-widest">{selectedRom.type} Emulator</div>
            <div className="text-[10px] mt-2 text-zinc-500">Running {selectedRom.name}</div>
          </div>
        )}

        <div className="absolute bottom-2 text-[8px] text-white bg-black/50 px-2 py-0.5 rounded font-bold uppercase tracking-widest z-10">
          Press MENU to exit
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col">
      <div className="h-8 bg-purple-600 flex items-center px-3 border-b border-purple-700 shrink-0">
        <div className="flex items-center gap-1.5 text-white">
          <Gamepad2 size={12} />
          <span className="text-[10px] font-bold">Retro Emulator</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-[10px] text-zinc-400 font-bold mb-2 flex items-center gap-1">
          <Folder size={10} /> /games
        </div>
        <div className="flex flex-col gap-1">
          {ROMS.map((rom, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div 
                key={rom.name} 
                className={`flex items-center justify-between px-2 py-2 rounded-md transition-colors ${isSelected ? 'bg-purple-900/40 text-purple-100' : 'text-zinc-300'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] ${isSelected ? 'font-bold' : ''}`}>{rom.name}</span>
                </div>
                {isSelected && <Play size={10} className="text-purple-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
