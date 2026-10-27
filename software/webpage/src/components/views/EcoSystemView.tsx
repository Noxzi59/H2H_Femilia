import React, { useState } from 'react';
import { Layers, Activity, Zap, Cpu, Sun, Bell, Sliders } from 'lucide-react';

interface EcoSystemViewProps {
  onLog: (type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM', message: string) => void;
}

export const EcoSystemView: React.FC<EcoSystemViewProps> = ({ onLog }) => {
  const [gripperAngle, setGripperAngle] = useState(45);
  const [headlightsOn, setHeadlightsOn] = useState(false);
  const [buzzerActive, setBuzzerActive] = useState(false);

  const handleTestBuzzer = () => {
    setBuzzerActive(true);
    onLog('CMD', 'ACTUATE_BUZZER: 2.4kHz audible pulse emitted (Simulated)');
    setTimeout(() => setBuzzerActive(false), 800);
  };

  const handleToggleHeadlights = () => {
    const next = !headlightsOn;
    setHeadlightsOn(next);
    onLog('CMD', `HEADLIGHTS_RELAY: ${next ? 'HIGH (ON)' : 'LOW (OFF)'}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Hardware Ecosystem & Peripheral Telemetry
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time status of ultrasonic sonars, 6-DOF inertial measurement unit (IMU), auxiliary servos, and power rails.
          </p>
        </div>

        <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
          ALL PERIPHERALS NOMINAL (SIM)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ultrasonic Sonar Array */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3>HC-SR04 Ultrasonic Sonar Array</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Left Sonar */}
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
              <div className="flex justify-between items-center mb-1 font-mono">
                <span className="text-neutral-400">LEFT SENSOR:</span>
                <span className="text-cyan-300 font-bold">48.2 cm</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[48%]" />
              </div>
            </div>

            {/* Center Sonar */}
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
              <div className="flex justify-between items-center mb-1 font-mono">
                <span className="text-neutral-400">CENTER FORWARD SENSOR:</span>
                <span className="text-emerald-400 font-bold">124.0 cm (CLEAR)</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[85%]" />
              </div>
            </div>

            {/* Right Sonar */}
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
              <div className="flex justify-between items-center mb-1 font-mono">
                <span className="text-neutral-400">RIGHT SENSOR:</span>
                <span className="text-cyan-300 font-bold">62.8 cm</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[62%]" />
              </div>
            </div>
          </div>
        </div>

        {/* 6-DOF IMU Orientation */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3>6-DOF IMU Attitude & Orientation (MPU6050)</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">Roll Axis (X)</span>
              <span className="text-xl font-mono font-bold text-cyan-300 tabular-nums">+1.2°</span>
              <span className="text-[10px] text-neutral-400 block mt-1">Level</span>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">Pitch Axis (Y)</span>
              <span className="text-xl font-mono font-bold text-cyan-300 tabular-nums">-0.4°</span>
              <span className="text-[10px] text-neutral-400 block mt-1">Level</span>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-lg border border-neutral-800">
              <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">Yaw Heading (Z)</span>
              <span className="text-xl font-mono font-bold text-cyan-300 tabular-nums">045.8°</span>
              <span className="text-[10px] text-neutral-400 block mt-1">North-East</span>
            </div>
          </div>

          <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between font-mono">
            <span>CALIBRATION: GYRO ZEROED</span>
            <span>SAMPLE RATE: 100 Hz</span>
          </div>
        </div>

        {/* Auxiliary Servos / Gripper Arm */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3>Auxiliary Servo & End-Effector Gripper</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-neutral-400">Gripper Jaw Aperture Angle</span>
                <span className="font-mono text-cyan-300 font-bold">{gripperAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={gripperAngle}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGripperAngle(val);
                  onLog('CMD', `SET_SERVO_ANGLE: Gripper set to ${val}° PWM`);
                }}
                className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
                <span>0° (Full Closed)</span>
                <span>90° (Neutral)</span>
                <span>180° (Wide Open)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setGripperAngle(0);
                  onLog('CMD', 'SERVO_PRESET: Gripper clamped closed (0°)');
                }}
                className="flex-1 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs rounded border border-neutral-800"
              >
                Close Clamp
              </button>
              <button
                onClick={() => {
                  setGripperAngle(180);
                  onLog('CMD', 'SERVO_PRESET: Gripper wide open (180°)');
                }}
                className="flex-1 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-xs rounded border border-neutral-800"
              >
                Open Wide
              </button>
            </div>
          </div>
        </div>

        {/* Power Rails & Actuator Relays */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3>Power Distribution & Hardware Toggles</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <span className="text-neutral-400 text-[11px] block">12V Drive Bus:</span>
              <span className="font-mono text-base font-bold text-neutral-200">12.58 V</span>
              <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">Draw: 1.42 A</span>
            </div>

            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <span className="text-neutral-400 text-[11px] block">5V Logic Bus:</span>
              <span className="font-mono text-base font-bold text-neutral-200">5.04 V</span>
              <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">Draw: 380 mA</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleToggleHeadlights}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
                headlightsOn
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              {headlightsOn ? 'Headlights: ON' : 'Headlights: OFF'}
            </button>

            <button
              onClick={handleTestBuzzer}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
                buzzerActive
                  ? 'bg-red-500/20 border-red-400 text-red-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Test Buzzer Pulse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
