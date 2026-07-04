import { ApiError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';
import { retry } from '@/utils/retry';
import { timeout } from '@/utils/timeout';

export interface FetcherOptions {
  timeoutMs?: number;
  maxSizeBytes?: number;
  userAgent?: string;
  maxRedirects?: number;
}

export class WebsiteFetcher {
  private static readonly DEFAULT_TIMEOUT = 8000;
  private static readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly DEFAULT_UA = 'ShopifyCROOpportunityEngine/1.0 (+https://cro-engine.com)';

  /**
   * Fetches public storefront HTML content.
   * Enforces rules like maximum payload size, timeouts, content-type checks, and retries.
   *
   * @param url Normalized target URL.
   * @param options Configurable parameters.
   */
  public static async fetchHtml(url: string, options: FetcherOptions = {}): Promise<string> {
    const timeoutMs = options.timeoutMs ?? this.DEFAULT_TIMEOUT;
    const maxSizeBytes = options.maxSizeBytes ?? this.DEFAULT_MAX_SIZE;
    const userAgent = options.userAgent ?? this.DEFAULT_UA;

    const executeFetch = async (): Promise<string> => {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        cache: 'no-store',
      });

      // Verify status codes
      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          throw new ApiError(
            ErrorCodes.SCRAPING_FAILED,
            'Access denied. The target storefront blocked our request.',
            403
          );
        }
        throw new ApiError(
          ErrorCodes.SCRAPING_FAILED,
          `Storefront returned failing status code: ${response.status}`,
          response.status
        );
      }

      // Enforce Content-Type validation
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new ApiError(
          ErrorCodes.SCRAPING_FAILED,
          'Unsupported content type. Only HTML sites are audited.',
          415
        );
      }

      // Check Content-Length before downloading if available
      const contentLengthHeader = response.headers.get('content-length');
      if (contentLengthHeader) {
        const size = parseInt(contentLengthHeader, 10);
        if (size > maxSizeBytes) {
          throw new ApiError(
            ErrorCodes.SCRAPING_FAILED,
            'Response size limits exceeded. HTML payload is too large.',
            413
          );
        }
      }

      // Read response body while checking size limits
      const reader = response.body?.getReader();
      if (!reader) {
        throw new ApiError(ErrorCodes.SCRAPING_FAILED, 'Could not read response stream.', 500);
      }

      const decoder = new TextDecoder('utf-8');
      let resultText = '';
      let bytesDownloaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        bytesDownloaded += value.length;
        if (bytesDownloaded > maxSizeBytes) {
          await reader.cancel();
          throw new ApiError(
            ErrorCodes.SCRAPING_FAILED,
            'Response size limits exceeded during download.',
            413
          );
        }

        resultText += decoder.decode(value, { stream: true });
      }

      resultText += decoder.decode(); // Flush stream
      return resultText;
    };

    try {
      // Execute the task wrapped in timeout and retry layers
      return await retry(() => timeout(executeFetch(), timeoutMs, 'Storefront request timed out'), {
        retries: 2,
        minTimeoutMs: 1000,
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;

      const message = error instanceof Error ? error.message : 'Unknown network failure';
      if (message.includes('timeout')) {
        throw new ApiError(
          ErrorCodes.SCRAPING_FAILED,
          'Request timed out waiting for response.',
          408
        );
      }
      throw new ApiError(
        ErrorCodes.SCRAPING_FAILED,
        `Storefront fetch failed: ${message}`,
        502,
        error
      );
    }
  }
}

export default WebsiteFetcher;
