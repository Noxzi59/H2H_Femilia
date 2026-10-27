import React, { useState, useEffect, useCallback } from 'react';
import { 
  ActiveTab, 
  MovementState, 
  TelemetryData, 
  LogEntry 
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CameraViewport } from './components/CameraViewport';
import { ManualControls } from './components/ManualControls';
import { BluetoothStatusPanel } from './components/BluetoothStatusPanel';
import { AudioInputPanel } from './components/AudioInputPanel';
import { InstructionsAndGesturePanel } from './components/InstructionsAndGesturePanel';
import { KillSwitchModal } from './components/KillSwitchModal';

import { BotConfigView } from './components/views/BotConfigView';
import { GeminiAiView } from './components/views/GeminiAiView';
import { AutoPilotView } from './components/views/AutoPilotView';
import { EcoSystemView } from './components/views/EcoSystemView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showKillModal, setShowKillModal] = useState(false);

  // Core Telemetry & Robot Simulation State
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speedPercent: 60,
    movementState: 'STOPPED',
    leftMotorPwm: 0,
    rightMotorPwm: 0,
    headingDeg: 45,
    batteryVoltage: 12.6,
    batteryPercent: 94,
    boardTempC: 38.4,
    emergencyStopEngaged: false,
    totalDistanceMeters: 14.2,
    isSimulatedLink: true,
  });

  // Event & Telemetry Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'SYSTEM',
      message: 'Robo Control frontend dashboard initialized in Simulation Mode.',
    },
    {
      id: '2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'SYSTEM',
      message: 'Hardware BLE & Camera pipelines standby. Ready for developer binding.',
    },
  ]);

  const addLog = useCallback((type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM', message: string) => {
    const entry: LogEntry = {
      id: String(Date.now() + Math.random()),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs((prev) => [entry, ...prev.slice(0, 99)]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Update PWM outputs whenever movement state or speed changes
  const updateMovement = useCallback((movement: MovementState) => {
    setTelemetry((prev) => {
      if (prev.emergencyStopEngaged && movement !== 'STOPPED' && movement !== 'EMERGENCY_STOP') {
        return prev;
      }

      let leftPwm = 0;
      let rightPwm = 0;
      const maxPwm = Math.round((prev.speedPercent / 100) * 255);

      switch (movement) {
        case 'FORWARD':
          leftPwm = maxPwm;
          rightPwm = maxPwm;
          break;
        case 'REVERSE':
          leftPwm = -maxPwm;
          rightPwm = -maxPwm;
          break;
        case 'LEFT':
          leftPwm = -Math.round(maxPwm * 0.6);
          rightPwm = maxPwm;
          break;
        case 'RIGHT':
          leftPwm = maxPwm;
          rightPwm = -Math.round(maxPwm * 0.6);
          break;
        case 'STOPPED':
        case 'EMERGENCY_STOP':
        default:
          leftPwm = 0;
          rightPwm = 0;
          break;
      }

      return {
        ...prev,
        movementState: movement,
        leftMotorPwm: leftPwm,
        rightMotorPwm: rightPwm,
      };
    });
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setTelemetry((prev) => {
      const clamped = Math.max(0, Math.min(100, speed));
      let leftPwm = 0;
      let rightPwm = 0;
      const maxPwm = Math.round((clamped / 100) * 255);

      if (prev.movementState === 'FORWARD') {
        leftPwm = maxPwm;
        rightPwm = maxPwm;
      } else if (prev.movementState === 'REVERSE') {
        leftPwm = -maxPwm;
        rightPwm = -maxPwm;
      } else if (prev.movementState === 'LEFT') {
        leftPwm = -Math.round(maxPwm * 0.6);
        rightPwm = maxPwm;
      } else if (prev.movementState === 'RIGHT') {
        leftPwm = maxPwm;
        rightPwm = -Math.round(maxPwm * 0.6);
      }

      return {
        ...prev,
        speedPercent: clamped,
        leftMotorPwm: leftPwm,
        rightMotorPwm: rightPwm,
      };
    });
  }, []);

  const triggerEmergencyStop = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      emergencyStopEngaged: true,
      movementState: 'EMERGENCY_STOP',
      leftMotorPwm: 0,
      rightMotorPwm: 0,
    }));
    addLog('WARNING', 'EMERGENCY STOP ENGAGED: All drive PWM cut to 0. Actuators locked.');
  }, [addLog]);

  const resetEmergencyStop = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      emergencyStopEngaged: false,
      movementState: 'STOPPED',
      leftMotorPwm: 0,
      rightMotorPwm: 0,
    }));
    addLog('SYSTEM', 'Emergency Stop Disengaged. Motor drives returned to ARMED state.');
  }, [addLog]);

  // Simulated Telemetry updates during active driving
  useEffect(() => {
    if (telemetry.movementState === 'STOPPED' || telemetry.emergencyStopEngaged) {
      return;
    }

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        let newHeading = prev.headingDeg;
        if (prev.movementState === 'LEFT') {
          newHeading = (newHeading - 2 + 360) % 360;
        } else if (prev.movementState === 'RIGHT') {
          newHeading = (newHeading + 2) % 360;
        }

        const distanceInc = prev.movementState === 'FORWARD' || prev.movementState === 'REVERSE' ? 0.05 : 0.01;

        return {
          ...prev,
          headingDeg: newHeading,
          totalDistanceMeters: Number((prev.totalDistanceMeters + distanceInc).toFixed(2)),
        };
      });
    }, 200);

    return () => clearInterval(interval);
  }, [telemetry.movementState, telemetry.emergencyStopEngaged]);

  const handleSelectTab = (tab: ActiveTab) => {
    if (tab === 'killswitch') {
      setShowKillModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenKillSwitch={() => setShowKillModal(true)}
        emergencyStopEngaged={telemetry.emergencyStopEngaged}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <Header
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          emergencyStopEngaged={telemetry.emergencyStopEngaged}
          onTriggerEmergencyStop={triggerEmergencyStop}
          onResetEmergencyStop={resetEmergencyStop}
          batteryPercent={telemetry.batteryPercent}
        />

        {/* Global Emergency Alert Banner if Failsafe Triggered */}
        {telemetry.emergencyStopEngaged && (
          <div className="bg-red-950/90 border-b border-red-700/80 px-6 py-2 flex items-center justify-between text-xs text-red-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span className="font-bold tracking-wide">
                SYSTEM FAILSAFE ACTIVE: DRIVE ACTUATORS IN EMERGENCY SHUTDOWN
              </span>
            </div>
            <button
              onClick={resetEmergencyStop}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-mono uppercase text-[11px] transition-colors"
            >
              Reset Safety Interlock
            </button>
          </div>
        )}

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-5 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-4 max-w-[1600px] mx-auto h-full">
              {/* Upper Section: Camera Viewport (Large Central Area) + Vertical Gestures/Instructions on the Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[380px] lg:min-h-[460px] flex-1">
                {/* Large Central Camera Area */}
                <div className="lg:col-span-9 xl:col-span-10 flex flex-col h-full">
                  <CameraViewport
                    emergencyStopEngaged={telemetry.emergencyStopEngaged}
                    onLog={addLog}
                  />
                </div>

                {/* Vertical Manual Instructions & Gestures Column to the right of Camera */}
                <div className="lg:col-span-3 xl:col-span-2 flex flex-col h-full">
                  <InstructionsAndGesturePanel
                    logs={logs}
                    onClearLogs={clearLogs}
                    onSetMovement={updateMovement}
                    onTriggerEmergencyStop={triggerEmergencyStop}
                    onLog={addLog}
                  />
                </div>
              </div>

              {/* Lower Section as in Sketch: Joystick on Left, Audio Input on Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0">
                {/* Bottom Left: Directional Cross Joystick ("Joy stick controle for seseme") */}
                <div className="lg:col-span-7 xl:col-span-7">
                  <ManualControls
                    telemetry={telemetry}
                    onSetMovement={updateMovement}
                    onSetSpeed={setSpeed}
                    onTriggerEmergencyStop={triggerEmergencyStop}
                    onResetEmergencyStop={resetEmergencyStop}
                    onLog={addLog}
                  />
                </div>

                {/* Bottom Right: Audio Input Wide Capsule + Bluetooth Link Reservation */}
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4 justify-between">
                  <AudioInputPanel
                    onSetMovement={updateMovement}
                    onSetSpeed={setSpeed}
                    onTriggerEmergencyStop={triggerEmergencyStop}
                    onLog={addLog}
                  />

                  <BluetoothStatusPanel onLog={addLog} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && <BotConfigView onLog={addLog} />}
          {activeTab === 'gemini' && <GeminiAiView onLog={addLog} />}
          {activeTab === 'autopilot' && <AutoPilotView onLog={addLog} />}
          {activeTab === 'ecosystem' && <EcoSystemView onLog={addLog} />}
        </main>
      </div>

      {/* Kill Switch Confirmation Dialog */}
      <KillSwitchModal
        isOpen={showKillModal}
        onClose={() => setShowKillModal(false)}
        onConfirmKill={triggerEmergencyStop}
      />
    </div>
  );
}
