import React, { useState, useEffect } from 'react';
import { Globe, ChevronLeft, ChevronRight, RefreshCw, Search, BookOpen, Code, Terminal, Newspaper, Film, History, X, Trash2 } from 'lucide-react';

const QUICK_LINKS = [
  { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Main_Page', icon: BookOpen, color: 'text-zinc-400' },
  { name: 'YouTube (Video)', url: 'https://www.youtube.com/embed/aqz-KE-bpKQ?autoplay=0', icon: Film, color: 'text-red-500' },
  { name: 'Example', url: 'https://example.com', icon: Globe, color: 'text-blue-400' },
  { name: 'CNN Lite', url: 'https://lite.cnn.com', icon: Newspaper, color: 'text-red-600' },
];

export default function BrowserApp() {
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isCaps, setIsCaps] = useState(false);
  const [view, setView] = useState<'home' | 'web' | 'history'>('home');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState<{url: string, title: string, timestamp: number}[]>([]);
  
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);
  const KEYBOARD_LAYOUT = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '-'],
    ['^', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '/']
  ];

  useEffect(() => {
    const saved = localStorage.getItem('ionos_browser_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      if (showKeyboard) {
        if (btn === 'right') setKbCol(prev => Math.min(prev + 1, KEYBOARD_LAYOUT[kbRow].length - 1));
        else if (btn === 'left') setKbCol(prev => Math.max(prev - 1, 0));
        else if (btn === 'down') {
          setKbRow(prev => Math.min(prev + 1, KEYBOARD_LAYOUT.length - 1));
          setKbCol(prev => Math.min(kbCol, KEYBOARD_LAYOUT[Math.min(kbRow + 1, KEYBOARD_LAYOUT.length - 1)].length - 1));
        }
        else if (btn === 'up') {
          setKbRow(prev => Math.max(prev - 1, 0));
          setKbCol(prev => Math.min(kbCol, KEYBOARD_LAYOUT[Math.max(kbRow - 1, 0)].length - 1));
        }
        else if (btn === 'x') {
          const key = KEYBOARD_LAYOUT[kbRow][kbCol];
          if (key === '^') setIsCaps(!isCaps);
          else setInputUrl(prev => prev + (isCaps ? key.toUpperCase() : key));
        }
        else if (btn === 'b') setInputUrl(prev => prev.slice(0, -1));
        else if (btn === 'a') setInputUrl(prev => prev + ' ');
        else if (btn === 'start') {
          let finalUrl = inputUrl;
          if (finalUrl.trim() !== '') {
            if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
            setUrl(finalUrl);
            setView('web');
            setLoading(true);
            
            const newEntry = { url: finalUrl, title: finalUrl, timestamp: Date.now() };
            const newHistory = [newEntry, ...history.filter(h => h.url !== finalUrl)].slice(0, 50);
            setHistory(newHistory);
            localStorage.setItem('ionos_browser_history', JSON.stringify(newHistory));
          }
          setShowKeyboard(false);
        }
        else if (btn === 'menu') {
          const clip = localStorage.getItem('ionos_clipboard');
          if (clip) setInputUrl(prev => prev + clip);
        }
      } else if (view === 'home') {
        if (btn === 'right') setSelectedIndex(prev => Math.min(prev + 1, QUICK_LINKS.length - 1));
        else if (btn === 'left') setSelectedIndex(prev => Math.max(prev - 1, 0));
        else if (btn === 'down') setSelectedIndex(prev => Math.min(prev + 2, QUICK_LINKS.length - 1));
        else if (btn === 'up') setSelectedIndex(prev => Math.max(prev - 2, 0));
        else if (btn === 'x' || btn === 'start') {
          const targetUrl = QUICK_LINKS[selectedIndex].url;
          setUrl(targetUrl);
          setInputUrl(targetUrl);
          setView('web');
          setLoading(true);

          const newEntry = { url: targetUrl, title: QUICK_LINKS[selectedIndex].name, timestamp: Date.now() };
          const newHistory = [newEntry, ...history.filter(h => h.url !== targetUrl)].slice(0, 50);
          setHistory(newHistory);
          localStorage.setItem('ionos_browser_history', JSON.stringify(newHistory));
        } else if (btn === 'a') {
          setShowKeyboard(true);
          setInputUrl('');
        }
      } else if (view === 'history') {
        if (btn === 'b' || btn === 'menu') setView('home');
      } else {
        if (btn === 'x' || btn === 'start') {
          setShowKeyboard(true);
        } else if (btn === 'b') {
          setView('home');
          setUrl('');
          setInputUrl('');
        }
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [showKeyboard, kbRow, kbCol, inputUrl, isCaps, view, selectedIndex, history]);

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col">
      <div className="h-8 bg-indigo-600 flex items-center px-2 border-b border-indigo-700 shrink-0 gap-2">
        <div className="flex items-center gap-1 text-indigo-200">
          <ChevronLeft size={14} />
          <ChevronRight size={14} className="opacity-50" />
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </div>
        <div className={`flex-1 rounded px-2 py-0.5 flex items-center gap-1 overflow-hidden ${showKeyboard ? 'bg-indigo-900 ring-1 ring-white' : 'bg-indigo-800/50'}`}>
          <Globe size={10} className="text-indigo-300 shrink-0" />
          <div className="flex-1 overflow-hidden relative h-3 flex items-center">
            {showKeyboard ? (
              <div className={`absolute whitespace-nowrap text-[9px] text-indigo-100 flex items-center ${inputUrl.length > 25 ? 'right-0' : 'left-0'}`}>
                {inputUrl}
                <span className="animate-pulse w-1 h-2.5 bg-white inline-block ml-0.5"></span>
              </div>
            ) : (
              <div className="text-[9px] text-indigo-100 truncate w-full">
                {view === 'home' ? 'Search or enter URL...' : url}
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => setView(view === 'history' ? 'home' : 'history')} 
          className={`p-1 rounded hover:bg-indigo-700 transition-colors ${view === 'history' ? 'text-white bg-indigo-700' : 'text-indigo-200'}`}
        >
          <History size={14} />
        </button>
      </div>
      
      <div className="flex-1 bg-white overflow-hidden relative text-black">
        {showKeyboard ? (
           <div className="absolute inset-0 bg-zinc-950 flex flex-col p-1 gap-1 z-20">
              <div className="flex-1 flex flex-col justify-center gap-1">
                {KEYBOARD_LAYOUT.map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-center gap-1">
                    {row.map((key, cIdx) => (
                      <div 
                        key={cIdx} 
                        className={`w-5 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                          rIdx === kbRow && cIdx === kbCol 
                            ? 'bg-indigo-600 text-white' 
                            : key === '^' && isCaps
                              ? 'bg-indigo-900 text-indigo-200'
                              : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {key === '^' ? (isCaps ? 'CAPS' : 'caps') : (isCaps ? key.toUpperCase() : key)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-1 text-[8px] text-zinc-500 font-bold pb-1">
                <span>[X] Type</span>
                <span>[B] Del</span>
                <span>[MENU] Paste</span>
                <span>[START] Go</span>
              </div>
           </div>
        ) : view === 'history' ? (
          <div className="w-full h-full bg-zinc-100 flex flex-col p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <History size={14} />
                <span>History</span>
              </div>
              <button 
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('ionos_browser_history');
                }}
                className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                  <History size={24} className="opacity-20" />
                  <span className="text-[10px]">No history yet</span>
                </div>
              ) : (
                history.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setUrl(item.url);
                      setInputUrl(item.url);
                      setView('web');
                      setLoading(true);
                      const newHistory = [item, ...history.filter(h => h.url !== item.url)];
                      setHistory(newHistory);
                      localStorage.setItem('ionos_browser_history', JSON.stringify(newHistory));
                    }}
                    className="flex flex-col p-2 bg-white rounded border border-zinc-200 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-colors group shrink-0"
                  >
                    <div className="text-[10px] font-medium text-zinc-800 truncate group-hover:text-indigo-700">{item.title}</div>
                    <div className="text-[8px] text-zinc-400 truncate">{item.url}</div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-2 text-center text-[8px] text-zinc-400 font-bold shrink-0">
              Press B to go back
            </div>
          </div>
        ) : view === 'home' ? (
          <div className="w-full h-full bg-zinc-100 flex flex-col p-3">
            <div className="flex items-center justify-center mb-6 mt-4">
              <Globe size={32} className="text-indigo-300" />
            </div>
            <div className="text-[10px] font-bold text-zinc-500 mb-2">Quick Links</div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_LINKS.map((link, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = link.icon;
                return (
                  <div 
                    key={idx}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${
                      isSelected ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <Icon size={16} className={`mb-1 ${link.color}`} />
                    <div className={`text-[9px] font-medium ${isSelected ? 'text-indigo-900' : 'text-zinc-600'}`}>
                      {link.name}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto text-center text-[8px] text-zinc-400 font-bold">
              Press A to type URL
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <RefreshCw size={24} className="text-indigo-500 animate-spin" />
              </div>
            )}
            <iframe 
              src={url} 
              className="w-full h-full border-none bg-white"
              onLoad={() => setLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="browser"
            />
          </>
        )}
      </div>
    </div>
  );
}
