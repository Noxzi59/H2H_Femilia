import React from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

interface KillSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmKill: () => void;
}

export const KillSwitchModal: React.FC<KillSwitchModalProps> = ({
  isOpen,
  onClose,
  onConfirmKill,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-red-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Top Warning Banner Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        <div className="flex items-start justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 tracking-tight">
                Engage Emergency Kill Switch?
              </h3>
              <span className="text-xs text-red-400 font-mono uppercase">
                Hardware Failsafe Simulation
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs text-neutral-300">
          <p className="leading-relaxed">
            Confirming this action will immediately cut all simulated drive motor PWM outputs to 0%, freeze autonomous execution, and lock user teleoperation controls.
          </p>

          <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between text-neutral-400">
              <span>DRIVE MOTORS M1/M2:</span>
              <span className="text-red-400 font-semibold">FORCE 0% PWM</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>SIMULATED RELAYS:</span>
              <span className="text-red-400 font-semibold">DISENGAGE BUS</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>CONTROLLER STATE:</span>
              <span className="text-amber-400 font-semibold">LOCKED</span>
            </div>
          </div>

          <div className="bg-red-950/40 border border-red-900/60 p-2.5 rounded-lg flex items-center gap-2 text-[11px] text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>
              Simulation Notice: This triggers a simulated hardware shutdown in the dashboard state machine.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmKill();
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-600/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            Confirm Emergency Stop
          </button>
        </div>
      </div>
    </div>
  );
};
