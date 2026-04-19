import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useMarketIndices, useSectorPerformance, useTopStocks } from "@/hooks/useMarketData";
import { useToggleWatchlist, useWatchlist } from "@/hooks/useWatchlist";
import { ArrowUp, ArrowDown, TrendingUp, AlertCircle, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";

const MarketOverview = () => {
  const { data: indices, isLoading: indicesLoading, error: indicesError, refetch: refetchIndices } = useMarketIndices();
  const { data: sectors, isLoading: sectorsLoading, error: sectorsError, refetch: refetchSectors } = useSectorPerformance();
  const { data: stocks, isLoading: stocksLoading, error: stocksError, refetch: refetchStocks } = useTopStocks();
  const { data: watchlist } = useWatchlist();
  const toggleWatchlist = useToggleWatchlist();
  const watchlistSymbols = new Set((watchlist || []).map((item) => item.symbol));

  const hasError = indicesError || sectorsError || stocksError;

  async function handleToggle(symbol: string) {
    const isSaved = watchlistSymbols.has(symbol);

    try {
      const result = await toggleWatchlist.mutateAsync({ isSaved, symbol });
      toast.success(result.action === "added" ? `${symbol} added to watchlist.` : `${symbol} removed from watchlist.`);
    } catch (toggleError) {
      const message = toggleError instanceof Error ? toggleError.message : "Failed to update watchlist.";
      toast.error(message);
    }
  }

  if (hasError) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Market Overview</h1>
          <p className="text-sm text-muted-foreground">Major indices, sector performance, and trending stocks</p>
        </div>
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-bearish mb-4" />
          <p className="text-muted-foreground mb-4">Failed to load market data</p>
          <div className="flex gap-4">
            {indicesError && <button onClick={() => refetchIndices()} className="text-primary hover:underline">Retry Indices</button>}
            {sectorsError && <button onClick={() => refetchSectors()} className="text-primary hover:underline">Retry Sectors</button>}
            {stocksError && <button onClick={() => refetchStocks()} className="text-primary hover:underline">Retry Stocks</button>}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Market Overview</h1>
        <p className="text-sm text-muted-foreground">Major indices, sector performance, and trending stocks</p>
      </div>

      {/* Indices */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {indicesLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-5">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-7 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          : indices?.map((idx) => (
              <div key={idx.ticker} className="glass-card p-5">
                <div className="text-sm text-muted-foreground mb-1">{idx.name}</div>
                <div className="text-xl font-bold text-foreground">{idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className={`flex items-center gap-1 text-sm font-medium ${idx.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {idx.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%
                </div>
              </div>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sector Performance */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sector Performance</h3>
          <div className="space-y-3">
            {sectorsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-2 w-32 rounded-full" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                  </div>
                ))
              : sectors?.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{s.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full">
                        <div
                          className={`h-full rounded-full ${s.change >= 0 ? 'bg-bullish' : 'bg-bearish'}`}
                          style={{ width: `${Math.min(Math.abs(s.change) * 20, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium w-14 text-right ${s.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                        {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Trending Stocks */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Trending Stocks</h3>
          <div className="space-y-3">
            {stocksLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30">
                    <div>
                      <Skeleton className="h-4 w-12 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 mb-1 ml-auto" />
                      <Skeleton className="h-3 w-12 ml-auto" />
                    </div>
                  </div>
                ))
              : stocks?.slice(0, 6).map((s) => (
                  <div key={s.ticker} className="flex items-center justify-between py-2 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggle(s.ticker)}
                        disabled={toggleWatchlist.isPending}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-primary"
                        aria-label={`Toggle ${s.ticker} watchlist`}
                      >
                        <Star
                          className={`h-4 w-4 ${watchlistSymbols.has(s.ticker) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        />
                      </button>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{s.ticker}</div>
                        <div className="text-xs text-muted-foreground">{s.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-foreground">${s.price.toFixed(2)}</div>
                      <div className={`text-xs font-medium flex items-center gap-1 justify-end ${
                        s.change >= 0 ? 'text-bullish' : 'text-bearish'
                      }`}>
                        {s.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Your Watchlist</h3>
          <span className="text-xs text-muted-foreground">{watchlist?.length || 0} saved</span>
        </div>
        {!watchlist?.length ? (
          <p className="text-sm text-muted-foreground">Save stocks with the star icon to build your personal watchlist.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {watchlist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggle(item.symbol)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-sm text-foreground hover:bg-muted"
              >
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                {item.symbol}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketOverview;
