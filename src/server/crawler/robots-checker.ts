import { logger } from '../logger/structured-logger';

export class RobotsChecker {
  /**
   * Evaluates robots.txt parameters to verify if a path is allowed to be crawled.
   *
   * @param storeUrl Normalized root storefront URL.
   * @param path The URL path (e.g. /products/shoes).
   * @param userAgent The bot's user agent name.
   */
  public static async isCrawlAllowed(
    storeUrl: string,
    path: string,
    userAgent: string = 'ShopifyCROOpportunityEngine'
  ): Promise<boolean> {
    try {
      const parsedUrl = new URL(storeUrl);
      const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}/robots.txt`;

      const response = await fetch(robotsUrl, {
        method: 'GET',
        headers: { 'User-Agent': userAgent },
        cache: 'default',
      });

      if (!response.ok) {
        // If robots.txt doesn't exist, assume allowed by default
        return true;
      }

      const content = await response.text();
      return this.parseAndCheck(content, path, userAgent);
    } catch (err) {
      logger.warn('Failed to retrieve robots.txt; defaulting to allow', err);
      return true;
    }
  }

  private static parseAndCheck(robotsTxt: string, path: string, userAgent: string): boolean {
    const lines = robotsTxt.split(/\r?\n/);
    let currentUserAgentMatches = false;
    let wildcardMatches = false;

    const disallowedPathsForUserAgent: string[] = [];
    const disallowedPathsForWildcard: string[] = [];

    const cleanPath = path.trim().toLowerCase();

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.startsWith('#')) continue;

      const parts = cleanLine.split(':');
      if (parts.length < 2) continue;

      const key = parts[0].trim().toLowerCase();
      const value = parts.slice(1).join(':').trim();

      if (key === 'user-agent') {
        const agent = value.toLowerCase();
        currentUserAgentMatches = agent === userAgent.toLowerCase();
        wildcardMatches = agent === '*';
      } else if (key === 'disallow') {
        const disallowPath = value.toLowerCase();
        if (disallowPath) {
          if (currentUserAgentMatches) {
            disallowedPathsForUserAgent.push(disallowPath);
          }
          if (wildcardMatches) {
            disallowedPathsForWildcard.push(disallowPath);
          }
        }
      }
    }

    // Determine paths list to check (specific user-agent rules take priority over wildcard)
    const activeDisallowedPaths =
      disallowedPathsForUserAgent.length > 0
        ? disallowedPathsForUserAgent
        : disallowedPathsForWildcard;

    // Check if the path is prefix-blocked
    for (const blockedPrefix of activeDisallowedPaths) {
      if (blockedPrefix === '/') return false;
      if (cleanPath.startsWith(blockedPrefix)) {
        return false;
      }
    }

    return true;
  }
}

export default RobotsChecker;
