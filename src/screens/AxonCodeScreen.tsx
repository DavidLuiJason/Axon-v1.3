import React, { useState } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  Save,
  Trash2,
  Terminal,
  RotateCcw,
  Sparkles,
  Layers,
  FileCode,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CodeSkillLevel, SavedScript } from '../types';

const SAMPLE_SCRIPTS = [
  {
    title: 'Text Frequencies & Token Counter',
    language: 'javascript',
    code: `// Count word frequencies and estimated tokens
const text = "AXON Offline Intelligence Neural Architecture";
const words = text.toLowerCase().match(/\\b\\w+\\b/g) || [];
const freq = {};
words.forEach(w => freq[w] = (freq[w] || 0) + 1);

console.log("Total words:", words.length);
console.log("Frequencies:", freq);
return { wordsCount: words.length, estimatedTokens: Math.ceil(words.length * 1.33) };`,
  },
  {
    title: 'Storage Budget Ratio Calculator',
    language: 'javascript',
    code: `// Compute memory breakdown percentages
const budgetGb = 15;
const allocatedGb = 1.2;
const percent = ((allocatedGb / budgetGb) * 100).toFixed(1);

console.log(\`Used \${allocatedGb} GB of \${budgetGb} GB (\${percent}%)\`);
return { percentUsed: parseFloat(percent), remainingGb: budgetGb - allocatedGb };`,
  },
];

export const AxonCodeScreen: React.FC = () => {
  const {
    codeSkillLevel,
    setCodeSkillLevel,
    savedScripts,
    saveScript,
    deleteScript,
    requestConfirmation,
    showToast,
  } = useApp();

  const [code, setCode] = useState(SAMPLE_SCRIPTS[0].code);
  const [language, setLanguage] = useState('javascript');
  const [outputLogs, setOutputLogs] = useState<string[]>([]);
  const [returnValue, setReturnValue] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [scriptTitle, setScriptTitle] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleRunCode = () => {
    setIsExecuting(true);
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '));
      },
      error: (...args: any[]) => {
        logs.push('[ERROR] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
      warn: (...args: any[]) => {
        logs.push('[WARN] ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      },
    };

    try {
      const runner = new Function('console', code);
      const res = runner(customConsole);
      setOutputLogs(logs);
      setReturnValue(res !== undefined ? JSON.stringify(res, null, 2) : null);
      showToast('Code executed cleanly');
    } catch (err: any) {
      setOutputLogs([...logs, `[RUNTIME ERROR] ${err?.message || String(err)}`]);
      setReturnValue(null);
      showToast('Runtime execution error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveCurrentScript = () => {
    const title = scriptTitle.trim() || `Script_${new Date().toISOString().slice(0, 10)}`;
    saveScript({
      title,
      code,
      language,
      skillLevel: codeSkillLevel,
    });
    setScriptTitle('');
    showToast(`Saved "${title}" to workspace`);
  };

  const handleDeleteSaved = (script: SavedScript) => {
    requestConfirmation({
      title: 'Delete Script',
      message: `Delete "${script.title}" from saved workspace scripts?`,
      danger: true,
      confirmLabel: 'Delete',
      onConfirm: () => {
        deleteScript(script.id);
        showToast('Script deleted');
      },
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    showToast('Code copied to clipboard');
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div id="axon-code-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">AXON Code Workspace</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Multi-tiered code sandbox, algorithm experimentation, and user script libraries.
            </p>
          </div>

          {/* Skill Level & Execution Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-xs">
              <Sliders className="w-3.5 h-3.5 text-neutral-500 ml-2 mr-1" />
              {(['beginner', 'guided', 'standard', 'expert'] as CodeSkillLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCodeSkillLevel(level)}
                  className={`px-2.5 py-1 rounded-lg capitalize text-xs font-medium transition-colors ${
                    codeSkillLevel === level
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2.5 py-1 bg-neutral-950 border border-neutral-700 rounded-lg text-xs text-white"
            >
              <option value="javascript">JavaScript (ES2024)</option>
              <option value="python">Python (WASM Engine)</option>
              <option value="shorthand">AXON Shorthand</option>
            </select>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {SAMPLE_SCRIPTS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCode(s.code)}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs whitespace-nowrap"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-800 transition-colors"
              title="Copy Code"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleRunCode}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Code</span>
            </button>
          </div>
        </div>

        {/* Editor & Console Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Code Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold">Code Editor</span>
              <span>{code.split('\n').length} lines</span>
            </div>
            <textarea
              rows={16}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3.5 bg-neutral-900/70 border border-neutral-800 rounded-2xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
              spellCheck={false}
            />

            {/* Save script row */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={scriptTitle}
                onChange={(e) => setScriptTitle(e.target.value)}
                placeholder="Script name to save..."
                className="flex-1 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleSaveCurrentScript}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Execution Output</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOutputLogs([]);
                  setReturnValue(null);
                }}
                className="text-neutral-500 hover:text-neutral-300 text-[11px]"
              >
                Clear
              </button>
            </div>

            <div className="p-3.5 bg-neutral-950 border border-neutral-850 rounded-2xl min-h-[360px] font-mono text-xs text-neutral-300 space-y-2 overflow-y-auto">
              {outputLogs.length === 0 && !returnValue && (
                <div className="text-neutral-600 italic">No output yet. Click "Run Code" to execute.</div>
              )}

              {outputLogs.map((log, index) => (
                <div key={index} className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {log}
                </div>
              ))}

              {returnValue && (
                <div className="pt-2 border-t border-neutral-850">
                  <div className="text-[11px] text-emerald-400 font-semibold mb-1">Return Value:</div>
                  <pre className="text-emerald-300 overflow-x-auto">{returnValue}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saved Scripts Section */}
        {savedScripts.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <h2 className="text-sm font-semibold text-white">Saved Workspace Scripts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedScripts.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/80 flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{s.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {s.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">Level: {s.skillLevel}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                    <button
                      type="button"
                      onClick={() => setCode(s.code)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Load into editor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSaved(s)}
                      className="p-1 text-neutral-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
