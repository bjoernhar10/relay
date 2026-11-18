import type { ChatSummary } from './chat-summary';

export const chatGroups = ['pinned', 'today', 'yesterday', 'last7Days', 'older'] as const;
export type ChatGroup = (typeof chatGroups)[number];

export type ChatSection = {
  group: ChatGroup;
  data: ChatSummary[];
};

function daysBefore(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function groupFor(chat: ChatSummary, now: Date): ChatGroup {
  if (chat.pinned) return 'pinned';
  const updatedAt = new Date(chat.updated);
  const today = startOfDay(now);
  if (updatedAt >= today) return 'today';
  if (updatedAt >= daysBefore(today, 1)) return 'yesterday';
  if (updatedAt >= daysBefore(today, 7)) return 'last7Days';
  return 'older';
}

export function groupChatsByDate(chats: ChatSummary[], now: Date): ChatSection[] {
  const newestFirst = [...chats].sort((a, b) => b.updated.localeCompare(a.updated));
  return chatGroups
    .map((group) => ({
      group,
      data: newestFirst.filter((chat) => groupFor(chat, now) === group),
    }))
    .filter((section) => section.data.length > 0);
}
