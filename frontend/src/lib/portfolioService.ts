import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export interface PortfolioTradeInput {
  portfolioId: string;
  price: number;
  quantity: number;
  side: "BUY" | "SELL";
  symbol: string;
  userId: string;
}

export type PortfolioTrade = Tables<"trades">;
export type PortfolioRecord = Tables<"portfolios">;

export async function getOrCreatePortfolio(userId: string) {
  const existing = await supabase
    .from("portfolios")
    .select("id,title,user_id,cash,total_value")
    .eq("user_id", userId)
    .eq("title", "Primary Portfolio")
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    return existing.data as PortfolioRecord;
  }

  const payload: TablesInsert<"portfolios"> = {
    cash: 0,
    title: "Primary Portfolio",
    total_value: 0,
    user_id: userId,
  };

  const created = await supabase
    .from("portfolios")
    .insert(payload)
    .select("id,title,user_id,cash,total_value")
    .single();

  if (created.error) {
    throw created.error;
  }

  return created.data as PortfolioRecord;
}

export async function listPortfolioTrades(portfolioId: string) {
  const result = await supabase
    .from("trades")
    .select("id,portfolio_id,user_id,symbol,side,quantity,price,total,created_at")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw result.error;
  }

  return (result.data || []) as PortfolioTrade[];
}

export async function createPortfolioTrade(input: PortfolioTradeInput) {
  const payload: TablesInsert<"trades"> = {
    portfolio_id: input.portfolioId,
    price: input.price,
    quantity: input.quantity,
    side: input.side,
    symbol: input.symbol,
    total: Number((input.price * input.quantity).toFixed(2)),
    user_id: input.userId,
  };

  const result = await supabase
    .from("trades")
    .insert(payload)
    .select("id,portfolio_id,user_id,symbol,side,quantity,price,total,created_at")
    .single();

  if (result.error) {
    throw result.error;
  }

  return result.data as PortfolioTrade;
}
