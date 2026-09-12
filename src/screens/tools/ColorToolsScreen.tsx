import React, { useState } from 'react';
import {
  Palette,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  normalizeHex,
  getContrastRatio,
  getContrastQuality,
  getAutoContrastColor,
} from '../../lib/colorContrast';

export const ColorToolsScreen: React.FC = () => {
  const { showToast } = useApp();
  const [hexColor, setHexColor] = useState('#06b6d4');
  const [bgHex, setBgHex] = useState('#0a0a0a');
  const [isCopied, setIsCopied] = useState(false);

  const cleanHex = normalizeHex(hexColor, '#06b6d4');
  const cleanBg = normalizeHex(bgHex, '#0a0a0a');

  // Convert HEX to RGB
  const r = parseInt(cleanHex.slice(1, 3), 16) || 0;
  const g = parseInt(cleanHex.slice(3, 5), 16) || 0;
  const b = parseInt(cleanHex.slice(5, 7), 16) || 0;

  // Convert RGB to HSL
  const computeHsl = () => {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hsl = computeHsl();
  const contrastRatio = getContrastRatio(cleanHex, cleanBg);
  const quality = getContrastQuality(contrastRatio);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast(`Copied ${text}`);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div id="color-tools-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                <Palette className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Color Intelligence & WCAG</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Precision color space translation, contrast ratio audits, and accessible harmonies.
            </p>
          </div>
        </div>

        {/* Color Inspector Card */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Color Swatch Preview */}
            <div
              className="w-full sm:w-36 h-32 rounded-2xl border border-white/10 shadow-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: cleanHex }}
            >
              <span
                className="font-mono text-xs font-bold px-2 py-1 rounded bg-black/40 backdrop-blur-sm"
                style={{ color: getAutoContrastColor(cleanHex) }}
              >
                {cleanHex.toUpperCase()}
              </span>
            </div>

            {/* Input Picker & Hex String */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={cleanHex}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="w-12 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  placeholder="#06b6d4"
                  className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              {/* Color Code Pills */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(cleanHex.toUpperCase())}
                  className="p-2 rounded-xl bg-neutral-950 border border-neutral-850 text-left hover:border-neutral-700"
                >
                  <div className="text-[10px] text-neutral-500">HEX</div>
                  <div className="font-mono text-xs text-neutral-200 mt-0.5">{cleanHex.toUpperCase()}</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(`rgb(${r}, ${g}, ${b})`)}
                  className="p-2 rounded-xl bg-neutral-950 border border-neutral-850 text-left hover:border-neutral-700"
                >
                  <div className="text-[10px] text-neutral-500">RGB</div>
                  <div className="font-mono text-xs text-neutral-200 mt-0.5">{r}, {g}, {b}</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                  className="p-2 rounded-xl bg-neutral-950 border border-neutral-850 text-left hover:border-neutral-700"
                >
                  <div className="text-[10px] text-neutral-500">HSL</div>
                  <div className="font-mono text-xs text-neutral-200 mt-0.5">{hsl.h}°, {hsl.s}%, {hsl.l}%</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WCAG Contrast Ratio Checker */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">WCAG 2.1 Contrast Ratio Audit</h2>
            <span className="text-xs font-mono font-bold text-fuchsia-400">
              Ratio: {contrastRatio.toFixed(2)}:1
            </span>
          </div>

          {/* Foreground & Background Preview Tile */}
          <div
            className="p-6 rounded-2xl border flex flex-col justify-center items-center text-center space-y-2 transition-colors"
            style={{ backgroundColor: cleanBg, borderColor: cleanHex + '40' }}
          >
            <p className="text-lg font-bold" style={{ color: cleanHex }}>
              Accessible Typography Sample
            </p>
            <p className="text-xs max-w-md leading-relaxed" style={{ color: cleanHex, opacity: 0.9 }}>
              AXON guarantees readable UI by measuring luminance steps between active tokens.
            </p>
          </div>

          {/* Test against custom background */}
          <div className="flex items-center gap-3 pt-2">
            <label className="text-xs text-neutral-400">Against Background:</label>
            <input
              type="color"
              value={cleanBg}
              onChange={(e) => setBgHex(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={bgHex}
              onChange={(e) => setBgHex(e.target.value)}
              className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-xs text-neutral-300 w-28"
            />
          </div>

          {/* Compliance Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
              <div className="text-[10px] text-neutral-500">WCAG AA Normal</div>
              <div className={`text-xs font-semibold mt-1 ${contrastRatio >= 4.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {contrastRatio >= 4.5 ? 'PASS (≥4.5:1)' : 'FAIL'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
              <div className="text-[10px] text-neutral-500">WCAG AA Large Text</div>
              <div className={`text-xs font-semibold mt-1 ${contrastRatio >= 3.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {contrastRatio >= 3.0 ? 'PASS (≥3:1)' : 'FAIL'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
              <div className="text-[10px] text-neutral-500">WCAG AAA Normal</div>
              <div className={`text-xs font-semibold mt-1 ${contrastRatio >= 7.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {contrastRatio >= 7.0 ? 'PASS (≥7:1)' : 'FAIL (<7:1)'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
              <div className="text-[10px] text-neutral-500">WCAG AAA Large</div>
              <div className={`text-xs font-semibold mt-1 ${contrastRatio >= 4.5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {contrastRatio >= 4.5 ? 'PASS (≥4.5:1)' : 'FAIL'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
