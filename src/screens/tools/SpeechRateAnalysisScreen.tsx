import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Volume2,
  Gauge,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PRACTICE_PASSAGES = [
  {
    title: 'Executive Briefing',
    text: 'Welcome everyone. Today we are examining our architectural evolution towards complete client-side determinism and reliable local storage management. By isolating data into self-contained operational manifests, we achieve unprecedented speed and privacy.',
  },
  {
    title: 'Technical Presentation',
    text: 'The neural kernel coordinates background tasks using discrete priority queues. This guarantees smooth sixty-frames-per-second animation states across all mobile and low-specification environments without dropping frame integrity.',
  },
];

export const SpeechRateAnalysisScreen: React.FC = () => {
  const { showToast } = useApp();
  const [selectedPassage, setSelectedPassage] = useState(PRACTICE_PASSAGES[0].text);
  const [isPracticing, setIsPracticing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  const wordCount = selectedPassage.trim() ? selectedPassage.trim().split(/\s+/).length : 0;
  const currentWpm = elapsedSeconds > 2 ? Math.round((wordCount / elapsedSeconds) * 60) : 0;

  useEffect(() => {
    if (isPracticing) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPracticing]);

  const handleStart = () => {
    setElapsedSeconds(0);
    setIsPracticing(true);
    showToast('Timer started. Read the passage aloud at your natural pace.');
  };

  const handleStop = () => {
    setIsPracticing(false);
    showToast(`Completed! Your pacing was ${currentWpm} WPM.`);
  };

  const handleReset = () => {
    setIsPracticing(false);
    setElapsedSeconds(0);
  };

  const getPacingFeedback = (wpm: number) => {
    if (wpm === 0) return { label: 'Ready to analyze', color: 'text-neutral-400', desc: 'Press Start and read.' };
    if (wpm < 110) return { label: 'Slow & Deliberate', color: 'text-sky-400', desc: 'Clear for teaching or technical details.' };
    if (wpm <= 155) return { label: 'Optimal Conversational', color: 'text-emerald-400', desc: 'Perfect for presentations and pitches.' };
    return { label: 'Fast / Rapid', color: 'text-amber-400', desc: 'May be challenging for listeners to retain.' };
  };

  const feedback = getPacingFeedback(currentWpm);

  return (
    <div id="speech-rate-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Mic className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Speech Rate & Acoustic Pacing</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Words-per-minute (WPM) teleprompter gauge, cadence pacing analysis, and vocal training.
            </p>
          </div>
        </div>

        {/* WPM Gauge Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs text-neutral-400 font-medium">Cadence Velocity</span>
            <div className="text-4xl font-bold font-mono text-rose-400">{currentWpm}</div>
            <span className="text-xs text-neutral-500">Words Per Minute</span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs text-neutral-400 font-medium">Elapsed Time</span>
            <div className="text-4xl font-bold font-mono text-white">
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </div>
            <span className="text-xs text-neutral-500">{wordCount} total words</span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 flex flex-col justify-center space-y-2">
            <div className="text-xs text-neutral-400 font-medium">Pacing Quality</div>
            <div className={`text-base font-bold ${feedback.color}`}>{feedback.label}</div>
            <p className="text-xs text-neutral-400 leading-relaxed">{feedback.desc}</p>
          </div>
        </div>

        {/* Passage Selector & Prompter */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-neutral-300">Practice Prompter Passage</div>
            <div className="flex items-center gap-1.5 text-xs">
              {PRACTICE_PASSAGES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPassage(p.text);
                    handleReset();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Prompter Box */}
          <textarea
            rows={5}
            value={selectedPassage}
            onChange={(e) => {
              setSelectedPassage(e.target.value);
              handleReset();
            }}
            placeholder="Type or paste speech script here..."
            className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm leading-relaxed text-neutral-200 focus:outline-none focus:border-rose-500 resize-none"
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {!isPracticing ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Reading</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold shadow-sm transition-colors"
                >
                  <Square className="w-4 h-4" />
                  <span>Finish & Calculate</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <span className="text-xs text-neutral-500">
              Optimal range: 130–155 WPM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
