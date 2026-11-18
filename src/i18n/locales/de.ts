import type { TranslationResources } from './en';

export const de: TranslationResources = {
  common: {
    cancel: 'Abbrechen',
    appName: 'Relay',
    copy: 'Kopieren',
    copied: 'Kopiert',
  },
  navigation: {
    openMenu: 'Menü öffnen',
  },
  drawer: {
    search: 'Suchen',
    newChat: 'Neuer Chat',
    settings: 'Einstellungen',
  },
  chatGroups: {
    today: 'Heute',
    yesterday: 'Gestern',
    last7Days: 'Letzte 7 Tage',
    older: 'Älter',
  },
  chat: {
    newChat: 'Neuer Chat',
    selectModel: 'Modell wählen',
    regenerate: 'Neu generieren',
    scrollToBottom: 'Nach unten',
  },
  composer: {
    placeholder: 'Nachricht',
    attach: 'Anhang hinzufügen',
    send: 'Senden',
    stop: 'Antwort stoppen',
  },
  emptyChat: {
    greeting: 'Wie kann ich helfen?',
    suggestions: {
      email: {
        title: 'E-Mail formulieren',
        detail: 'an den Vermieter wegen der Heizung',
      },
      explainCode: {
        title: 'Code erklären',
        detail: 'Schritt für Schritt, ohne Fachchinesisch',
      },
      summarize: {
        title: 'Text zusammenfassen',
        detail: 'in fünf Stichpunkten',
      },
      brainstorm: {
        title: 'Ideen sammeln',
        detail: 'für ein Wochenende in den Bergen',
      },
    },
  },
  modelPicker: {
    search: 'Modell suchen',
    favorites: 'Favoriten',
    noResults: 'Keine Modelle gefunden',
  },
  providerErrors: {
    invalidApiKey: 'Der API-Key wurde abgelehnt. Prüfe ihn in den Einstellungen.',
    forbidden: 'Kein Zugriff auf dieses Modell oder diese Funktion.',
    notFound: 'Modell oder Endpunkt nicht gefunden. Prüfe Base-URL und Modell.',
    quotaExceeded: 'Guthaben oder Kontingent beim Anbieter ist aufgebraucht.',
    rateLimited: 'Zu viele Anfragen. Versuch es gleich noch einmal.',
    rateLimitedRetry_one: 'Zu viele Anfragen. Versuch es in {{count}} Sekunde noch einmal.',
    rateLimitedRetry_other: 'Zu viele Anfragen. Versuch es in {{count}} Sekunden noch einmal.',
    badRequest: 'Der Anbieter hat die Anfrage abgelehnt.',
    server: 'Der Anbieter hat einen Fehler gemeldet. Versuch es später erneut.',
    network: 'Keine Verbindung zum Anbieter. Prüfe deine Internetverbindung und die Base-URL.',
    aborted: 'Abgebrochen.',
    invalidResponse: 'Der Anbieter hat eine unerwartete Antwort geschickt.',
    unknown: 'Etwas ist schiefgelaufen.',
  },
  markdown: {
    copyCode: 'Code kopieren',
  },
  settings: {
    title: 'Einstellungen',
    providers: 'Anbieter',
  },
  providers: {
    title: 'Anbieter',
    add: 'Anbieter hinzufügen',
    emptyTitle: 'Noch keine Anbieter',
    emptyHint: 'Füge einen Anbieter mit deinem API-Key hinzu.',
    noApiKey: 'Kein API-Key',
    count_one: '{{count}} Anbieter',
    count_other: '{{count}} Anbieter',
    chooseTitle: 'Anbieter hinzufügen',
    presets: 'Vorlagen',
    custom: 'Eigener Anbieter',
    customHint: 'Base-URL und Protokoll selbst festlegen',
    protocols: {
      'openai-compatible': 'OpenAI-kompatibel',
      anthropic: 'Anthropic',
    },
    form: {
      newTitle: 'Neuer Anbieter',
      editTitle: 'Anbieter bearbeiten',
      name: 'Name',
      baseUrl: 'Base-URL',
      protocol: 'Protokoll',
      apiKey: 'API-Key',
      apiKeyPlaceholder: 'API-Key einfügen',
      apiKeyStored: 'Gespeichert, leer lassen zum Behalten',
      apiKeyHint:
        'Wird verschlüsselt nur auf diesem Gerät gespeichert. Bei lokalen Servern optional.',
      apiKeyWillBeRemoved: 'Der gespeicherte Key wird beim Sichern entfernt.',
      removeApiKey: 'Key entfernen',
      keepApiKey: 'Key behalten',
      save: 'Sichern',
      delete: 'Anbieter löschen',
      saveFailed: 'Konnte nicht gespeichert werden. Bitte erneut versuchen.',
      deleteConfirmTitle: 'Anbieter löschen?',
      deleteConfirmMessage:
        '{{name}} und der gespeicherte API-Key werden von diesem Gerät entfernt.',
      errors: {
        required: 'Pflichtfeld',
        invalidUrl: 'Keine gültige URL (http oder https)',
      },
    },
  },
};
