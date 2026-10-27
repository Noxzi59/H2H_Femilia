import React, { useState } from 'react';
import { Sparkles, Brain, Eye, Compass, Play, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';

interface GeminiAiViewProps {
  onLog: (type: 'CMD' | 'TELEMETRY' | 'WARNING' | 'SYSTEM', message: string) => void;
}

export const GeminiAiView: React.FC<GeminiAiViewProps> = ({ onLog }) => {
  const [missionPrompt, setMissionPrompt] = useState(
    'Inspect floor zone, detect obstacle markers, and compute optimal clearance vector to goal target.'
  );
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [isSimulating, setIsSimulating] = useState(false);
  const [inferenceLog, setInferenceLog] = useState<string[]>([
    'Vision reasoning engine initialized (Simulated mode).',
    'Awaiting frame buffer feed from Camera Viewport.',
  ]);

  const handleRunInference = () => {
    setIsSimulating(true);
    onLog('SYSTEM', `Gemini Multimodal reasoning triggered with model ${selectedModel} (Simulated)`);
    
    setTimeout(() => {
      setInferenceLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Analyzed synthetic frame: No obstacles detected within 50cm.`,
        `[${new Date().toLocaleTimeString()}] Suggested Trajectory: HEADING 012° @ 45% PWM.`,
        `[${new Date().toLocaleTimeString()}] Confidence Score: ${confidenceThreshold + 4}%. Ready for actuation.`,
        ...prev,
      ]);
      setIsSimulating(false);
      onLog('CMD', 'GEMINI_AUTONOMOUS_OUTPUT: Clearance confirmed. Path clear.');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Gemini Multimodal Vision & Navigation Reasoning
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Configure autonomous vision prompts, perception confidence thresholds, and spatial reasoning models.
          </p>
        </div>

        <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-neutral-900 text-cyan-400 border border-cyan-800/60">
          FRONTEND SIMULATION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Mission Prompt & Configuration */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-semibold uppercase text-neutral-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Autonomous Mission Directive
              </span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1 font-mono"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Robotics Fast)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Spatial Reasoning)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                System Prompt / Spatial Guidance Goal
              </label>
              <textarea
                rows={3}
                value={missionPrompt}
                onChange={(e) => setMissionPrompt(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-100 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Detection Confidence Threshold</span>
                  <span className="font-mono text-cyan-300 font-semibold">{confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Target Object Classes</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Obstacle', 'Target Goal', 'Marker Cone', 'Wayline'].map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 text-[10px] bg-neutral-950 text-neutral-300 border border-neutral-800 rounded font-mono"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleRunInference}
                disabled={isSimulating}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow transition-all active:scale-98 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Running Spatial Reasoning...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Execute Reasoning Step (Simulated)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reasoning Telemetry Trace */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-neutral-200 mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Perception & Spatial Decision Stream
            </h4>
            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 font-mono text-[11px] space-y-1.5 text-neutral-300 min-h-[140px] max-h-[220px] overflow-y-auto">
              {inferenceLog.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-neutral-500 shrink-0">›</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Perception Diagnostics */}
        <div className="space-y-4">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5 border-b border-neutral-800 pb-2">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Perception Pipeline Status
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-neutral-950 rounded-lg border border-neutral-800">
                <span className="text-neutral-400">Frame Stream:</span>
                <span className="font-mono text-neutral-300">Awaiting Feed</span>
              </div>
              <div className="flex justify-between p-2 bg-neutral-950 rounded-lg border border-neutral-800">
                <span className="text-neutral-400">Estimated Latency:</span>
                <span className="font-mono text-cyan-400">~180ms</span>
              </div>
              <div className="flex justify-between p-2 bg-neutral-950 rounded-lg border border-neutral-800">
                <span className="text-neutral-400">Safety Guardrail:</span>
                <span className="font-mono text-emerald-400">ENABLED</span>
              </div>
            </div>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
              When live camera frames are piped into the system, Gemini Multimodal models will classify terrain hazards, identify goal markers, and publish velocity vectors to the autopilot controller.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
