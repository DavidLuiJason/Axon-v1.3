import {
  AssetCategory,
  AssetManifestItem,
  SaveMode,
  StorageBudgetConfig,
  TrimCategoryPriority,
} from '../types';

export interface StorageBreakdown {
  totalStoredBytes: number;
  totalOriginalBytes: number;
  totalAllocatedBytes: number;
  totalSavingsBytes: number;
  categoryTotals: Record<AssetCategory, number>;
  itemCounts: Record<AssetCategory, number>;
}

export const DEFAULT_STORAGE_BUDGET_CONFIG: StorageBudgetConfig = {
  budgetBytes: 15 * 1024 * 1024 * 1024, // 15 GB
  warningThresholdPercent: 85,
  hasCompletedOnboarding: false,
  trimPriority: ['cache', 'chat_history', 'user_file', 'knowledge_pack', 'model', 'system'],
};

export const AVAILABLE_DOWNLOADABLE_PACKS = [
  {
    id: 'pack-bible-kjv',
    name: 'King James Version & Concordance',
    sizeBytes: 42 * 1024 * 1024, // 42 MB
    category: 'knowledge_pack' as AssetCategory,
    description: 'Complete Old and New Testaments with Strong numbers, Greek and Hebrew dictionary lemmas.',
  },
  {
    id: 'pack-bible-web',
    name: 'World English Bible (WEB)',
    sizeBytes: 38 * 1024 * 1024, // 38 MB
    category: 'knowledge_pack' as AssetCategory,
    description: 'Modern public domain English translation with full cross-references and verse index.',
  },
  {
    id: 'pack-web-dev-docs',
    name: 'Web Dev Offline Reference (MDN Core)',
    sizeBytes: 128 * 1024 * 1024, // 128 MB
    category: 'knowledge_pack' as AssetCategory,
    description: 'TypeScript, React, HTML5, CSS3, and modern Web APIs documentation index for instant offline lookups.',
  },
  {
    id: 'pack-python-stdlib',
    name: 'Python 3.12 Standard Library Docs',
    sizeBytes: 64 * 1024 * 1024, // 64 MB
    category: 'knowledge_pack' as AssetCategory,
    description: 'Official Python standard library documentation, signatures, and code examples.',
  },
  {
    id: 'pack-speech-phonemes',
    name: 'Phoneme Speech Rate Acoustic Models',
    sizeBytes: 85 * 1024 * 1024, // 85 MB
    category: 'knowledge_pack' as AssetCategory,
    description: 'Acoustic feature extractor and speech-rate syllable estimation tables for audio analysis.',
  },
];

export const DEFAULT_ASSET_MANIFEST: AssetManifestItem[] = [
  {
    id: 'core-axon-offline-engine',
    name: 'AXON Offline Intelligence Core',
    category: 'system',
    storageLocation: '/sys/engine/axon-core.wasm',
    mimeType: 'application/wasm',
    originalSizeBytes: 480 * 1024 * 1024,
    storedSizeBytes: 480 * 1024 * 1024,
    allocatedSizeBytes: 512 * 1024 * 1024,
    saveMode: 'archive',
    isOriginalPreserved: true,
    qualityState: 'original',
    knowledgeStatus: 'current',
    isCore: true,
    isEnabled: true,
    description: 'Core on-device rule engine, tokenizer, timeline, and arithmetic evaluator.',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'model-axon-light-embeddings',
    name: 'AXON Mobile Embeddings (MiniLM-L6)',
    category: 'model',
    storageLocation: '/models/embeddings/minilm-l6-quant.bin',
    mimeType: 'application/octet-stream',
    originalSizeBytes: 120 * 1024 * 1024,
    storedSizeBytes: 82 * 1024 * 1024,
    allocatedSizeBytes: 128 * 1024 * 1024,
    saveMode: 'space_saver',
    isOriginalPreserved: false,
    qualityState: 'quantized',
    knowledgeStatus: 'current',
    isCore: true,
    isEnabled: true,
    description: '8-bit quantized text embeddings for vector retrieval and notes similarity.',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'bible-core-kjv',
    name: 'Offline Scripture Library (KJV)',
    category: 'knowledge_pack',
    storageLocation: '/data/bible/kjv.db',
    mimeType: 'application/x-sqlite3',
    originalSizeBytes: 42 * 1024 * 1024,
    storedSizeBytes: 42 * 1024 * 1024,
    allocatedSizeBytes: 64 * 1024 * 1024,
    saveMode: 'archive',
    isOriginalPreserved: true,
    qualityState: 'lossless',
    knowledgeStatus: 'current',
    isCore: false,
    isEnabled: true,
    description: 'Full text index of Scripture books, chapters, verses, and concordance keywords.',
    createdAt: '2026-09-03T14:15:00.000Z',
    updatedAt: '2026-09-03T14:15:00.000Z',
  },
  {
    id: 'sys-video-wasm-transcoder',
    name: 'Video Transcoder & Waveform Engine',
    category: 'system',
    storageLocation: '/sys/video/ffmpeg-core.wasm',
    mimeType: 'application/wasm',
    originalSizeBytes: 32 * 1024 * 1024,
    storedSizeBytes: 32 * 1024 * 1024,
    allocatedSizeBytes: 40 * 1024 * 1024,
    saveMode: 'archive',
    isOriginalPreserved: true,
    qualityState: 'lossless',
    knowledgeStatus: 'current',
    isCore: false,
    isEnabled: true,
    description: 'Client-side audio/video processing and timeline scrubber.',
    createdAt: '2026-09-04T12:00:00.000Z',
    updatedAt: '2026-09-04T12:00:00.000Z',
  },
];

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${val} ${sizes[i]}`;
}

export function calculateStorageBreakdown(manifest: AssetManifestItem[]): StorageBreakdown {
  const categoryTotals: Record<AssetCategory, number> = {
    model: 0,
    knowledge_pack: 0,
    user_file: 0,
    chat_history: 0,
    cache: 0,
    system: 0,
  };

  const itemCounts: Record<AssetCategory, number> = {
    model: 0,
    knowledge_pack: 0,
    user_file: 0,
    chat_history: 0,
    cache: 0,
    system: 0,
  };

  let totalStoredBytes = 0;
  let totalOriginalBytes = 0;
  let totalAllocatedBytes = 0;

  for (const item of manifest) {
    const stored = item.storedSizeBytes || 0;
    const orig = item.originalSizeBytes || stored;
    const allocated = item.allocatedSizeBytes || stored;

    totalStoredBytes += stored;
    totalOriginalBytes += orig;
    totalAllocatedBytes += allocated;

    if (categoryTotals[item.category] !== undefined) {
      categoryTotals[item.category] += stored;
      itemCounts[item.category] += 1;
    }
  }

  const totalSavingsBytes = Math.max(0, totalOriginalBytes - totalStoredBytes);

  return {
    totalStoredBytes,
    totalOriginalBytes,
    totalAllocatedBytes,
    totalSavingsBytes,
    categoryTotals,
    itemCounts,
  };
}

export function changeAssetSaveMode(item: AssetManifestItem, mode: SaveMode): AssetManifestItem {
  const originalSize = item.originalSizeBytes || item.storedSizeBytes;
  const storedSize =
    mode === 'archive'
      ? originalSize
      : Math.round(originalSize * 0.35); // Quantized space-saver size

  return {
    ...item,
    saveMode: mode,
    isOriginalPreserved: mode === 'archive',
    storedSizeBytes: storedSize,
    qualityState: mode === 'archive' ? 'lossless' : 'quantized',
    updatedAt: new Date().toISOString(),
  };
}

export function performEnhanceOrRevert(item: AssetManifestItem): {
  updatedItem: AssetManifestItem;
  resultType: 'enhanced' | 'reverted' | 'noop';
  message: string;
} {
  const now = new Date().toISOString();
  if (item.saveMode === 'space_saver') {
    // Revert/enhance to archive lossless
    const updated: AssetManifestItem = {
      ...item,
      saveMode: 'archive',
      isOriginalPreserved: true,
      storedSizeBytes: item.originalSizeBytes,
      qualityState: 'lossless',
      updatedAt: now,
    };
    return {
      updatedItem: updated,
      resultType: 'enhanced',
      message: `Restored "${item.name}" to full lossless archive state (${formatBytes(item.originalSizeBytes)}).`,
    };
  } else {
    // Compress to space-saver
    const newStored = Math.round(item.originalSizeBytes * 0.35);
    const updated: AssetManifestItem = {
      ...item,
      saveMode: 'space_saver',
      isOriginalPreserved: false,
      storedSizeBytes: newStored,
      qualityState: 'quantized',
      updatedAt: now,
    };
    return {
      updatedItem: updated,
      resultType: 'reverted',
      message: `Downsampled "${item.name}" with space-saver quantization (${formatBytes(newStored)}).`,
    };
  }
}

export function simulateTrimPlan(
  manifest: AssetManifestItem[],
  targetBytesToFree: number,
  priorities: TrimCategoryPriority[]
): {
  itemsToPrune: Array<{ item: AssetManifestItem; simulatedFreedBytes: number }>;
  totalSimulatedSavingsBytes: number;
} {
  const itemsToPrune: Array<{ item: AssetManifestItem; simulatedFreedBytes: number }> = [];
  let freedSoFar = 0;

  for (const cat of priorities) {
    if (freedSoFar >= targetBytesToFree) break;

    const candidates = manifest.filter((i) => i.category === cat && !i.isCore);
    for (const candidate of candidates) {
      itemsToPrune.push({
        item: candidate,
        simulatedFreedBytes: candidate.storedSizeBytes,
      });
      freedSoFar += candidate.storedSizeBytes;

      if (freedSoFar >= targetBytesToFree) break;
    }
  }

  return {
    itemsToPrune,
    totalSimulatedSavingsBytes: freedSoFar,
  };
}
