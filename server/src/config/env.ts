import dotenv from 'dotenv';
import path from 'path';
import { cleanEnv, port, str, url } from 'envalid';

const envPaths = [
  path.resolve(__dirname, '../../../.env.local'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(__dirname, '../../.env'),
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath, override: false });
}

export const validatedEnv = cleanEnv(process.env, {
  NODE_ENV: str({ default: 'development', choices: ['development', 'test', 'production'] }),
  PORT: port({ default: 5000 }),
  SUPABASE_URL: url({ desc: 'Supabase project URL for backend service operations' }),
  SUPABASE_ANON_KEY: str({ desc: 'Supabase anon key for RLS-scoped user queries' }),
  SUPABASE_SERVICE_ROLE_KEY: str({ desc: 'Supabase service role key for privileged server access' }),
  ETH_RPC_URL: str({ default: 'http://127.0.0.1:8545' }),
  P3_PROTOCOL_ADDRESS: str({ default: '0x0000000000000000000000000000000000000000' }),
  STRIPE_SECRET_KEY: str({ default: '' }),
  STRIPE_WEBHOOK_SECRET: str({ default: '' }),
});
