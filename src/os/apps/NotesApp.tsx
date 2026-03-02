import React, { useState, useEffect } from 'react';
import { Save, FileText, Menu, Trash2, Download } from 'lucide-react';

export default function NotesApp() {
  const [text, setText] = useState('My first note on Apex V1.');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isCaps, setIsCaps] = useState(false);
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);
  
  const [view, setView] = useState<'editor' | 'menu'>('editor');
  const [menuIndex, setMenuIndex] = useState(0);
  const [toast, setToast] = useState('');

  const MENU_OPTIONS = [
    { name: 'Edit Note', icon: FileText },
    { name: 'Copy Note', icon: Save },
    { name: 'Paste Note', icon: Download },
    { name: 'Save to SD', icon: Save },
    { name: 'Load from SD', icon: Download },
    { name: 'Clear Note', icon: Trash2 }
  ];

  const KEYBOARD_LAYOUT = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '-'],
    ['^', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '?']
  ];

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      if (view === 'menu') {
        if (btn === 'down') setMenuIndex(prev => Math.min(prev + 1, MENU_OPTIONS.length - 1));
        else if (btn === 'up') setMenuIndex(prev => Math.max(prev - 1, 0));
        else if (btn === 'b') setView('editor');
        else if (btn === 'x' || btn === 'start') {
          const option = MENU_OPTIONS[menuIndex].name;
          if (option === 'Edit Note') {
            setView('editor');
            setShowKeyboard(true);
          } else if (option === 'Copy Note') {
            localStorage.setItem('ionos_clipboard', text);
            setToast('Copied to clipboard');
            setView('editor');
          } else if (option === 'Paste Note') {
            const clip = localStorage.getItem('ionos_clipboard');
            if (clip) {
              setText(prev => prev + clip);
              setToast('Pasted from clipboard');
            } else {
              setToast('Clipboard is empty');
            }
            setView('editor');
          } else if (option === 'Save to SD') {
            localStorage.setItem('ionos_note', text);
            setToast('Note saved to SD card');
            setView('editor');
          } else if (option === 'Load from SD') {
            const saved = localStorage.getItem('ionos_note');
            if (saved !== null) {
              setText(saved);
              setToast('Note loaded');
            } else {
              setToast('No saved note found');
            }
            setView('editor');
          } else if (option === 'Clear Note') {
            setText('');
            setToast('Note cleared');
            setView('editor');
          }
        }
      } else if (showKeyboard) {
        if (btn === 'right') {
          setKbCol(prev => Math.min(prev + 1, KEYBOARD_LAYOUT[kbRow].length - 1));
        } else if (btn === 'left') {
          setKbCol(prev => Math.max(prev - 1, 0));
        } else if (btn === 'down') {
          setKbRow(prev => Math.min(prev + 1, KEYBOARD_LAYOUT.length - 1));
          setKbCol(prev => Math.min(kbCol, KEYBOARD_LAYOUT[Math.min(kbRow + 1, KEYBOARD_LAYOUT.length - 1)].length - 1));
        } else if (btn === 'up') {
          setKbRow(prev => Math.max(prev - 1, 0));
          setKbCol(prev => Math.min(kbCol, KEYBOARD_LAYOUT[Math.max(kbRow - 1, 0)].length - 1));
        } else if (btn === 'x') {
          const key = KEYBOARD_LAYOUT[kbRow][kbCol];
          if (key === '^') {
            setIsCaps(!isCaps);
          } else {
            setText(prev => prev + (isCaps ? key.toUpperCase() : key));
          }
        } else if (btn === 'b') {
          setText(prev => prev.slice(0, -1));
        } else if (btn === 'a') {
          setText(prev => prev + ' ');
        } else if (btn === 'start' || btn === 'menu') {
          setShowKeyboard(false);
        }
      } else {
        if (btn === 'x') {
          setShowKeyboard(true);
        } else if (btn === 'start') {
          setView('menu');
          setMenuIndex(0);
        }
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [text, showKeyboard, kbRow, kbCol, isCaps, view, menuIndex]);

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col">
      <div className="h-8 bg-yellow-600 flex items-center px-3 border-b border-yellow-700 shrink-0 justify-between">
        <div className="flex items-center gap-1.5 text-white">
          <FileText size={12} />
          <span className="text-[10px] font-bold">Notes</span>
        </div>
        <div className="flex items-center gap-1 text-yellow-200 text-[9px]">
          <Menu size={10} />
          <span>START</span>
        </div>
      </div>
      
      {view === 'menu' ? (
        <div className="flex-1 bg-zinc-900 p-2 flex flex-col">
          <div className="text-[10px] text-zinc-400 font-bold mb-2 px-1">Options</div>
          <div className="flex-1 flex flex-col gap-1">
            {MENU_OPTIONS.map((opt, idx) => {
              const isSelected = idx === menuIndex;
              const Icon = opt.icon;
              return (
                <div 
                  key={opt.name}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isSelected ? 'bg-yellow-600 text-white' : 'text-zinc-300'}`}
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
      ) : (
        <div className="flex-1 overflow-y-auto p-3 text-[11px] leading-relaxed text-zinc-300 font-mono whitespace-pre-wrap relative">
          {toast && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[9px] px-3 py-1 rounded-full shadow-lg border border-zinc-700 z-10">
              {toast}
            </div>
          )}
          {text}
          {showKeyboard && <span className="animate-pulse w-1.5 h-3 bg-yellow-500 inline-block ml-0.5 align-middle"></span>}
          {!showKeyboard && text.length === 0 && <span className="text-zinc-600">Press X to start typing...</span>}
        </div>
      )}

      {showKeyboard && view === 'editor' && (
        <div className="h-auto pb-2 bg-zinc-950 border-t border-zinc-800 p-1 flex flex-col gap-1 shrink-0">
          {KEYBOARD_LAYOUT.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1">
              {row.map((key, cIdx) => (
                <div 
                  key={cIdx} 
                  className={`w-5 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                    rIdx === kbRow && cIdx === kbCol 
                      ? 'bg-yellow-600 text-white' 
                      : key === '^' && isCaps
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {key === '^' ? (isCaps ? 'CAPS' : 'caps') : (isCaps ? key.toUpperCase() : key)}
                </div>
              ))}
            </div>
          ))}
          <div className="flex justify-center gap-2 mt-1 text-[8px] text-zinc-500 font-bold">
            <span>[X] Type</span>
            <span>[B] Del</span>
            <span>[A] Space</span>
            <span>[START] Done</span>
          </div>
        </div>
      )}
    </div>
  );
}
