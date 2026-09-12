import React, { useState } from 'react';
import {
  Bell,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  HardDrive,
  FileText,
  Filter,
  Trash2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProjectActivityType } from '../types';

export const NotificationsScreen: React.FC = () => {
  const { projectActivities, showToast } = useApp();
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredActivities = projectActivities.filter((act) => {
    if (selectedType === 'all') return true;
    return act.type === selectedType;
  });

  const getEventIcon = (type: ProjectActivityType) => {
    switch (type) {
      case 'rule_triggered':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'storage_trimmed':
        return <HardDrive className="w-4 h-4 text-cyan-400" />;
      case 'note_created':
      case 'note_updated':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div id="notifications-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Activity Feed & Logs</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Audit trails, rule executions, storage optimizations, and neural timeline history.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Activities' },
            { id: 'rule_triggered', label: 'Rules Triggered' },
            { id: 'storage_trimmed', label: 'Storage Events' },
            { id: 'chat_turn', label: 'Chat Turns' },
            { id: 'note_created', label: 'Notes' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedType(cat.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-medium transition-all ${
                selectedType === cat.id
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white bg-neutral-900/40 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              id={`activity-item-${act.id}`}
              className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-3.5"
            >
              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 shrink-0 mt-0.5">
                {getEventIcon(act.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-white truncate">{act.title}</span>
                  <span className="text-[10px] text-neutral-500 shrink-0 font-mono">
                    {act.timeString || new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">{act.summary}</p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-neutral-500">
                  <span className="capitalize">{act.type.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{act.dateString || new Date(act.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No recent notifications or activities recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
