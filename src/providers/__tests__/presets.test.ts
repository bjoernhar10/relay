import { providerPresets } from '../presets';
import { normalizeBaseUrl, validateProviderDraft } from '../provider-draft';

describe('providerPresets', () => {
  it('have unique ids', () => {
    const ids = providerPresets.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(providerPresets)('$name has a valid, normalized https base URL', (preset) => {
    expect(preset.baseUrl.startsWith('https://')).toBe(true);
    expect(normalizeBaseUrl(preset.baseUrl)).toBe(preset.baseUrl);
    expect(validateProviderDraft({ ...preset, apiKey: '' })).toEqual({});
  });
});
