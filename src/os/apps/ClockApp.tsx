import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlarmClock, Timer, Hourglass, Play, Pause, RotateCcw, Plus, Trash2, Globe } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

type View = 'world' | 'alarm' | 'stopwatch' | 'timer';

const CITIES = [
  { name: 'New York', offset: -5 },
  { name: 'London', offset: 0 },
  { name: 'Paris', offset: 1 },
  { name: 'Tokyo', offset: 9 },
  { name: 'Sydney', offset: 11 },
  { name: 'Dubai', offset: 4 },
];

export default function ClockApp() {
  const { theme } = useTheme();
  const [view, setView] = useState<View>('world');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swRef = useRef<NodeJS.Timeout | null>(null);

  // Timer State
  const [timerTime, setTimerTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInput, setTimerInput] = useState(0); // in minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Alarm State
  const [alarms, setAlarms] = useState<{id: number, time: string, active: boolean}[]>([
    { id: 1, time: '07:00', active: true },
    { id: 2, time: '08:30', active: false },
  ]);
  const [alarmInput, setAlarmInput] = useState('00:00');
  const [isAddingAlarm, setIsAddingAlarm] = useState(false);

  // Navigation State
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuIndex, setMenuIndex] = useState(0); // 0-3 for tabs

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => {
        setSwTime(prev => prev + 10);
      }, 10);
    } else {
      if (swRef.current) clearInterval(swRef.current);
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);

  useEffect(() => {
    if (timerRunning && timerTime > 0) {
      timerRef.current = setInterval(() => {
        setTimerTime(prev => {
          if (prev <= 10) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 10;
        });
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, timerTime]);

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  const getWorldTime = (offset: number) => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nd = new Date(utc + (3600000 * offset));
    return nd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      
      // Tab Navigation (A Button)
      if (btn === 'a') {
        setMenuIndex(prev => (prev + 1) % 4);
        const views: View[] = ['world', 'alarm', 'stopwatch', 'timer'];
        setView(views[(menuIndex + 1) % 4]);
        setSelectedIndex(0);
        return;
      }

      if (view === 'world') {
        if (btn === 'down') setSelectedIndex(prev => Math.min(prev + 1, CITIES.length - 1));
        else if (btn === 'up') setSelectedIndex(prev => Math.max(prev - 1, 0));
      } 
      else if (view === 'alarm') {
        if (isAddingAlarm) {
            // Simple alarm time input simulation
             if (btn === 'up') {
                const [h, m] = alarmInput.split(':').map(Number);
                const newH = (h + 1) % 24;
                setAlarmInput(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
             } else if (btn === 'down') {
                const [h, m] = alarmInput.split(':').map(Number);
                const newH = (h - 1 + 24) % 24;
                setAlarmInput(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
             } else if (btn === 'right') {
                const [h, m] = alarmInput.split(':').map(Number);
                const newM = (m + 5) % 60;
                setAlarmInput(`${h.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
             } else if (btn === 'left') {
                const [h, m] = alarmInput.split(':').map(Number);
                const newM = (m - 5 + 60) % 60;
                setAlarmInput(`${h.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
             } else if (btn === 'start') {
                setAlarms(prev => [...prev, { id: Date.now(), time: alarmInput, active: true }]);
                setIsAddingAlarm(false);
             } else if (btn === 'b') {
                setIsAddingAlarm(false);
             }
        } else {
            if (btn === 'down') setSelectedIndex(prev => Math.min(prev + 1, alarms.length)); // +1 for "Add Alarm" button
            else if (btn === 'up') setSelectedIndex(prev => Math.max(prev - 1, 0));
            else if (btn === 'start' || btn === 'x') {
                if (selectedIndex === alarms.length) {
                    setIsAddingAlarm(true);
                    setAlarmInput('12:00');
                } else {
                    // Toggle alarm
                    const newAlarms = [...alarms];
                    newAlarms[selectedIndex].active = !newAlarms[selectedIndex].active;
                    setAlarms(newAlarms);
                }
            } else if (btn === 'b') {
                if (selectedIndex < alarms.length) {
                    setAlarms(prev => prev.filter((_, i) => i !== selectedIndex));
                }
            }
        }
      }
      else if (view === 'stopwatch') {
        if (btn === 'start') setSwRunning(prev => !prev);
        else if (btn === 'b') {
            setSwRunning(false);
            setSwTime(0);
        }
      }
      else if (view === 'timer') {
        if (timerRunning) {
            if (btn === 'start') setTimerRunning(false);
            else if (btn === 'b') {
                setTimerRunning(false);
                setTimerTime(0);
            }
        } else {
            if (btn === 'up') setTimerInput(prev => prev + 1);
            else if (btn === 'down') setTimerInput(prev => Math.max(0, prev - 1));
            else if (btn === 'right') setTimerInput(prev => prev + 5);
            else if (btn === 'left') setTimerInput(prev => Math.max(0, prev - 5));
            else if (btn === 'start' && timerInput > 0) {
                setTimerTime(timerInput * 60000);
                setTimerRunning(true);
            }
        }
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [view, menuIndex, selectedIndex, isAddingAlarm, alarmInput, alarms, swRunning, timerRunning, timerInput, timerTime]);

  return (
    <div className={`w-full h-full ${theme.wallpaper} flex flex-col transition-colors duration-300`}>
      {/* Header Tabs */}
      <div className="flex items-center justify-around p-2 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <Globe size={16} className={view === 'world' ? theme.accent.replace('text-', 'text-') : 'text-zinc-600'} />
        <AlarmClock size={16} className={view === 'alarm' ? theme.accent.replace('text-', 'text-') : 'text-zinc-600'} />
        <Clock size={16} className={view === 'stopwatch' ? theme.accent.replace('text-', 'text-') : 'text-zinc-600'} />
        <Hourglass size={16} className={view === 'timer' ? theme.accent.replace('text-', 'text-') : 'text-zinc-600'} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {view === 'world' && (
            <div className="flex flex-col gap-2">
                {CITIES.map((city, idx) => (
                    <div key={city.name} className={`flex justify-between items-center p-3 rounded-lg ${idx === selectedIndex ? theme.highlight : 'bg-black/20'}`}>
                        <div className="flex flex-col">
                            <span className={`text-xs font-bold ${theme.text}`}>{city.name}</span>
                            <span className="text-[10px] text-zinc-400">{city.offset > 0 ? `+${city.offset}` : city.offset} HRS</span>
                        </div>
                        <span className={`text-lg font-mono ${theme.text}`}>{getWorldTime(city.offset)}</span>
                    </div>
                ))}
            </div>
        )}

        {view === 'alarm' && (
            <div className="flex flex-col gap-2">
                {isAddingAlarm ? (
                    <div className="flex flex-col items-center justify-center h-full mt-10">
                        <div className={`text-4xl font-mono mb-4 ${theme.text}`}>{alarmInput}</div>
                        <div className="text-[10px] text-zinc-400">Use D-Pad to adjust</div>
                        <div className="text-[10px] text-zinc-400 mt-2">START: Save | B: Cancel</div>
                    </div>
                ) : (
                    <>
                        {alarms.map((alarm, idx) => (
                            <div key={alarm.id} className={`flex justify-between items-center p-3 rounded-lg ${idx === selectedIndex ? theme.highlight : 'bg-black/20'}`}>
                                <span className={`text-xl font-mono ${alarm.active ? theme.text : 'text-zinc-500'}`}>{alarm.time}</span>
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${alarm.active ? 'bg-green-500' : 'bg-zinc-700'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${alarm.active ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        ))}
                        <div className={`flex items-center justify-center p-3 rounded-lg border border-dashed border-zinc-600 ${selectedIndex === alarms.length ? theme.highlight : ''}`}>
                            <Plus size={16} className="text-zinc-400" />
                            <span className="text-xs text-zinc-400 ml-2">Add Alarm</span>
                        </div>
                        <div className="text-[9px] text-zinc-500 text-center mt-2">B: Delete Selected</div>
                    </>
                )}
            </div>
        )}

        {view === 'stopwatch' && (
            <div className="flex flex-col items-center justify-center h-full">
                <div className={`text-4xl font-mono mb-8 ${theme.text} tracking-wider`}>
                    {formatTime(swTime)}
                </div>
                <div className="flex gap-4">
                    <div className={`flex flex-col items-center gap-1 ${!swRunning ? 'opacity-50' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Pause size={16} className="text-white" />
                        </div>
                        <span className="text-[9px] text-zinc-500">START</span>
                    </div>
                    <div className={`flex flex-col items-center gap-1 ${swRunning ? 'opacity-50' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Play size={16} className="text-green-500" />
                        </div>
                        <span className="text-[9px] text-zinc-500">START</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <RotateCcw size={16} className="text-red-500" />
                        </div>
                        <span className="text-[9px] text-zinc-500">B</span>
                    </div>
                </div>
            </div>
        )}

        {view === 'timer' && (
            <div className="flex flex-col items-center justify-center h-full">
                {timerRunning ? (
                    <>
                        <div className={`text-4xl font-mono mb-8 ${theme.text} tracking-wider`}>
                            {formatTime(timerTime)}
                        </div>
                        <div className="flex gap-4">
                             <div className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <Pause size={16} className="text-white" />
                                </div>
                                <span className="text-[9px] text-zinc-500">START</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <RotateCcw size={16} className="text-red-500" />
                                </div>
                                <span className="text-[9px] text-zinc-500">B</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-xs text-zinc-400 mb-2">SET TIMER (MIN)</div>
                        <div className={`text-6xl font-mono mb-8 ${theme.text}`}>
                            {timerInput}
                        </div>
                        <div className="flex gap-4">
                             <div className="flex flex-col items-center gap-1">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <Play size={16} className="text-green-500" />
                                </div>
                                <span className="text-[9px] text-zinc-500">START</span>
                            </div>
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-4">Use D-Pad to adjust</div>
                    </>
                )}
            </div>
        )}
      </div>
      
      {/* Footer Hint */}
      <div className="p-1 bg-black/20 text-[8px] text-center text-zinc-500">
        A: Switch Tab | Menu: Exit
      </div>
    </div>
  );
}
