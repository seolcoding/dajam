/**
 * Database Types
 *
 * This file will contain type-safe database schema definitions.
 * Types will be generated from Supabase schema using:
 *
 * ```bash
 * pnpm supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types.ts
 * ```
 *
 * Or manually define types for your tables here.
 */

// Placeholder type - will be replaced with generated types
export type Database = {
  public: {
    Tables: {
      // Table definitions will go here
      // Example:
      // users: {
      //   Row: {
      //     id: string;
      //     email: string;
      //     created_at: string;
      //   };
      //   Insert: {
      //     id?: string;
      //     email: string;
      //     created_at?: string;
      //   };
      //   Update: {
      //     id?: string;
      //     email?: string;
      //     created_at?: string;
      //   };
      // };
    };
    Views: {
      // View definitions will go here
    };
    Functions: {
      // Function definitions will go here
    };
    Enums: {
      // Enum definitions will go here
    };
  };
};
