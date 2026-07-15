import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { storage } from "@/lib/storage";
import type { TableName } from "@/types/models";

/**
 * Generic per-user CRUD service.
 *
 * - When Supabase is configured: reads/writes go to the Supabase table.
 * - When not configured: falls back to localStorage under `ascend:<table>`.
 *
 * This keeps the UI working during manual integration, and swaps to real
 * data automatically once VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
 * are set.
 */

type Row = Record<string, unknown> & { id: string; user_id?: string };

const key = (table: TableName) => `ascend:${table}`;

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const db = {
  isRemote: () => isSupabaseConfigured,

  async list<T extends Row>(table: TableName): Promise<T[]> {
    if (supabase) {
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw error;
      return (data as T[]) ?? [];
    }
    return storage.get<T[]>(key(table), []);
  },

  async getById<T extends Row>(table: TableName, id: string): Promise<T | null> {
    if (supabase) {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as T) ?? null;
    }
    return storage.get<T[]>(key(table), []).find((r) => r.id === id) ?? null;
  },

  async insert<T extends Row>(table: TableName, row: Omit<T, "id"> & { id?: string }): Promise<T> {
    if (supabase) {
      const { data, error } = await supabase.from(table).insert(row as never).select().single();
      if (error) throw error;
      return data as T;
    }
    const rows = storage.get<T[]>(key(table), []);
    const created = { ...(row as object), id: row.id ?? uuid() } as T;
    storage.set(key(table), [created, ...rows]);
    return created;
  },

  async update<T extends Row>(table: TableName, id: string, patch: Partial<T>): Promise<T> {
    if (supabase) {
      const { data, error } = await supabase.from(table).update(patch as never).eq("id", id).select().single();
      if (error) throw error;
      return data as T;
    }
    const rows = storage.get<T[]>(key(table), []);
    const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    storage.set(key(table), next);
    return next.find((r) => r.id === id) as T;
  },

  async remove(table: TableName, id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return;
    }
    const rows = storage.get<Row[]>(key(table), []);
    storage.set(
      key(table),
      rows.filter((r) => r.id !== id),
    );
  },
};
