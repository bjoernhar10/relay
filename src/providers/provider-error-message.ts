import i18n from '@/i18n';

import { ProviderError } from './provider-error';

export function providerErrorMessage(error: unknown): string {
  if (!(error instanceof ProviderError)) return i18n.t('providerErrors.unknown');
  if (error.kind === 'rateLimited' && error.retryAfterSeconds !== undefined) {
    return i18n.t('providerErrors.rateLimitedRetry', { count: error.retryAfterSeconds });
  }
  return i18n.t(`providerErrors.${error.kind}`);
}
