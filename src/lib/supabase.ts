import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = Boolean(url && anon);

export const isSupabaseConfigured = (): boolean => {
  const urlEnv = import.meta.env.VITE_SUPABASE_URL;
  const keyEnv = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!urlEnv || !keyEnv) return false;
  try {
    const u = new URL(urlEnv);
    const host = u.host || '';
    return u.protocol === 'https:' && (host.endsWith('.supabase.co') || host.endsWith('.supabase.net'));
  } catch {
    return false;
  }
};

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(url as string, anon as string);
  }
  return client;
}