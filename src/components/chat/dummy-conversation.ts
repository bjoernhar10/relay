import type { ChatMessage } from './chat-message';

export const dummyModelLabel = 'deepseek-chat';

export const dummyConversation: ChatMessage[] = [
  {
    id: 'm1',
    role: 'user',
    content: 'Wie baue ich eine Debounce-Funktion in TypeScript?',
  },
  {
    id: 'm2',
    role: 'assistant',
    modelLabel: dummyModelLabel,
    status: 'complete',
    content: `## Debounce in TypeScript

Eine Debounce-Funktion verzögert den Aufruf, bis eine bestimmte Zeit **ohne neuen Aufruf** vergangen ist. Typisch für Suchfelder oder \`resize\`-Events.

\`\`\`ts
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}
\`\`\`

Worauf du achten solltest:

1. Die Typen der Argumente bleiben durch das Generic erhalten.
2. \`clearTimeout\` mit \`undefined\` ist erlaubt, ein Sonderfall ist nicht nötig.
3. In React gehört die Funktion in ein \`useMemo\`, sonst entsteht bei jedem Render ein neuer Timer.

| Technik | Wann ausführen | Typischer Einsatz |
| --- | --- | --- |
| Debounce | nach der letzten Eingabe | Suche, Autosave |
| Throttle | höchstens alle *n* ms | Scrollen, Resize |

> Für Eingaben im UI reichen meist 200 bis 300 ms.`,
  },
  {
    id: 'm3',
    role: 'user',
    content: 'Und wie sähe das in Python aus?',
  },
  {
    id: 'm4',
    role: 'assistant',
    modelLabel: dummyModelLabel,
    status: 'complete',
    content: `In Python geht das mit \`threading.Timer\`:

\`\`\`python
import threading

def debounce(delay_s: float):
    def decorator(fn):
        timer = None

        def wrapper(*args, **kwargs):
            nonlocal timer
            if timer:
                timer.cancel()
            timer = threading.Timer(delay_s, fn, args, kwargs)
            timer.start()

        return wrapper
    return decorator
\`\`\`

Für \`asyncio\` würdest du stattdessen mit \`asyncio.sleep\` und einem gemerkten Task arbeiten. Mehr dazu in der [Python-Dokumentation](https://docs.python.org/3/library/asyncio-task.html).`,
  },
];

export const dummyStreamedReply = `Gute Frage. Hier eine kurze Übersicht, wie du vorgehen kannst:

1. **Ziel klären:** Was genau soll am Ende herauskommen?
2. **Klein anfangen:** Erst eine einfache Version bauen, dann verbessern.
3. **Messen:** Prüfen, ob die Änderung wirklich etwas bringt.

Ein kleines Beispiel in TypeScript:

\`\`\`ts
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
\`\`\`

| Schritt | Aufwand | Nutzen |
| --- | --- | --- |
| Ziel klären | gering | hoch |
| Prototyp | mittel | hoch |
| Messen | gering | mittel |

Wenn du magst, gehen wir einen der Schritte im Detail durch.`;
