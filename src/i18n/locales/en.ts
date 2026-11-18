export const en = {
  common: {
    cancel: 'Cancel',
    appName: 'Relay',
    copy: 'Copy',
    copied: 'Copied',
  },
  navigation: {
    openMenu: 'Open menu',
  },
  drawer: {
    search: 'Search',
    newChat: 'New chat',
    settings: 'Settings',
  },
  chatGroups: {
    today: 'Today',
    yesterday: 'Yesterday',
    last7Days: 'Previous 7 days',
    older: 'Older',
  },
  chat: {
    newChat: 'New chat',
    selectModel: 'Choose model',
    regenerate: 'Regenerate',
    scrollToBottom: 'Scroll to bottom',
  },
  composer: {
    placeholder: 'Message',
    attach: 'Add attachment',
    send: 'Send',
    stop: 'Stop response',
  },
  emptyChat: {
    greeting: 'How can I help?',
    suggestions: {
      email: {
        title: 'Draft an email',
        detail: 'to my landlord about the heating',
      },
      explainCode: {
        title: 'Explain code',
        detail: 'step by step, without jargon',
      },
      summarize: {
        title: 'Summarize a text',
        detail: 'in five bullet points',
      },
      brainstorm: {
        title: 'Brainstorm ideas',
        detail: 'for a weekend in the mountains',
      },
    },
  },
  modelPicker: {
    search: 'Search models',
    favorites: 'Favorites',
    noResults: 'No models found',
  },
  providerErrors: {
    invalidApiKey: 'The API key was rejected. Check it in Settings.',
    forbidden: 'No access to this model or feature.',
    notFound: 'Model or endpoint not found. Check the base URL and model.',
    quotaExceeded: 'Your credit or quota with this provider is used up.',
    rateLimited: 'Too many requests. Try again in a moment.',
    rateLimitedRetry_one: 'Too many requests. Try again in {{count}} second.',
    rateLimitedRetry_other: 'Too many requests. Try again in {{count}} seconds.',
    badRequest: 'The provider rejected the request.',
    server: 'The provider reported an error. Try again later.',
    network: 'Could not reach the provider. Check your connection and the base URL.',
    aborted: 'Stopped.',
    invalidResponse: 'The provider sent an unexpected response.',
    unknown: 'Something went wrong.',
  },
  markdown: {
    copyCode: 'Copy code',
  },
  settings: {
    title: 'Settings',
    providers: 'Providers',
  },
  providers: {
    title: 'Providers',
    add: 'Add provider',
    emptyTitle: 'No providers yet',
    emptyHint: 'Add a provider with your API key.',
    noApiKey: 'No API key',
    count_one: '{{count}} provider',
    count_other: '{{count}} providers',
    chooseTitle: 'Add provider',
    presets: 'Presets',
    custom: 'Custom provider',
    customHint: 'Set the base URL and protocol yourself',
    protocols: {
      'openai-compatible': 'OpenAI-compatible',
      anthropic: 'Anthropic',
    },
    form: {
      newTitle: 'New provider',
      editTitle: 'Edit provider',
      name: 'Name',
      baseUrl: 'Base URL',
      protocol: 'Protocol',
      apiKey: 'API key',
      apiKeyPlaceholder: 'Paste API key',
      apiKeyStored: 'Saved, leave empty to keep it',
      apiKeyHint: 'Stored encrypted on this device only. Optional for local servers.',
      apiKeyWillBeRemoved: 'The saved key will be removed when you save.',
      removeApiKey: 'Remove key',
      keepApiKey: 'Keep key',
      save: 'Save',
      delete: 'Delete provider',
      saveFailed: 'Could not save. Please try again.',
      deleteConfirmTitle: 'Delete provider?',
      deleteConfirmMessage: '{{name}} and its saved API key will be removed from this device.',
      errors: {
        required: 'Required',
        invalidUrl: 'Not a valid URL (http or https)',
      },
    },
  },
};

type Translations<T> = { [K in keyof T]: T[K] extends string ? string : Translations<T[K]> };

export type TranslationResources = Translations<typeof en>;
