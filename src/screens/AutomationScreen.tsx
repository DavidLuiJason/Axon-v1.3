import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Terminal,
  Activity,
  ToggleLeft,
  ToggleRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AutomationRule, RunCodeEntry } from '../types';
import { RuleEditorModal } from '../components/automation/RuleEditorModal';
import { AutomationSimulatorView } from '../components/automation/AutomationSimulatorView';

export const AutomationScreen: React.FC = () => {
  const {
    automationRules,
    saveRule,
    deleteRule,
    toggleRule,
    testRule,
    runCodeEntries,
    saveRunCodeEntry,
    deleteRunCodeEntry,
    toggleRunCodeEntry,
    testRunCodeEntry,
    requestConfirmation,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rules' | 'runcode' | 'simulator'>('rules');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const handleOpenNewRule = () => {
    setEditingRule(null);
    setIsEditorOpen(true);
  };

  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
    setIsEditorOpen(true);
  };

  const handleDeleteRule = (rule: AutomationRule) => {
    requestConfirmation({
      title: 'Delete Automation Rule',
      message: `Are you sure you want to permanently delete "${rule.title}"?`,
      danger: true,
      confirmLabel: 'Delete Rule',
      onConfirm: () => {
        deleteRule(rule.id);
        showToast('Rule deleted');
      },
    });
  };

  const handleTestRule = (rule: AutomationRule) => {
    const res = testRule(rule.id);
    showToast(res.log);
  };

  return (
    <div id="automation-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Automation & Extensions</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Event-driven trigger rules, fallback auto-recoveries, and live behavioral code hooks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="new-rule-button"
              type="button"
              onClick={handleOpenNewRule}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-neutral-950 text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Rule</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'rules'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Conditional Rules ({automationRules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('runcode')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'runcode'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>Run Code Hooks ({runCodeEntries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Live Simulator</span>
          </button>
        </div>

        {/* Tab 1: Rules List */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <div
                key={rule.id}
                id={`rule-item-${rule.id}`}
                className={`p-4 rounded-2xl border transition-all ${
                  rule.enabled
                    ? 'bg-neutral-900/50 border-neutral-800'
                    : 'bg-neutral-950/40 border-neutral-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{rule.title}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {rule.triggerLabel || rule.triggerType}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        {rule.actionLabel || rule.actionType}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {rule.description || rule.plainLanguagePrompt}
                    </p>
                    {rule.triggerCount > 0 && (
                      <p className="text-[11px] text-neutral-500">
                        Triggered {rule.triggerCount} times {rule.lastTriggered && `• Last: ${new Date(rule.lastTriggered).toLocaleTimeString()}`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      title={rule.enabled ? 'Disable' : 'Enable'}
                      onClick={() => toggleRule(rule.id, !rule.enabled)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    >
                      {rule.enabled ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-neutral-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Test Rule"
                      onClick={() => handleTestRule(rule)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-yellow-400 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => handleEditRule(rule)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => handleDeleteRule(rule)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {automationRules.length === 0 && (
              <div className="text-center py-12 text-neutral-500 text-xs">
                No automation rules configured yet. Click "New Rule" to set up your first trigger rule.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Run Code Entries */}
        {activeTab === 'runcode' && (
          <div className="space-y-4">
            {runCodeEntries.map((entry) => (
              <div
                key={entry.id}
                id={`runcode-item-${entry.id}`}
                className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{entry.title}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-mono">
                        {entry.language}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700">
                        {entry.hookPoint}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{entry.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await testRunCodeEntry(entry.id);
                        showToast(`Ran ${entry.title}: ${res.output.slice(0, 50)}`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 text-blue-400" />
                      <span>Execute</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleRunCodeEntry(entry.id, !entry.enabled)}
                      className="p-1.5 text-neutral-400 hover:text-white"
                    >
                      {entry.enabled ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-neutral-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850 font-mono text-xs text-neutral-300 overflow-x-auto max-h-36">
                  <pre>{entry.code}</pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Simulator */}
        {activeTab === 'simulator' && <AutomationSimulatorView />}
      </div>

      {/* Editor Modal */}
      <RuleEditorModal
        isOpen={isEditorOpen}
        initialRule={editingRule}
        onClose={() => setIsEditorOpen(false)}
        onSave={(ruleData) => {
          saveRule(ruleData);
          setIsEditorOpen(false);
          showToast(editingRule ? 'Rule updated' : 'Rule created');
        }}
      />
    </div>
  );
};
