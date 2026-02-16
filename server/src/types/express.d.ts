import type { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
      auth?: {
        userId: string;
        email: string | null;
        roles: string[];
        rawUser?: User;
      };
    }
  }
}

export {};
