import React from 'react';
import { 
  SlidersHorizontal,
  Brain, 
  Compass, 
  Layers, 
  ShieldAlert, 
  Menu,
  Gamepad2,
  Radio
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenKillSwitch: () => void;
  emergencyStopEngaged: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenKillSwitch,
  emergencyStopEngaged,
}) => {
  const sidebarButtons = [
    {
      id: 'config' as ActiveTab,
      label: 'Bot config',
      note: 'BoT Settings',
      icon: SlidersHorizontal,
    },
    {
      id: 'gemini' as ActiveTab,
      label: 'Gemini AI',
      note: 'femilia AI',
      icon: Brain,
    },
    {
      id: 'autopilot' as ActiveTab,
      label: 'Auto pilot',
      note: 'Autopilot',
      icon: Compass,
    },
    {
      id: 'ecosystem' as ActiveTab,
      label: 'Eco Sys',
      note: 'Eco System',
      icon: Layers,
    },
  ];

  return (
    <aside className="w-56 bg-neutral-925 border-r border-neutral-800/80 flex flex-col justify-between shrink-0 h-screen select-none p-3.5">
      {/* Top Header & Menu Icon */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 py-1 border-b border-neutral-800/70 pb-3">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2 group text-left"
            title="Return to Main Remote UI Viewport"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors">
              <Menu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-100 tracking-tight">Robo Control</div>
              <div className="text-[10px] font-mono text-cyan-400">Remote UI</div>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className={`p-1.5 rounded-lg border transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Main Remote UI Workspace"
          >
            <Gamepad2 className="w-4 h-4" />
          </button>
        </div>

        {/* Vertical Stack of Capsule Buttons as in the Hand-Drawn Reference */}
        <div className="space-y-2.5">
          {/* Main Remote Workspace Pill */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full py-2.5 px-3.5 rounded-full border text-center transition-all shadow-xs ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 font-bold'
                : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
            }`}
          >
            <div className="text-xs font-medium">Remote Workspace</div>
            <div className="text-[9px] font-mono text-neutral-400">Live Camera & Teleop</div>
          </button>

          {/* Sketch Buttons 1 to 4 */}
          {sidebarButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeTab === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => onSelectTab(btn.id)}
                className={`w-full py-2 px-3.5 rounded-full border flex items-center justify-between transition-all group ${
                  isActive
                    ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-sm font-semibold'
                    : 'bg-neutral-900/90 hover:bg-neutral-850 border-neutral-800/90 text-neutral-300 hover:text-white hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-neutral-400 group-hover:text-neutral-300'}`} />
                  <span className="text-xs font-medium">{btn.label}</span>
                </div>
                <span className="text-[9px] font-mono text-neutral-400">
                  {btn.note}
                </span>
              </button>
            );
          })}

          {/* Button 5: Kill Switch (Oval Pill as in sketch) */}
          <button
            onClick={onOpenKillSwitch}
            className={`w-full py-2.5 px-3.5 rounded-full border flex items-center justify-between transition-all active:scale-98 mt-2 ${
              emergencyStopEngaged
                ? 'bg-red-950 border-red-600 text-red-200 shadow-lg shadow-red-950/60 animate-pulse font-bold'
                : 'bg-red-950/30 hover:bg-red-950/60 border-red-900/60 hover:border-red-600 text-red-300'
            }`}
            title="Emergency Kill Switch"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Kill</span>
            </div>
            <span className="text-[9px] font-mono uppercase bg-red-900/50 px-2 py-0.5 rounded-full text-red-200 border border-red-800/60">
              {emergencyStopEngaged ? 'HALTED' : 'Switch'}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Status */}
      <div className="space-y-2 pt-3 border-t border-neutral-800/70">
        <div className="px-3 py-2 bg-neutral-950/80 rounded-xl border border-neutral-800/80 text-[10px] font-mono space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span>MODE:</span>
            <span className="text-cyan-400">SIMULATION</span>
          </div>
          <div className="flex items-center justify-between text-neutral-400">
            <span>LINK:</span>
            <span className="text-emerald-400">ACTIVE LOOP</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
