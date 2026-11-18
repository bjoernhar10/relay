import type { ModelInfo } from '@/providers/types';
import { isSameModel, type ModelRef } from '@/store/model-store';

export type PickerModel = ModelRef & {
  label: string;
  providerName: string;
  isManual: boolean;
  isFavorite: boolean;
};

export type ProviderModels = {
  providerId: string;
  providerName: string;
  status: 'loading' | 'error' | 'ready';
  error?: unknown;
  models: ModelInfo[];
};

export type ModelSection =
  | { kind: 'favorites'; key: string; data: PickerModel[] }
  | {
      kind: 'provider';
      key: string;
      providerId: string;
      title: string;
      status: ProviderModels['status'];
      error?: unknown;
      data: PickerModel[];
    };

type ModelCatalog = {
  providers: ProviderModels[];
  manualModels: Record<string, string[]>;
  favorites: ModelRef[];
};

function providerPickerModels(
  { providerId, providerName, models }: ProviderModels,
  manualIds: string[],
  favorites: ModelRef[],
): PickerModel[] {
  const fromApi = models.map((model) => ({
    modelId: model.id,
    label: model.displayName ?? model.id,
    isManual: false,
  }));
  const manual = manualIds
    .filter((modelId) => !models.some((model) => model.id === modelId))
    .map((modelId) => ({ modelId, label: modelId, isManual: true }));

  return [...fromApi, ...manual].map((model) => ({
    ...model,
    providerId,
    providerName,
    isFavorite: favorites.some((favorite) => isSameModel(favorite, { providerId, ...model })),
  }));
}

function matchesQuery(model: PickerModel, query: string): boolean {
  return [model.label, model.modelId, model.providerName].some((text) =>
    text.toLowerCase().includes(query),
  );
}

export function buildModelSections(
  { providers, manualModels, favorites }: ModelCatalog,
  rawQuery: string,
): ModelSection[] {
  const query = rawQuery.trim().toLowerCase();

  const providerSections: ModelSection[] = providers.map((provider) => {
    const models = providerPickerModels(
      provider,
      manualModels[provider.providerId] ?? [],
      favorites,
    );
    return {
      kind: 'provider',
      key: provider.providerId,
      providerId: provider.providerId,
      title: provider.providerName,
      status: provider.status,
      error: provider.error,
      data: query ? models.filter((model) => matchesQuery(model, query)) : models,
    };
  });

  // While searching, only matches count; favorites would repeat them.
  if (query) return providerSections.filter((section) => section.data.length > 0);

  // Favorites stay visible while their provider is still loading, labelled by their ID.
  const favoriteModels = favorites.flatMap((favorite): PickerModel[] => {
    const section = providerSections.find((candidate) => candidate.key === favorite.providerId);
    if (!section) return [];
    const known = section.data.find((model) => model.modelId === favorite.modelId);
    return [
      known ?? {
        ...favorite,
        label: favorite.modelId,
        providerName: section.kind === 'provider' ? section.title : favorite.providerId,
        isManual: false,
        isFavorite: true,
      },
    ];
  });

  return favoriteModels.length > 0
    ? [{ kind: 'favorites', key: 'favorites', data: favoriteModels }, ...providerSections]
    : providerSections;
}
