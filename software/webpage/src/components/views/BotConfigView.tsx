import React, { useState } from 'react';
import { Settings, Cpu, Sliders, Save, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BotConfigViewProps {
  onLog: (type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM', message: string) => void;
}

export const BotConfigView: React.FC<BotConfigViewProps> = ({ onLog }) => {
  const [chassisType, setChassisType] = useState<'differential' | 'mecanum' | 'ackermann'>('differential');
  const [wheelDiameter, setWheelDiameter] = useState<number>(65);
  const [trackWidth, setTrackWidth] = useState<number>(180);
  const [maxRpm, setMaxRpm] = useState<number>(320);
  const [kp, setKp] = useState<number>(1.45);
  const [ki, setKi] = useState<number>(0.12);
  const [kd, setKd] = useState<number>(0.05);
  const [leftTrim, setLeftTrim] = useState<number>(0);
  const [rightTrim, setRightTrim] = useState<number>(0);
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [watchdogTimeout, setWatchdogTimeout] = useState<number>(500);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSaveSuccess(true);
    onLog('SYSTEM', `Bot Configuration updated: Chassis=${chassisType}, PID=[${kp}, ${ki}, ${kd}], Baud=${baudRate}`);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    setChassisType('differential');
    setWheelDiameter(65);
    setTrackWidth(180);
    setMaxRpm(320);
    setKp(1.45);
    setKi(0.12);
    setKd(0.05);
    setLeftTrim(0);
    setRightTrim(0);
    setBaudRate(115200);
    setWatchdogTimeout(500);
    onLog('SYSTEM', 'Bot Configuration reset to factory calibration presets');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Bot Configuration & Hardware Calibration
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Tune drive kinematics, PID closed-loop control gains, motor trims, and comm watchdog settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md transition-colors"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drive Kinematics & Chassis */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3>Chassis Kinematics & Geometry</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1.5 font-medium">Chassis Drive Topology</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'differential', label: 'Differential (2WD)' },
                  { id: 'mecanum', label: 'Omni / Mecanum' },
                  { id: 'ackermann', label: 'Ackermann Steer' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setChassisType(type.id as typeof chassisType)}
                    className={`py-2 px-2 text-center rounded-lg border font-medium transition-colors ${
                      chassisType === type.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-neutral-400 mb-1">Wheel Diameter (mm)</label>
                <input
                  type="number"
                  value={wheelDiameter}
                  onChange={(e) => setWheelDiameter(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 font-mono text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Track Width (mm)</label>
                <input
                  type="number"
                  value={trackWidth}
                  onChange={(e) => setTrackWidth(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 font-mono text-neutral-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Max No-Load Motor RPM</label>
              <input
                type="number"
                value={maxRpm}
                onChange={(e) => setMaxRpm(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 font-mono text-neutral-100"
              />
            </div>
          </div>
        </div>

        {/* PID Tuning */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3>Velocity PID Controller Parameters</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">Proportional Gain (Kp)</span>
                <span className="font-mono text-cyan-300 font-bold">{kp}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.05"
                value={kp}
                onChange={(e) => setKp(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">Integral Gain (Ki)</span>
                <span className="font-mono text-cyan-300 font-bold">{ki}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={ki}
                onChange={(e) => setKi(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">Derivative Gain (Kd)</span>
                <span className="font-mono text-cyan-300 font-bold">{kd}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={kd}
                onChange={(e) => setKd(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded cursor-pointer"
              />
            </div>

            {/* Simulated Step Response Preview */}
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 space-y-1">
              <span className="text-[10px] font-mono text-neutral-400">SIMULATED STEP-RESPONSE DAMPING:</span>
              <div className="h-10 flex items-end gap-1 px-1">
                {[20, 55, 88, 105, 98, 102, 100, 100, 100, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-cyan-500/40 border-t border-cyan-400 rounded-t-xs"
                    style={{ height: `${h * 0.35}px` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                <span>Rise: 140ms</span>
                <span>Overshoot: 5.0%</span>
                <span>Settling: 320ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Motor Trims & Watchdog */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3>Motor Trims & Drift Compensation</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">Left Motor Trim Offset</span>
                <span className="font-mono text-cyan-300">{leftTrim > 0 ? `+${leftTrim}%` : `${leftTrim}%`}</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="1"
                value={leftTrim}
                onChange={(e) => setLeftTrim(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-neutral-400">Right Motor Trim Offset</span>
                <span className="font-mono text-cyan-300">{rightTrim > 0 ? `+${rightTrim}%` : `${rightTrim}%`}</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="1"
                value={rightTrim}
                onChange={(e) => setRightTrim(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Communication & Safety Failsafes */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3>Comm Bus & Heartbeat Watchdog</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">UART Serial Baud Rate</label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 font-mono text-neutral-100"
              >
                <option value={9600}>9600 BAUD</option>
                <option value={57600}>57600 BAUD</option>
                <option value={115200}>115200 BAUD (Standard)</option>
                <option value={921600}>921600 BAUD (High-Speed BLE)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Failsafe Watchdog Timeout (ms)</label>
              <input
                type="number"
                value={watchdogTimeout}
                onChange={(e) => setWatchdogTimeout(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 font-mono text-neutral-100"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Robot automatically cuts motor power if no heartbeat packet is received within this window.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
