/**
 * AXON Shared Types & Interfaces
 */

// Screen identifiers supported across navigation & panels
export type ScreenId =
  | 'axon'
  | 'tools'
  | 'code'
  | 'automation'
  | 'video_editor'
  | 'notes'
  | 'settings'
  | 'account'
  | 'notifications'
  | 'tool_text'
  | 'tool_calc'
  | 'tool_units'
  | 'tool_colors'
  | 'tool_images'
  | 'tool_files'
  | 'tool_speech_rate'
  | 'tool_bible'
  | 'storage';

export type PaneViewState = 'chat-only' | 'workspace-only' | 'split';

export interface NavHistoryEntry {
  id: string;
  screen: ScreenId;
  isMenuOpen: boolean;
  paneViewState: PaneViewState;
  splitRatio: number;
  activePanel: string | null;
  panelPayload?: any;
  scrollPositions: Record<string, number>;
  screenState?: Record<string, any>;
}

export interface ChatAttachment {
  id?: string;
  name: string;
  size?: number | string;
  type: string;
  url?: string;
  dataUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'axon' | 'user';
  text: string;
  timestamp: string;
  projectId?: string;
  modelUsed?: string;
  accountUsed?: string;
  isRateLimitedNotice?: boolean;
  workspaceArtifactId?: string;
  workspaceArtifactTitle?: string;
  attachment?: ChatAttachment;
}

export type NoteCategory = 'general' | 'extract' | 'code' | 'prompt' | 'spec' | 'bible' | 'extracted_chat';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  projectId: string;
  category: NoteCategory;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  systemContext: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProjectActivityType =
  | 'project_created'
  | 'note_created'
  | 'note_updated'
  | 'code_executed'
  | 'tool_used'
  | 'chat_turn'
  | 'file_uploaded'
  | 'rule_triggered'
  | 'storage_trimmed'
  | 'plan_created';

export interface ProjectActivityEvent {
  id: string;
  projectId: string;
  timestamp: string;
  dateString: string;
  timeString: string;
  type: ProjectActivityType;
  title: string;
  summary: string;
  metadata?: Record<string, any>;
}

export interface ProjectTimelineQuery {
  projectId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  types?: ProjectActivityType[];
  searchTerm?: string;
  limit?: number;
}

export type IconPreset = 'axon-orb' | 'axon-minimal' | 'axon-neural' | 'axon-cyber';

export type AppNameTextCase = 'uppercase' | 'lowercase' | 'titlecase';

export function formatAppNameCase(textCase: AppNameTextCase = 'uppercase'): string {
  if (textCase === 'lowercase') return 'axon';
  if (textCase === 'titlecase') return 'Axon';
  return 'AXON';
}

export interface IconAvatarSettings {
  appIconType: 'preset' | 'custom';
  appIconPreset: IconPreset;
  appIconCustomUrl?: string;
  avatarType: 'preset' | 'custom';
  avatarPreset: IconPreset;
  avatarCustomUrl?: string;
  lastCustomAvatarUrl?: string;
  syncAppIconAndAvatar: boolean;
  showChatAvatar: boolean;
  appNameTextCase: AppNameTextCase;
}

export interface FunctionColors {
  aiChatBubbleBg: string;
  aiChatBubbleText: string;
  userChatBubbleBg: string;
  userChatBubbleText: string;
  userBubbleColor: string;
  axonBubbleColor: string;
  sendButtonColor: string;
  chatInputBg: string;
  userMsgBtnColor: string;
  axonMsgBtnColor: string;
  messageButtonAutoContrast: boolean;
  micRecordingColor: string;
  toolText: string;
  toolCalc: string;
  toolColors: string;
  toolImages: string;
  toolFiles: string;
  toolBible: string;
  toolSpeech: string;
  videoEditor: string;
  codeWorkspace: string;
  notesLibrary: string;
  storageManifest: string;
}

export interface ThemeSettings {
  mode: 'dark' | 'light';
  accentColor: string;
  palette: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    activeHighlight: string;
    avatarGlow: string;
  };
  functionColors: FunctionColors;
}

export type AIProvider = 'axon' | 'gemini' | 'claude' | 'chatgpt' | 'openai' | 'anthropic' | 'google';

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  providerName?: string;
  badge?: string;
  description?: string;
  contextWindow?: string;
  recommendedFor?: string;
  isOfflineOnly?: boolean;
}

export interface AIAccount {
  id: string;
  name?: string;
  label: string;
  provider: AIProvider;
  apiKey: string;
  isActive: boolean;
  isRateLimited?: boolean;
  cooldownUntil?: number;
  rateLimitReason?: string;
  createdAt: string;
}

export type CodeSkillLevel = 'beginner' | 'guided' | 'standard' | 'expert';

export interface SavedScript {
  id: string;
  title: string;
  code: string;
  language: string;
  skillLevel: CodeSkillLevel;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type RuleTriggerType =
  | 'connection_error'
  | 'rate_limit'
  | 'code_execution_error'
  | 'model_error'
  | 'keyword_match'
  | 'message_sent';

export type RuleActionType =
  | 'retry_automatically'
  | 'notify_user'
  | 'auto_format_code'
  | 'append_instruction'
  | 'save_to_notes'
  | 'switch_account'
  | 'execute_run_code';

export interface AutomationRule {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  triggerType: RuleTriggerType;
  triggerLabel: string;
  triggerCondition: string;
  actionType: RuleActionType;
  actionLabel: string;
  actionConfig: {
    maxRetries?: number;
    customMessage?: string;
    instructionPayload?: string;
    [key: string]: any;
  };
  plainLanguagePrompt?: string;
  creationMode?: 'plain_language' | 'structured';
  createdAt: string;
  updatedAt: string;
  triggerCount: number;
  lastTriggered?: string;
  lastExecutionLog?: string;
}

export interface RunCodeEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  hookPoint: 'pre_prompt' | 'post_response' | 'standalone';
  code: string;
  language: 'javascript' | 'python' | 'shorthand';
  enabled: boolean;
  author: string;
  version: string;
  commandKeyword?: string;
  executionCount: number;
  lastExecuted?: string;
  lastOutput?: string;
  createdAt: string;
  updatedAt: string;
}

// Storage & Asset Manifest Types
export type AssetCategory =
  | 'model'
  | 'knowledge_pack'
  | 'user_file'
  | 'chat_history'
  | 'cache'
  | 'system';

export type SaveMode = 'archive' | 'space_saver';
export type QualityState = 'original' | 'lossless' | 'quantized' | 'downsampled';
export type KnowledgeStatus = 'current' | 'stale' | 'updating' | 'not_applicable';

export interface AssetManifestItem {
  id: string;
  name: string;
  category: AssetCategory;
  storageLocation: string;
  mimeType: string;
  originalSizeBytes: number;
  storedSizeBytes: number;
  allocatedSizeBytes?: number;
  saveMode: SaveMode;
  isOriginalPreserved: boolean;
  qualityState: QualityState;
  knowledgeStatus: KnowledgeStatus;
  isCore?: boolean;
  isEnabled?: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export type TrimCategoryPriority = AssetCategory;

export interface StorageBudgetConfig {
  budgetBytes: number;
  customLimitBytes?: number;
  warningThresholdPercent: number;
  hasCompletedOnboarding?: boolean;
  trimPriority: TrimCategoryPriority[];
}

export interface GeneralSettings {
  deleteConfirmationWaitTimerSeconds: number;
  deleteConfirmationTimerEnabled: boolean;
  userReadingSpeedWpm: number;
  aiCallMode: 'single' | 'parallel';
}

export interface ConfirmationConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}

export interface AppStateData {
  settings?: {
    theme?: ThemeSettings;
    icons?: IconAvatarSettings;
    notificationsEnabled?: boolean;
    soundEnabled?: boolean;
    aiAccounts?: AIAccount[];
    activeModelId?: string;
    codeSkillLevel?: CodeSkillLevel;
    activeProjectId?: string;
    storageBudget?: StorageBudgetConfig;
    generalSettings?: GeneralSettings;
  };
  projects?: ProjectItem[];
  projectActivities?: ProjectActivityEvent[];
  messages?: ChatMessage[];
  notes?: NoteItem[];
  assetManifest?: AssetManifestItem[];
  userContent?: {
    customFiles?: any[];
    savedScripts?: SavedScript[];
    automationRules?: AutomationRule[];
    runCodeEntries?: RunCodeEntry[];
  };
}

// File Intelligence types (src/lib/fileIntelligence.ts)
export type FileIntelligenceType =
  | 'document'
  | 'text'
  | 'image'
  | 'code'
  | 'video'
  | 'pdf'
  | 'audio'
  | 'archive'
  | 'data';

export interface FileIndexEntry {
  id: string;
  name: string;
  fileType: FileIntelligenceType;
  category?: AssetCategory;
  mimeType: string;
  sizeBytes: number;
  projectId?: string;
  metadata?: Record<string, any>;
  extractedSummary?: string;
  summary?: string;
  keywords?: string[];
  tags?: string[];
  extractedKeywords?: string[];
  semanticTopics?: string[];
  contentPreview?: string;
  dataUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  lastIndexed?: string;
}

export interface FileSearchQuery {
  naturalLanguageQuery?: string;
  term?: string;
  fileTypes?: FileIntelligenceType[];
  types?: FileIntelligenceType[];
  projectId?: string;
  categories?: AssetCategory[];
  minSize?: number;
  maxSize?: number;
  minScore?: number;
  limit?: number;
}

export interface FileSearchResult {
  entry: FileIndexEntry;
  matchScore: number;
  score?: number;
  matchedReasons: string[];
  excerpt?: string;
  matchedSnippet?: string;
}
