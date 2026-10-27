import React, { useState } from 'react';
import { Bluetooth, BluetoothOff, RefreshCw, Radio, CheckCircle2, AlertCircle, Cpu, Wifi } from 'lucide-react';
import { BluetoothDevice } from '../types';

interface BluetoothStatusPanelProps {
  onLog: (type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM', message: string) => void;
}

const MOCK_DEVICES: BluetoothDevice[] = [
  { id: '1', name: 'RoboCore-ESP32-BLE', rssi: -58, status: 'available', address: '00:1A:7D:DA:71:11' },
  { id: '2', name: 'RoverChassis-DualMotor', rssi: -72, status: 'available', address: 'B8:27:EB:44:90:F2' },
  { id: '3', name: 'TelemetryLink-HC05', rssi: -84, status: 'available', address: '98:D3:31:80:45:9C' },
];

export const BluetoothStatusPanel: React.FC<BluetoothStatusPanelProps> = ({ onLog }) => {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'scanning' | 'connected'>('disconnected');
  const [activeDevice, setActiveDevice] = useState<BluetoothDevice | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>(MOCK_DEVICES);

  const startScan = () => {
    setShowScanModal(true);
    setConnectionStatus('scanning');
    onLog('SYSTEM', 'Initiated Bluetooth Low Energy device discovery (Simulated)');
    setTimeout(() => {
      setConnectionStatus(activeDevice ? 'connected' : 'disconnected');
    }, 2000);
  };

  const handleConnect = (dev: BluetoothDevice) => {
    setConnectionStatus('connected');
    setActiveDevice(dev);
    setShowScanModal(false);
    onLog('SYSTEM', `Simulated BLE connection established with ${dev.name} [${dev.address}]`);
  };

  const handleDisconnect = () => {
    if (activeDevice) {
      onLog('SYSTEM', `Disconnected simulated BLE connection with ${activeDevice.name}`);
    }
    setActiveDevice(null);
    setConnectionStatus('disconnected');
  };

  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${connectionStatus === 'connected' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-neutral-800 text-neutral-400'}`}>
            {connectionStatus === 'connected' ? <Bluetooth className="w-4 h-4" /> : <BluetoothOff className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">Hardware Link</h3>
            <span className="text-[11px] text-neutral-400">Bluetooth LE / Serial Port</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800/90 text-neutral-300 border border-neutral-700">
            {connectionStatus === 'connected' ? 'LINK ACTIVE (SIM)' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-2 text-xs">
        {connectionStatus === 'connected' && activeDevice ? (
          <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-cyan-900/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                {activeDevice.name}
              </span>
              <span className="font-mono text-[11px] text-neutral-400">{activeDevice.rssi} dBm</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>MAC: {activeDevice.address}</span>
              <span>115200 BAUD</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full mt-1 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded transition-colors"
            >
              Disconnect Simulated Device
            </button>
          </div>
        ) : (
          <div className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-neutral-300">Port Status:</span>
              <span className="font-mono text-neutral-400">Ready for BLE Binding</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Reserved for future Bluetooth/Serial connection. Native RF connection is in simulation mode until physical hardware binding is performed.
            </p>
            <button
              onClick={startScan}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 hover:text-white text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === 'scanning' ? 'animate-spin' : ''}`} />
              Scan for BLE Devices (Simulated)
            </button>
          </div>
        )}
      </div>

      {/* Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h4 className="text-sm font-semibold text-neutral-100">Discovered BLE Hardware (Simulated)</h4>
              </div>
              <button
                onClick={() => setShowScanModal(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-neutral-800"
              >
                Close
              </button>
            </div>

            <div className="my-4 space-y-2">
              <p className="text-xs text-neutral-400">
                Select a target microcontroller receiver to simulate Bluetooth link connection:
              </p>
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => handleConnect(dev)}
                  className="p-3 bg-neutral-950/80 hover:bg-neutral-800/80 border border-neutral-800 hover:border-cyan-500/50 rounded-lg cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      {dev.name}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400">{dev.address}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-emerald-400">{dev.rssi} dBm</span>
                    <div className="text-[10px] text-cyan-400">Pair Demo</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg flex items-start gap-2 text-[11px] text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Simulated Pairing Mode: This does not emit native Bluetooth radio packets. It configures the dashboard state for UI and communication testing.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
