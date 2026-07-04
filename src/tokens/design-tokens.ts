/**
 * Unified application design tokens.
 * Matches CSS properties declared inside src/styles/globals.css.
 */
export const tokens = {
  colors: {
    bg: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      card: '#ffffff',
    },
    border: {
      muted: '#e2e8f0',
      accent: '#cbd5e1',
    },
    accent: {
      violet: '#1e40af',
      violetGlow: '#eff6ff',
      emerald: '#059669',
      amber: '#d97706',
      rose: '#dc2626',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#64748b',
    },
  },
  spacing: {
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    12: '3rem', // 48px
  },
  radius: {
    sm: '6px',
    md: '6px',
    lg: '6px',
    full: '9999px',
  },
  typography: {
    fontSans: 'var(--font-geist-sans), sans-serif',
    fontMono: 'var(--font-geist-mono), monospace',
    size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },
} as const;

export type DesignTokens = typeof tokens;
export default tokens;
