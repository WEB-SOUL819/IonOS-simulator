import React, { useState, useEffect } from 'react';
import { Lock, Palette } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const SETTINGS = [
  'Personalization',
  'Power Config',
  'Display Brightness',
  'Always On Display',
  'Require PIN',
  'Change PIN',
  'System Info',
  'About Device'
];

export default function SettingsApp() {
  const { theme, setTheme, setAccent, themes } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [view, setView] = useState<'list' | 'about' | 'specs' | 'change_pin' | 'toggle' | 'personalization' | 'theme_select' | 'accent_select' | 'power' | 'brightness'>('list');
  const [toggleSetting, setToggleSetting] = useState('');
  const [toggleState, setToggleState] = useState(false);
  
  // Power & Brightness state
  const [powerMode, setPowerMode] = useState(1); // 0: Saver, 1: Balanced, 2: Performance
  const [brightness, setBrightness] = useState(80); // 0-100
  
  // Personalization state
  const [persIndex, setPersIndex] = useState(0);
  const [themeIndex, setThemeIndex] = useState(0);
  const [accentIndex, setAccentIndex] = useState(0);

  const ACCENTS = [
    { name: 'Indigo', class: 'text-indigo-400' },
    { name: 'Emerald', class: 'text-emerald-400' },
    { name: 'Blue', class: 'text-blue-400' },
    { name: 'Orange', class: 'text-orange-400' },
    { name: 'Purple', class: 'text-purple-400' },
    { name: 'Green', class: 'text-green-500' },
    { name: 'Red', class: 'text-red-400' },
    { name: 'Pink', class: 'text-pink-400' },
    { name: 'Yellow', class: 'text-yellow-400' },
    { name: 'Cyan', class: 'text-cyan-400' },
  ];

  const [pinStep, setPinStep] = useState<'old' | 'new' | 'confirm'>('old');
  const [pinInput, setPinInput] = useState('');
  const [tempPin, setTempPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      
      if (view === 'list') {
        if (btn === 'down') {
          setSelectedIndex(prev => Math.min(prev + 1, SETTINGS.length - 1));
        } else if (btn === 'up') {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (btn === 'x' || btn === 'start') {
          if (SETTINGS[selectedIndex] === 'About Device') {
            setView('about');
          } else if (SETTINGS[selectedIndex] === 'Personalization') {
            setView('personalization');
            setPersIndex(0);
          } else if (SETTINGS[selectedIndex] === 'Change PIN') {
            setView('change_pin');
            setPinStep('old');
            setPinInput('');
            setPinError(false);
            setPinSuccess(false);
          } else if (SETTINGS[selectedIndex] === 'Always On Display' || SETTINGS[selectedIndex] === 'Require PIN') {
            setView('toggle');
            setToggleSetting(SETTINGS[selectedIndex]);
            const key = SETTINGS[selectedIndex] === 'Always On Display' ? 'ionos_aod' : 'ionos_require_pin';
            setToggleState(localStorage.getItem(key) !== 'false');
          } else if (SETTINGS[selectedIndex] === 'Power Config') {
            setView('power');
          } else if (SETTINGS[selectedIndex] === 'Display Brightness') {
            setView('brightness');
          }
        }
      } else if (view === 'power') {
        if (btn === 'b') {
          setView('list');
        } else if (btn === 'down') {
          setPowerMode(prev => Math.min(prev + 1, 2));
        } else if (btn === 'up') {
          setPowerMode(prev => Math.max(prev - 1, 0));
        }
      } else if (view === 'brightness') {
        if (btn === 'b') {
          setView('list');
        } else if (btn === 'right') {
          setBrightness(prev => Math.min(prev + 10, 100));
        } else if (btn === 'left') {
          setBrightness(prev => Math.max(prev - 10, 10));
        }
      } else if (view === 'personalization') {
        if (btn === 'b') {
            setView('list');
        } else if (btn === 'down') {
            setPersIndex(prev => Math.min(prev + 1, 1));
        } else if (btn === 'up') {
            setPersIndex(prev => Math.max(prev - 1, 0));
        } else if (btn === 'x' || btn === 'start') {
            if (persIndex === 0) {
                setView('theme_select');
                setThemeIndex(themes.findIndex(t => t.id === theme.id));
            } else {
                setView('accent_select');
                const currentAccent = ACCENTS.findIndex(a => a.class === theme.accent);
                setAccentIndex(currentAccent !== -1 ? currentAccent : 0);
            }
        }
      } else if (view === 'theme_select') {
        if (btn === 'b') {
          setView('personalization');
        } else if (btn === 'down') {
          setThemeIndex(prev => Math.min(prev + 1, themes.length - 1));
        } else if (btn === 'up') {
          setThemeIndex(prev => Math.max(prev - 1, 0));
        } else if (btn === 'x' || btn === 'start') {
          setTheme(themes[themeIndex].id);
        }
      } else if (view === 'accent_select') {
        if (btn === 'b') {
            setView('personalization');
        } else if (btn === 'down') {
            setAccentIndex(prev => Math.min(prev + 1, ACCENTS.length - 1));
        } else if (btn === 'up') {
            setAccentIndex(prev => Math.max(prev - 1, 0));
        } else if (btn === 'x' || btn === 'start') {
            setAccent(ACCENTS[accentIndex].class);
        }
      } else if (view === 'toggle') {
        if (btn === 'b') {
          setView('list');
        } else if (btn === 'x' || btn === 'start') {
          const newState = !toggleState;
          setToggleState(newState);
          const key = toggleSetting === 'Always On Display' ? 'ionos_aod' : 'ionos_require_pin';
          localStorage.setItem(key, String(newState));
        }
      } else if (view === 'about') {
        if (btn === 'b') {
          setView('list');
        } else if (btn === 'x' || btn === 'start') {
          setView('specs');
        }
      } else if (view === 'specs') {
        if (btn === 'b') {
          setView('about');
        }
      } else if (view === 'change_pin') {
        if (btn === 'b' && pinInput.length === 0) {
          setView('list');
        } else if (btn === 'b') {
          setPinInput(p => p.slice(0, -1));
        } else if (btn === 'up') setPinInput(p => p + '1');
        else if (btn === 'down') setPinInput(p => p + '2');
        else if (btn === 'left') setPinInput(p => p + '3');
        else if (btn === 'right') setPinInput(p => p + '4');
        else if (btn === 'a') setPinInput(p => p + '5');
        else if (btn === 'x') setPinInput(p => p + '6');
        else if (btn === 'start') {
          if (pinStep === 'old') {
            const savedPin = localStorage.getItem('ionos_pin') || '1234';
            if (pinInput === savedPin) {
              setPinStep('new');
              setPinInput('');
              setPinError(false);
            } else {
              setPinError(true);
              setPinInput('');
              setTimeout(() => setPinError(false), 1000);
            }
          } else if (pinStep === 'new') {
            if (pinInput.length >= 4) {
              setTempPin(pinInput);
              setPinStep('confirm');
              setPinInput('');
            } else {
              setPinError(true);
              setTimeout(() => setPinError(false), 1000);
            }
          } else if (pinStep === 'confirm') {
            if (pinInput === tempPin) {
              localStorage.setItem('ionos_pin', pinInput);
              setPinSuccess(true);
              setTimeout(() => {
                setView('list');
              }, 1500);
            } else {
              setPinError(true);
              setPinInput('');
              setPinStep('new');
              setTimeout(() => setPinError(false), 1000);
            }
          }
        }
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [selectedIndex, view, pinStep, pinInput, tempPin, toggleState, toggleSetting, themeIndex, themes, theme, persIndex, accentIndex]);

  if (view === 'personalization') {
    return (
        <div className={`w-full h-full ${theme.wallpaper} flex flex-col p-2 transition-colors duration-300`}>
            <div className={`text-xs font-bold ${theme.accent} mb-2 px-2 border-b border-white/10 pb-1`}>Personalization</div>
            <div className="flex-1 overflow-y-auto">
                {['Select Theme', 'Accent Color'].map((opt, idx) => (
                    <div 
                        key={opt} 
                        className={`px-3 py-2 text-xs rounded-md mb-1 transition-colors ${idx === persIndex ? `${theme.highlight} text-white font-bold` : `${theme.text} opacity-60`}`}
                    >
                        {opt}
                    </div>
                ))}
            </div>
            <div className={`text-center text-[8px] ${theme.text} opacity-50 mt-2`}>
                Press X to Select | B to Back
            </div>
        </div>
    );
  }

  if (view === 'theme_select') {
    return (
      <div className={`w-full h-full ${theme.wallpaper} flex flex-col p-2 transition-colors duration-300`}>
        <div className={`text-xs font-bold ${theme.accent} mb-2 px-2 border-b border-white/10 pb-1`}>Select Theme</div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {themes.map((t, index) => {
              const isSelected = index === themeIndex;
              const isActive = t.id === theme.id;
              return (
                <div 
                  key={t.id} 
                  className={`flex items-center justify-between px-3 py-2 rounded-md transition-all ${
                    isSelected ? theme.highlight : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Palette size={12} className={t.accent.replace('text-', 'text-')} />
                    <span className={`text-[10px] ${isSelected ? 'font-bold text-white' : theme.text} ${isActive ? theme.accent : ''}`}>
                      {t.name}
                    </span>
                  </div>
                  {isActive && <div className={`w-1.5 h-1.5 rounded-full ${t.accent.replace('text-', 'bg-')}`} />}
                </div>
              );
            })}
          </div>
        </div>
        <div className={`text-center text-[8px] ${theme.text} opacity-50 mt-2`}>
          Press X to Apply | B to Back
        </div>
      </div>
    );
  }

  if (view === 'accent_select') {
    return (
      <div className={`w-full h-full ${theme.wallpaper} flex flex-col p-2 transition-colors duration-300`}>
        <div className={`text-xs font-bold ${theme.accent} mb-2 px-2 border-b border-white/10 pb-1`}>Accent Color</div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {ACCENTS.map((a, index) => {
              const isSelected = index === accentIndex;
              const isActive = a.class === theme.accent;
              return (
                <div 
                  key={a.name} 
                  className={`flex items-center justify-between px-3 py-2 rounded-md transition-all ${
                    isSelected ? theme.highlight : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${a.class.replace('text-', 'bg-')}`} />
                    <span className={`text-[10px] ${isSelected ? 'font-bold text-white' : theme.text} ${isActive ? theme.accent : ''}`}>
                      {a.name}
                    </span>
                  </div>
                  {isActive && <div className={`w-1.5 h-1.5 rounded-full ${theme.text.replace('text-', 'bg-')}`} />}
                </div>
              );
            })}
          </div>
        </div>
        <div className={`text-center text-[8px] ${theme.text} opacity-50 mt-2`}>
          Press X to Apply | B to Back
        </div>
      </div>
    );
  }

  if (view === 'power') {
    const modes = ['Power Saver', 'Balanced', 'Performance'];
    return (
      <div className={`w-full h-full ${theme.wallpaper} flex flex-col p-2 transition-colors duration-300`}>
        <div className={`text-xs font-bold ${theme.accent} mb-2 px-2 border-b border-white/10 pb-1`}>Power Config</div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {modes.map((mode, index) => {
              const isSelected = index === powerMode;
              return (
                <div 
                  key={mode} 
                  className={`flex items-center justify-between px-3 py-2 rounded-md transition-all ${
                    isSelected ? theme.highlight : 'bg-transparent'
                  }`}
                >
                  <span className={`text-[10px] ${isSelected ? 'font-bold text-white' : theme.text}`}>
                    {mode}
                  </span>
                  {isSelected && <div className={`w-1.5 h-1.5 rounded-full ${theme.text.replace('text-', 'bg-')}`} />}
                </div>
              );
            })}
          </div>
        </div>
        <div className={`text-center text-[8px] ${theme.text} opacity-50 mt-2`}>
          Use D-Pad to Select | B to Back
        </div>
      </div>
    );
  }

  if (view === 'brightness') {
    return (
      <div className={`w-full h-full ${theme.wallpaper} flex flex-col p-4 relative text-white items-center justify-center transition-colors duration-300`}>
        <div className={`text-xs font-bold ${theme.accent} mb-6`}>Display Brightness</div>
        
        <div className="flex items-center gap-2 w-full px-4 mb-8">
          <span className={`text-[10px] font-bold ${theme.text}`}>10%</span>
          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden relative">
            <div className={`h-full ${theme.accent.replace('text-', 'bg-')} transition-all`} style={{ width: `${brightness}%` }} />
          </div>
          <span className={`text-[10px] font-bold ${theme.text}`}>100%</span>
        </div>
        <div className={`text-2xl font-mono font-bold ${theme.text} mb-4`}>{brightness}%</div>

        <div className={`absolute bottom-4 left-0 w-full text-center text-[8px] ${theme.text} opacity-50`}>
          <p>Left/Right to Adjust</p>
          <p className="mt-1">Press B to Go Back</p>
        </div>
      </div>
    );
  }

  if (view === 'toggle') {
    return (
      <div className={`w-full h-full ${theme.wallpaper} flex flex-col p-4 relative text-white items-center justify-center transition-colors duration-300`}>
        <div className={`text-xs font-bold ${theme.accent} mb-6`}>{toggleSetting}</div>
        
        <div className="flex items-center gap-4 mb-8">
          <span className={`text-[10px] font-bold ${!toggleState ? theme.text : 'text-zinc-600'}`}>OFF</span>
          <div className={`w-12 h-6 rounded-full p-1 transition-colors ${toggleState ? 'bg-green-500' : 'bg-zinc-700'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${toggleState ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
          <span className={`text-[10px] font-bold ${toggleState ? theme.text : 'text-zinc-600'}`}>ON</span>
        </div>

        <div className={`absolute bottom-4 left-0 w-full text-center text-[8px] ${theme.text} opacity-50`}>
          <p>Press X to Toggle</p>
          <p className="mt-1">Press B to Go Back</p>
        </div>
      </div>
    );
  }

  if (view === 'change_pin') {
    return (
      <div className={`w-full h-full ${theme.wallpaper} flex flex-col items-center justify-center text-white relative transition-colors duration-300`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full mb-2 ${theme.highlight}`}>
            <Lock size={24} className={pinSuccess ? 'text-green-500' : pinError ? 'text-red-500 animate-pulse' : theme.accent.replace('text-', 'text-')} />
          </div>
          <div className={`text-xl font-mono tracking-[0.5em] h-8 text-center ${theme.text}`}>
            {pinSuccess ? 'DONE' : pinInput.split('').map(() => '•').join('')}
          </div>
          <div className={`text-[10px] ${theme.text} mt-2 text-center opacity-70`}>
            {pinSuccess ? (
              <p className="text-green-400">PIN Changed Successfully</p>
            ) : pinStep === 'old' ? (
              <p>Enter Current PIN</p>
            ) : pinStep === 'new' ? (
              <p>Enter New PIN (Min 4)</p>
            ) : (
              <p>Confirm New PIN</p>
            )}
          </div>
          {!pinSuccess && (
            <>
              <div className={`grid grid-cols-3 gap-2 mt-2 text-[8px] ${theme.text} opacity-60 font-mono`}>
                <div className="text-center">UP: 1</div>
                <div className="text-center">DN: 2</div>
                <div className="text-center">LF: 3</div>
                <div className="text-center">RT: 4</div>
                <div className="text-center">A: 5</div>
                <div className="text-center">X: 6</div>
              </div>
              <div className={`text-[8px] ${theme.text} opacity-60 mt-2`}>START: Enter | B: Back/Del</div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (view === 'specs') {
    return (
      <div className={`w-full h-full ${theme.wallpaper} flex flex-col p-4 relative text-white transition-colors duration-300`}>
        <div className={`text-xs font-bold ${theme.accent} mb-4 border-b border-white/10 pb-2`}>Specifications</div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className={`text-[10px] ${theme.text} mb-2 font-bold`}>Hardware</div>
          <div className={`text-[9px] ${theme.text} opacity-60 mb-1`}>ESP32-S3 Dual-Core</div>
          <div className={`text-[9px] ${theme.text} opacity-60 mb-1`}>8MB Flash / 2MB PSRAM</div>
          <div className={`text-[9px] ${theme.text} opacity-60 mb-4`}>240x320 SPI TFT Display</div>
          
          <div className={`text-[10px] ${theme.text} mb-2 font-bold`}>Connectivity</div>
          <div className={`text-[9px] ${theme.text} opacity-60 mb-1`}>Wi-Fi 802.11 b/g/n</div>
          <div className={`text-[9px] ${theme.text} opacity-60 mb-1`}>Bluetooth 5 (LE)</div>
          
          <div className={`text-[10px] ${theme.text} mb-2 font-bold mt-2`}>Software</div>
          <div className={`text-[9px] ${theme.text} opacity-60 mb-1`}>IonOS v1.0</div>
          
          <div className={`absolute bottom-4 left-0 w-full text-center text-[8px] ${theme.text} opacity-50`}>
            Press B to go back
          </div>
        </div>
      </div>
    );
  }

  if (view === 'about') {
    return (
      <div className={`w-full h-full ${theme.wallpaper} flex flex-col p-4 relative text-white transition-colors duration-300`}>
        <div className={`text-xs font-bold ${theme.accent} mb-4 border-b border-white/10 pb-2`}>About Device</div>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className={`text-xl font-bold mb-1 ${theme.text}`}>Apex V1</div>
          <div className={`text-xs ${theme.text} opacity-60 mb-6`}>Running IonOS</div>
          
          <div className={`text-[10px] ${theme.text} opacity-80 mb-2`}>Created by</div>
          <div className={`text-[11px] font-bold ${theme.accent} mb-6`}>Aosmic Studio</div>
          
          <div className={`text-[9px] ${theme.text} opacity-60 mb-1`}>Visit us at:</div>
          <div className={`text-[10px] ${theme.text} opacity-80 mb-6`}>aosmicstudio.vercel.app</div>
          
          <div className="absolute bottom-4 left-0 w-full text-center">
            <div className={`text-[8px] ${theme.text} opacity-60 mb-2`}>Press X for Specifications</div>
            <div className={`text-[8px] ${theme.text} opacity-40`}>© 2026 All Rights Reserved</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${theme.wallpaper} flex flex-col p-2 transition-colors duration-300`}>
      <div className={`text-xs font-bold ${theme.accent} mb-2 px-2`}>Settings</div>
      <div className="flex-1 overflow-y-auto">
        {SETTINGS.map((setting, index) => {
          const isSelected = index === selectedIndex;
          return (
            <div 
              key={setting} 
              className={`px-3 py-2 text-xs rounded-md mb-1 transition-colors ${isSelected ? `${theme.highlight} text-white font-bold` : `${theme.text} opacity-60`}`}
            >
              {setting}
            </div>
          );
        })}
      </div>
    </div>
  );
}
