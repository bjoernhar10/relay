import {
  errorFromHttpResponse,
  errorFromRequestFailure,
  errorFromStreamPayload,
  parseRetryAfter,
  ProviderError,
} from '../provider-error';
import { providerErrorMessage } from '../provider-error-message';

describe('errorFromHttpResponse', () => {
  it.each([
    [401, 'invalidApiKey'],
    [402, 'quotaExceeded'],
    [403, 'forbidden'],
    [404, 'notFound'],
    [429, 'rateLimited'],
    [400, 'badRequest'],
    [422, 'badRequest'],
    [500, 'server'],
    [503, 'server'],
    [418, 'unknown'],
  ])('maps HTTP %i to %s', (status, kind) => {
    expect(errorFromHttpResponse(status, '', null)).toMatchObject({ kind, status });
  });

  it('recognizes an exhausted OpenAI quota behind a 429', () => {
    const body = JSON.stringify({
      error: { message: 'You exceeded your quota', code: 'insufficient_quota' },
    });
    expect(errorFromHttpResponse(429, body, null).kind).toBe('quotaExceeded');
  });

  it('extracts the provider message from the usual error shapes', () => {
    const shapes = [
      { error: { message: 'Incorrect API key provided' } },
      { error: 'Incorrect API key provided' },
      { message: 'Incorrect API key provided' },
      { detail: 'Incorrect API key provided' },
    ];
    for (const shape of shapes) {
      expect(errorFromHttpResponse(401, JSON.stringify(shape), null).detail).toBe(
        'Incorrect API key provided',
      );
    }
  });

  it('ignores bodies that are not JSON and truncates long messages', () => {
    expect(errorFromHttpResponse(502, '<html>Bad Gateway</html>', null).detail).toBeUndefined();
    const long = errorFromHttpResponse(400, JSON.stringify({ message: 'x'.repeat(1000) }), null);
    expect(long.detail).toHaveLength(300);
  });

  it('reads Retry-After only for rate limits', () => {
    expect(errorFromHttpResponse(429, '', '12').retryAfterSeconds).toBe(12);
    expect(errorFromHttpResponse(503, '', '12').retryAfterSeconds).toBeUndefined();
  });
});

describe('parseRetryAfter', () => {
  it('accepts seconds and HTTP dates', () => {
    const now = Date.parse('2026-11-17T12:00:00Z');
    expect(parseRetryAfter('1.2', now)).toBe(2);
    expect(parseRetryAfter('Tue, 17 Nov 2026 12:00:30 GMT', now)).toBe(30);
    expect(parseRetryAfter('Tue, 17 Nov 2026 11:00:00 GMT', now)).toBe(0);
    expect(parseRetryAfter('soon', now)).toBeUndefined();
    expect(parseRetryAfter(null, now)).toBeUndefined();
  });
});

describe('errorFromRequestFailure', () => {
  it('distinguishes aborts from network failures', () => {
    const controller = new AbortController();
    controller.abort();
    expect(
      errorFromRequestFailure(new Error('fetch failed: aborted'), controller.signal).kind,
    ).toBe('aborted');
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' });
    expect(errorFromRequestFailure(abortError).kind).toBe('aborted');
    expect(errorFromRequestFailure(new TypeError('Network request failed')).kind).toBe('network');
  });

  it('passes provider errors through unchanged', () => {
    const original = new ProviderError('rateLimited');
    expect(errorFromRequestFailure(original)).toBe(original);
  });
});

describe('errorFromStreamPayload', () => {
  it('maps errors sent inside a stream', () => {
    expect(errorFromStreamPayload({ message: 'overloaded' })).toMatchObject({
      kind: 'server',
      detail: 'overloaded',
    });
    expect(errorFromStreamPayload({ code: 'insufficient_quota' }).kind).toBe('quotaExceeded');
  });
});

describe('providerErrorMessage', () => {
  it('returns understandable messages', () => {
    expect(providerErrorMessage(new ProviderError('invalidApiKey'))).toBe(
      'Der API-Key wurde abgelehnt. Prüfe ihn in den Einstellungen.',
    );
    expect(providerErrorMessage(new ProviderError('network'))).toBe(
      'Keine Verbindung zum Anbieter. Prüfe deine Internetverbindung und die Base-URL.',
    );
    expect(providerErrorMessage(new Error('boom'))).toBe('Etwas ist schiefgelaufen.');
  });

  it('includes the wait time for rate limits', () => {
    expect(providerErrorMessage(new ProviderError('rateLimited', { retryAfterSeconds: 1 }))).toBe(
      'Zu viele Anfragen. Versuch es in 1 Sekunde noch einmal.',
    );
    expect(providerErrorMessage(new ProviderError('rateLimited', { retryAfterSeconds: 20 }))).toBe(
      'Zu viele Anfragen. Versuch es in 20 Sekunden noch einmal.',
    );
    expect(providerErrorMessage(new ProviderError('rateLimited'))).toBe(
      'Zu viele Anfragen. Versuch es gleich noch einmal.',
    );
  });
});
