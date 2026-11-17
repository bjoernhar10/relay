import { create } from 'zustand';

type ModelState = {
  selectedModelId: string;
  selectModel: (modelId: string) => void;
};

export const useModelStore = create<ModelState>()((set) => ({
  selectedModelId: 'deepseek/deepseek-chat',
  selectModel: (selectedModelId) => set({ selectedModelId }),
}));
