# Relay – Spezifikation

Stand: 17.11.2026, Entwurf. Abschnitt 2 ist ausgearbeitet, die übrigen Abschnitte halten die Eckpunkte fest und werden in ihrem jeweiligen Schritt verfeinert.

## 1. Überblick

Relay ist eine KI-Chat-App für iOS und Android. Nutzer hinterlegen eigene API-Keys bei beliebigen Anbietern und chatten mit deren Modellen. Chats und Gedächtnis werden über ein selbst gehostetes PocketBase zwischen Geräten synchronisiert.

Grundsätze (Details in `CLAUDE.md`):

- Modellanfragen gehen direkt von der App zum Anbieter, nie über das Backend.
- API-Keys liegen nur in `expo-secure-store`. Sie werden nie geloggt, nie in SQLite oder einem anderen Store gespeichert und nie zum Backend geschickt.
- Zwei Protokolle decken alle Anbieter ab: OpenAI-kompatibel und Anthropic. Modellnamen werden nicht hardcodiert, sondern vom Anbieter geladen oder vom Nutzer eingetragen.
- Offline zuerst: Die UI liest aus SQLite, der Sync läuft im Hintergrund.

## 2. Anbieter und Modelle

### 2.1 Begriffe

- **Anbieter (Provider):** ein konfigurierter Zugang zu einer API, bestehend aus Name, Base-URL, Protokoll und API-Key. Mehrere Anbieter mit demselben Preset sind erlaubt, z. B. zwei OpenAI-Konten.
- **Preset:** eine mitgelieferte Vorlage mit Name, Base-URL und Protokoll für bekannte Anbieter. Presets enthalten keine Modelle.
- **Protokoll:** bestimmt den Adapter, der Anfragen baut und Antworten liest.
  - `openai-compatible`: `POST {baseUrl}/chat/completions`, `GET {baseUrl}/models`, Auth per `Authorization: Bearer <key>`
  - `anthropic`: `POST {baseUrl}/messages`, `GET {baseUrl}/models`, Auth per `x-api-key: <key>` und Header `anthropic-version`
- **Modell:** ein konkretes Modell eines Anbieters, identifiziert durch die ID, die an die API geschickt wird.

### 2.2 Base-URL-Konvention

Die Base-URL ist die Adresse, an die der Adapter die Endpunktpfade (`/chat/completions`, `/messages`, `/models`) anhängt. Sie enthält daher bereits das Versionssegment, z. B. `https://api.openai.com/v1` oder `https://api.anthropic.com/v1`. Abschließende Schrägstriche werden beim Speichern entfernt.

### 2.3 Typen

```ts
type ProviderProtocol = 'openai-compatible' | 'anthropic';

type ProviderPreset = {
  id: string;              // stabil, z. B. 'openai'
  name: string;            // Anzeigename, z. B. 'OpenAI'
  baseUrl: string;
  protocol: ProviderProtocol;
};

type ProviderConfig = {
  id: string;              // lokal erzeugt, eindeutig
  name: string;
  baseUrl: string;
  protocol: ProviderProtocol;
  presetId?: string;       // gesetzt, wenn aus einem Preset angelegt
  hasApiKey: boolean;      // ob im SecureStore ein Key liegt, nie der Key selbst
  createdAt: number;       // Unix-Zeit in ms
  updatedAt: number;
};

type ModelInfo = {
  id: string;              // Modell-ID, wie sie an die API geht
  providerId: string;      // ProviderConfig.id
  displayName?: string;    // falls die API einen liefert
  contextWindow?: number;  // Tokens, falls bekannt
  source: 'api' | 'manual';
};
```

### 2.4 Presets

Die Base-URLs wurden am 17.11.2026 mit der Doku der Anbieter abgeglichen.

| Preset-ID | Name | Base-URL | Protokoll |
| --- | --- | --- | --- |
| `openai` | OpenAI | `https://api.openai.com/v1` | openai-compatible |
| `anthropic` | Anthropic | `https://api.anthropic.com/v1` | anthropic |
| `deepseek` | DeepSeek | `https://api.deepseek.com` | openai-compatible |
| `moonshot` | Kimi (Moonshot) | `https://api.moonshot.ai/v1` | openai-compatible |
| `zai` | GLM (Z.ai) | `https://api.z.ai/api/paas/v4` | openai-compatible |
| `mistral` | Mistral | `https://api.mistral.ai/v1` | openai-compatible |
| `gemini` | Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai` | openai-compatible |
| `openrouter` | OpenRouter | `https://openrouter.ai/api/v1` | openai-compatible |
| `groq` | Groq | `https://api.groq.com/openai/v1` | openai-compatible |
| `xai` | xAI | `https://api.x.ai/v1` | openai-compatible |

Hinweise für Nutzer, die eine andere Variante brauchen (als eigener Anbieter oder durch Ändern der Base-URL):

- Kimi mit Konto in Festlandchina: `https://api.moonshot.cn/v1`
- GLM mit Konto in Festlandchina: `https://open.bigmodel.cn/api/paas/v4`
- GLM Coding Plan: `https://api.z.ai/api/coding/paas/v4`
- DeepSeek, Kimi und Z.ai bieten zusätzlich Anthropic-kompatible Endpunkte an. Relay nutzt bei Presets den OpenAI-kompatiblen.
- Anthropic führt mit `2026-10-21` eine neue API-Version ein. Der Adapter setzt den Header `anthropic-version` zentral, siehe Abschnitt 3.

### 2.5 Speicherung

- **Config** (`ProviderConfig[]`): Zustand-Store mit `persist`, gespeichert über den Key-Value-Store von `expo-sqlite` (`expo-sqlite/kv-store`) unter dem Schlüssel `relay.providers`.
- **API-Key:** ausschließlich `expo-secure-store`, Schlüssel `relay.provider-key.<providerId>`. Gelesen wird der Key nur vom Adapter direkt vor einer Anfrage.
- `hasApiKey` wird beim Speichern und Löschen des Keys mitgeführt, damit die Liste ohne SecureStore-Zugriff anzeigen kann, ob ein Key fehlt.
- Wird ein Anbieter gelöscht, wird sein Key im SecureStore mitgelöscht.
- Anbieter-Configs werden vorerst nicht synchronisiert. Ob sie (ohne Key) über PocketBase wandern, wird im Sync-Schritt entschieden.

### 2.6 Anbieter-Verwaltung (Einstellungen → Anbieter)

- Liste aller Anbieter mit Name, Host der Base-URL und Hinweis „Kein API-Key“, falls keiner hinterlegt ist. Leerer Zustand mit Button zum Hinzufügen.
- Hinzufügen: Preset wählen oder „Eigener Anbieter“. Ein Preset füllt Name, Base-URL und Protokoll vor, alle Felder bleiben änderbar.
- Formular: Name, Base-URL, Protokoll (OpenAI-kompatibel oder Anthropic), API-Key.
  - Pflicht: Name, gültige `https`- oder `http`-URL. `http` ist für lokale Server im LAN erlaubt (z. B. Ollama, LM Studio).
  - Der API-Key ist optional, weil lokale Server keinen brauchen.
  - Beim Bearbeiten wird der gespeicherte Key nie angezeigt. Ein leeres Feld behält ihn, eine Eingabe ersetzt ihn, „Key entfernen“ löscht ihn.
- Löschen mit Bestätigung.
- In diesem Schritt finden keine API-Aufrufe statt, also auch kein Verbindungstest.

### 2.7 Modelle (folgt)

- Die Modellliste eines Anbieters wird über `GET {baseUrl}/models` geladen und in SQLite zwischengespeichert (`source: 'api'`).
- Nutzer können Modell-IDs zusätzlich manuell eintragen (`source: 'manual'`), etwa wenn ein Anbieter keine Liste liefert.
- Favoriten werden pro Modell (`providerId` + `id`) gespeichert und speisen den Modell-Picker.

## 3. Provider-Adapter

### 3.1 Interface

```ts
type ChatRequestMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type StreamChatRequest = {
  model: string;
  messages: ChatRequestMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
};

type ChatStreamChunk =
  | { type: 'text'; text: string }
  | { type: 'reasoning'; text: string }   // Denkprozess, getrennt vom Antworttext
  | { type: 'done'; finishReason?: string; usage?: { inputTokens: number; outputTokens: number } };

interface ProviderAdapter {
  listModels(signal?: AbortSignal): Promise<ModelInfo[]>;
  streamChat(request: StreamChatRequest): AsyncIterable<ChatStreamChunk>;
}
```

- `streamChat` liefert die Chunks in Eingangsreihenfolge und endet mit genau einem `done`.
- Fehler werden als `ProviderError` geworfen, auch der Abbruch über das Signal (`kind: 'aborted'`).
- Requests laufen über `expo/fetch`, weil nur dieses auf iOS und Android Antworten tatsächlich streamt.

### 3.2 OpenAI-kompatibel

- `listModels`: `GET {baseUrl}/models`, liest `data[].id`, optional `name` und `context_length` bzw. `context_window`
- `streamChat`: `POST {baseUrl}/chat/completions` mit `stream: true`. Liest `choices[0].delta.content` als Text und `delta.reasoning_content` (DeepSeek, Kimi, GLM) bzw. `delta.reasoning` (OpenRouter, Groq) als Reasoning.
- `data: [DONE]` beendet den Stream. Endet die Verbindung ohne `[DONE]`, gilt die Antwort trotzdem als fertig.
- Fehler innerhalb des Streams (`data: {"error": …}`) werden als `ProviderError` geworfen.

### 3.3 SSE

Eigener Parser nach dem WHATWG-Format:
- Zeilenenden `\n`, `\r\n` und `\r`, auch über Chunk-Grenzen hinweg
- Kommentare (`:`) dienen als Keepalive und werden ignoriert
- mehrere `data`-Zeilen werden mit `\n` verbunden, ein BOM am Anfang wird entfernt
- ein letztes Event ohne abschließende Leerzeile wird trotzdem ausgeliefert

Bytes werden mit `TextDecoder` im Stream-Modus dekodiert, damit Mehrbyte-Zeichen über Chunk-Grenzen heil bleiben.

### 3.4 Fehler

| Ursache | `kind` | Meldung (Kurzform) |
| --- | --- | --- |
| HTTP 401 | `invalidApiKey` | Key abgelehnt, in den Einstellungen prüfen |
| HTTP 402, `insufficient_quota` | `quotaExceeded` | Guthaben oder Kontingent aufgebraucht |
| HTTP 403 | `forbidden` | Kein Zugriff auf Modell oder Funktion |
| HTTP 404 | `notFound` | Modell oder Endpunkt nicht gefunden |
| HTTP 429 | `rateLimited` | Zu viele Anfragen, mit Wartezeit aus `Retry-After` |
| HTTP 400, 413, 422 | `badRequest` | Anfrage abgelehnt |
| HTTP 5xx, Fehler im Stream | `server` | Fehler beim Anbieter |
| Verbindung fehlgeschlagen | `network` | Keine Verbindung, Internet und Base-URL prüfen |
| Signal ausgelöst | `aborted` | Abgebrochen |
| Antwort nicht lesbar | `invalidResponse` | Unerwartete Antwort |

Die Meldung des Anbieters wird gekürzt als `detail` mitgegeben. Gemeinsame Bausteine (HTTP, JSON-Lesen, SSE, Fehler) liegen in eigenen Modulen und werden auch vom Anthropic-Adapter genutzt.

## 4. Datenhaltung und Sync (folgt)

- Lokale SQLite-Datenbank mit Chats, Nachrichten, Modellen und Gedächtnis. Die UI liest nur von dort.
- PocketBase auf einem Raspberry Pi 5 (arm64), Setup in `backend/`.
- Sync im Hintergrund, Konflikte nach „letzte Änderung gewinnt“ pro Datensatz.

## 5. Chat-Screen

Umgesetzt in den Schritten 3 bis 5:

- Header: Menü links, Modellname als Button für den Modell-Picker in der Mitte, „Neuer Chat“ rechts
- Nachrichtenliste mit FlashList. User-Nachrichten als Bubble rechts, Antworten ohne Bubble in voller Breite
- Markdown mit Codeblöcken (Highlighting, Kopieren) und Tabellen
- Unter jeder Antwort: Kopieren, Neu generieren, Modellname
- Leerer Zustand mit Begrüßung und vier Vorschlägen
- Composer mit wachsendem Feld, „+“-Sheet, Senden bzw. Stop, Haptics, Keyboard-Handling

## 6. Gedächtnis (folgt)

Fakten über den Nutzer, die über Chats hinweg in den Kontext gegeben werden. Lokal in SQLite, synchronisiert über PocketBase, jederzeit einsehbar und löschbar.

## 7. Einstellungen

- Anbieter (Abschnitt 2.6)
- Weitere Punkte (Erscheinungsbild, Sync-Server, Gedächtnis) folgen in ihren Schritten.
