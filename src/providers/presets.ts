import type { ProviderPreset } from './types';

// Base URLs checked against each provider's documentation on 2026-11-17 (see docs/SPEC.md 2.4).
// Each URL already contains the version segment; adapters append /chat/completions, /messages or /models.
export const providerPresets: readonly ProviderPreset[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    protocol: 'openai-compatible',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    protocol: 'anthropic',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    protocol: 'openai-compatible',
  },
  {
    id: 'moonshot',
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.ai/v1',
    protocol: 'openai-compatible',
  },
  {
    id: 'zai',
    name: 'GLM (Z.ai)',
    baseUrl: 'https://api.z.ai/api/paas/v4',
    protocol: 'openai-compatible',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    protocol: 'openai-compatible',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    protocol: 'openai-compatible',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    protocol: 'openai-compatible',
  },
  {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    protocol: 'openai-compatible',
  },
  { id: 'xai', name: 'xAI', baseUrl: 'https://api.x.ai/v1', protocol: 'openai-compatible' },
];

export function findPreset(presetId: string | undefined): ProviderPreset | undefined {
  return providerPresets.find((preset) => preset.id === presetId);
}
