import React, { useState } from 'react';
import {
  User,
  Key,
  HardDrive,
  FolderOpen,
  Sparkles,
  Shield,
  Activity,
  Cpu,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatBytes } from '../lib/storageManifest';
import { ProjectSwitcherModal } from '../components/ProjectSwitcherModal';

export const AccountScreen: React.FC = () => {
  const {
    activeModel,
    aiAccounts,
    activeAccount,
    projects,
    activeProjectId,
    storageBreakdown,
    storageBudget,
    messages,
    notes,
    savedScripts,
    automationRules,
    navigateTo,
  } = useApp();

  const [isProjectSwitcherOpen, setIsProjectSwitcherOpen] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const percentUsed = Math.min(
    100,
    Math.round((storageBreakdown.totalStoredBytes / storageBudget.budgetBytes) * 100)
  );

  return (
    <div id="account-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Profile Card Header */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">AXON Workspace Operator</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">Local Sandbox Instance • Offline-Capable Architecture</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateTo('settings')}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
            >
              Configure Settings
            </button>
          </div>
        </div>

        {/* 4 Stats Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <div className="text-[11px] text-neutral-500 font-medium">Chat Turns</div>
            <div className="text-xl font-bold text-white mt-1">{messages.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <div className="text-[11px] text-neutral-500 font-medium">Knowledge Notes</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{notes.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <div className="text-[11px] text-neutral-500 font-medium">Saved Scripts</div>
            <div className="text-xl font-bold text-blue-400 mt-1">{savedScripts.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
            <div className="text-[11px] text-neutral-500 font-medium">Automation Rules</div>
            <div className="text-xl font-bold text-yellow-400 mt-1">{automationRules.length}</div>
          </div>
        </div>

        {/* Current Project Card */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>Active Project Context</span>
            </div>
            <button
              type="button"
              onClick={() => setIsProjectSwitcherOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Switch Project
            </button>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-white">{activeProject?.name || 'Default Project'}</div>
              <div className="text-xs text-neutral-400 mt-0.5">
                {activeProject?.description || 'General purpose workspace environment'}
              </div>
            </div>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeProject?.color || '#06b6d4' }} />
          </div>
        </div>

        {/* Active AI Model & Key Management */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Active Model & Provider</span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('settings')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Manage API Keys
            </button>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-sm text-white">{activeModel.name}</div>
              <div className="text-xs text-neutral-400 capitalize mt-0.5">
                Provider: {activeModel.provider} • {activeModel.contextWindow || '1M Tokens'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-300">
                {aiAccounts.filter((a) => a.isActive).length} Keys Configured
              </span>
            </div>
          </div>
        </div>

        {/* Storage Summary Card */}
        <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Local Storage Footprint</span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('storage')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>View Manifest</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Allocated Space</span>
              <span className="font-mono text-white">
                {formatBytes(storageBreakdown.totalStoredBytes)} / {formatBytes(storageBudget.budgetBytes)} ({percentUsed}%)
              </span>
            </div>
            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <ProjectSwitcherModal
        isOpen={isProjectSwitcherOpen}
        onClose={() => setIsProjectSwitcherOpen(false)}
      />
    </div>
  );
};
