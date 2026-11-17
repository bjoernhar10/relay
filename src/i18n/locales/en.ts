export const en = {
  common: {
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
  markdown: {
    copyCode: 'Copy code',
  },
  settings: {
    title: 'Settings',
  },
};

type Translations<T> = { [K in keyof T]: T[K] extends string ? string : Translations<T[K]> };

export type TranslationResources = Translations<typeof en>;
