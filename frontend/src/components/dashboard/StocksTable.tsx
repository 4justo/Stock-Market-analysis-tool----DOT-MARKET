import { useTopStocks } from "@/hooks/useMarketData";
import { useToggleWatchlist, useWatchlist } from "@/hooks/useWatchlist";
import { ArrowUp, ArrowDown, AlertCircle, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";

const StocksTable = () => {
  const { data: stocks, isLoading, error, refetch } = useTopStocks();
  const { data: watchlist } = useWatchlist();
  const toggleWatchlist = useToggleWatchlist();
  const watchlistSymbols = new Set((watchlist || []).map((item) => item.symbol));

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

  if (error) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-8 w-8 text-bearish mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load stocks</p>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top Predicted Stocks</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">Save</th>
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">Ticker</th>
              <th className="text-right text-xs font-medium text-muted-foreground pb-3">Price</th>
              <th className="text-right text-xs font-medium text-muted-foreground pb-3">Predicted</th>
              <th className="text-right text-xs font-medium text-muted-foreground pb-3">Confidence</th>
              <th className="text-right text-xs font-medium text-muted-foreground pb-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3"><Skeleton className="h-5 w-5" /></td>
                  <td className="py-3"><Skeleton className="h-5 w-16" /></td>
                  <td className="py-3 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                  <td className="py-3 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                  <td className="py-3 text-right"><Skeleton className="h-5 w-10 ml-auto" /></td>
                  <td className="py-3 text-right"><Skeleton className="h-5 w-14 ml-auto" /></td>
                </tr>
              ))
            ) : (
              stocks?.map((stock) => (
                <tr key={stock.ticker} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(stock.ticker)}
                      disabled={toggleWatchlist.isPending}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-primary"
                      aria-label={`Toggle ${stock.ticker} watchlist`}
                    >
                      <Star
                        className={`h-4 w-4 ${watchlistSymbols.has(stock.ticker) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      />
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-sm text-foreground">{stock.ticker}</div>
                    <div className="text-xs text-muted-foreground">{stock.name}</div>
                  </td>
                  <td className="text-right text-sm text-foreground">${stock.price.toFixed(2)}</td>
                  <td className="text-right text-sm text-foreground">${stock.predicted.toFixed(2)}</td>
                  <td className="text-right">
                    <span className={`text-sm font-medium ${stock.confidence >= 85 ? 'text-bullish' : 'text-muted-foreground'}`}>
                      {stock.confidence}%
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {stock.trend === 'bullish' ? (
                        <ArrowUp className="h-4 w-4 text-bullish" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-bearish" />
                      )}
                      <span className={`text-sm font-medium ${
                        stock.trend === 'bullish' ? 'text-bullish' : 'text-bearish'
                      }`}>
                        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StocksTable;
