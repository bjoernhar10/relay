import { buildModelSections, type ProviderModels } from '../model-sections';

const alpha: ProviderModels = {
  providerId: 'alpha',
  providerName: 'Alpha AI',
  status: 'ready',
  models: [
    { id: 'alpha-large', providerId: 'alpha', displayName: 'Alpha Large', source: 'api' },
    { id: 'alpha-fast', providerId: 'alpha', source: 'api' },
  ],
};
const beta: ProviderModels = {
  providerId: 'beta',
  providerName: 'Beta',
  status: 'loading',
  models: [],
};

function summarize(sections: ReturnType<typeof buildModelSections>) {
  return sections.map((section) => [section.key, section.data.map((model) => model.label)]);
}

describe('buildModelSections', () => {
  it('lists favorites first, then every provider with API and manual models', () => {
    const sections = buildModelSections(
      {
        providers: [alpha, beta],
        manualModels: { alpha: ['alpha-preview', 'alpha-fast'], beta: ['beta-1'] },
        favorites: [
          { providerId: 'beta', modelId: 'beta-1' },
          { providerId: 'alpha', modelId: 'alpha-large' },
        ],
      },
      '',
    );

    expect(summarize(sections)).toEqual([
      ['favorites', ['beta-1', 'Alpha Large']],
      ['alpha', ['Alpha Large', 'alpha-fast', 'alpha-preview']],
      ['beta', ['beta-1']],
    ]);
    const alphaSection = sections[1];
    expect(
      alphaSection?.data.map((model) => [model.modelId, model.isManual, model.isFavorite]),
    ).toEqual([
      ['alpha-large', false, true],
      ['alpha-fast', false, false],
      ['alpha-preview', true, false],
    ]);
    expect(sections[2]).toMatchObject({ kind: 'provider', status: 'loading' });
  });

  it('keeps a favorite visible by its ID while its provider is still loading', () => {
    const sections = buildModelSections(
      {
        providers: [beta],
        manualModels: {},
        favorites: [{ providerId: 'beta', modelId: 'beta-x' }],
      },
      '',
    );
    expect(sections[0]?.data[0]).toMatchObject({
      label: 'beta-x',
      providerName: 'Beta',
      isFavorite: true,
    });
  });

  it('drops favorites of removed providers', () => {
    const sections = buildModelSections(
      { providers: [alpha], manualModels: {}, favorites: [{ providerId: 'gone', modelId: 'x' }] },
      '',
    );
    expect(sections.map((section) => section.key)).toEqual(['alpha']);
  });

  it('searches labels, IDs and provider names and hides favorites and empty providers', () => {
    const catalog = {
      providers: [alpha, beta],
      manualModels: {},
      favorites: [{ providerId: 'alpha', modelId: 'alpha-fast' }],
    };
    expect(summarize(buildModelSections(catalog, ' LARGE '))).toEqual([['alpha', ['Alpha Large']]]);
    expect(summarize(buildModelSections(catalog, 'alpha ai'))).toEqual([
      ['alpha', ['Alpha Large', 'alpha-fast']],
    ]);
    expect(buildModelSections(catalog, 'nothing')).toEqual([]);
  });
});
