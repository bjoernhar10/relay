import type { ProviderPreset, ProviderProtocol } from './types';

export type ProviderDraft = {
  name: string;
  baseUrl: string;
  protocol: ProviderProtocol;
  apiKey: string;
};

export type ProviderDraftErrors = Partial<Record<'name' | 'baseUrl', 'required' | 'invalidUrl'>>;

export function draftFromPreset(preset: ProviderPreset | undefined): ProviderDraft {
  return {
    name: preset?.name ?? '',
    baseUrl: preset?.baseUrl ?? '',
    protocol: preset?.protocol ?? 'openai-compatible',
    apiKey: '',
  };
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}

export function validateProviderDraft(draft: ProviderDraft): ProviderDraftErrors {
  const errors: ProviderDraftErrors = {};
  if (!draft.name.trim()) errors.name = 'required';

  const baseUrl = normalizeBaseUrl(draft.baseUrl);
  if (!baseUrl) errors.baseUrl = 'required';
  else if (!isHttpUrl(baseUrl)) errors.baseUrl = 'invalidUrl';

  return errors;
}

export function hostOf(baseUrl: string): string {
  try {
    return new URL(baseUrl).host;
  } catch {
    return baseUrl;
  }
}
