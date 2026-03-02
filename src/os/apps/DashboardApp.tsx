import React, { useState, useEffect } from 'react';
import { Activity, Cpu, MemoryStick, HardDrive, Battery } from 'lucide-react';

export default function DashboardApp() {
  const [cpuUsage, setCpuUsage] = useState(12);
  const [ramUsage, setRamUsage] = useState(45);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 20) + 5);
      setRamUsage(prev => Math.min(100, Math.max(0, prev + (Math.random() * 4 - 2))));
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col">
      <div className="h-8 bg-zinc-800 flex items-center px-3 border-b border-zinc-700 shrink-0">
        <div className="flex items-center gap-1.5 text-white">
          <Activity size={12} />
          <span className="text-[10px] font-bold">System Dashboard</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* CPU */}
        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Cpu size={12} className="text-blue-400" />
              <span className="text-[10px] font-bold">CPU Usage</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">{cpuUsage}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        {/* RAM */}
        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <MemoryStick size={12} className="text-emerald-400" />
              <span className="text-[10px] font-bold">PSRAM (8MB)</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">{ramUsage.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${ramUsage}%` }}
            />
          </div>
          <div className="text-[8px] text-zinc-500 mt-1 text-right font-mono">
            {((ramUsage / 100) * 8).toFixed(1)}MB / 8.0MB
          </div>
        </div>

        {/* Storage */}
        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <HardDrive size={12} className="text-amber-400" />
              <span className="text-[10px] font-bold">SD Card (32GB)</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">12%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: '12%' }} />
          </div>
          <div className="text-[8px] text-zinc-500 mt-1 text-right font-mono">
            3.8GB / 32.0GB
          </div>
        </div>

        {/* Power */}
        <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Battery size={12} className="text-rose-400" />
              <span className="text-[10px] font-bold">Battery</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">98%</span>
          </div>
          <div className="flex justify-between text-[8px] text-zinc-500 font-mono">
            <span>Voltage: 4.1V</span>
            <span>Discharging</span>
          </div>
        </div>

        {/* Uptime */}
        <div className="text-center mt-2">
          <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">System Uptime</div>
          <div className="text-xs font-mono text-zinc-300 mt-0.5">{formatUptime(uptime)}</div>
        </div>
      </div>
    </div>
  );
}
