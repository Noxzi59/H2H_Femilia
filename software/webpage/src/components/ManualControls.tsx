import React, { useEffect, useCallback } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Square, 
  Gauge, 
  Zap, 
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { MovementState, TelemetryData } from '../types';

interface ManualControlsProps {
  telemetry: TelemetryData;
  onSetMovement: (movement: MovementState) => void;
  onSetSpeed: (speed: number) => void;
  onTriggerEmergencyStop: () => void;
  onResetEmergencyStop: () => void;
  onLog: (type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM', message: string) => void;
}

export const ManualControls: React.FC<ManualControlsProps> = ({
  telemetry,
  onSetMovement,
  onSetSpeed,
  onTriggerEmergencyStop,
  onResetEmergencyStop,
  onLog,
}) => {
  const { speedPercent, movementState, leftMotorPwm, rightMotorPwm, emergencyStopEngaged } = telemetry;

  const handleDirection = useCallback((direction: MovementState) => {
    if (emergencyStopEngaged) {
      onLog('WARNING', 'Drive command rejected: Emergency Stop is currently engaged');
      return;
    }
    onSetMovement(direction);
    onLog('CMD', `SIMULATED_DRIVE_CMD: ${direction} at ${speedPercent}% throttle`);
  }, [emergencyStopEngaged, onSetMovement, onLog, speedPercent]);

  const handleStop = useCallback(() => {
    onSetMovement('STOPPED');
    onLog('CMD', 'SIMULATED_DRIVE_CMD: STOPPED (Actuator PWM reset to 0)');
  }, [onSetMovement, onLog]);

  // Keyboard shortcut listener for teleoperation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          e.preventDefault();
          handleDirection('FORWARD');
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          e.preventDefault();
          handleDirection('REVERSE');
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          e.preventDefault();
          handleDirection('LEFT');
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          e.preventDefault();
          handleDirection('RIGHT');
          break;
        case ' ': // Spacebar for Stop
          e.preventDefault();
          handleStop();
          break;
        case 'Escape':
          e.preventDefault();
          onTriggerEmergencyStop();
          break;
        case '1':
          onSetSpeed(25);
          break;
        case '2':
          onSetSpeed(50);
          break;
        case '3':
          onSetSpeed(75);
          break;
        case '4':
          onSetSpeed(100);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirection, handleStop, onTriggerEmergencyStop, onSetSpeed]);

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">Manual Control</h3>
          <span className="text-[11px] text-neutral-400">Directional D-Pad & Throttle</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-neutral-400">DEMO SIMULATION</span>
          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
            emergencyStopEngaged 
              ? 'bg-red-950/80 text-red-400 border-red-800'
              : movementState !== 'STOPPED' 
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800' 
              : 'bg-neutral-800 text-neutral-300 border-neutral-700'
          }`}>
            {movementState}
          </span>
        </div>
      </div>

      {/* Main Grid: D-Pad on Left, Throttle & Meters on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Directional D-Pad Cross from Sketch */}
        <div className="flex flex-col items-center justify-center p-3 bg-neutral-950/70 rounded-2xl border border-neutral-800/90 relative">
          <div className="flex items-center justify-between w-full mb-1 px-1">
            <span className="text-[10px] font-mono text-neutral-400">
              CROSS JOYSTICK [SESEME]
            </span>
            <span className="text-[9px] font-mono text-cyan-400">WASD / ARROWS</span>
          </div>
          
          <div className="grid grid-cols-3 gap-1.5 w-44 h-44 p-1">
            {/* Row 1 */}
            <div />
            <button
              onClick={() => handleDirection('FORWARD')}
              disabled={emergencyStopEngaged}
              className={`flex flex-col items-center justify-center rounded-xl border font-bold text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                movementState === 'FORWARD'
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
              }`}
              title="Drive Forward (N / W / Up Arrow)"
            >
              <span className="text-[10px] font-mono text-cyan-400 font-bold">N</span>
              <ArrowUp className="w-4 h-4" />
            </button>
            <div />

            {/* Row 2 */}
            <button
              onClick={() => handleDirection('LEFT')}
              disabled={emergencyStopEngaged}
              className={`flex flex-col items-center justify-center rounded-xl border font-bold text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                movementState === 'LEFT'
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
              }`}
              title="Steer Left (A / Left Arrow)"
            >
              <span className="text-[10px] font-mono text-cyan-400 font-bold">A</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Central STOP Button */}
            <button
              onClick={handleStop}
              className={`flex flex-col items-center justify-center rounded-xl border font-bold text-xs transition-all active:scale-95 ${
                movementState === 'STOPPED'
                  ? 'bg-neutral-800 border-neutral-600 text-neutral-100 shadow-inner'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/60 text-amber-300'
              }`}
              title="Full Stop (Spacebar)"
            >
              <Square className="w-3.5 h-3.5 fill-current mb-0.5" />
              <span className="text-[8px] font-mono">STOP</span>
            </button>

            <button
              onClick={() => handleDirection('RIGHT')}
              disabled={emergencyStopEngaged}
              className={`flex flex-col items-center justify-center rounded-xl border font-bold text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                movementState === 'RIGHT'
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
              }`}
              title="Steer Right (E / D / Right Arrow)"
            >
              <span className="text-[10px] font-mono text-cyan-400 font-bold">E</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Row 3 */}
            <div />
            <button
              onClick={() => handleDirection('REVERSE')}
              disabled={emergencyStopEngaged}
              className={`flex flex-col items-center justify-center rounded-xl border font-bold text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                movementState === 'REVERSE'
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
              }`}
              title="Drive Reverse (S / Down Arrow)"
            >
              <ArrowDown className="w-4 h-4" />
              <span className="text-[10px] font-mono text-cyan-400 font-bold">S</span>
            </button>
            <div />
          </div>
        </div>

        {/* Speed Slider & Actuator Readouts */}
        <div className="flex flex-col justify-between h-full space-y-3">
          {/* Speed / Throttle Slider */}
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Throttle Speed
              </span>
              <span className="font-mono text-sm font-bold text-cyan-400 tabular-nums">
                {speedPercent}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={speedPercent}
              onChange={(e) => {
                const val = Number(e.target.value);
                onSetSpeed(val);
                onLog('CMD', `SET_THROTTLE_LIMIT: ${val}%`);
              }}
              className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded-lg cursor-pointer"
            />

            {/* Speed Presets */}
            <div className="grid grid-cols-4 gap-1.5 mt-2.5">
              {[25, 50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    onSetSpeed(preset);
                    onLog('CMD', `PRESET_THROTTLE: ${preset}%`);
                  }}
                  className={`py-1 text-[10px] font-mono rounded border transition-colors ${
                    speedPercent === preset
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-neutral-850 border-neutral-700/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Motor Actuator PWM Simulation Readouts */}
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Motor Drive Signals
              </span>
              <span className="text-[10px] font-mono text-neutral-400">PWM (0-255)</span>
            </div>

            {/* Left Motor */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-neutral-400">LEFT MOTOR (M1):</span>
                <span className="text-cyan-300 font-semibold tabular-nums">{leftMotorPwm} PWM</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-150" 
                  style={{ width: `${Math.min(100, Math.abs(leftMotorPwm) / 2.55)}%` }} 
                />
              </div>
            </div>

            {/* Right Motor */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-neutral-400">RIGHT MOTOR (M2):</span>
                <span className="text-cyan-300 font-semibold tabular-nums">{rightMotorPwm} PWM</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-150" 
                  style={{ width: `${Math.min(100, Math.abs(rightMotorPwm) / 2.55)}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Prominent Emergency Stop Button */}
          {emergencyStopEngaged ? (
            <button
              onClick={onResetEmergencyStop}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Emergency Stop (Arm Motors)
            </button>
          ) : (
            <button
              onClick={onTriggerEmergencyStop}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-red-700 via-rose-600 to-red-700 hover:from-red-600 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg border border-red-500/50 flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
              Emergency Stop (Halt All)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
