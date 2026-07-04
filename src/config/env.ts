import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required for the Opportunity Engine'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required for database persistence'),
});

const parseEnv = () => {
  // Return placeholder configs when executing in the browser context (client-side)
  if (typeof window !== 'undefined') {
    return {
      NODE_ENV: 'development' as const,
      PORT: 8080,
      GEMINI_API_KEY: '',
      MONGODB_URI: '',
    };
  }

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    MONGODB_URI: process.env.MONGODB_URI,
  };

  const parsed = envSchema.safeParse(envVars);

  if (!parsed.success) {
    console.error('❌ Environment validation failed:', parsed.error.format());
    throw new Error('Environment validation failed');
  }

  return parsed.data;
};

export const env = parseEnv();
