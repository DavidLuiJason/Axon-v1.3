import React, { useState, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  Upload,
  Scissors,
  Volume2,
  VolumeX,
  Maximize2,
  Camera,
  RotateCcw,
  Sparkles,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VideoEditorScreen: React.FC = () => {
  const { showToast } = useApp();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsPlaying(false);
      setCurrentTime(0);
      showToast(`Loaded "${file.name}"`);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    setDuration(dur);
    setTrimEnd(dur);
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `frame_${Math.round(currentTime * 1000)}.jpg`;
      a.click();
      showToast('Frame snapshot captured');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div id="video-editor-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Video className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Video & Waveform Editor</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              High-performance client-side video trimming, scrubbing, speed ramping, and frame extraction.
            </p>
          </div>

          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-sm transition-colors">
            <Upload className="w-4 h-4" />
            <span>Load Video</span>
            <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Video Canvas / Player Area */}
        <div className="relative rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden flex flex-col items-center justify-center min-h-[320px]">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="max-h-[420px] w-full object-contain"
              muted={isMuted}
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <Video className="w-7 h-7" />
              </div>
              <p className="text-xs text-neutral-400">
                No video loaded. Click "Load Video" above or choose a sample to begin trimming.
              </p>
            </div>
          )}
        </div>

        {/* Transport Controls Bar */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          {/* Time Scrubber */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-neutral-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (videoRef.current) videoRef.current.currentTime = val;
              }}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                disabled={!videoSrc}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleCaptureFrame}
                disabled={!videoSrc}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs disabled:opacity-40"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Frame</span>
              </button>
            </div>

            {/* Playback speed selector */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
              {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                    playbackRate === rate ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trim Markers Card */}
        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
              <Scissors className="w-4 h-4 text-indigo-400" />
              <span>In/Out Range Markers</span>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              Duration: {formatTime(Math.max(0, trimEnd - trimStart))}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setTrimStart(currentTime);
                showToast(`Marked In at ${formatTime(currentTime)}`);
              }}
              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left hover:border-neutral-700"
            >
              <div className="text-[11px] text-neutral-400">Trim Start (Mark In)</div>
              <div className="font-mono text-sm text-indigo-400 font-semibold mt-0.5">{formatTime(trimStart)}</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setTrimEnd(currentTime);
                showToast(`Marked Out at ${formatTime(currentTime)}`);
              }}
              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left hover:border-neutral-700"
            >
              <div className="text-[11px] text-neutral-400">Trim End (Mark Out)</div>
              <div className="font-mono text-sm text-indigo-400 font-semibold mt-0.5">{formatTime(trimEnd)}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
