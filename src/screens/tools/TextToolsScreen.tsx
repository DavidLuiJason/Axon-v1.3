import React, { useState } from 'react';
import {
  Type,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlignLeft,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TextToolsScreen: React.FC = () => {
  const { showToast } = useApp();
  const [text, setText] = useState('');
  const [regexQuery, setRegexQuery] = useState('');
  const [regexFlags, setRegexFlags] = useState('g');
  const [isCopied, setIsCopied] = useState(false);

  // Statistics
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s+/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const readingTimeMin = (words / 200).toFixed(1);
  const speakingTimeMin = (words / 130).toFixed(1);

  // Transformations
  const applyTransform = (type: string) => {
    let result = text;
    switch (type) {
      case 'upper':
        result = text.toUpperCase();
        break;
      case 'lower':
        result = text.toLowerCase();
        break;
      case 'title':
        result = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase());
        break;
      case 'sentence':
        result = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case 'camel':
        result = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
        break;
      case 'snake':
        result = text
          .trim()
          .toLowerCase()
          .replace(/[\s\W-]+/g, '_');
        break;
      case 'kebab':
        result = text
          .trim()
          .toLowerCase()
          .replace(/[\s\W-]+/g, '-');
        break;
      case 'clean-spaces':
        result = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
        break;
    }
    setText(result);
    showToast(`Applied ${type} transform`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast('Copied to clipboard');
    setTimeout(() => setIsCopied(false), 1500);
  };

  // Regex matches
  let regexMatches: string[] = [];
  let regexError: string | null = null;
  if (regexQuery && text) {
    try {
      const re = new RegExp(regexQuery, regexFlags);
      regexMatches = text.match(re) || [];
    } catch (e: any) {
      regexError = e.message;
    }
  }

  return (
    <div id="text-tools-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Type className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Text Intelligence & Transformer</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Deterministic string analysis, case conversion, typography normalization, and regex matcher.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>Copy</span>
            </button>
            <button
              type="button"
              onClick={() => setText('')}
              className="p-2 rounded-xl bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Clear"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Stats Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <div className="text-[11px] text-neutral-500">Words</div>
            <div className="text-xl font-bold text-sky-400 mt-0.5">{words}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <div className="text-[11px] text-neutral-500">Characters</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {charCount} <span className="text-xs text-neutral-500 font-normal">({charNoSpaces} no spaces)</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <div className="text-[11px] text-neutral-500">Est. Reading Time</div>
            <div className="text-xl font-bold text-white mt-0.5">{readingTimeMin} min</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <div className="text-[11px] text-neutral-500">Est. Speech Time</div>
            <div className="text-xl font-bold text-white mt-0.5">{speakingTimeMin} min</div>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type text here to transform or inspect..."
            className="w-full p-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500 leading-relaxed resize-y"
          />
        </div>

        {/* Case & Whitespace Transformers */}
        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <h2 className="text-xs font-semibold text-neutral-300">Format & Case Actions</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => applyTransform('upper')}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              UPPERCASE
            </button>
            <button
              type="button"
              onClick={() => applyTransform('lower')}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              lowercase
            </button>
            <button
              type="button"
              onClick={() => applyTransform('title')}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              Title Case
            </button>
            <button
              type="button"
              onClick={() => applyTransform('sentence')}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              Sentence case
            </button>
            <button
              type="button"
              onClick={() => applyTransform('camel')}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono"
            >
              camelCase
            </button>
            <button
              type="button"
              onClick={() => applyTransform('snake')}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono"
            >
              snake_case
            </button>
            <button
              type="button"
              onClick={() => applyTransform('kebab')}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono"
            >
              kebab-case
            </button>
            <button
              type="button"
              onClick={() => applyTransform('clean-spaces')}
              className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20"
            >
              Trim Extra Whitespace
            </button>
          </div>
        </div>

        {/* Regular Expression Tester */}
        <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-neutral-300">Regular Expression Tester</h2>
            {regexMatches.length > 0 && (
              <span className="text-xs text-emerald-400">{regexMatches.length} matches found</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs">/</span>
              <input
                type="text"
                value={regexQuery}
                onChange={(e) => setRegexQuery(e.target.value)}
                placeholder="e.g. \\b\\w+ing\\b"
                className="w-full pl-6 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1.5 border border-neutral-800 rounded-xl">
              <span className="text-neutral-500 text-xs font-mono">/</span>
              <input
                type="text"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                placeholder="flags"
                className="w-10 bg-transparent text-xs font-mono text-sky-400 focus:outline-none"
              />
            </div>
          </div>

          {regexError && (
            <div className="text-xs text-rose-400 font-mono">Syntax error: {regexError}</div>
          )}

          {regexMatches.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-neutral-950 border border-neutral-850">
              {regexMatches.slice(0, 50).map((m, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-xs font-mono border border-sky-500/30"
                >
                  {m}
                </span>
              ))}
              {regexMatches.length > 50 && (
                <span className="text-xs text-neutral-500 self-center">
                  +{regexMatches.length - 50} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
