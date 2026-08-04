import { supabase } from "@/integrations/supabase/client";
import type { TableName } from "@/types/models";

/**
 * Generic per-user CRUD service backed entirely by Supabase.
 *
 * Every row is scoped to the signed-in user: `user_id` is filled in on
 * insert and RLS enforces owner-only access on the server. There is no
 * localStorage fallback any more — if the client is not configured the
 * calls fail loudly instead of silently writing to the browser.
 */

type Row = Record<string, unknown> & { id: string; user_id?: string };

/** Tables keyed by the user's auth id instead of a `user_id` column. */
const OWNER_ID_COLUMN: Partial<Record<TableName, string>> = { profiles: "id" };

function client() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return supabase;
}

async function currentUserId(): Promise<string> {
  const { data, error } = await client().auth.getUser();
  if (error || !data.user) throw new Error("You must be signed in.");
  return data.user.id;
}

export const db = {
  isRemote: () => true,

  /** Raw query builder for a table (already authenticated, RLS applies). */
  from(table: TableName) {
    return client().from(table);
  },

  /** Id of the signed-in user. Throws when there is no session. */
  userId: currentUserId,

  /** Insert-or-update on a unique constraint. */
  async upsert<T>(
    table: TableName,
    row: Record<string, unknown>,
    onConflict: string,
  ): Promise<T> {
    const userId = await currentUserId();
    const column = OWNER_ID_COLUMN[table] ?? "user_id";
    const { data, error } = await client()
      .from(table)
      .upsert({ ...row, [column]: userId } as never, { onConflict })
      .select()
      .single();
    if (error) throw error;
    return data as T;
  },


  async list<T extends Row>(table: TableName): Promise<T[]> {
    const userId = await currentUserId();
    const column = OWNER_ID_COLUMN[table] ?? "user_id";
    const { data, error } = await client().from(table).select("*").eq(column, userId);
    if (error) throw error;
    return (data as T[]) ?? [];
  },

  async getById<T extends Row>(table: TableName, id: string): Promise<T | null> {
    const { data, error } = await client().from(table).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as T) ?? null;
  },

  async insert<T extends Row>(table: TableName, row: Omit<T, "id"> & { id?: string }): Promise<T> {
    const userId = await currentUserId();
    const column = OWNER_ID_COLUMN[table] ?? "user_id";
    const payload = { ...(row as object), [column]: userId };
    const { data, error } = await client()
      .from(table)
      .insert(payload as never)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  },

  async update<T extends Row>(table: TableName, id: string, patch: Partial<T>): Promise<T> {
    const { data, error } = await client()
      .from(table)
      .update(patch as never)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as T;
  },

  async remove(table: TableName, id: string): Promise<void> {
    const { error } = await client().from(table).delete().eq("id", id);
    if (error) throw error;
  },
};
