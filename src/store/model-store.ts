import { create } from 'zustand';

export type ModelRef = {
  providerId: string;
  modelId: string;
};

export type ModelSelection = ModelRef & {
  label: string;
};

export function isSameModel(a: ModelRef, b: ModelRef): boolean {
  return a.providerId === b.providerId && a.modelId === b.modelId;
}

// Kept in memory only for now; persistence follows with the SQLite step.
type ModelState = {
  selected: ModelSelection | null;
  favorites: ModelRef[];
  manualModels: Record<string, string[]>;
  selectModel: (selection: ModelSelection) => void;
  toggleFavorite: (model: ModelRef) => void;
  addManualModel: (model: ModelRef) => void;
  forgetProvider: (providerId: string) => void;
};

export const useModelStore = create<ModelState>()((set) => ({
  selected: null,
  favorites: [],
  manualModels: {},
  selectModel: (selected) => set({ selected }),
  toggleFavorite: (model) =>
    set((state) => ({
      favorites: state.favorites.some((favorite) => isSameModel(favorite, model))
        ? state.favorites.filter((favorite) => !isSameModel(favorite, model))
        : [...state.favorites, model],
    })),
  addManualModel: ({ providerId, modelId }) =>
    set((state) => {
      const existing = state.manualModels[providerId] ?? [];
      if (existing.includes(modelId)) return state;
      return { manualModels: { ...state.manualModels, [providerId]: [...existing, modelId] } };
    }),
  forgetProvider: (providerId) =>
    set((state) => {
      const { [providerId]: _removed, ...manualModels } = state.manualModels;
      return {
        selected: state.selected?.providerId === providerId ? null : state.selected,
        favorites: state.favorites.filter((favorite) => favorite.providerId !== providerId),
        manualModels,
      };
    }),
}));
