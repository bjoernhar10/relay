import type { Model, ModelProvider } from '../model';
import { buildModelSections } from '../model-sections';

const providers: ModelProvider[] = [
  { id: 'alpha', name: 'Alpha AI' },
  { id: 'beta', name: 'Beta Labs' },
  { id: 'empty', name: 'Empty' },
];

const models: Model[] = [
  { id: 'alpha/fast', label: 'alpha-fast', providerId: 'alpha' },
  { id: 'alpha/large', label: 'alpha-large', providerId: 'alpha' },
  { id: 'beta/chat', label: 'beta-chat', providerId: 'beta' },
];

const catalog = { providers, models, favoriteModelIds: ['beta/chat', 'missing/model'] };

function summarize(sections: ReturnType<typeof buildModelSections>) {
  return sections.map((section) => [section.key, section.data.map((model) => model.id)]);
}

describe('buildModelSections', () => {
  it('puts favorites first and groups the rest by provider', () => {
    expect(summarize(buildModelSections(catalog, ''))).toEqual([
      ['favorites', ['beta/chat']],
      ['alpha', ['alpha/fast', 'alpha/large']],
      ['beta', ['beta/chat']],
    ]);
  });

  it('filters by model and provider name and drops favorites while searching', () => {
    expect(summarize(buildModelSections(catalog, '  LARGE '))).toEqual([
      ['alpha', ['alpha/large']],
    ]);
    expect(summarize(buildModelSections(catalog, 'beta labs'))).toEqual([['beta', ['beta/chat']]]);
  });

  it('returns no sections when nothing matches', () => {
    expect(buildModelSections(catalog, 'xyz')).toEqual([]);
  });
});
