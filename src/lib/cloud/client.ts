/**
 * Supabase wiring. The URL and anon key are public by design (security comes from the Row Level Security
 * rules in docs/CLOUD_SETUP.md). If they are not configured the app runs exactly as before, local-only.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CloudData, CloudStore } from './sync';
import type { Progress } from '../progress';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const cloudConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;
export function getClient(): SupabaseClient | null {
  if (!cloudConfigured) return null;
  client ??= createClient(url!, anonKey!, {
    // detectSessionInUrl off: the app uses #/ routes, so a token hash must never be parsed as a page.
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' },
  });
  return client;
}

/**
 * Used only to request a password-reset email. Implicit flow makes the emailed link carry its token in the URL
 * fragment, so it opens in any browser or device (a PKCE link only works in the browser that asked for it).
 * It stores nothing; the main client above does everything else.
 */
let recoveryClient: SupabaseClient | null = null;
export function getRecoveryClient(): SupabaseClient | null {
  if (!cloudConfigured) return null;
  recoveryClient ??= createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, flowType: 'implicit', storageKey: 'mba-lab-recovery' },
  });
  return recoveryClient;
}

/** A store bound to one account. RLS in the database enforces the same rule a second time. */
export function storeFor(c: SupabaseClient, userId: string): CloudStore {
  return {
    async fetch() {
      const { data, error } = await c.from('progress').select('data,revision').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data ? { data: data.data, revision: Number(data.revision) } : null;
    },
    async insert(data: CloudData) {
      const { error } = await c.from('progress').insert({ user_id: userId, data, revision: 1 });
      if (!error) return 'ok';
      if (error.code === '23505') return 'conflict'; // row appeared meanwhile (another device)
      throw error;
    },
    async update(data: CloudData, expectedRevision: number) {
      const { data: rows, error } = await c
        .from('progress')
        .update({ data, revision: expectedRevision + 1, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('revision', expectedRevision)
        .select('revision');
      if (error) throw error;
      return rows && rows.length > 0 ? 'ok' : 'conflict';
    },
  };
}
