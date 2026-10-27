import React, { useEffect, useState } from 'react';
import { Camera, Grid, RefreshCw, ShieldAlert, VideoOff } from 'lucide-react';

interface VisionObject {
  label: string;
  confidence: number;
  position: 'left' | 'center' | 'right';
}

interface VisionStatus {
  connected: boolean;
  mode: 'STILL' | 'MOVEMENT';
  motion_detected: boolean;
  fps: number;
  objects: VisionObject[];
  error: string | null;
}

interface CameraViewportProps {
  emergencyStopEngaged: boolean;
  onLog: (type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM', message: string) => void;
}

const initialStatus: VisionStatus = {
  connected: false,
  mode: 'STILL',
  motion_detected: false,
  fps: 0,
  objects: [],
  error: null,
};

export const CameraViewport: React.FC<CameraViewportProps> = ({ emergencyStopEngaged, onLog }) => {
  const [status, setStatus] = useState<VisionStatus>(initialStatus);
  const [showGrid, setShowGrid] = useState(true);
  const [videoKey, setVideoKey] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const visionBaseUrl = window.location.protocol === 'file:' ? 'http://127.0.0.1:8000' : '';

  useEffect(() => {
    let active = true;
    const socketUrl = window.location.protocol === 'file:'
      ? 'ws://127.0.0.1:8000/ws/vision'
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/vision`;
    const socket = new WebSocket(socketUrl);

    socket.onmessage = (event) => {
      try {
        if (active) setStatus(JSON.parse(event.data) as VisionStatus);
      } catch {
        // Ignore malformed status packets; the next websocket update will refresh the HUD.
      }
    };

    const pollStatus = async () => {
      try {
        const response = await fetch(`${visionBaseUrl}/api/vision/status`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Vision service returned ${response.status}`);
        const nextStatus = (await response.json()) as VisionStatus;
        if (active) setStatus(nextStatus);
      } catch {
        if (active) {
          setStatus((previous) => ({
            ...previous,
            connected: false,
            error: previous.error ?? 'Cannot reach the local vision service at 127.0.0.1:8000.',
          }));
        }
      }
    };

    const pollTimer = window.location.protocol === 'file:'
      ? undefined
      : window.setInterval(pollStatus, 1000);
    if (pollTimer !== undefined) void pollStatus();
    return () => {
      active = false;
      if (pollTimer !== undefined) window.clearInterval(pollTimer);
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (videoLoaded) return;
    const retryTimer = window.setTimeout(() => setVideoKey((value) => value + 1), 2500);
    return () => window.clearTimeout(retryTimer);
  }, [videoKey, videoLoaded]);

  const captureSnapshot = () => {
    onLog('SYSTEM', 'Snapshot requested from the local YOLO camera feed.');
  };

  const connectionLabel = status.connected ? 'LOCAL YOLO ONLINE' : 'VISION SERVICE OFFLINE';

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800/80 text-xs">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${status.connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="font-semibold text-neutral-200">PRIMARY OPTICAL FEED</span>
          <span className="text-neutral-500 font-mono">|</span>
          <span className="font-mono text-[11px] text-cyan-400">{connectionLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowGrid((value) => !value)} className={`p-1.5 rounded-lg border ${showGrid ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`} title="Toggle alignment grid">
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button onClick={captureSnapshot} className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200" title="Log snapshot request">
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setVideoKey((value) => value + 1)} className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200" title="Reconnect video feed">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[320px] bg-neutral-950 flex items-center justify-center overflow-hidden">
        <img
          key={videoKey}
          src={`${visionBaseUrl}/api/vision/video?session=${videoKey}`}
          alt="Live local webcam with YOLO object detections and OpenCV motion regions"
          onLoad={() => {
            setVideoLoaded(true);
            setStatus((previous) => ({ ...previous, connected: true, error: null }));
          }}
          onError={() => setVideoLoaded(false)}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {!videoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
            <div className="text-center max-w-md p-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-2xl">
              <div className="inline-flex p-3 rounded-full bg-neutral-800 text-cyan-400 mb-3 border border-neutral-700">
                {status.error ? <VideoOff className="w-6 h-6" /> : <RefreshCw className="w-6 h-6 animate-spin" />}
              </div>
              <h3 className="text-sm font-bold text-neutral-100 tracking-wide uppercase">
                {status.error ? 'Local vision service unavailable' : 'Connecting to local camera'}
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                {status.error ?? 'Waiting for the webcam and YOLO service to provide the first frame.'}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono mt-3">LOCAL ONLY · NO CLOUD API KEY</p>
            </div>
          </div>
        )}

        {showGrid && <div className="absolute inset-3 pointer-events-none border border-cyan-500/20 rounded-sm"><div className="absolute left-1/3 top-0 bottom-0 border-l border-cyan-500/20" /><div className="absolute left-2/3 top-0 bottom-0 border-l border-cyan-500/20" /><div className="absolute top-1/2 left-0 right-0 border-t border-cyan-500/20" /></div>}

        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-neutral-950/80 border border-neutral-800 px-3 py-1.5 rounded-lg text-[10px] font-mono backdrop-blur-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${status.mode === 'MOVEMENT' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <span className="text-neutral-200">MODE: {status.mode}</span>
          <span className="text-neutral-500">{status.fps.toFixed(1)} FPS</span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-3 pointer-events-none">
          <div className="max-w-[70%] flex flex-wrap gap-1.5">
            {status.objects.slice(0, 6).map((object, index) => (
              <span key={`${object.label}-${index}`} className="px-2 py-1 rounded bg-neutral-950/85 border border-cyan-500/30 text-cyan-200 text-[10px] font-mono">
                {object.label} {(object.confidence * 100).toFixed(0)}% · {object.position}
              </span>
            ))}
            {status.objects.length === 0 && status.connected && <span className="px-2 py-1 rounded bg-neutral-950/80 text-neutral-400 text-[10px] font-mono">No objects detected</span>}
          </div>
          <span className="text-[10px] font-mono text-neutral-300 bg-neutral-950/75 px-2 py-1 rounded">
            {status.motion_detected ? 'MOTION DETECTED' : 'OBSERVING'}
          </span>
        </div>

        {emergencyStopEngaged && (
          <div className="absolute top-3 right-3 bg-red-950/95 border border-red-700 text-red-200 px-3 py-2 rounded-lg flex items-center gap-2 text-xs z-20 shadow-lg">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="font-semibold">EMERGENCY STOP ENGAGED</span>
          </div>
        )}
      </div>
    </div>
  );
};
