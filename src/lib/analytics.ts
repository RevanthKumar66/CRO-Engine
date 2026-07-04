/**
 * Abstraction layer for analytics integrations (Google Analytics, Vercel, Plausible, PostHog).
 * Keeps analytics vendor-agnostic and clean of direct import lock-in.
 */

type AnalyticsProviders = {
  vercel?: boolean;
  ga?: boolean;
  postHog?: boolean;
  plausible?: boolean;
};

const enabledProviders: AnalyticsProviders = {
  vercel: true, // abstract activation flags
  ga: false,
  postHog: false,
  plausible: false,
};

export const analytics = {
  /**
   * Tracks standard pageview.
   */
  pageview: (url: string) => {
    if (typeof window === 'undefined') return;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics:PageView] -> ${url}`);
      return;
    }

    // Abstract mapping to individual script tags / window variables
    if (enabledProviders.ga && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      });
    }

    if (enabledProviders.postHog && (window as any).posthog) {
      (window as any).posthog.capture('$pageview', { $current_url: url });
    }

    if (enabledProviders.plausible && (window as any).plausible) {
      (window as any).plausible('pageview', { u: url });
    }
  },

  /**
   * Captures custom track events.
   */
  event: (name: string, properties?: Record<string, any>) => {
    if (typeof window === 'undefined') return;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics:Event] -> "${name}"`, properties || '');
      return;
    }

    if (enabledProviders.ga && (window as any).gtag) {
      (window as any).gtag('event', name, properties);
    }

    if (enabledProviders.postHog && (window as any).posthog) {
      (window as any).posthog.capture(name, properties);
    }

    if (enabledProviders.plausible && (window as any).plausible) {
      (window as any).plausible(name, { props: properties });
    }
  },
};

export default analytics;
