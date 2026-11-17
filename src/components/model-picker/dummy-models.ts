import type { Model, ModelProvider } from './model';

export const dummyProviders: ModelProvider[] = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'mistral', name: 'Mistral' },
  { id: 'moonshot', name: 'Moonshot' },
  { id: 'zhipu', name: 'Zhipu' },
];

export const dummyModels: Model[] = [
  { id: 'openai/gpt-4.1', label: 'gpt-4.1', providerId: 'openai' },
  { id: 'openai/gpt-4.1-mini', label: 'gpt-4.1-mini', providerId: 'openai' },
  { id: 'openai/o3', label: 'o3', providerId: 'openai' },
  { id: 'anthropic/claude-opus-5-5', label: 'claude-opus-5-5', providerId: 'anthropic' },
  { id: 'anthropic/claude-sonnet-5-5', label: 'claude-sonnet-5-5', providerId: 'anthropic' },
  { id: 'anthropic/claude-haiku-5-5', label: 'claude-haiku-5-5', providerId: 'anthropic' },
  { id: 'deepseek/deepseek-chat', label: 'deepseek-chat', providerId: 'deepseek' },
  { id: 'deepseek/deepseek-reasoner', label: 'deepseek-reasoner', providerId: 'deepseek' },
  { id: 'mistral/mistral-large-latest', label: 'mistral-large-latest', providerId: 'mistral' },
  { id: 'mistral/mistral-small-latest', label: 'mistral-small-latest', providerId: 'mistral' },
  { id: 'moonshot/kimi-k2', label: 'kimi-k2', providerId: 'moonshot' },
  { id: 'zhipu/glm-4.6', label: 'glm-4.6', providerId: 'zhipu' },
];

export const dummyFavoriteModelIds = [
  'deepseek/deepseek-chat',
  'anthropic/claude-sonnet-5-5',
  'openai/gpt-4.1',
];

export function findDummyModel(modelId: string): Model | undefined {
  return dummyModels.find((model) => model.id === modelId);
}
