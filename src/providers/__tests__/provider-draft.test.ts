import { findPreset } from '../presets';
import {
  draftFromPreset,
  hostOf,
  normalizeBaseUrl,
  validateProviderDraft,
} from '../provider-draft';

const validDraft = {
  name: 'Lokal',
  baseUrl: 'http://192.168.1.20:11434/v1',
  protocol: 'openai-compatible' as const,
  apiKey: '',
};

describe('validateProviderDraft', () => {
  it('accepts http and https URLs without an API key', () => {
    expect(validateProviderDraft(validDraft)).toEqual({});
    expect(
      validateProviderDraft({ ...validDraft, baseUrl: 'https://api.example.com/v1/' }),
    ).toEqual({});
  });

  it('requires a name and a base URL', () => {
    expect(validateProviderDraft({ ...validDraft, name: '  ', baseUrl: ' ' })).toEqual({
      name: 'required',
      baseUrl: 'required',
    });
  });

  it('rejects URLs that are not http or https', () => {
    for (const baseUrl of ['api.example.com', 'ftp://example.com', 'https://']) {
      expect(validateProviderDraft({ ...validDraft, baseUrl }).baseUrl).toBe('invalidUrl');
    }
  });
});

describe('provider draft helpers', () => {
  it('strips whitespace and trailing slashes from base URLs', () => {
    expect(normalizeBaseUrl('  https://api.example.com/v1// ')).toBe('https://api.example.com/v1');
  });

  it('prefills a draft from a preset and starts empty without one', () => {
    expect(draftFromPreset(findPreset('anthropic'))).toEqual({
      name: 'Anthropic',
      baseUrl: 'https://api.anthropic.com/v1',
      protocol: 'anthropic',
      apiKey: '',
    });
    expect(draftFromPreset(undefined)).toMatchObject({ name: '', baseUrl: '' });
  });

  it('shows the host of a base URL', () => {
    expect(hostOf('https://api.z.ai/api/paas/v4')).toBe('api.z.ai');
    expect(hostOf('not a url')).toBe('not a url');
  });
});
