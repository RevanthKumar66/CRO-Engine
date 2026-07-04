/**
 * Core application routes (web client and backend api).
 */
export const routes = {
  web: {
    home: '/',
    dashboard: '/dashboard',
    docs: '/docs',
    audits: (id: string) => `/audits/${id}`,
  },
  api: {
    health: '/api/v1/health',
    audits: '/api/v1/audits',
    analyze: '/api/v1/analyze',
    auditDetails: (id: string) => `/api/v1/audits/${id}`,
  },
} as const;

export default routes;
