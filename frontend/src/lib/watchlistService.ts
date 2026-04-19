import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type WatchlistItem = Tables<"watchlists">;

export async function listWatchlist(userId: string): Promise<WatchlistItem[]> {
  const { data, error } = await supabase
    .from("watchlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function addWatchlistItem(userId: string, symbol: string): Promise<WatchlistItem> {
  const payload: TablesInsert<"watchlists"> = {
    symbol: symbol.toUpperCase(),
    user_id: userId,
  };

  const { data, error } = await supabase
    .from("watchlists")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeWatchlistItem(userId: string, symbol: string): Promise<void> {
  const { error } = await supabase
    .from("watchlists")
    .delete()
    .eq("user_id", userId)
    .eq("symbol", symbol.toUpperCase());

  if (error) {
    throw error;
  }
}
