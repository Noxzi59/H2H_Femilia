import React from 'react';
import { ShieldAlert, RotateCcw, Gamepad2 } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  emergencyStopEngaged: boolean;
  onTriggerEmergencyStop: () => void;
  onResetEmergencyStop: () => void;
  batteryPercent: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  emergencyStopEngaged,
  onTriggerEmergencyStop,
  onResetEmergencyStop,
  batteryPercent,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-neutral-800 bg-neutral-925/90 backdrop-blur-xs select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <span className="text-sm font-bold tracking-tight text-neutral-100 uppercase font-sans">
          Remote UI
        </span>
        <span className="text-xs font-mono text-cyan-400">
          (Robo Control)
        </span>
      </div>

      {/* Center Zone: Gamepad Icon from Hand-Drawn Reference [ 🎮 ] */}
      <div className="flex items-center gap-2">
        <div 
          className="flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-700/80 rounded-full shadow-inner cursor-pointer hover:border-cyan-500/50 transition-colors"
          title="Gamepad Controller Connection: Ready / Simulated Gamepad Link"
        >
          <Gamepad2 className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono text-neutral-300 hidden sm:inline">
            GAMEPAD [READY]
          </span>
        </div>
      </div>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-neutral-400 mr-2">
          <span>PWR: {batteryPercent}%</span>
          <span className="text-neutral-600">·</span>
          <span>12.6V</span>
        </div>

        {emergencyStopEngaged ? (
          <button
            onClick={onResetEmergencyStop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Safety Failsafe
          </button>
        ) : (
          <button
            onClick={onTriggerEmergencyStop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            E-Stop Halt
          </button>
        )}
      </div>
    </header>
  );
};
