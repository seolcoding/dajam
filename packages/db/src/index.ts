import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Supabase Client
 *
 * Environment variables required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
 *
 * Usage in apps:
 * ```typescript
 * import { supabase } from "@mini-apps/db";
 *
 * const { data, error } = await supabase
 *   .from('table_name')
 *   .select('*');
 * ```
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[@mini-apps/db] Supabase credentials not found. " +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || "",
  supabaseAnonKey || ""
);

// Re-export types for convenience
export type { Database } from "./types";
