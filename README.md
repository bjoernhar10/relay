# Relay

Eine KI-Chat-App für iOS und Android, die mit den Modellen deiner Wahl spricht: OpenAI, Anthropic, DeepSeek, Kimi, GLM, Mistral und weitere Anbieter, jeweils mit deinem eigenen API-Key. Chats und Gedächtnis synchronisieren über ein selbst gehostetes PocketBase.

[![Expo SDK 58](https://img.shields.io/badge/Expo-SDK%2058-000020?logo=expo&logoColor=white)](https://docs.expo.dev/)
[![React Native 0.88](https://img.shields.io/badge/React%20Native-0.88-20232a?logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

> **Status:** frühe Entwicklung. Die Oberfläche steht, Modellanfragen und Sync laufen noch über Dummy-Daten.

## Idee

- **Eigene Keys, direkte Verbindung.** Anfragen gehen von der App direkt zum Anbieter, nie über einen Server dazwischen. API-Keys liegen ausschließlich im SecureStore des Geräts.
- **Ein Interface, viele Anbieter.** Zwei Adapter decken fast alles ab: OpenAI-kompatibel und Anthropic. Modelle werden nicht hart codiert.
- **Offline zuerst.** Die UI liest immer aus einer lokalen SQLite-Datenbank, der Sync mit PocketBase läuft im Hintergrund.
- **Ruhiges Design.** Neutrale Grautöne, eine Akzentfarbe, Systemschrift, kurze und funktionale Animationen. Hell und Dunkel.

## Was es schon gibt

- Chat mit Markdown: Codeblöcke mit Syntax-Highlighting und Kopieren, Tabellen, Listen, Zitate
- Composer, der bis sechs Zeilen mitwächst, sauberes Keyboard-Handling auf iOS und Android, Haptics
- Simulierte, gestreamte Antworten mit Stop, Auto-Scroll und „nach unten“-Button
- Modell-Picker als Bottom-Sheet: Favoriten, Gruppen nach Anbieter, Suche
- Drawer mit Chatliste nach Heute, Gestern, Letzte 7 Tage und Älter
- Deutsch und Englisch, folgt der Gerätesprache

Was als Nächstes kommt, steht in [`docs/PROGRESS.md`](docs/PROGRESS.md).

## Loslegen

Voraussetzungen: Node.js 22 oder neuer und die App [Expo Go](https://expo.dev/go) auf dem Handy.

```bash
npm install
npx expo start
```

QR-Code mit Expo Go scannen (Handy und Rechner im selben WLAN). Alternativ in Expo Go „Enter URL manually“ mit der angezeigten `exp://`-Adresse.

Für native Module, die Expo Go nicht mitbringt, gibt es einen Development Build:

```bash
npx expo run:ios      # macOS mit Xcode
npx expo run:android  # Android SDK
```

## Skripte

| Befehl | Zweck |
| --- | --- |
| `npm start` | Dev-Server starten |
| `npm test` | Jest mit React Native Testing Library |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Expo-Konfiguration und Prettier) |
| `npm run format` | Prettier über das ganze Projekt |

## Aufbau

```
app/                 Screens (expo-router): Drawer, Chat, Einstellungen
src/
  components/        UI: chat, composer, markdown, model-picker, drawer
  theme/             Farben, Abstände, Radien, Typografie, Bewegung
  store/             Zustand-Stores (Theme, ausgewähltes Modell)
  i18n/              Übersetzungen de und en
  providers/         Provider-Adapter (folgt)
  db/  sync/         SQLite-Cache und PocketBase-Sync (folgt)
  memory/            Gedächtnis (folgt)
backend/             PocketBase: Migrations, docker-compose, Setup (folgt)
docs/                Spezifikation und Fortschritt
```

## Stack

Expo, React Native, TypeScript, expo-router, Zustand, FlashList, Reanimated, react-native-keyboard-controller, @gorhom/bottom-sheet, marked, Prism, Lucide.

Geplant: TanStack Query, expo-sqlite, expo-secure-store und als Backend PocketBase auf einem Raspberry Pi 5.

## Lizenz

[MIT](LICENSE)
