import React, { useState } from 'react';
import {
  Wrench,
  Calculator,
  Type,
  Palette,
  Image as ImageIcon,
  FileCode,
  Mic,
  BookOpen,
  HardDrive,
  Code2,
  Zap,
  FileText,
  Video,
  Search,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScreenId } from '../types';

interface ToolDefinition {
  id: string;
  screenId: ScreenId;
  title: string;
  description: string;
  category: 'productivity' | 'utilities' | 'media' | 'code' | 'reference';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
}

const TOOLS_LIST: ToolDefinition[] = [
  {
    id: 'tool_text',
    screenId: 'tool_text',
    title: 'Text Intelligence',
    description: 'Word & char counter, case transformers, typography cleaner, and regex matcher.',
    category: 'utilities',
    icon: Type,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 'tool_calc',
    screenId: 'tool_calc',
    title: 'Calculators & Units',
    description: 'Scientific calculator, formula evaluator, and comprehensive metric/imperial unit converter.',
    category: 'utilities',
    icon: Calculator,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'tool_colors',
    screenId: 'tool_colors',
    title: 'Color Mixer & WCAG',
    description: 'HEX/RGB/HSL conversion, palette generator, and WCAG AA/AAA contrast accessibility checker.',
    category: 'utilities',
    icon: Palette,
    color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
  },
  {
    id: 'tool_images',
    screenId: 'tool_images',
    title: 'Image Tools',
    description: 'Aspect ratio calculators, dimension scaling, quality optimizer, and format converter.',
    category: 'media',
    icon: ImageIcon,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'tool_files',
    screenId: 'tool_files',
    title: 'File & Data Converter',
    description: 'JSON/CSV format transformer, Base64 encoder/decoder, and Markdown live renderer.',
    category: 'utilities',
    icon: FileCode,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    id: 'tool_speech_rate',
    screenId: 'tool_speech_rate',
    title: 'Speech Rate & Pacing',
    description: 'Words-per-minute (WPM) acoustic pacing guide, syllable meter, and live practice prompter.',
    category: 'productivity',
    icon: Mic,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  {
    id: 'tool_bible',
    screenId: 'tool_bible',
    title: 'Offline Scripture Library',
    description: 'Fully indexed offline Bible (KJV & WEB) with verse search and note extraction.',
    category: 'reference',
    icon: BookOpen,
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    badge: 'Offline',
  },
  {
    id: 'storage',
    screenId: 'storage',
    title: 'Storage & Manifest',
    description: 'Deterministic 15GB device budget, smart cache trimming, and asset preservation.',
    category: 'utilities',
    icon: HardDrive,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'code',
    screenId: 'code',
    title: 'AXON Code Workspace',
    description: 'Interactive JavaScript/Python workspace with beginner to expert execution levels.',
    category: 'code',
    icon: Code2,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    id: 'automation',
    screenId: 'automation',
    title: 'Automation & Run Code',
    description: 'Trigger-based execution rules, fallback failovers, and live behavior extension layer.',
    category: 'productivity',
    icon: Zap,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },
  {
    id: 'notes',
    screenId: 'notes',
    title: 'Knowledge & Notes',
    description: 'Context documents, prompt snippets, conversation extracts, and tags organization.',
    category: 'productivity',
    icon: FileText,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'video_editor',
    screenId: 'video_editor',
    title: 'Video Editor & Waveform',
    description: 'Timeline playback, frame accurate trimmer, and client-side audio/video processing.',
    category: 'media',
    icon: Video,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
];

export const ToolsMenuScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTools = TOOLS_LIST.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="tools-menu-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Wrench className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Tools & Utilities Hub</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Zero-latency offline utilities, media processing, and computational companions.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              id="tools-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Tools' },
            { id: 'utilities', label: 'Utilities' },
            { id: 'productivity', label: 'Productivity' },
            { id: 'media', label: 'Media & Visual' },
            { id: 'code', label: 'Developer' },
            { id: 'reference', label: 'Reference' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-white bg-neutral-900/50 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                id={`tool-card-${tool.id}`}
                type="button"
                onClick={() => navigateTo(tool.screenId)}
                className="group p-4 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 text-left transition-all duration-150 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2.5 rounded-xl border ${tool.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {tool.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500 group-hover:text-neutral-300">
                  <span className="capitalize text-[11px]">{tool.category}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12 text-neutral-500 text-xs">
            No tools found matching "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
