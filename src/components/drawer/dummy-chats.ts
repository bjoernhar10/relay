import type { ChatSummary } from './chat-summary';

const hour = 60 * 60 * 1000;
const day = 24 * hour;

const dummyChatAges: [title: string, ageInMs: number][] = [
  ['Rezept für Sauerteigbrot', 1 * hour],
  ['TypeScript Generics erklärt', 3 * hour],
  ['Reiseplan Lissabon', 1 * day + 2 * hour],
  ['E-Mail an Vermieter', 1 * day + 5 * hour],
  ['PocketBase auf dem Raspberry Pi', 3 * day],
  ['Zusammenfassung Meeting', 4 * day],
  ['Trainingsplan Halbmarathon', 6 * day],
  ['SQL-Abfrage optimieren', 12 * day],
  ['Geburtstagsgeschenk Ideen', 30 * day],
  ['Bewerbungsschreiben', 64 * day],
];

export function createDummyChats(now: Date): ChatSummary[] {
  return dummyChatAges.map(([title, ageInMs], index) => ({
    id: `dummy-${index}`,
    title,
    updatedAt: new Date(now.getTime() - ageInMs),
  }));
}
