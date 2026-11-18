import { fetch as expoFetch } from 'expo/fetch';

import { errorFromHttpResponse, errorFromRequestFailure, ProviderError } from './provider-error';

export type HttpResponse = {
  ok: boolean;
  status: number;
  headers: { get(name: string): string | null };
  body: ReadableStream<Uint8Array> | null;
  text(): Promise<string>;
};

export type FetchLike = (
  url: string,
  init: {
    method: 'GET' | 'POST';
    headers: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
) => Promise<HttpResponse>;

// expo/fetch streams response bodies on iOS and Android; React Native's built-in fetch buffers them.
export const defaultFetch: FetchLike = (url, init) => expoFetch(url, init);

export function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

type SendRequestOptions = {
  fetchImpl: FetchLike;
  url: string;
  method: 'GET' | 'POST';
  headers: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
};

export async function sendRequest({
  fetchImpl,
  url,
  method,
  headers,
  body,
  signal,
}: SendRequestOptions): Promise<HttpResponse> {
  let response: HttpResponse;
  try {
    response = await fetchImpl(url, {
      method,
      headers: body === undefined ? headers : { ...headers, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    throw errorFromRequestFailure(error, signal);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw errorFromHttpResponse(response.status, text, response.headers.get('retry-after'));
  }
  return response;
}

export async function readJsonResponse(
  response: HttpResponse,
  signal?: AbortSignal,
): Promise<unknown> {
  let text: string;
  try {
    text = await response.text();
  } catch (error) {
    throw errorFromRequestFailure(error, signal);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ProviderError('invalidResponse', { status: response.status, cause: error });
  }
}
