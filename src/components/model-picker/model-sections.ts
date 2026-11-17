import type { Model, ModelProvider } from './model';

export type ModelSection =
  | { kind: 'favorites'; key: string; data: Model[] }
  | { kind: 'provider'; key: string; title: string; data: Model[] };

type ModelCatalog = {
  providers: ModelProvider[];
  models: Model[];
  favoriteModelIds: string[];
};

function matchesQuery(model: Model, provider: ModelProvider, query: string): boolean {
  return [model.label, provider.name].some((text) => text.toLowerCase().includes(query));
}

export function buildModelSections(
  { providers, models, favoriteModelIds }: ModelCatalog,
  rawQuery: string,
): ModelSection[] {
  const query = rawQuery.trim().toLowerCase();

  const providerSections: ModelSection[] = providers
    .map((provider) => ({
      kind: 'provider' as const,
      key: provider.id,
      title: provider.name,
      data: models.filter(
        (model) => model.providerId === provider.id && matchesQuery(model, provider, query),
      ),
    }))
    .filter((section) => section.data.length > 0);

  // While searching, favorites would only repeat matches from the provider groups.
  if (query) return providerSections;

  const favorites = favoriteModelIds
    .map((id) => models.find((model) => model.id === id))
    .filter((model): model is Model => model !== undefined);

  return favorites.length > 0
    ? [{ kind: 'favorites', key: 'favorites', data: favorites }, ...providerSections]
    : providerSections;
}
