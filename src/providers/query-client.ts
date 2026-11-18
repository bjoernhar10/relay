import { QueryClient } from '@tanstack/react-query';

import { ProviderError } from './provider-error';

const maxRetries = 2;

// Retrying only helps with transient failures; a wrong key or URL fails the same way again.
function shouldRetry(failureCount: number, error: unknown): boolean {
  const isTransient =
    error instanceof ProviderError &&
    (error.kind === 'network' || error.kind === 'server' || error.kind === 'rateLimited');
  return isTransient && failureCount < maxRetries;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry },
  },
});
