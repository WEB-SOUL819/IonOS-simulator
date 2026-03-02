import React, { useState, useEffect, useRef } from 'react';
import { Send, Wifi, WifiOff } from 'lucide-react';
import { AppState } from '../../components/Screen';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export default function ChatbotApp({ setApp }: { setApp: (app: AppState) => void }) {
  const [mode, setMode] = useState<'local' | 'online'>('local');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! I am ApexBot. Press START to toggle Online Mode.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isCaps, setIsCaps] = useState(false);
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);

  const KEYBOARD_LAYOUT = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '-'],
    ['^', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '?']
  ];

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      if (showKeyboard) {
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
            setInput(prev => prev + (isCaps ? key.toUpperCase() : key));
          }
        } else if (btn === 'b') {
          setInput(prev => prev.slice(0, -1));
        } else if (btn === 'a') {
          setInput(prev => prev + ' ');
        } else if (btn === 'start') {
          if (input.trim()) {
            handleSend();
          }
          setShowKeyboard(false);
        } else if (btn === 'menu') {
          setShowKeyboard(false);
        }
      } else {
        if (btn === 'x') {
          setShowKeyboard(true);
        } else if (btn === 'start') {
          setMode(prev => prev === 'local' ? 'online' : 'local');
        }
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [input, showKeyboard, kbRow, kbCol, isCaps, mode]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    if (mode === 'online') {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: userMsg,
          config: {
            systemInstruction: 'You are ApexBot, an AI assistant inside a retro handheld device called Apex V1 running IonOS. Keep your answers very concise (1-2 short sentences) so they fit on a small screen.'
          }
        });
        setMessages(prev => [...prev, { role: 'bot', text: response.text || 'No response.' }]);
      } catch (e) {
        setMessages(prev => [...prev, { role: 'bot', text: 'Connection error. Check API key or network.' }]);
      }
      setIsTyping(false);
    } else {
      setTimeout(() => {
        let botResponse = "I'm not sure about that.";
        const lowerInput = userMsg.toLowerCase().trim();
        
        if (lowerInput.startsWith('open ')) {
          const target = lowerInput.replace('open ', '').trim();
          const validApps = ['settings', 'music', 'files', 'calculator', 'wireless', 'notes', 'emulator', 'browser', 'dashboard', 'bruce', 'marauder'];
          if (validApps.includes(target)) {
            botResponse = `Opening ${target}...`;
            setTimeout(() => setApp(target as AppState), 1500);
          } else {
            botResponse = `I cannot find the app "${target}".`;
          }
        } else if (lowerInput.includes('+') || lowerInput.includes('-') || lowerInput.includes('*') || lowerInput.includes('/')) {
          try {
            // eslint-disable-next-line no-eval
            const result = eval(lowerInput.replace(/[^0-9+\-*/.]/g, ''));
            botResponse = `The answer is ${result}`;
          } catch {
            botResponse = "I couldn't calculate that.";
          }
        } else if (lowerInput.includes('time')) {
          botResponse = "Look at the top right of your screen!";
        } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
          botResponse = "Hello there! How can I assist you today?";
        } else if (lowerInput.includes('what can you do') || lowerInput.includes('help')) {
          botResponse = "I can open apps (e.g., 'open music'), do basic math (e.g., '5 * 5'), and answer simple questions!";
        }

        setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col">
      <div className="h-8 bg-zinc-800 flex items-center justify-between px-3 border-b border-zinc-700 shrink-0">
        <div className="text-[10px] font-bold text-zinc-300">ApexBot</div>
        <div className={`flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded ${mode === 'online' ? 'bg-blue-900/50 text-blue-400' : 'bg-zinc-700 text-zinc-400'}`}>
          {mode === 'online' ? <Wifi size={8} /> : <WifiOff size={8} />}
          {mode.toUpperCase()}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`max-w-[85%] p-2 rounded-lg text-[10px] leading-tight ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white self-end rounded-br-none' 
                : 'bg-zinc-700 text-zinc-200 self-start rounded-bl-none'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="bg-zinc-700 text-zinc-400 self-start rounded-lg rounded-bl-none p-2 text-[10px] flex gap-1">
            <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="h-10 bg-zinc-800 border-t border-zinc-700 flex items-center px-2 gap-2 shrink-0">
        <div className="flex-1 bg-zinc-900 h-6 rounded px-2 text-[10px] flex items-center text-zinc-400 overflow-hidden whitespace-nowrap">
          {input || 'Press X to type...'}
          {showKeyboard && <span className="animate-pulse w-1 h-3 bg-zinc-400 ml-0.5"></span>}
        </div>
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
          <Send size={10} />
        </div>
      </div>

      {showKeyboard && (
        <div className="h-auto pb-2 bg-zinc-950 border-t border-zinc-800 p-1 flex flex-col gap-1 shrink-0">
          {KEYBOARD_LAYOUT.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1">
              {row.map((key, cIdx) => (
                <div 
                  key={cIdx} 
                  className={`w-5 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                    rIdx === kbRow && cIdx === kbCol 
                      ? 'bg-blue-500 text-white' 
                      : key === '^' && isCaps
                        ? 'bg-blue-900 text-blue-200'
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
            <span>[START] Send</span>
          </div>
        </div>
      )}
    </div>
  );
}
