import React, { useState } from 'react';
import { HardDrive, Plus, RefreshCw, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AssetCategory } from '../types';
import { StorageBudgetBar } from '../components/storage/StorageBudgetBar';
import { StorageCategoryBreakdown } from '../components/storage/StorageCategoryBreakdown';
import { AssetManifestTable } from '../components/storage/AssetManifestTable';
import { DownloadablePacksSection } from '../components/storage/DownloadablePacksSection';
import { BudgetSettingModal } from '../components/storage/BudgetSettingModal';
import { TrimOptimizerModal } from '../components/storage/TrimOptimizerModal';
import { RegisterAssetModal } from '../components/storage/RegisterAssetModal';

export const StorageDiagnosticsScreen: React.FC = () => {
  const { storageBudget, storageBreakdown, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isTrimModalOpen, setIsTrimModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const usedBytes = storageBreakdown.totalStoredBytes;
  const budgetBytes = storageBudget.budgetBytes;
  const percentUsed = Math.min(100, Math.round((usedBytes / budgetBytes) * 100));
  const isNearLimit = percentUsed >= (storageBudget.warningThresholdPercent || 85);

  return (
    <div id="storage-diagnostics-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Title Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <HardDrive className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Storage & Asset Manifest</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Deterministic budget allocation, intelligent asset retention, and lossless space reclamation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="register-asset-btn"
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Register Asset</span>
            </button>
          </div>
        </div>

        {/* Warning banner if approaching budget */}
        {isNearLimit && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-amber-300">Storage Warning: Budget threshold reached</p>
              <p className="text-neutral-400 leading-relaxed">
                Allocated assets are utilizing {percentUsed}% of your {storageBudget.budgetBytes / (1024 * 1024 * 1024)} GB device budget.
                Execute the Trim Optimizer to prune temporary caches and compress compressible assets.
              </p>
            </div>
          </div>
        )}

        {/* Budget Bar Progress Card */}
        <StorageBudgetBar
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          onOpenTrimModal={() => setIsTrimModalOpen(true)}
        />

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-neutral-300">Category Allocation</h2>
          <StorageCategoryBreakdown
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Downloadable Packs Section */}
        <div className="space-y-3">
          <DownloadablePacksSection />
        </div>

        {/* Asset Manifest Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-300">Managed Manifest Items</h2>
            <span className="text-xs text-neutral-500">
              {storageBreakdown.totalSavingsBytes > 0 ? (
                <span className="text-emerald-400">
                  Total saved: {(storageBreakdown.totalSavingsBytes / (1024 * 1024)).toFixed(1)} MB
                </span>
              ) : (
                'All items intact'
              )}
            </span>
          </div>

          <AssetManifestTable
            categoryFilter={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <BudgetSettingModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      <TrimOptimizerModal
        isOpen={isTrimModalOpen}
        onClose={() => setIsTrimModalOpen(false)}
      />

      <RegisterAssetModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
};
