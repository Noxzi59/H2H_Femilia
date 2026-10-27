import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Sparkles } from 'lucide-react';
import { MovementState } from '../types';

interface AudioInputPanelProps {
  onSetMovement: (movement: MovementState) => void;
  onSetSpeed: (speed: number) => void;
  onTriggerEmergencyStop: () => void;
  onLog: (type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM', message: string) => void;
}

export const AudioInputPanel: React.FC<AudioInputPanelProps> = ({
  onSetMovement,
  onSetSpeed,
  onTriggerEmergencyStop,
  onLog,
}) => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>('Ready for voice command');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [showVoiceTriggers, setShowVoiceTriggers] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startMicrophone = async () => {
    try {
      setErrorMessage(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionState('unsupported');
        setErrorMessage('MediaDevices Web API is not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionState('granted');
      setIsMicActive(true);
      onLog('SYSTEM', 'Audio input channel active: Microphone permission granted');

      // Setup Web Audio API analyser
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err: unknown) {
      console.warn('Microphone permission request failed:', err);
      setPermissionState('denied');
      setIsMicActive(false);
      setErrorMessage('Microphone access denied or unavailable in sandbox frame.');
      onLog('WARNING', 'Audio input permission was denied or blocked');
    }
  };

  const stopMicrophone = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicActive(false);
    setAudioLevel(0);
    onLog('SYSTEM', 'Audio input channel muted');
  };

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, []);

  const executeVoiceCommand = (command: string) => {
    setLastTranscript(command);
    const normalized = command.toLowerCase();

    if (normalized.includes('forward') || normalized.includes('ahead')) {
      onSetMovement('FORWARD');
      onLog('CMD', `VOICE_CMD: "${command}" -> FORWARD`);
    } else if (normalized.includes('reverse') || normalized.includes('back')) {
      onSetMovement('REVERSE');
      onLog('CMD', `VOICE_CMD: "${command}" -> REVERSE`);
    } else if (normalized.includes('left')) {
      onSetMovement('LEFT');
      onLog('CMD', `VOICE_CMD: "${command}" -> STEER LEFT`);
    } else if (normalized.includes('right')) {
      onSetMovement('RIGHT');
      onLog('CMD', `VOICE_CMD: "${command}" -> STEER RIGHT`);
    } else if (normalized.includes('stop') || normalized.includes('halt')) {
      onSetMovement('STOPPED');
      onLog('CMD', `VOICE_CMD: "${command}" -> FULL STOP`);
    } else if (normalized.includes('kill') || normalized.includes('emergency')) {
      onTriggerEmergencyStop();
      onLog('WARNING', `VOICE_CMD: "${command}" -> EMERGENCY STOP`);
    }
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-lg select-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-200">
            Audio Input Control
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            {isMicActive ? 'MIC ACTIVE' : 'STANDBY'}
          </span>
        </div>

        <button
          onClick={() => setShowVoiceTriggers(!showVoiceTriggers)}
          className="text-[10px] font-mono text-neutral-400 hover:text-cyan-300 underline"
        >
          {showVoiceTriggers ? 'Hide Voice Presets' : 'Voice Presets'}
        </button>
      </div>

      {/* The Wide Capsule Audio Input Control from the Hand-Drawn Reference Sketch */}
      <div className="relative">
        <button
          onClick={isMicActive ? stopMicrophone : startMicrophone}
          className={`w-full py-3.5 px-6 rounded-full border flex items-center justify-between transition-all group shadow-md active:scale-98 relative overflow-hidden ${
            isMicActive
              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-cyan-500/20'
              : 'bg-neutral-950 hover:bg-neutral-850 border-neutral-700 text-neutral-300 hover:text-white'
          }`}
          title={isMicActive ? 'Click to Mute Microphone' : 'Click to Activate Microphone Input'}
        >
          {/* Subtle audio level waveform fill inside capsule */}
          {isMicActive && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-cyan-500/15 transition-all duration-75 pointer-events-none"
              style={{ width: `${Math.max(5, audioLevel)}%` }}
            />
          )}

          {/* Left descriptor */}
          <div className="flex items-center gap-2 relative z-10">
            <span className="text-xs font-mono text-neutral-400">INPUT:</span>
            <span className="text-xs font-medium text-neutral-200 truncate max-w-[140px]">
              {lastTranscript}
            </span>
          </div>

          {/* Center Microphone Icon from Sketch: [ 🎙️ ] */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              isMicActive
                ? 'bg-cyan-500 border-cyan-300 text-neutral-950 shadow-lg shadow-cyan-400/30 animate-pulse'
                : 'bg-neutral-800 border-neutral-600 text-cyan-400 group-hover:scale-105'
            }`}>
              {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-neutral-400" />}
            </div>
            <span className="text-[8px] font-mono uppercase tracking-wider text-neutral-400 mt-0.5">
              {isMicActive ? 'MUTE' : 'PRESS MIC'}
            </span>
          </div>

          {/* Right Signal Level */}
          <div className="flex items-center gap-1.5 relative z-10">
            <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] font-mono text-cyan-300 tabular-nums">
              {isMicActive ? `${audioLevel}%` : '0%'}
            </span>
          </div>
        </button>

        {errorMessage && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-900/50">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Expandable Simulated Voice Presets */}
      {showVoiceTriggers && (
        <div className="mt-2.5 pt-2 border-t border-neutral-800 grid grid-cols-3 gap-1.5 animate-fadeIn">
          {[
            { label: 'Voice: "Forward"', cmd: 'Drive Forward' },
            { label: 'Voice: "Reverse"', cmd: 'Drive Reverse' },
            { label: 'Voice: "Turn Left"', cmd: 'Turn Left' },
            { label: 'Voice: "Turn Right"', cmd: 'Turn Right' },
            { label: 'Voice: "Full Stop"', cmd: 'Stop Robot' },
            { label: 'Voice: "Kill Switch"', cmd: 'Emergency Stop' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => executeVoiceCommand(item.cmd)}
              className="px-2 py-1 text-[10px] bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded font-mono text-left transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
