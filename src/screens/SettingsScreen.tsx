import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Bell,
  Volume2,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Sparkles,
  Smartphone,
  Check,
  Bot,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { IconPreset, AppNameTextCase } from '../types';
import { AIAccountsSettings } from '../components/AIAccountsSettings';
import { InstallAppSection } from '../components/InstallAppSection';

export const SettingsScreen: React.FC = () => {
  const {
    theme,
    setThemeMode,
    setAccentColor,
    icons,
    setAppIconPreset,
    setAvatarPreset,
    setAppNameTextCase,
    notificationsEnabled,
    setNotificationsEnabled,
    soundEnabled,
    setSoundEnabled,
    exportStateJson,
    importStateJson,
    resetAllData,
    requestConfirmation,
    showToast,
  } = useApp();

  const [activeSettingsTab, setActiveSettingsTab] = useState<'ai' | 'appearance' | 'system' | 'data'>('ai');

  const handleExportBackup = () => {
    const jsonStr = exportStateJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axon-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported backup snapshot');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importStateJson(content);
        if (success) {
          showToast('Backup restored successfully');
        } else {
          showToast('Failed to parse backup file');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    requestConfirmation({
      title: 'Reset All Data',
      message: 'This will erase all local settings, messages, notes, and custom API keys. Are you sure?',
      danger: true,
      confirmLabel: 'Reset Everything',
      onConfirm: () => {
        resetAllData();
        showToast('Application reset to factory defaults');
      },
    });
  };

  return (
    <div id="settings-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-800">
          <div className="p-2 rounded-xl bg-neutral-800 text-neutral-300 border border-neutral-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">System Settings</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Personalize model orchestration, visual aesthetic, and storage preservation.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto text-xs">
          {[
            { id: 'ai', label: 'AI Accounts & Models', icon: Bot },
            { id: 'appearance', label: 'Theme & Branding', icon: Palette },
            { id: 'system', label: 'Notifications & App', icon: Bell },
            { id: 'data', label: 'Backup & Storage', icon: HardDrive },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSettingsTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeSettingsTab === tab.id
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content 1: AI Accounts */}
        {activeSettingsTab === 'ai' && (
          <div className="space-y-6">
            <AIAccountsSettings />
          </div>
        )}

        {/* Tab Content 2: Appearance */}
        {activeSettingsTab === 'appearance' && (
          <div className="space-y-6">
            {/* Color Mode */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-semibold text-white">Theme & Palette</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    theme.mode === 'dark'
                      ? 'bg-neutral-800 border-cyan-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">Obsidian Dark</div>
                  <div className="text-[11px] text-neutral-500 mt-1">Eye-safe OLED dark canvas</div>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    theme.mode === 'light'
                      ? 'bg-neutral-800 border-cyan-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">Pure Light</div>
                  <div className="text-[11px] text-neutral-500 mt-1">High-contrast bright canvas</div>
                </button>
              </div>

              {/* Accent Color Picker */}
              <div className="space-y-2 pt-2">
                <label className="text-xs text-neutral-400">Accent Highlight Color</label>
                <div className="flex items-center gap-2">
                  {['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccentColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        theme.accentColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* App Name Display Case */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-semibold text-white">Header Typography Case</h2>
              <div className="grid grid-cols-3 gap-3">
                {(['uppercase', 'titlecase', 'lowercase'] as AppNameTextCase[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAppNameTextCase(c)}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      icons.appNameTextCase === c
                        ? 'bg-neutral-800 border-cyan-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="text-sm font-bold tracking-wider">
                      {c === 'uppercase' ? 'AXON' : c === 'titlecase' ? 'Axon' : 'axon'}
                    </div>
                    <div className="text-[10px] text-neutral-500 capitalize mt-0.5">{c}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Presets */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-semibold text-white">Avatar & Logo Icon Presets</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['axon-orb', 'axon-minimal', 'axon-neural', 'axon-cyber'] as IconPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAppIconPreset(preset);
                      setAvatarPreset(preset);
                    }}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      icons.avatarPreset === preset
                        ? 'bg-neutral-800 border-cyan-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="text-xs font-semibold capitalize text-white">{preset.replace('axon-', '')}</div>
                    <div className="text-[10px] text-neutral-500 mt-1">Preset Vector</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: System & PWA */}
        {activeSettingsTab === 'system' && (
          <div className="space-y-6">
            {/* Notification & Sound toggles */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-semibold text-white">Alerts & Sensory Feedback</h2>
              <div className="flex items-center justify-between py-2 border-b border-neutral-800/80">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-neutral-400" />
                  <div>
                    <div className="text-xs font-medium text-white">Push & In-App Notifications</div>
                    <div className="text-[11px] text-neutral-500">Alerts on automation trigger completion</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="rounded bg-neutral-800 border-neutral-700 text-cyan-500 focus:ring-0"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-neutral-400" />
                  <div>
                    <div className="text-xs font-medium text-white">Acoustic Feedback</div>
                    <div className="text-[11px] text-neutral-500">Audio chimes for tool executions</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded bg-neutral-800 border-neutral-700 text-cyan-500 focus:ring-0"
                />
              </div>
            </div>

            {/* Install PWA Section */}
            <InstallAppSection />
          </div>
        )}

        {/* Tab Content 4: Data & Backup */}
        {activeSettingsTab === 'data' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <h2 className="text-sm font-semibold text-white">Workspace State Backup</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Export all local settings, custom prompts, scripts, and conversation history into a standalone JSON file.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Backup JSON</span>
                </button>

                <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Restore from Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Factory Reset */}
            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <RotateCcw className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Permanently purge all local memory, accounts, notes, and resets the application back to initialization state.
              </p>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
              >
                Reset All Local Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
