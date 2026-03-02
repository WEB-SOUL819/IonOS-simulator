import React, { useState, useEffect } from 'react';
import { Share2, Smartphone, FileText, Gamepad2, Send, RefreshCw, Check, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

type View = 'scan' | 'devices' | 'menu' | 'text' | 'file' | 'game';

const MOCK_DEVICES = [
  { id: 'dev1', name: 'Apex V1 (John)', signal: 80 },
  { id: 'dev2', name: 'Flipper Zero', signal: 45 },
  { id: 'dev3', name: 'Unknown Device', signal: 20 },
];

const MOCK_FILES = [
  { name: 'secret_codes.txt', size: '2KB' },
  { name: 'photo_001.jpg', size: '1.2MB' },
  { name: 'backup.bin', size: '450KB' },
];

export default function ConnectApp() {
  const { theme } = useTheme();
  const [view, setView] = useState<View>('scan');
  const [scanning, setScanning] = useState(true);
  const [devices, setDevices] = useState<typeof MOCK_DEVICES>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Text Transfer
  const [textInput, setTextInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Game
  const [gameMove, setGameMove] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [opponentMove, setOpponentMove] = useState<'rock' | 'paper' | 'scissors' | null>(null);
  const [gameResult, setGameResult] = useState<string | null>(null);

  useEffect(() => {
    if (view === 'scan') {
      setScanning(true);
      setDevices([]);
      const timer = setTimeout(() => {
        setDevices(MOCK_DEVICES);
        setScanning(false);
        setView('devices');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;

      if (view === 'devices') {
        if (btn === 'down') setSelectedIndex(prev => Math.min(prev + 1, devices.length - 1));
        else if (btn === 'up') setSelectedIndex(prev => Math.max(prev - 1, 0));
        else if (btn === 'start' || btn === 'x') {
            setSelectedDevice(devices[selectedIndex].id);
            setView('menu');
            setSelectedIndex(0);
        } else if (btn === 'b') {
            setView('scan'); // Rescan
        }
      }
      else if (view === 'menu') {
        const options = ['Send Text', 'Send File', 'Multiplayer Game'];
        if (btn === 'down') setSelectedIndex(prev => Math.min(prev + 1, options.length - 1));
        else if (btn === 'up') setSelectedIndex(prev => Math.max(prev - 1, 0));
        else if (btn === 'start' || btn === 'x') {
            if (selectedIndex === 0) setView('text');
            else if (selectedIndex === 1) setView('file');
            else if (selectedIndex === 2) setView('game');
            setSelectedIndex(0);
        } else if (btn === 'b') {
            setView('devices');
            setSelectedIndex(0);
        }
      }
      else if (view === 'text') {
        if (sentSuccess) {
            if (btn === 'b' || btn === 'start') {
                setSentSuccess(false);
                setTextInput('');
                setView('menu');
            }
        } else if (sending) {
            // wait
        } else {
            // Simple keyboard simulation for demo
            if (btn === 'b') {
                if (textInput.length > 0) setTextInput(prev => prev.slice(0, -1));
                else setView('menu');
            } else if (btn === 'start') {
                if (textInput.length > 0) {
                    setSending(true);
                    setTimeout(() => {
                        setSending(false);
                        setSentSuccess(true);
                    }, 2000);
                }
            } else if (btn === 'x') setTextInput(prev => prev + 'Hello ');
            else if (btn === 'a') setTextInput(prev => prev + 'World ');
        }
      }
      else if (view === 'file') {
         if (sentSuccess) {
            if (btn === 'b' || btn === 'start') {
                setSentSuccess(false);
                setView('menu');
            }
        } else if (sending) {
            // wait
        } else {
            if (btn === 'down') setSelectedIndex(prev => Math.min(prev + 1, MOCK_FILES.length - 1));
            else if (btn === 'up') setSelectedIndex(prev => Math.max(prev - 1, 0));
            else if (btn === 'start' || btn === 'x') {
                setSending(true);
                setTimeout(() => {
                    setSending(false);
                    setSentSuccess(true);
                }, 2000);
            } else if (btn === 'b') {
                setView('menu');
            }
        }
      }
      else if (view === 'game') {
        if (gameResult) {
            if (btn === 'start' || btn === 'b') {
                setGameResult(null);
                setGameMove(null);
                setOpponentMove(null);
                setView('menu');
            } else if (btn === 'x') {
                // Rematch
                setGameResult(null);
                setGameMove(null);
                setOpponentMove(null);
            }
        } else {
            if (btn === 'left') setGameMove('rock');
            else if (btn === 'up') setGameMove('paper');
            else if (btn === 'right') setGameMove('scissors');
            else if (btn === 'b') setView('menu');
            
            if (['left', 'up', 'right'].includes(btn)) {
                // Play logic
                setTimeout(() => {
                    const moves: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
                    const opp = moves[Math.floor(Math.random() * 3)];
                    setOpponentMove(opp);
                    
                    let res = '';
                    // Logic is handled in render for simplicity of state update, but here we set result
                    // Actually, let's do it here to be clean
                    let myMove = btn === 'left' ? 'rock' : btn === 'up' ? 'paper' : 'scissors';
                    
                    if (myMove === opp) res = 'DRAW';
                    else if (
                        (myMove === 'rock' && opp === 'scissors') ||
                        (myMove === 'paper' && opp === 'rock') ||
                        (myMove === 'scissors' && opp === 'paper')
                    ) res = 'YOU WIN';
                    else res = 'YOU LOSE';
                    
                    setGameResult(res);
                }, 1000);
            }
        }
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [view, devices, selectedIndex, textInput, sending, sentSuccess, gameResult]);

  return (
    <div className={`w-full h-full ${theme.wallpaper} flex flex-col transition-colors duration-300`}>
      <div className={`h-8 ${theme.highlight} flex items-center px-3 border-b border-white/10 shrink-0 gap-2`}>
        <Share2 size={14} className={theme.accent.replace('text-', 'text-')} />
        <span className="text-xs font-bold text-white">Connect</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {view === 'scan' && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <RefreshCw size={32} className={`text-zinc-400 ${scanning ? 'animate-spin' : ''}`} />
                <span className="text-xs text-zinc-400">{scanning ? 'Scanning for devices...' : 'Scan Complete'}</span>
            </div>
        )}

        {view === 'devices' && (
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-400 px-1">Found Devices</span>
                {devices.map((dev, idx) => (
                    <div key={dev.id} className={`flex justify-between items-center p-3 rounded-lg ${idx === selectedIndex ? theme.highlight : 'bg-black/20'}`}>
                        <div className="flex items-center gap-3">
                            <Smartphone size={16} className="text-zinc-300" />
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold ${theme.text}`}>{dev.name}</span>
                                <span className="text-[9px] text-zinc-500">ID: {dev.id}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="flex gap-0.5 items-end h-3">
                                <div className={`w-1 bg-zinc-500 ${dev.signal > 20 ? 'h-1' : 'h-1 opacity-30'}`} />
                                <div className={`w-1 bg-zinc-500 ${dev.signal > 40 ? 'h-2' : 'h-2 opacity-30'}`} />
                                <div className={`w-1 bg-zinc-500 ${dev.signal > 60 ? 'h-3' : 'h-3 opacity-30'}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {view === 'menu' && (
            <div className="flex flex-col gap-2">
                <div className="text-center mb-4">
                    <span className="text-[10px] text-zinc-400">Connected to</span>
                    <div className={`text-sm font-bold ${theme.accent}`}>{devices.find(d => d.id === selectedDevice)?.name}</div>
                </div>
                {['Send Text', 'Send File', 'Multiplayer Game'].map((opt, idx) => (
                    <div key={opt} className={`flex items-center gap-3 p-3 rounded-lg ${idx === selectedIndex ? theme.highlight : 'bg-black/20'}`}>
                        {idx === 0 && <FileText size={16} className="text-blue-400" />}
                        {idx === 1 && <Share2 size={16} className="text-green-400" />}
                        {idx === 2 && <Gamepad2 size={16} className="text-purple-400" />}
                        <span className={`text-xs font-bold ${theme.text}`}>{opt}</span>
                    </div>
                ))}
            </div>
        )}

        {view === 'text' && (
            <div className="flex flex-col h-full">
                {sentSuccess ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <Check size={24} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-green-400">Sent Successfully</span>
                    </div>
                ) : sending ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <RefreshCw size={24} className="text-blue-400 animate-spin" />
                        <span className="text-xs text-blue-400">Sending...</span>
                    </div>
                ) : (
                    <>
                        <div className="text-[10px] text-zinc-400 mb-2">Compose Message</div>
                        <div className="flex-1 bg-black/30 rounded-lg p-2 text-xs text-white break-all">
                            {textInput}<span className="animate-pulse">|</span>
                        </div>
                        <div className="mt-2 text-[9px] text-zinc-500">
                            X: "Hello" | A: "World" | START: Send
                        </div>
                    </>
                )}
            </div>
        )}

        {view === 'file' && (
            <div className="flex flex-col h-full">
                {sentSuccess ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <Check size={24} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-green-400">File Sent</span>
                    </div>
                ) : sending ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <RefreshCw size={24} className="text-blue-400 animate-spin" />
                        <span className="text-xs text-blue-400">Transferring...</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-zinc-400 px-1">Select File</span>
                        {MOCK_FILES.map((file, idx) => (
                            <div key={file.name} className={`flex justify-between items-center p-3 rounded-lg ${idx === selectedIndex ? theme.highlight : 'bg-black/20'}`}>
                                <div className="flex items-center gap-3">
                                    <FileText size={16} className="text-zinc-300" />
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold ${theme.text}`}>{file.name}</span>
                                        <span className="text-[9px] text-zinc-500">{file.size}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {view === 'game' && (
            <div className="flex flex-col items-center justify-center h-full">
                {gameResult ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-2xl font-bold text-white">{gameResult}</div>
                        <div className="flex gap-8">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-zinc-400 mb-1">YOU</span>
                                <div className="text-2xl">{gameMove === 'rock' ? '🪨' : gameMove === 'paper' ? '📄' : '✂️'}</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-zinc-400 mb-1">OPP</span>
                                <div className="text-2xl">{opponentMove === 'rock' ? '🪨' : opponentMove === 'paper' ? '📄' : '✂️'}</div>
                            </div>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-4">X: Rematch | B: Exit</div>
                    </div>
                ) : gameMove ? (
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs text-zinc-400">Waiting for opponent...</span>
                        <RefreshCw size={24} className="text-purple-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="text-xs font-bold text-white mb-6">ROCK PAPER SCISSORS</div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-xl">🪨</div>
                                <span className="text-[9px] text-zinc-500">LEFT</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-xl">📄</div>
                                <span className="text-[9px] text-zinc-500">UP</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-xl">✂️</div>
                                <span className="text-[9px] text-zinc-500">RIGHT</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
