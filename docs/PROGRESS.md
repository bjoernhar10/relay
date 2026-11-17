# Fortschritt

## Schritt 1: Projekt-Setup

**Neu**

- Expo SDK 58 mit expo-router (Screens in `app/`), TypeScript strict (plus `noUncheckedIndexedAccess`)
- ESLint (`eslint-config-expo` + Prettier-Plugin, `any` verboten), Prettier, Jest (`jest-expo`) mit React Native Testing Library
- Ordnerstruktur aus CLAUDE.md: `src/{providers,memory,sync,db,components,store,theme,i18n}`, `backend/`, `docs/`
- i18n mit i18next + react-i18next + expo-localization: de und en, Gerätesprache als Standard, Fallback en. Übersetzungen typisiert (`src/i18n/locales`), fehlende Keys in `de` sind ein Typfehler.
- Leerer Startscreen (`app/index.tsx`), Template-Demo und fremde Logos entfernt

**Testen**

- `npx expo start`: App in Expo Go oder Simulator öffnen, leerer Screen erscheint
- `npm run typecheck`, `npm run lint`, `npm test`, `npx prettier --check .`

**Offen**

- App-Icon und Splash-Grafik sind noch Platzhalter aus dem Expo-Template

## Schritt 2: Theme und Navigation

**Neu**

- `src/theme`: Farbpaletten hell/dunkel (neutrale Grautöne, eine Akzentfarbe), Abstände (4/8-Raster), Radien, Größen, Typografie (4 Stile, 2 Gewichte, Systemschrift). `useTheme()` liefert das aktive Theme, `makeStyles()` erzeugt pro Farbschema gecachte StyleSheets.
- `src/store/theme-store.ts`: Zustand-Store mit `system | light | dark`, Standard `system`. Wird noch nicht gespeichert, nach einem Neustart gilt wieder `system`.
- Navigation: Drawer aus `expo-router/drawer` (Wischgeste vom linken Rand, Menü-Button im Header). Screens: Chat (`app/index.tsx`) und Einstellungen (`app/settings.tsx`), beide noch leer.
- Drawer-Inhalt (`src/components/drawer`): Suchfeld ohne Funktion, „Neuer Chat“, Dummy-Chatliste gruppiert nach Heute / Gestern / Letzte 7 Tage / Älter, Einstellungen unten.
- Basiskomponenten: `AppText`, `Icon` (Feather, ein Linien-Set), `Screen`, `MenuButton`

**Testen**

- `npx expo start`, dann vom linken Rand wischen oder auf das Menü tippen. Einträge und „Einstellungen“ navigieren.
- Hell/Dunkel: Systemeinstellung des Geräts umschalten, die App folgt.
- `npm test`: Gruppierung nach Datum, Theme-Auflösung und Store, Chatliste

## Schritt 3: Chat-Screen mit Dummy-Nachrichten

`docs/SPEC.md` fehlt noch im Repo. Gebaut nach der Beschreibung des Schritts, Abgleich mit Abschnitt 5 steht aus.

**Neu**

- Routen: `app/index.tsx` ist der neue, leere Chat. `app/chat/[id].tsx` zeigt eine Dummy-Unterhaltung (für jede ID dieselbe).
- Header: Menü links, Modellname mit Pfeil in der Mitte (ohne Funktion), „Neuer Chat“ rechts. Einstellungen behalten den normalen Titel.
- Nachrichtenliste mit FlashList (`src/components/chat`), startet unten. User-Nachrichten als Bubble rechts, Assistant-Antworten in voller Breite.
- Unter jeder Antwort: Kopieren (kopiert das rohe Markdown, kurz Häkchen als Bestätigung), Neu generieren (ohne Funktion), Modell-Badge
- Leerer Zustand: Begrüßung und 4 Vorschlags-Chips (ohne Funktion)
- Markdown (`src/components/markdown`): `marked` als Parser, eigene Komponenten für Absätze, Überschriften, Listen inkl. Aufgaben, Zitate, Trennlinien, Inline-Code, Links, Tabellen (horizontal scrollbar) und Codeblöcke (Prism-Highlighting mit Theme-Farben, Kopieren-Button)
- `babel.config.js` mit kleinem Plugin für `marked`: das RN-Babel-Preset baut benannte Regex-Gruppen um, wodurch marked z. B. **fett** nach `Inline-Code` nicht mehr erkannt hat.

**Testen**

- `npx expo start -c` (wegen der neuen Babel-Config einmal mit leerem Cache), im Drawer einen Chat öffnen: Codeblöcke, Tabelle, Kopieren ausprobieren. „Neuer Chat“ zeigt den leeren Zustand.
- `npm test`: Markdown-Rendering inkl. Code-Kopieren, Syntax-Farben, Nachrichten-Aktionen, leerer Zustand

## Schritt 4: Composer, simuliertes Streaming

**Neu**

- `ChatView` (`src/components/chat/chat-view.tsx`) für neuen Chat und bestehende Chats: Liste bzw. leerer Zustand plus Composer
- Composer (`src/components/composer`): abgerundetes Feld, wächst bis 6 Zeilen und scrollt dann. „+“ öffnet ein leeres Bottom-Sheet (`@gorhom/bottom-sheet`), Senden ist bei leerem Feld deaktiviert und wird während einer Antwort zum Stop-Button. Leichte Haptics bei Senden und Stop (`expo-haptics`).
- Keyboard: `react-native-keyboard-controller`. Composer in `KeyboardStickyView`, Liste über `KeyboardChatScrollView` (hebt den Inhalt nur, wenn man am Ende ist). Die Safe Area unten verschwindet beim Öffnen hinter der Tastatur, statt doppelt Abstand zu erzeugen. Interaktives Wegwischen der Tastatur in der Liste.
- `useChatSession`: Nachrichten im Speicher, simulierte Antwort streamt Wort für Wort, Stop behält den bisherigen Text. Aktionen unter der Antwort erscheinen erst, wenn sie fertig ist.
- Auto-Scroll beim Streaming, solange man nahe am Ende ist. Beim Hochscrollen erscheint ein „nach unten“-Button über dem Composer.
- „Neuer Chat“ übergibt einen frischen `session`-Parameter, damit der neue Chat wieder leer startet.

**Testen**

- `npx expo start -c`, Nachricht senden: erscheint unten, Antwort streamt, Stop-Button bricht ab. Während des Streamings hochscrollen: Auto-Scroll pausiert, Pfeil-Button bringt zurück.
- Keyboard auf iOS und Android öffnen/schließen, mehrzeilig tippen (ab Zeile 7 scrollt das Feld), „+“ öffnet das Sheet.
- `npm test`: Chunking, Session-Hook (Streaming und Stop), Composer-Zustände, Aktionen während des Streamings

## Schritt 5: Modell-Picker

**Neu**

- Tippen auf den Modellnamen im Header öffnet ein Bottom-Sheet (`src/components/model-picker`): Suchfeld oben, darunter Favoriten (mit Anbieter als Zusatzzeile), dann alle Modelle gruppiert nach Anbieter. Das gewählte Modell hat ein Häkchen.
- Suche filtert nach Modell- und Anbietername, ohne Groß/Klein-Unterscheidung. Während der Suche entfällt die Favoriten-Gruppe, damit nichts doppelt erscheint. Ohne Treffer: „Keine Modelle gefunden“.
- Auswahl landet in `src/store/model-store.ts` (Zustand), der Header zeigt sie sofort. Neue Antworten tragen das gewählte Modell als Badge.
- Anbieter, Modelle und Favoriten sind Dummy-Daten (`dummy-models.ts`). Favoriten lassen sich noch nicht ändern, die Auswahl wird noch nicht gespeichert.
- Gemeinsame `Sheet`-Komponente (Backdrop, Hintergrund, Griff) für Anhang- und Modell-Sheet. `SearchField` liegt jetzt in `src/components` und wird im Drawer und im Picker genutzt.

**Testen**

- `npx expo start`, Modellname im Header antippen, suchen (z. B. „kimi“ oder „anthropic“), Modell wählen: Sheet schließt, Header zeigt das Modell, die nächste Antwort hat das passende Badge.
- `npm test`: Gruppierung und Suche (`buildModelSections`), Picker-Sheet (Favoriten, Auswahl, leere Suche)

## Design-Durchgang (zwischen Schritt 5 und 6)

**Neu**

- Farben: neutralere, weicher abgestufte Grautöne in Hell und Dunkel (Dunkel `#212121`), eigene Töne für Drawer (`sidebar`) und User-Bubble (`surfaceStrong`)
- Typografie: Lesetext 17/26, Begrüßung 28 (`display`), Captions regulär oder halbfett. Insgesamt 4 Größen, 2 Gewichte, Code in Monospace 14.
- Icons: Lucide (`lucide-react-native` + `react-native-svg`) statt Feather, Strichstärke 1.75. Icons werden über Rollen angesprochen (`newChat`, `send`, `stop` …), Zuordnung nur in `src/components/icon.tsx`.
- Composer: zweistufiger Block mit großem Radius, Text oben, „+“ und Senden darunter. Senden blendet animiert zwischen deaktiviert, Senden (Akzent) und Stop um.
- Leerer Zustand: große Begrüßung, Vorschlagskarten mit Titel und Unterzeile als horizontale Reihe über dem Composer, dezentes Einblenden
- Nachrichten: rundere Bubble mit mehr Kontrast, Modell-Badge als reiner Text, gesendete Nachrichten blenden ein, pulsierender Punkt während des Streamings. Markdown mit mehr Abstand, Tabellen nur mit horizontalen Linien.
- Drawer: eigene Hintergrundfarbe, aktiver Chat hervorgehoben, mehr Luft zwischen den Gruppen
- Jest: Reanimated-Resolver, `.mjs`-Transform für Lucide. Zirkulären Import zwischen Markdown-Blöcken und Listen aufgelöst.

**Testen**

- `npx expo start` (läuft der Server schon, in Expo Go neu laden), hell und dunkel durchklicken: leerer Chat, Senden und Stop, Drawer mit geöffnetem Chat, Modell-Picker
- `npm test`: zusätzlich aktiver Chat im Drawer und Vorschlagskarten
