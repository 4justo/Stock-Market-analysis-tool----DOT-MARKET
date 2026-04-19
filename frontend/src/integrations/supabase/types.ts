export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      backtest_results: {
        Row: {
          created_at: string;
          id: string;
          max_drawdown: number;
          sharpe_ratio: number;
          strategy: string;
          symbol: string;
          total_return: number;
          trades: number;
          user_id: string | null;
          win_rate: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          max_drawdown: number;
          sharpe_ratio: number;
          strategy: string;
          symbol: string;
          total_return: number;
          trades?: number;
          user_id?: string | null;
          win_rate?: number;
        };
        Update: Partial<Database["public"]["Tables"]["backtest_results"]["Insert"]>;
        Relationships: [];
      };
      candles: {
        Row: {
          bucket: string;
          candle_at: string;
          close: number;
          created_at: string;
          high: number;
          id: string;
          low: number;
          open: number;
          stock_id: string;
          volume: number;
        };
        Insert: {
          bucket?: string;
          candle_at: string;
          close: number;
          created_at?: string;
          high: number;
          id?: string;
          low: number;
          open: number;
          stock_id: string;
          volume?: number;
        };
        Update: Partial<Database["public"]["Tables"]["candles"]["Insert"]>;
        Relationships: [];
      };
      portfolios: {
        Row: {
          cash: number;
          created_at: string;
          id: string;
          title: string;
          total_value: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cash?: number;
          created_at?: string;
          id?: string;
          title?: string;
          total_value?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["portfolios"]["Insert"]>;
        Relationships: [];
      };
      predictions: {
        Row: {
          confidence: number;
          created_at: string;
          id: string;
          model: string;
          predicted_price: number;
          symbol: string;
          timeframe: string;
        };
        Insert: {
          confidence: number;
          created_at?: string;
          id?: string;
          model: string;
          predicted_price: number;
          symbol: string;
          timeframe: string;
        };
        Update: Partial<Database["public"]["Tables"]["predictions"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      sentiments: {
        Row: {
          confidence: number;
          created_at: string;
          id: string;
          label: string;
          score: number;
          signal: string | null;
          source: string;
          symbol: string;
        };
        Insert: {
          confidence?: number;
          created_at?: string;
          id?: string;
          label: string;
          score: number;
          signal?: string | null;
          source?: string;
          symbol: string;
        };
        Update: Partial<Database["public"]["Tables"]["sentiments"]["Insert"]>;
        Relationships: [];
      };
      stocks: {
        Row: {
          change: number | null;
          change_percent: number | null;
          created_at: string;
          id: string;
          last_update: string | null;
          market_cap: number | null;
          name: string;
          pe: number | null;
          price: number;
          symbol: string;
          updated_at: string;
          volume: number | null;
        };
        Insert: {
          change?: number | null;
          change_percent?: number | null;
          created_at?: string;
          id?: string;
          last_update?: string | null;
          market_cap?: number | null;
          name: string;
          pe?: number | null;
          price?: number;
          symbol: string;
          updated_at?: string;
          volume?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["stocks"]["Insert"]>;
        Relationships: [];
      };
      trades: {
        Row: {
          created_at: string;
          executed_at: string;
          fee: number;
          id: string;
          portfolio_id: string;
          price: number;
          quantity: number;
          side: "BUY" | "SELL";
          status: string;
          symbol: string;
          total: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          executed_at?: string;
          fee?: number;
          id?: string;
          portfolio_id: string;
          price: number;
          quantity: number;
          side: "BUY" | "SELL";
          status?: string;
          symbol: string;
          total: number;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["trades"]["Insert"]>;
        Relationships: [];
      };
      watchlists: {
        Row: {
          created_at: string;
          id: string;
          symbol: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          symbol: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["watchlists"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals["public"];

export type Tables<
  TableName extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName] extends {
  Row: infer Row;
}
  ? Row
  : never;

export type TablesInsert<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName] extends {
    Insert: infer Insert;
  }
    ? Insert
    : never;

export type TablesUpdate<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName] extends {
    Update: infer Update;
  }
    ? Update
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
