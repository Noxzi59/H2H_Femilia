export type ActiveTab = 'dashboard' | 'config' | 'gemini' | 'autopilot' | 'ecosystem' | 'killswitch';

export type MovementState = 'STOPPED' | 'FORWARD' | 'REVERSE' | 'LEFT' | 'RIGHT' | 'EMERGENCY_STOP';

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
  status: 'available' | 'paired' | 'connecting';
  address: string;
}

export interface TelemetryData {
  speedPercent: number;
  movementState: MovementState;
  leftMotorPwm: number;
  rightMotorPwm: number;
  headingDeg: number;
  batteryVoltage: number;
  batteryPercent: number;
  boardTempC: number;
  emergencyStopEngaged: boolean;
  totalDistanceMeters: number;
  isSimulatedLink: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM';
  message: string;
}

export interface Waypoint {
  id: string;
  x: number;
  y: number;
  label: string;
  status: 'pending' | 'reached' | 'active';
}
