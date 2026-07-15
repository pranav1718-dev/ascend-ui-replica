import { useCallback, useEffect, useState } from "react";
import { db } from "@/services/db";
import type { TableName } from "@/types/models";

type Row = Record<string, unknown> & { id: string };

/**
 * Generic hook: list + mutate rows of a table.
 * Uses Supabase when configured, otherwise localStorage.
 */
export function useTable<T extends Row>(table: TableName) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await db.list<T>(table);
      setData(rows);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const insert = useCallback(
    async (row: Omit<T, "id"> & { id?: string }) => {
      const created = await db.insert<T>(table, row);
      setData((prev) => [created, ...prev]);
      return created;
    },
    [table],
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      const next = await db.update<T>(table, id, patch);
      setData((prev) => prev.map((r) => (r.id === id ? next : r)));
      return next;
    },
    [table],
  );

  const remove = useCallback(
    async (id: string) => {
      await db.remove(table, id);
      setData((prev) => prev.filter((r) => r.id !== id));
    },
    [table],
  );

  return { data, loading, error, refresh, insert, update, remove };
}
