import React, { useState } from 'react';
import { Compass, Navigation, Play, Square, Plus, Trash2, Shield, MapPin } from 'lucide-react';
import { Waypoint } from '../../types';

interface AutoPilotViewProps {
  onLog: (type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM', message: string) => void;
}

export const AutoPilotView: React.FC<AutoPilotViewProps> = ({ onLog }) => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: '1', x: 20, y: 30, label: 'WP1 (Entry)', status: 'reached' },
    { id: '2', x: 50, y: 70, label: 'WP2 (Waypoint A)', status: 'active' },
    { id: '3', x: 80, y: 40, label: 'WP3 (Goal)', status: 'pending' },
  ]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [avoidanceDistance, setAvoidanceDistance] = useState(45);
  const [rthEnabled, setRthEnabled] = useState(true);

  const handleStartMission = () => {
    setIsNavigating(true);
    onLog('SYSTEM', 'Autonomous Waypoint Navigation mission started (Simulated)');
  };

  const handleStopMission = () => {
    setIsNavigating(false);
    onLog('CMD', 'Autonomous mission paused by operator');
  };

  const handleAddWaypoint = () => {
    const newWp: Waypoint = {
      id: String(Date.now()),
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 80) + 10,
      label: `WP${waypoints.length + 1}`,
      status: 'pending',
    };
    setWaypoints([...waypoints, newWp]);
    onLog('SYSTEM', `Added waypoint ${newWp.label} at coordinates [${newWp.x}, ${newWp.y}]`);
  };

  const handleDeleteWaypoint = (id: string) => {
    setWaypoints(waypoints.filter((w) => w.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            Auto Pilot & Waypoint Navigation
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Simulated 2D arena grid planner, obstacle avoidance buffers, and path-following controllers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isNavigating ? (
            <button
              onClick={handleStopMission}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              Pause Mission
            </button>
          ) : (
            <button
              onClick={handleStartMission}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Execute Autonomous Mission
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2D Arena Grid Canvas Stage */}
        <div className="md:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-cyan-400" />
              2D Arena Coordinate Map (Simulated 10m × 10m)
            </span>
            <span className="text-[10px] font-mono text-neutral-400">COORD: [0, 0] TO [100, 100]</span>
          </div>

          {/* Interactive Arena Graphic */}
          <div className="relative aspect-4/3 bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden flex items-center justify-center">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

            {/* Waypoint Path Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {waypoints.map((wp, index) => {
                if (index === 0) return null;
                const prev = waypoints[index - 1];
                return (
                  <line
                    key={`line-${index}`}
                    x1={`${prev.x}%`}
                    y1={`${prev.y}%`}
                    x2={`${wp.x}%`}
                    y2={`${wp.y}%`}
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                );
              })}
            </svg>

            {/* Waypoints */}
            {waypoints.map((wp) => (
              <div
                key={wp.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 text-[9px] font-bold ${
                    wp.status === 'active'
                      ? 'bg-cyan-500 border-white text-neutral-950 animate-pulse'
                      : wp.status === 'reached'
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-neutral-800 border-neutral-600 text-neutral-300'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded bg-neutral-900/90 text-neutral-300 border border-neutral-800 whitespace-nowrap">
                  {wp.label}
                </span>
              </div>
            ))}

            {/* Simulated Robot Position */}
            <div
              className="absolute w-6 h-6 rounded-md bg-cyan-400 border border-white flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-xl shadow-cyan-500/20"
              style={{ left: '42%', top: '55%' }}
              title="Simulated Rover Current Position"
            >
              <Navigation className="w-3.5 h-3.5 text-neutral-950 -rotate-45" />
            </div>

            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-neutral-400 pointer-events-none">
              CURRENT ESTIMATED POSE: X: 4.2m · Y: 5.5m · θ: 045°
            </div>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-neutral-400">Click coordinates or add automated waypoints to route.</span>
            <button
              onClick={handleAddWaypoint}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Waypoint
            </button>
          </div>
        </div>

        {/* Navigation Parameters & Waypoints List */}
        <div className="space-y-4">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Autonomous Failsafe & Avoidance
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral-400">Obstacle Clearance Buffer</span>
                  <span className="font-mono text-cyan-300 font-semibold">{avoidanceDistance} cm</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={avoidanceDistance}
                  onChange={(e) => setAvoidanceDistance(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                <span className="text-neutral-300">Return to Home (RTH) on Failsafe</span>
                <input
                  type="checkbox"
                  checked={rthEnabled}
                  onChange={(e) => setRthEnabled(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Waypoint Queue List */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-neutral-200 border-b border-neutral-800 pb-2">
              Waypoint Route Sequence
            </h4>

            <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
              {waypoints.map((wp, i) => (
                <div
                  key={wp.id}
                  className="flex items-center justify-between p-2 bg-neutral-950 rounded-lg border border-neutral-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-neutral-400">{i + 1}.</span>
                    <span className="text-neutral-200 font-medium">{wp.label}</span>
                    <span className="font-mono text-[10px] text-neutral-400">
                      [{wp.x}, {wp.y}]
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteWaypoint(wp.id)}
                    className="text-neutral-400 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
