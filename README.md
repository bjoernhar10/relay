# Relay

A chat app for iOS and Android that talks to the models you choose: OpenAI, Anthropic, DeepSeek, Kimi, GLM, Mistral and other providers, each with your own API key. Chats and memory sync through a self-hosted PocketBase.

[![Expo SDK 58](https://img.shields.io/badge/Expo-SDK%2058-000020?logo=expo&logoColor=white)](https://docs.expo.dev/)
[![React Native 0.88](https://img.shields.io/badge/React%20Native-0.88-20232a?logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

> **Status:** early development. The interface is in place; model requests and sync still run on dummy data.

## Principles

- **Your keys, direct connection.** Requests go straight from the app to the provider, never through a server in between. API keys live only in the device's secure store.
- **One interface, many providers.** Two adapters cover almost everything: OpenAI-compatible and Anthropic. Model names are never hardcoded.
- **Offline first.** The UI always reads from a local SQLite database; syncing with PocketBase happens in the background.
- **Calm design.** Neutral grays, a single accent color, the system font, short and functional animations. Light and dark mode.

## What works today

- Chat with Markdown: code blocks with syntax highlighting and copy, tables, lists, quotes
- A composer that grows up to six lines, clean keyboard handling on iOS and Android, haptics
- Simulated streaming replies with stop, auto-scroll and a scroll-to-bottom button
- Model picker as a bottom sheet: favorites, groups by provider, search
- Drawer with chats grouped into today, yesterday, previous 7 days and older
- German and English, following the device language

Upcoming work is tracked in [`docs/PROGRESS.md`](docs/PROGRESS.md) (German).

## Getting started

Requirements: Node.js 22 or newer and the [Expo Go](https://expo.dev/go) app on your phone.

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (phone and computer on the same network), or use "Enter URL manually" in Expo Go with the `exp://` address shown in the terminal.

For native modules that Expo Go does not include, use a development build:

```bash
npx expo run:ios      # macOS with Xcode
npx expo run:android  # Android SDK
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the dev server |
| `npm test` | Jest with React Native Testing Library |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Expo config with Prettier) |
| `npm run format` | Prettier across the project |

## Project structure

```
app/                 Screens (expo-router): drawer, chat, settings
src/
  components/        UI: chat, composer, markdown, model-picker, drawer
  theme/             Colors, spacing, radii, typography, motion
  store/             Zustand stores (theme, selected model)
  i18n/              Translations (de, en)
  providers/         Provider adapters (planned)
  db/  sync/         SQLite cache and PocketBase sync (planned)
  memory/            Memory (planned)
backend/             PocketBase migrations, docker-compose, setup (planned)
docs/                Specification and progress log
```

## Stack

Expo, React Native, TypeScript, expo-router, Zustand, FlashList, Reanimated, react-native-keyboard-controller, @gorhom/bottom-sheet, marked, Prism, Lucide.

Planned: TanStack Query, expo-sqlite, expo-secure-store, and PocketBase on a Raspberry Pi 5 as the backend.

## License

[MIT](LICENSE)
