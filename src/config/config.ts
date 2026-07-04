import { env } from './env';

export const config = {
  app: {
    name: 'Shopify CRO Opportunity Engine',
    version: '0.1.0',
    environment: env.NODE_ENV,
  },
  server: {
    port: env.PORT,
  },
  db: {
    uri: env.MONGODB_URI,
    name: 'cro_engine',
  },
  ai: {
    geminiApiKey: env.GEMINI_API_KEY,
    defaultModel: 'gemini-2.5-flash',
    fallbackModel: 'gemini-2.5-pro',
    temperature: 0.2,
    maxRetries: 3,
  },
  scraper: {
    timeoutMs: 8000,
    maxHtmlSizeBytes: 5242880, // 5MB limit
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  cache: {
    defaultTtlSeconds: 86400, // 24 hours
  },
} as const;

export type AppConfig = typeof config;
export default config;
