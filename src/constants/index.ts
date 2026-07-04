/**
 * Core business constants for the Shopify CRO Opportunity Engine.
 */

// Target storefront pages checked by the parser
export const TARGET_PAGES = ['homepage', 'pdp', 'collection', 'cart'] as const;

// Heuristic categories
export const HEURISTIC_CATEGORIES = [
  'copywriting',
  'layout',
  'cta',
  'trust',
  'mobile',
  'performance',
] as const;

// Audit execution states
export const AUDIT_STATES = [
  'INITIATED',
  'SCRAPING',
  'PROCESSING',
  'ANALYZING',
  'COMPLETED',
  'FAILED',
] as const;

// Priority bounds
export const PRIORITIES = {
  impact: ['HIGH', 'MEDIUM', 'LOW'],
  effort: ['HIGH', 'MEDIUM', 'LOW'],
} as const;

// Score indicator thresholds
export const SCORE_THRESHOLDS = {
  healthy: 80, // >= 80: Green
  warning: 50, // >= 50: Amber, <50: Red
} as const;

// Rate limit configurations
export const RATE_LIMITS = {
  maxAuditsPerHour: 5,
  healthCheckWindowMs: 60000,
  maxHealthRequests: 60,
} as const;
