export type SseEvent = {
  event: string;
  data: string;
  id?: string;
};

export type SseParser = {
  // Feeds decoded text of any size; returns the events completed by it.
  push: (text: string) => SseEvent[];
  // Signals the end of the stream and returns a trailing event, if any.
  end: () => SseEvent[];
};

const byteOrderMark = '﻿';

// Follows the WHATWG event-stream format: lines end in \n, \r\n or \r (also across chunk
// boundaries), lines starting with ":" are comments (keepalives), multiple data lines join with \n.
export function createSseParser(): SseParser {
  let buffer = '';
  let isStart = true;
  let dataLines: string[] = [];
  let eventType = '';
  let lastEventId: string | undefined;

  const dispatch = (events: SseEvent[]) => {
    if (dataLines.length > 0) {
      events.push({ event: eventType || 'message', data: dataLines.join('\n'), id: lastEventId });
    }
    dataLines = [];
    eventType = '';
  };

  const processLine = (line: string, events: SseEvent[]) => {
    if (line === '') return dispatch(events);
    if (line.startsWith(':')) return;

    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);

    if (field === 'data') dataLines.push(value);
    else if (field === 'event') eventType = value;
    else if (field === 'id' && !value.includes('\0')) lastEventId = value;
  };

  const drain = (isFinal: boolean): SseEvent[] => {
    const events: SseEvent[] = [];
    let lineStart = 0;

    for (let index = 0; index < buffer.length; index += 1) {
      const char = buffer[index];
      if (char !== '\n' && char !== '\r') continue;
      // A trailing \r may be the first half of \r\n, so wait for the next chunk.
      if (char === '\r' && index === buffer.length - 1 && !isFinal) break;

      processLine(buffer.slice(lineStart, index), events);
      if (char === '\r' && buffer[index + 1] === '\n') index += 1;
      lineStart = index + 1;
    }

    buffer = buffer.slice(lineStart);

    if (isFinal) {
      if (buffer) processLine(buffer, events);
      buffer = '';
      // The spec drops an unterminated last event, but some proxies close the connection
      // without the final blank line. Keeping it avoids losing the end of an answer.
      dispatch(events);
    }
    return events;
  };

  return {
    push: (text) => {
      if (isStart && text.length > 0) {
        isStart = false;
        if (text.startsWith(byteOrderMark)) text = text.slice(1);
      }
      buffer += text;
      return drain(false);
    },
    end: () => drain(true),
  };
}
