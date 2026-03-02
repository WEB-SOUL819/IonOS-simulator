import React, { useState, useEffect } from 'react';
import { Wifi, Bluetooth, Radio, RefreshCw, Lock, Unlock } from 'lucide-react';

const NETWORKS = [
  { ssid: 'Home_Network', signal: -45, security: 'WPA2' },
  { ssid: 'Guest_WiFi', signal: -60, security: 'Open' },
  { ssid: 'CoffeeShop', signal: -80, security: 'WPA3' }
];

const DEVICES = [
  { name: 'Headphones', mac: '00:11:22:33:44:55', type: 'audio' },
  { name: 'Keyboard', mac: 'AA:BB:CC:DD:EE:FF', type: 'hid' }
];

export default function WirelessApp() {
  const [tab, setTab] = useState<'wifi' | 'bt' | 'nrf'>('wifi');
  const [scanning, setScanning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [connectedSsid, setConnectedSsid] = useState<string | null>(null);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  
  // Keyboard state
  const [isCaps, setIsCaps] = useState(false);
  const [kbRow, setKbRow] = useState(0);
  const [kbCol, setKbCol] = useState(0);
  const KEYBOARD_LAYOUT = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '-'],
    ['^', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '_', '@']
  ];

  useEffect(() => {
    const handleInput = (e: CustomEvent<string>) => {
      const btn = e.detail;
      
      if (showPasswordPrompt) {
        // Keyboard navigation for password
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
            setPassword(prev => prev + (isCaps ? key.toUpperCase() : key));
          }
        } else if (btn === 'b') {
          setPassword(prev => prev.slice(0, -1));
        } else if (btn === 'a') {
          setPassword(prev => prev + ' ');
        } else if (btn === 'start') {
          // Attempt connection
          setShowPasswordPrompt(false);
          setConnectingTo(NETWORKS[selectedIndex].ssid);
          setTimeout(() => {
            setConnectingTo(null);
            setConnectedSsid(NETWORKS[selectedIndex].ssid);
            setPassword('');
          }, 2000);
        } else if (btn === 'menu') {
          setShowPasswordPrompt(false);
          setPassword('');
        }
        return;
      }

      // Normal navigation
      if (btn === 'right') {
        setTab(prev => prev === 'wifi' ? 'bt' : prev === 'bt' ? 'nrf' : 'wifi');
        setSelectedIndex(0);
      } else if (btn === 'left') {
        setTab(prev => prev === 'nrf' ? 'bt' : prev === 'bt' ? 'wifi' : 'nrf');
        setSelectedIndex(0);
      } else if (btn === 'down') {
        if (tab === 'wifi') setSelectedIndex(prev => Math.min(prev + 1, NETWORKS.length - 1));
        if (tab === 'bt') setSelectedIndex(prev => Math.min(prev + 1, DEVICES.length - 1));
      } else if (btn === 'up') {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (btn === 'x' || btn === 'start') {
        if (tab === 'wifi') {
          const selectedNet = NETWORKS[selectedIndex];
          if (connectedSsid === selectedNet.ssid) {
            // Disconnect
            setConnectedSsid(null);
          } else if (selectedNet.security === 'Open') {
            // Connect directly
            setConnectingTo(selectedNet.ssid);
            setTimeout(() => {
              setConnectingTo(null);
              setConnectedSsid(selectedNet.ssid);
            }, 1500);
          } else {
            // Prompt for password
            setShowPasswordPrompt(true);
            setPassword('');
          }
        } else {
          setScanning(true);
          setTimeout(() => setScanning(false), 2000);
        }
      }
    };
    window.addEventListener('device-button-down', handleInput as EventListener);
    return () => window.removeEventListener('device-button-down', handleInput as EventListener);
  }, [tab, showPasswordPrompt, selectedIndex, kbRow, kbCol, connectedSsid, isCaps]);

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col relative">
      <div className="h-8 bg-cyan-600 flex items-center px-3 border-b border-cyan-700 shrink-0">
        <div className="flex items-center gap-1.5 text-white">
          <Wifi size={12} />
          <span className="text-[10px] font-bold">Wireless Toolkit</span>
        </div>
      </div>
      
      <div className="flex bg-zinc-950 border-b border-zinc-800 text-[10px] font-bold text-zinc-500">
        <div className={`flex-1 py-1.5 text-center transition-colors ${tab === 'wifi' ? 'text-cyan-400 border-b-2 border-cyan-500' : ''}`}>WiFi</div>
        <div className={`flex-1 py-1.5 text-center transition-colors ${tab === 'bt' ? 'text-blue-400 border-b-2 border-blue-500' : ''}`}>BT</div>
        <div className={`flex-1 py-1.5 text-center transition-colors ${tab === 'nrf' ? 'text-purple-400 border-b-2 border-purple-500' : ''}`}>NRF</div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 relative">
        {scanning && (
          <div className="absolute inset-0 bg-zinc-900/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
            <RefreshCw size={24} className="text-cyan-400 animate-spin mb-2" />
            <span className="text-[10px] text-zinc-300 font-bold">Scanning...</span>
          </div>
        )}

        {tab === 'wifi' && (
          <div className="flex flex-col gap-1">
            {NETWORKS.map((net, i) => {
              const isSelected = i === selectedIndex;
              const isConnected = connectedSsid === net.ssid;
              const isConnecting = connectingTo === net.ssid;
              
              return (
                <div 
                  key={i} 
                  className={`p-2 rounded-md flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-cyan-900/40 ring-1 ring-cyan-500/50' : 'bg-zinc-800'
                  }`}
                >
                  <div>
                    <div className={`text-[10px] font-bold ${isConnected ? 'text-cyan-400' : 'text-white'}`}>
                      {net.ssid}
                    </div>
                    <div className="text-[8px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      {net.security === 'Open' ? <Unlock size={8} /> : <Lock size={8} />}
                      {net.security}
                      {isConnected && <span className="text-cyan-500 ml-1">• Connected</span>}
                      {isConnecting && <span className="text-yellow-500 ml-1 animate-pulse">• Connecting...</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-zinc-500 font-mono">{net.signal}dBm</span>
                    <Wifi size={12} className={net.signal > -50 ? 'text-green-400' : net.signal > -70 ? 'text-yellow-400' : 'text-red-400'} />
                  </div>
                </div>
              );
            })}
            <div className="text-[8px] text-zinc-500 text-center mt-2">
              Press X to Connect/Disconnect
            </div>
          </div>
        )}

        {tab === 'bt' && (
          <div className="flex flex-col gap-1">
            {DEVICES.map((dev, i) => {
              const isSelected = i === selectedIndex;
              return (
                <div 
                  key={i} 
                  className={`p-2 rounded-md flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-blue-900/40 ring-1 ring-blue-500/50' : 'bg-zinc-800'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-bold text-white">{dev.name}</div>
                    <div className="text-[8px] text-zinc-400 font-mono">{dev.mac}</div>
                  </div>
                  <Bluetooth size={12} className="text-blue-400" />
                </div>
              );
            })}
          </div>
        )}

        {tab === 'nrf' && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Radio size={32} className="mb-2 opacity-50" />
            <div className="text-[10px] font-bold">NRF24L01 Console</div>
            <div className="text-[8px] mt-1">Listening on channel 76...</div>
          </div>
        )}
      </div>

      {/* Password Prompt Overlay */}
      {showPasswordPrompt && (
        <div className="absolute inset-0 bg-zinc-950/95 z-20 flex flex-col">
          <div className="p-3 border-b border-zinc-800">
            <div className="text-[10px] font-bold text-cyan-400 mb-1">Connect to {NETWORKS[selectedIndex].ssid}</div>
            <div className="bg-zinc-900 h-8 rounded border border-zinc-700 flex items-center px-2">
              <span className="text-zinc-300 text-[12px] font-mono tracking-widest">
                {password.replace(/./g, '•')}
                <span className="animate-pulse w-1.5 h-3 bg-cyan-500 inline-block ml-0.5 align-middle"></span>
              </span>
              {password.length === 0 && <span className="text-[10px] text-zinc-600 absolute ml-1">Enter Password</span>}
            </div>
          </div>
          
          <div className="flex-1 p-1 flex flex-col justify-center gap-1">
            {KEYBOARD_LAYOUT.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1">
                {row.map((key, cIdx) => (
                  <div 
                    key={cIdx} 
                    className={`w-5 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                      rIdx === kbRow && cIdx === kbCol 
                        ? 'bg-cyan-600 text-white' 
                        : key === '^' && isCaps
                          ? 'bg-cyan-900 text-cyan-200'
                          : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {key === '^' ? (isCaps ? 'CAPS' : 'caps') : (isCaps ? key.toUpperCase() : key)}
                  </div>
                ))}
              </div>
            ))}
            <div className="flex justify-center gap-2 mt-2 text-[8px] text-zinc-500 font-bold">
              <span>[X] Type</span>
              <span>[B] Del</span>
              <span>[START] Connect</span>
              <span>[MENU] Cancel</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
