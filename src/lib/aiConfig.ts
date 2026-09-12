import { AIAccount, AIModelOption } from '../types';

export const AXON_OFFLINE_MODEL: AIModelOption = {
  id: 'axon-offline-core',
  name: 'AXON Local Core',
  provider: 'axon',
  providerName: 'AXON Engine',
  badge: 'Offline Safe',
  description: 'On-device local assistant capable of offline queries, calculations, and local scripts.',
};

export const AVAILABLE_AI_MODELS: AIModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'gemini',
    providerName: 'Google',
    badge: 'Recommended',
    description: 'Ultra-fast multimodal model with state-of-the-art conversational and reasoning speed.',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    providerName: 'Google',
    badge: 'Fast & Smart',
    description: 'High performance multimodal model optimized for real-time chat and workspace tasks.',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    providerName: 'Google',
    badge: 'Reasoning',
    description: 'Complex reasoning, advanced coding synthesis, and architectural design.',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    providerName: 'Anthropic',
    badge: 'Coding & Analysis',
    description: 'Superior coding and nuance analysis with strict instruction following.',
  },
  {
    id: 'gpt-4o',
    name: 'ChatGPT GPT-4o',
    provider: 'chatgpt',
    providerName: 'OpenAI',
    badge: 'Flagship Omni',
    description: 'High-speed flagship multimodal model for text, reasoning, and complex tasks.',
  },
];

export const DEFAULT_AI_ACCOUNTS: AIAccount[] = [
  {
    id: 'account-axon-default',
    provider: 'gemini',
    label: 'Primary Gemini Account',
    apiKey: '',
    isActive: true,
    isRateLimited: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'account-claude-default',
    provider: 'claude',
    label: 'Primary Claude Account',
    apiKey: '',
    isActive: false,
    isRateLimited: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'account-chatgpt-default',
    provider: 'chatgpt',
    label: 'Primary ChatGPT Account',
    apiKey: '',
    isActive: false,
    isRateLimited: false,
    createdAt: new Date().toISOString(),
  },
];

export function isAccountInCooldown(account?: AIAccount): boolean {
  if (!account || !account.cooldownUntil) return false;
  // AXON's own local core is ONE unified intelligence and is strictly exempt from usage limits and cooldowns
  if (account.provider === 'axon') return false;
  return Date.now() < account.cooldownUntil;
}

export function getRemainingCooldownString(accountOrCooldownUntil?: AIAccount | number): string {
  if (!accountOrCooldownUntil) return '';
  if (typeof accountOrCooldownUntil === 'object' && accountOrCooldownUntil.provider === 'axon') {
    return '';
  }
  const cooldownUntil =
    typeof accountOrCooldownUntil === 'number'
      ? accountOrCooldownUntil
      : accountOrCooldownUntil.cooldownUntil;
  if (!cooldownUntil) return '';

  const remainingMs = cooldownUntil - Date.now();
  if (remainingMs <= 0) return '';
  const remainingMin = Math.ceil(remainingMs / (1000 * 60));
  if (remainingMin >= 60) {
    const hours = Math.floor(remainingMin / 60);
    const mins = remainingMin % 60;
    return `${hours}h ${mins}m`;
  }
  return `${remainingMin}m`;
}

export function findAccountByLabel(
  accounts: AIAccount[],
  label: string,
  preferredProvider?: string
): AIAccount | undefined {
  const norm = label.trim().toLowerCase();
  if (preferredProvider) {
    const matched = accounts.find(
      (a) =>
        a.provider === preferredProvider &&
        (a.label.toLowerCase() === norm || a.id.toLowerCase() === norm)
    );
    if (matched) return matched;
  }
  return accounts.find(
    (a) => a.label.toLowerCase() === norm || a.id.toLowerCase() === norm
  );
}
