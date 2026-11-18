import { isRecord, parseJson, readRecord, readString } from './json';

export type ProviderErrorKind =
  | 'invalidApiKey'
  | 'forbidden'
  | 'notFound'
  | 'quotaExceeded'
  | 'rateLimited'
  | 'badRequest'
  | 'server'
  | 'network'
  | 'aborted'
  | 'invalidResponse'
  | 'unknown';

type ProviderErrorOptions = {
  status?: number;
  detail?: string;
  retryAfterSeconds?: number;
  cause?: unknown;
};

export class ProviderError extends Error {
  readonly kind: ProviderErrorKind;
  readonly status?: number;
  // The provider's own message, shown as secondary text. Never contains our API key,
  // because requests only send it in headers and providers echo at most a masked form.
  readonly detail?: string;
  readonly retryAfterSeconds?: number;

  constructor(kind: ProviderErrorKind, options: ProviderErrorOptions = {}) {
    super(options.detail ? `${kind}: ${options.detail}` : kind, { cause: options.cause });
    this.name = 'ProviderError';
    this.kind = kind;
    this.status = options.status;
    this.detail = options.detail;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

const maxDetailLength = 300;

type ProviderErrorBody = { message?: string; code?: string };

// Providers wrap errors differently: { error: { message, code } }, { error: "..." },
// { message } or { detail }. Anything else is ignored rather than shown raw.
export function readErrorBody(body: unknown): ProviderErrorBody {
  if (!isRecord(body)) return {};
  const nested = readRecord(body, 'error');
  const message =
    (nested && readString(nested, 'message')) ??
    readString(body, 'error') ??
    readString(body, 'message') ??
    readString(body, 'detail');
  const code = (nested && (readString(nested, 'code') ?? readString(nested, 'type'))) ?? undefined;
  return {
    message: message?.trim().slice(0, maxDetailLength) || undefined,
    code,
  };
}

const exhaustedCreditCodes = new Set(['insufficient_quota', 'billing_error']);

// Error types sent inside a stream, where there is no HTTP status to go by.
// Covers OpenAI's codes and Anthropic's `error.type` values.
const streamErrorKinds: Record<string, ProviderErrorKind> = {
  insufficient_quota: 'quotaExceeded',
  billing_error: 'quotaExceeded',
  authentication_error: 'invalidApiKey',
  permission_error: 'forbidden',
  not_found_error: 'notFound',
  rate_limit_error: 'rateLimited',
  invalid_request_error: 'badRequest',
  request_too_large: 'badRequest',
};

function kindForStatus(status: number, code: string | undefined): ProviderErrorKind {
  if (code && exhaustedCreditCodes.has(code)) return 'quotaExceeded';
  if (status === 401) return 'invalidApiKey';
  if (status === 402) return 'quotaExceeded';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 429) return 'rateLimited';
  if (status === 400 || status === 413 || status === 422) return 'badRequest';
  if (status >= 500) return 'server';
  return 'unknown';
}

export function parseRetryAfter(header: string | null, now = Date.now()): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const date = Date.parse(header);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, Math.ceil((date - now) / 1000));
}

export function errorFromHttpResponse(
  status: number,
  bodyText: string,
  retryAfterHeader: string | null,
): ProviderError {
  const { message, code } = readErrorBody(parseJson(bodyText));
  return new ProviderError(kindForStatus(status, code), {
    status,
    detail: message,
    retryAfterSeconds: status === 429 ? parseRetryAfter(retryAfterHeader) : undefined,
  });
}

// Errors inside an otherwise successful stream arrive as { error: { message, code | type } }.
export function errorFromStreamPayload(error: unknown): ProviderError {
  const { message, code } = readErrorBody({ error });
  return new ProviderError((code && streamErrorKinds[code]) || 'server', { detail: message });
}

export function errorFromRequestFailure(error: unknown, signal?: AbortSignal): ProviderError {
  if (error instanceof ProviderError) return error;
  const isAbort =
    signal?.aborted === true || (error instanceof Error && error.name === 'AbortError');
  return new ProviderError(isAbort ? 'aborted' : 'network', { cause: error });
}
