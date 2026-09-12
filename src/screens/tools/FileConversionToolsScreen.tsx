import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  RotateCcw,
  ArrowRightLeft,
  Download,
  Eye,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FileConversionToolsScreen: React.FC = () => {
  const { showToast } = useApp();
  const [mode, setMode] = useState<'json-csv' | 'base64' | 'url' | 'markdown'>('json-csv');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleJsonToCsv = () => {
    try {
      const parsed = JSON.parse(inputText);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0) {
        setOutputText('');
        return;
      }
      const headers = Object.keys(arr[0]);
      const csvRows = [headers.join(',')];
      for (const row of arr) {
        const values = headers.map((header) => {
          const val = row[header];
          const escaped = ('' + (val !== undefined ? val : '')).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
      setOutputText(csvRows.join('\n'));
      showToast('Converted JSON to CSV');
    } catch (e: any) {
      showToast('Invalid JSON input: ' + e.message);
    }
  };

  const handleCsvToJson = () => {
    try {
      const lines = inputText.trim().split('\n');
      if (lines.length < 2) {
        showToast('CSV must have header row and at least one data row');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const result = [];
      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const obj: Record<string, any> = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentLine[j] || '';
        }
        result.push(obj);
      }
      setOutputText(JSON.stringify(result, null, 2));
      showToast('Converted CSV to JSON');
    } catch (e: any) {
      showToast('Failed to parse CSV');
    }
  };

  const handleBase64Encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(inputText)));
      setOutputText(encoded);
      showToast('Encoded to Base64');
    } catch (e: any) {
      showToast('Encode error');
    }
  };

  const handleBase64Decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(inputText.trim())));
      setOutputText(decoded);
      showToast('Decoded from Base64');
    } catch (e: any) {
      showToast('Invalid Base64 string');
    }
  };

  const handleUrlEncode = () => {
    setOutputText(encodeURIComponent(inputText));
    showToast('URL Encoded');
  };

  const handleUrlDecode = () => {
    try {
      setOutputText(decodeURIComponent(inputText));
      showToast('URL Decoded');
    } catch (e: any) {
      showToast('Invalid URL encoded string');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    showToast('Copied to clipboard');
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div id="file-conversion-tools-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <FileCode className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">File & Format Transformer</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Zero-leakage client-side JSON/CSV converter, Base64 encoder, and URL string serializer.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'json-csv', label: 'JSON ↔ CSV' },
              { id: 'base64', label: 'Base64' },
              { id: 'url', label: 'URL Encode' },
              { id: 'markdown', label: 'Markdown View' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id as any);
                  setInputText('');
                  setOutputText('');
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  mode === m.id
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Converter Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center gap-2">
            {mode === 'json-csv' && (
              <>
                <button
                  type="button"
                  onClick={handleJsonToCsv}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
                >
                  Convert JSON → CSV
                </button>
                <button
                  type="button"
                  onClick={handleCsvToJson}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                >
                  Convert CSV → JSON
                </button>
              </>
            )}

            {mode === 'base64' && (
              <>
                <button
                  type="button"
                  onClick={handleBase64Encode}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
                >
                  Encode to Base64
                </button>
                <button
                  type="button"
                  onClick={handleBase64Decode}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                >
                  Decode from Base64
                </button>
              </>
            )}

            {mode === 'url' && (
              <>
                <button
                  type="button"
                  onClick={handleUrlEncode}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
                >
                  Encode URI Component
                </button>
                <button
                  type="button"
                  onClick={handleUrlDecode}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                >
                  Decode URI Component
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!outputText}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white text-xs font-medium"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Output</span>
            </button>
          </div>
        </div>

        {/* Input & Output Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-400">
              <span className="font-semibold">Input</span>
              <span>{inputText.length} chars</span>
            </div>
            <textarea
              rows={14}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw input here..."
              className="w-full p-3.5 bg-neutral-900/60 border border-neutral-800 rounded-2xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-400">
              <span className="font-semibold">Output</span>
              <span>{outputText.length} chars</span>
            </div>
            <textarea
              rows={14}
              readOnly
              value={outputText}
              placeholder="Output will appear here..."
              className="w-full p-3.5 bg-neutral-950 border border-neutral-850 rounded-2xl text-xs font-mono text-violet-300 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
