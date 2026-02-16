import { z } from 'zod';

const frontendEnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(20, 'VITE_SUPABASE_ANON_KEY must be set and non-empty'),
  VITE_BACKEND_URL: z
    .string()
    .url('VITE_BACKEND_URL must be a valid URL')
    .default('http://localhost:3001'),
  VITE_API_KEY: z.string().optional().default(''),
  VITE_GOOGLE_CLIENT_ID: z.string().optional().default(''),
  VITE_COINGECKO_API_KEY: z.string().optional().default(''),
});

const rawEnv = {
  ...(typeof process !== 'undefined' ? process.env : {}),
  ...(import.meta as any).env,
};

const parsedEnv = frontendEnvSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');

  throw new Error(`Frontend environment validation failed: ${details}`);
}

export const frontendEnv = parsedEnv.data;
