import type { ChatSummary } from '../chat-summary';
import { groupChatsByDate } from '../group-chats-by-date';

const now = new Date(2026, 10, 17, 14, 0);

function chat(id: string, updatedAt: Date, pinned = false): ChatSummary {
  return { id, title: id, pinned, archived: false, updated: updatedAt.toISOString() };
}

describe('groupChatsByDate', () => {
  it('puts pinned chats first and sorts the rest into today, yesterday, last 7 days and older', () => {
    const sections = groupChatsByDate(
      [
        chat('older', new Date(2026, 10, 9, 23, 59)),
        chat('today', new Date(2026, 10, 17, 0, 0)),
        chat('pinned', new Date(2025, 0, 1), true),
        chat('yesterday', new Date(2026, 10, 16, 23, 59)),
        chat('last7Days', new Date(2026, 10, 10, 0, 0)),
      ],
      now,
    );

    expect(sections.map((section) => [section.group, section.data.map((c) => c.id)])).toEqual([
      ['pinned', ['pinned']],
      ['today', ['today']],
      ['yesterday', ['yesterday']],
      ['last7Days', ['last7Days']],
      ['older', ['older']],
    ]);
  });

  it('orders chats within a group newest first', () => {
    const [today] = groupChatsByDate(
      [chat('morning', new Date(2026, 10, 17, 8, 0)), chat('noon', new Date(2026, 10, 17, 12, 0))],
      now,
    );

    expect(today?.data.map((c) => c.id)).toEqual(['noon', 'morning']);
  });

  it('leaves out empty groups', () => {
    const sections = groupChatsByDate([chat('older', new Date(2025, 0, 1))], now);

    expect(sections.map((section) => section.group)).toEqual(['older']);
  });
});
