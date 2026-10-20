import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';


//////////////////////
//To get the access to the supabase from the non-public reach.

// Quickly gets the url for the supabase database!
export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Add it to your environment before using Supabase.');
  }
  return url;
}

// gets key password to access the supabase database.
export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Missing Supabase anon key. Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  return key;
}
/////////////

//////////////////////
////serverclient to connect to the supabase database
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Ignores if running in a Server Action or on a request that does not allow cookie writes.
        }
      },
    },
  });
}
