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
- Anthropic bietet neben `2023-06-01` die API-Version `2026-10-21` an. Relay sendet `2023-06-01`, siehe Abschnitt 3.3.

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

### 2.7 Modelle

- Die Modellliste eines Anbieters wird über `GET {baseUrl}/models` geladen (TanStack Query, `source: 'api'`). Sie wird neu geladen, sobald sich URL, Protokoll oder Key des Anbieters ändern.
- Nutzer können Modell-IDs zusätzlich manuell eintragen (`source: 'manual'`), etwa wenn ein Anbieter keine Liste liefert.
- Favoriten werden pro Modell (`providerId` + `id`) gemerkt und erscheinen oben im Modell-Picker.
- Ein Modell wird über `providerId` + `id` referenziert. Wird ein Anbieter gelöscht, verschwinden seine Favoriten, manuellen Modelle und eine Auswahl auf ihn.
- Vorerst liegen Modelllisten, Favoriten, manuelle Modelle und Auswahl nur im Speicher. Mit dem SQLite-Schritt werden sie lokal gespeichert.
- „Key testen“ im Anbieter-Formular ruft `listModels` mit den aktuellen Formularwerten auf, also auch vor dem Sichern.

## 3. Provider-Adapter

### 3.1 Interface

```ts
type ChatRequestMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type StreamChatRequest = {
  model: string;
  messages: ChatRequestMessage[];
  modelInfo?: ModelInfo;   // aus der geladenen Modellliste, falls bekannt
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
- Sampling-Parameter (`temperature` usw.) gibt es bewusst nicht: Anthropics API-Version `2026-10-21` lehnt sie ab, und Relay braucht sie nicht.
- `ModelInfo` enthält zusätzlich `maxOutputTokens` und `supportsAdaptiveThinking`, sofern der Anbieter sie liefert (Anthropic `/v1/models`). Der Chat gibt die `ModelInfo` des gewählten Modells aus dem Query-Cache an den Adapter.

### 3.2 OpenAI-kompatibel

- `listModels`: `GET {baseUrl}/models`, liest `data[].id`, optional `name` und `context_length` bzw. `context_window`
- `streamChat`: `POST {baseUrl}/chat/completions` mit `stream: true`. Liest `choices[0].delta.content` als Text und `delta.reasoning_content` (DeepSeek, Kimi, GLM) bzw. `delta.reasoning` (OpenRouter, Groq) als Reasoning.
- `data: [DONE]` beendet den Stream. Endet die Verbindung ohne `[DONE]`, gilt die Antwort trotzdem als fertig.
- Fehler innerhalb des Streams (`data: {"error": …}`) werden als `ProviderError` geworfen.

### 3.3 Anthropic

- Header: `x-api-key`, `anthropic-version: 2023-06-01`. Diese Version akzeptiert Anthropic weiterhin, und Anthropic-kompatible Endpunkte (DeepSeek, Kimi, Z.ai) erwarten sie. `2026-10-21` würde nur Felder verbieten, die Relay nicht sendet. Die Konstante steht zentral in `src/providers/anthropic.ts`.
- `listModels`: `GET {baseUrl}/models?limit=1000`, folgt `has_more`/`last_id`. Liest `display_name`, `max_input_tokens`, `max_tokens` und `capabilities.thinking.types.adaptive.supported`. Reihenfolge wie geliefert (neueste zuerst).
- `streamChat`: `POST {baseUrl}/messages` mit `stream: true`
  - System-Nachrichten werden zu einem eigenen `system`-Feld zusammengefasst, das Gespräch beginnt immer mit einer Nutzer-Nachricht.
  - `max_tokens` ist Pflicht: die vom Modell gemeldete Obergrenze, höchstens 64 000; unbekannte Modelle bekommen 8 192.
  - `thinking: { type: 'adaptive', display: 'summarized' }` nur, wenn das Modell adaptives Thinking meldet. Ältere Modelle lehnen den Parameter ab, und aktuelle liefern ohne `display: 'summarized'` leeren Thinking-Text.
- Events: `content_block_delta` mit `text_delta` wird zu Text, `thinking_delta` zu Reasoning. `signature_delta`, `input_json_delta`, `citations_delta`, `redacted_thinking`, `ping` und unbekannte Event-Typen werden ignoriert. `message_start` liefert die Eingabe-Tokens, `message_delta` Abbruchgrund und Ausgabe-Tokens, `message_stop` beendet den Stream. Ein `error`-Event wird über `error.type` gemappt (z. B. `overloaded_error` → `server`).

### 3.4 SSE

Eigener Parser nach dem WHATWG-Format:
- Zeilenenden `\n`, `\r\n` und `\r`, auch über Chunk-Grenzen hinweg
- Kommentare (`:`) dienen als Keepalive und werden ignoriert
- mehrere `data`-Zeilen werden mit `\n` verbunden, ein BOM am Anfang wird entfernt
- ein letztes Event ohne abschließende Leerzeile wird trotzdem ausgeliefert

Bytes werden mit `TextDecoder` im Stream-Modus dekodiert, damit Mehrbyte-Zeichen über Chunk-Grenzen heil bleiben.

### 3.5 Fehler

| Ursache | `kind` | Meldung (Kurzform) |
| --- | --- | --- |
| HTTP 401 | `invalidApiKey` | Key abgelehnt, in den Einstellungen prüfen |
| HTTP 402, `insufficient_quota`, `billing_error` | `quotaExceeded` | Guthaben oder Kontingent aufgebraucht |
| HTTP 403 | `forbidden` | Kein Zugriff auf Modell oder Funktion |
| HTTP 404 | `notFound` | Modell oder Endpunkt nicht gefunden |
| HTTP 429 | `rateLimited` | Zu viele Anfragen, mit Wartezeit aus `Retry-After` |
| HTTP 400, 413, 422 | `badRequest` | Anfrage abgelehnt |
| HTTP 5xx (auch Anthropics 529), Fehler im Stream | `server` | Fehler beim Anbieter |
| Verbindung fehlgeschlagen | `network` | Keine Verbindung, Internet und Base-URL prüfen |
| Signal ausgelöst | `aborted` | Abgebrochen |
| Antwort nicht lesbar | `invalidResponse` | Unerwartete Antwort |

Fehler-Events im Stream werden über ihren Typ zugeordnet (`authentication_error`, `rate_limit_error`, `invalid_request_error`, …), sonst gelten sie als `server`. Die Meldung des Anbieters wird gekürzt als `detail` mitgegeben. Gemeinsame Bausteine (HTTP, JSON-Lesen, SSE-Events als JSON, Fehler) liegen in eigenen Modulen und werden von beiden Adaptern genutzt.

## 4. Datenhaltung und Sync

### 4.1 Lokale Datenbank

`expo-sqlite`, Datei `relay.db`, WAL und Fremdschlüssel aktiv. Migrationen zählen `PRAGMA user_version` hoch, ausgelieferte Migrationen werden nie geändert.

**conversations**

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `id` | TEXT PK | 15 Zeichen `a-z0-9`, Format wie PocketBase-IDs |
| `title` | TEXT | Anzeigetitel |
| `title_source` | TEXT | `provisional` (Anfang der ersten Nachricht), `generated` (vom Modell), `user` (umbenannt) |
| `pinned`, `archived` | INTEGER 0/1 | Anpinnen, Archivieren |
| `provider_id`, `model_id` | TEXT | zuletzt genutztes Modell |
| `created`, `updated` | TEXT | ISO 8601, UTC |
| `sync_status` | TEXT | `pending` (lokal geändert) oder `synced` |

**messages**

| Feld | Typ | Bedeutung |
| --- | --- | --- |
| `id` | TEXT PK | wie oben |
| `conversation_id` | TEXT FK | `ON DELETE CASCADE` |
| `role` | TEXT | `user` oder `assistant` |
| `content`, `reasoning` | TEXT | Antworttext und Gedankengang |
| `status` | TEXT | `streaming`, `complete`, `stopped`, `error` |
| `model_label` | TEXT | angezeigter Modellname der Antwort |
| `error_kind`, `error_detail` | TEXT | `ProviderError.kind` bzw. `missingModel` und Meldung des Anbieters |
| `created`, `updated`, `sync_status` | | wie oben |

- Reihenfolge der Nachrichten: `created`, bei Gleichstand Einfügereihenfolge.
- Jede Änderung setzt `updated` und `sync_status = 'pending'`.
- Löschen ist vorerst endgültig. Für den Sync kommen Löschmarkierungen dazu.
- Beim Start werden Antworten mit Status `streaming` auf `stopped` gesetzt, weil sie nach einem Neustart nicht mehr laufen können.

### 4.2 Lesen und Schreiben

- Die UI liest ausschließlich aus SQLite, über TanStack-Query-Hooks (`src/db/queries.ts`). Schreibende Funktionen invalidieren die betroffenen Abfragen.
- Antworten werden auch während des Streamings in die Datenbank geschrieben, gebündelt etwa alle 120 ms.
- Die Chat-Engine (`src/components/chat/chat-engine.ts`) läuft außerhalb von React. Eine Antwort streamt also weiter, wenn der Nutzer den Chat wechselt.
- Titel: Ein neuer Chat bekommt zuerst den Anfang der ersten Nachricht. Nach der ersten vollständigen Antwort erzeugt ein kurzer Extra-Aufruf an das aktuelle Modell einen Titel mit höchstens sechs Wörtern in der Sprache des Gesprächs. Ein vom Nutzer gesetzter Titel wird nie überschrieben.
- Suche im Drawer: Titel und Nachrichteninhalt per `LIKE`. Groß- und Kleinschreibung wird dabei nur für ASCII ignoriert; Umlaute müssen exakt passen. Eine Volltextsuche (FTS5) wäre die spätere Verbesserung.

### 4.3 Sync (folgt)

- PocketBase auf einem Raspberry Pi 5 (arm64), Setup in `backend/`.
- Sync im Hintergrund über `sync_status`, Konflikte nach „letzte Änderung gewinnt“ pro Datensatz.

## 5. Chat-Screen

Umgesetzt in den Schritten 3 bis 5:

- Header: Menü links, Modellname als Button für den Modell-Picker in der Mitte, „Neuer Chat“ rechts
- Nachrichtenliste mit FlashList. User-Nachrichten als Bubble rechts, Antworten ohne Bubble in voller Breite
- Markdown mit Codeblöcken (Highlighting, Kopieren) und Tabellen
- Unter jeder Antwort: Kopieren, Neu generieren, Modellname
- Leerer Zustand mit Begrüßung und vier Vorschlägen
- Drawer: Chats aus SQLite, oben „Angepinnt“, dann nach Datum gruppiert. Long-Press öffnet ein Menü mit Umbenennen, Anpinnen, Archivieren und Löschen (mit Bestätigung). Archivierte Chats liegen unter Einstellungen → Archiv.
- Composer mit wachsendem Feld, „+“-Sheet, Senden bzw. Stop, Haptics, Keyboard-Handling

## 6. Gedächtnis (folgt)

Fakten über den Nutzer, die über Chats hinweg in den Kontext gegeben werden. Lokal in SQLite, synchronisiert über PocketBase, jederzeit einsehbar und löschbar.

## 7. Einstellungen

- Anbieter (Abschnitt 2.6)
- Weitere Punkte (Erscheinungsbild, Sync-Server, Gedächtnis) folgen in ihren Schritten.
