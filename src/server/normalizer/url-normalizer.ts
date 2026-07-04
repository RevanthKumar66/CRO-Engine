import { ApiError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

/**
 * Normalizes, cleans, and secures storefront URLs against security threats like SSRF.
 */
export class UrlNormalizer {
  /**
   * Cleans and validates incoming URL parameters.
   *
   * @param inputUrl The raw storefront URL.
   * @returns Normalized URL string.
   */
  public static normalize(inputUrl: string): string {
    if (!inputUrl) {
      throw new ApiError(ErrorCodes.INVALID_URL, 'URL cannot be empty', 400);
    }

    let clean = inputUrl.trim();

    let parsed: URL;
    try {
      parsed = new URL(clean);
    } catch (e) {
      try {
        parsed = new URL('https://' + clean);
      } catch (err) {
        throw new ApiError(ErrorCodes.INVALID_URL, 'Invalid URL format', 400, err);
      }
    }

    try {
      const protocol = parsed.protocol.toLowerCase();

      if (protocol !== 'http:' && protocol !== 'https:') {
        throw new ApiError(
          ErrorCodes.INVALID_URL,
          'Unsupported protocol. Only HTTP and HTTPS are allowed.',
          400
        );
      }

      const hostname = parsed.hostname.toLowerCase();
      const cleanHost = hostname.replace(/[\[\]]/g, '');

      // Block localhost loopbacks
      const localhosts = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
      if (localhosts.some((h) => cleanHost === h)) {
        throw new ApiError(ErrorCodes.INVALID_URL, 'Loopback addresses are blocked.', 400);
      }

      // Block standard private subnet ranges (SSRF mitigation)
      if (
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') ||
        hostname.startsWith('172.19.') ||
        hostname.startsWith('172.20.') ||
        hostname.startsWith('172.21.') ||
        hostname.startsWith('172.22.') ||
        hostname.startsWith('172.23.') ||
        hostname.startsWith('172.24.') ||
        hostname.startsWith('172.25.') ||
        hostname.startsWith('172.26.') ||
        hostname.startsWith('172.27.') ||
        hostname.startsWith('172.28.') ||
        hostname.startsWith('172.29.') ||
        hostname.startsWith('172.30.') ||
        hostname.startsWith('172.31.')
      ) {
        throw new ApiError(ErrorCodes.INVALID_URL, 'Private network access is blocked.', 400);
      }

      // Standardize trailing slashes and redundant path grids
      let normalizedPath = parsed.pathname.replace(/\/+/g, '/');
      if (normalizedPath.endsWith('/') && normalizedPath.length > 1) {
        normalizedPath = normalizedPath.slice(0, -1);
      }

      return `${protocol}//${hostname}${normalizedPath}${parsed.search}`;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(ErrorCodes.INVALID_URL, 'Invalid URL format', 400, error);
    }
  }
}

export default UrlNormalizer;
