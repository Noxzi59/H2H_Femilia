import React, { useState } from 'react';
import { 
  Keyboard, 
  Hand, 
  Terminal, 
  Trash2, 
  HelpCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { LogEntry, MovementState } from '../types';

interface InstructionsAndGesturePanelProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onSetMovement: (movement: MovementState) => void;
  onTriggerEmergencyStop: () => void;
  onLog: (type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM', message: string) => void;
}

export const InstructionsAndGesturePanel: React.FC<InstructionsAndGesturePanelProps> = ({
  logs,
  onClearLogs,
  onSetMovement,
  onTriggerEmergencyStop,
  onLog,
}) => {
  const [activeGesture, setActiveGesture] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState<'none' | 'keys' | 'logs'>('none');

  const gestures = [
    { id: 'palm', name: 'Open Palm', label: 'Halt / Stop', move: 'STOPPED' as MovementState, icon: '🖐️' },
    { id: 'point', name: 'Point Ahead', label: 'Drive Fwd', move: 'FORWARD' as MovementState, icon: '☝️' },
    { id: 'left', name: 'Tilt Left', label: 'Steer Left', move: 'LEFT' as MovementState, icon: '👈' },
    { id: 'right', name: 'Tilt Right', label: 'Steer Right', move: 'RIGHT' as MovementState, icon: '👉' },
    { id: 'down', name: 'Thumb Down', label: 'Drive Rev', move: 'REVERSE' as MovementState, icon: '👎' },
    { id: 'fist', name: 'Closed Fist', label: 'E-Brake', move: 'EMERGENCY' as const, icon: '✊' },
  ];

  const simulateGesture = (name: string, movement: MovementState | 'EMERGENCY') => {
    setActiveGesture(name);
    if (movement === 'EMERGENCY') {
      onTriggerEmergencyStop();
      onLog('WARNING', `GESTURE_RECOGNITION: "${name}" -> EMERGENCY HALT`);
    } else {
      onSetMovement(movement);
      onLog('CMD', `GESTURE_RECOGNITION: "${name}" -> Set state to ${movement}`);
    }

    setTimeout(() => {
      setActiveGesture(null);
    }, 1200);
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 flex flex-col justify-between h-full shadow-lg relative select-none">
      {/* Top Header Label */}
      <div className="pb-2 border-b border-neutral-800/80 text-center">
        <div className="flex items-center justify-center gap-1.5 text-neutral-200">
          <Hand className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Gestures</span>
        </div>
        <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">
          Manual & Vision
        </span>
      </div>

      {/* Active Gesture Feedback Notification */}
      {activeGesture && (
        <div className="my-1 py-1 px-2 bg-cyan-500/20 border border-cyan-400/50 rounded-full text-center text-[10px] font-mono text-cyan-200 animate-pulse">
          Active: {activeGesture}
        </div>
      )}

      {/* Vertical Stack of Rounded Pills as in the Hand-Drawn Reference Sketch */}
      <div className="flex-1 flex flex-col justify-around py-1 gap-2">
        {gestures.map((g) => {
          const isFist = g.id === 'fist';
          return (
            <button
              key={g.id}
              onClick={() => simulateGesture(g.name, g.move)}
              className={`w-full py-2 px-2.5 rounded-full border text-center transition-all flex items-center justify-between group active:scale-95 ${
                isFist
                  ? 'bg-red-950/40 hover:bg-red-950/70 border-red-900/60 hover:border-red-600 text-red-300'
                  : 'bg-neutral-950 hover:bg-neutral-850 border-neutral-800 hover:border-cyan-500/60 text-neutral-300 hover:text-white'
              }`}
              title={`Simulate gesture: ${g.name} (${g.label})`}
            >
              <span className="text-base leading-none group-hover:scale-110 transition-transform">
                {g.icon}
              </span>
              <div className="text-left flex-1 ml-2">
                <div className="text-[11px] font-semibold tracking-tight">{g.name}</div>
                <div className="text-[9px] font-mono text-neutral-400">{g.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Utility Actions: Guide & Log */}
      <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-1.5">
        <button
          onClick={() => setShowDrawer(showDrawer === 'keys' ? 'none' : 'keys')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-mono transition-colors ${
            showDrawer === 'keys'
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
          title="Toggle Manual Keybinds Guide"
        >
          <Keyboard className="w-3 h-3" />
          Keys
        </button>

        <button
          onClick={() => setShowDrawer(showDrawer === 'logs' ? 'none' : 'logs')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-mono transition-colors ${
            showDrawer === 'logs'
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
          title="Toggle Telemetry Log Drawer"
        >
          <Terminal className="w-3 h-3" />
          Log ({logs.length})
        </button>
      </div>

      {/* Floating Popup Drawer for Keybinds or Log */}
      {showDrawer !== 'none' && (
        <div className="absolute top-0 right-full mr-3 w-80 bg-neutral-900 border border-neutral-700 rounded-2xl p-4 shadow-2xl z-40 backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <span className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
              {showDrawer === 'keys' ? <Keyboard className="w-3.5 h-3.5 text-cyan-400" /> : <Terminal className="w-3.5 h-3.5 text-cyan-400" />}
              {showDrawer === 'keys' ? 'Manual Keyboard Shortcuts' : 'Telemetry Event Stream'}
            </span>
            <button
              onClick={() => setShowDrawer('none')}
              className="text-neutral-400 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-neutral-800"
            >
              Close
            </button>
          </div>

          {showDrawer === 'keys' ? (
            <div className="mt-3 space-y-2 text-xs">
              <p className="text-[11px] text-neutral-400">
                Direct manual controls via keyboard hotkeys:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="p-2 bg-neutral-950 rounded border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Forward</span>
                  <kbd className="font-mono bg-neutral-800 px-1 rounded text-cyan-300">W / ↑</kbd>
                </div>
                <div className="p-2 bg-neutral-950 rounded border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Reverse</span>
                  <kbd className="font-mono bg-neutral-800 px-1 rounded text-cyan-300">S / ↓</kbd>
                </div>
                <div className="p-2 bg-neutral-950 rounded border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Steer Left</span>
                  <kbd className="font-mono bg-neutral-800 px-1 rounded text-cyan-300">A / ←</kbd>
                </div>
                <div className="p-2 bg-neutral-950 rounded border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Steer Right</span>
                  <kbd className="font-mono bg-neutral-800 px-1 rounded text-cyan-300">D / →</kbd>
                </div>
                <div className="p-2 bg-neutral-950 rounded border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Stop</span>
                  <kbd className="font-mono bg-neutral-800 px-1 rounded text-cyan-300">Space</kbd>
                </div>
                <div className="p-2 bg-neutral-950 rounded border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">E-Stop</span>
                  <kbd className="font-mono bg-red-950 px-1 rounded text-red-300">Esc</kbd>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-col h-64">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-neutral-400">BUFFER: {logs.length} ENTRIES</span>
                <button
                  onClick={onClearLogs}
                  className="text-[10px] text-neutral-400 hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
              <div className="flex-1 bg-neutral-950 p-2 rounded-lg border border-neutral-800 font-mono text-[10px] overflow-y-auto space-y-1.5 custom-scrollbar">
                {logs.map((l) => (
                  <div key={l.id} className="leading-relaxed">
                    <span className="text-neutral-500">[{l.timestamp}] </span>
                    <span className={l.type === 'CMD' ? 'text-cyan-300' : l.type === 'WARNING' ? 'text-amber-400' : 'text-neutral-300'}>
                      {l.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
