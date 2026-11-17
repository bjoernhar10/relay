import { useModelStore } from '@/store/model-store';

import { findDummyModel } from './dummy-models';

export function selectedModelLabel(selectedModelId: string): string {
  return findDummyModel(selectedModelId)?.label ?? selectedModelId;
}

export function useSelectedModelLabel(): string {
  return selectedModelLabel(useModelStore((state) => state.selectedModelId));
}
