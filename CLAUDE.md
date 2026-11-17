# Relay – Projektkontext für Claude Code

Relay ist eine universelle KI-Chat-App für iOS und Android. Man nutzt darin OpenAI, Anthropic, DeepSeek, Kimi, GLM, Mistral und andere Anbieter mit eigenen API-Keys. Chats und das Gedächtnis werden über ein selbst gehostetes PocketBase synchronisiert. Die UI orientiert sich an ChatGPT, Claude und Kimi Mobile, mit eigenem Design.

Die komplette Spezifikation steht in `docs/SPEC.md`. Lies davon nur die Abschnitte, die der aktuelle Schritt nennt.

## Stack

- Expo (aktuelles SDK), React Native, TypeScript strict, expo-router
- Zustand (UI-State), TanStack Query (Server-State)
- expo-sqlite (lokaler Cache, offline-first), expo-secure-store (API-Keys)
- FlashList für Nachrichtenlisten
- PocketBase (Backend, läuft auf einem Raspberry Pi 5 / arm64)
- ESLint, Prettier, Jest und React Native Testing Library

## Architekturregeln

- Modellanfragen gehen direkt von der App zum Anbieter, nie über das Backend.
- API-Keys liegen nur in SecureStore. Sie werden nie geloggt, nie in SQLite gespeichert und nie zum Backend geschickt.
- Zwei Provider-Adapter mit gemeinsamem Interface: OpenAI-kompatibel und Anthropic. Keine Modellnamen hardcoden.
- Die UI liest immer aus SQLite. Der Sync läuft im Hintergrund.
- Alle UI-Texte laufen über i18n (de + en). Keine hardcodierten Strings.
- Keine fremden Logos, Icons oder Brand-Assets.

## Design: kein AI-Slop

Relay soll aussehen wie eine App, die ein Designer mit Geschmack gebaut hat, nicht wie ein generiertes Template. Ruhig, präzise, hochwertig. Vorbilder für das Niveau: Claude Mobile, ChatGPT Mobile, Linear, Things.

Verboten:

- Lila-blaue oder regenbogenfarbene Verläufe, Glow-Effekte, Neon-Akzente
- Glassmorphism und Blur als Deko (nur wo es funktional ist, z. B. Header beim Scrollen)
- ✨-Sparkle-Icons, Roboter- oder Gehirn-Icons, „magische“ KI-Symbolik
- Emojis in UI-Texten, Buttons oder Überschriften
- Marketing-Sprech wie „Unleash the power of AI 🚀“ oder „Your AI journey starts here“
- Überall dicke Schatten, Karten in Karten, jedes Element maximal abgerundet
- Zufällige Abstände und Größen, zu viele Farben, zu viele Schriftgewichte
- Animationen, die nur zeigen sollen, dass es Animationen gibt

Stattdessen:

- **Farben:** neutrale Grautöne als Basis plus **eine** dezente Akzentfarbe, sparsam eingesetzt (z. B. Senden-Button, aktive Elemente). Dark Mode mit echten dunklen Grautönen statt reinem Schwarz mit Neon.
- **Typografie:** Systemschrift (SF Pro / Roboto), klare Hierarchie mit maximal 3–4 Größen und 2 Gewichten. Gut lesbare Zeilenhöhe für lange Antworten.
- **Abstände:** festes Raster (4/8 pt) und konsistente Radien aus src/theme. Keine Magic Numbers in Komponenten.
- **Icons:** ein einziges, schlichtes Icon-Set (Linien-Icons, einheitliche Strichstärke).
- **Animationen:** kurz (150–250 ms), funktional, nativ wirkend: Drawer, Bottom-Sheet, Streaming-Text. Haptics dezent.
- **Texte:** kurz, menschlich, auf Augenhöhe. „Neuer Chat“ statt „Starte eine neue Konversation mit KI“. Leere Zustände ohne Floskeln.
- **Details:** sauberes Pressed-Feedback, korrekte Safe Areas, kein Layout-Springen, sinnvolle Lade- und Fehlerzustände.
- Im Zweifel weglassen. Weniger Elemente, dafür jedes perfekt.

## Code: kein AI-Slop

- Keine Kommentare, die nur nacherzählen, was der Code tut. Kommentiere nur das Warum.
- Keine unnötigen Abstraktionen, Wrapper oder „Manager“-Klassen auf Vorrat
- Kein toter Code, keine auskommentierten Blöcke, keine TODO-Platzhalter ohne Grund
- Keine `any`, kein Copy-Paste zwischen den Adaptern: Gemeinsames gehört in Hilfsfunktionen.
- Sprechende Namen, kleine Funktionen, konsistenter Stil im ganzen Projekt

## Ordner

- `app/`: Screens (expo-router)
- `src/providers/`, `src/memory/`, `src/sync/`, `src/db/`, `src/components/`, `src/store/`, `src/theme/`, `src/i18n/`
- `backend/`: PocketBase-Migrations, docker-compose, Setup-Doku
- `docs/`: SPEC.md, PROGRESS.md

## Arbeitsweise (wichtig)

- Arbeite **nur am aktuellen Schritt**. Keine Features aus späteren Schritten vorziehen.
- Nenn vor dem Coden kurz deinen Plan (max. 5 Punkte).
- Am Ende jedes Schritts:
  - `npx tsc --noEmit`, Lint und Tests laufen lassen und Fehler beheben
  - `docs/PROGRESS.md` um ein paar Zeilen ergänzen: was neu ist, wie man es testet
  - kurze Zusammenfassung ausgeben und dann **stoppen**
- Bei unklaren Architekturentscheidungen erst fragen, dann bauen.
- Kleine, gut benannte Dateien statt Riesen-Komponenten.
