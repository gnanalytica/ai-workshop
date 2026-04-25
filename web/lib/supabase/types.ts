/**
 * Stub Supabase Database type. Once schema is finalised, regenerate via:
 *   supabase gen types typescript --linked > lib/supabase/database.types.ts
 * and import from there.
 */
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
