import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBacktest } from "@/hooks/useMarketData";
import { STOCK_SYMBOLS, STOCK_NAMES } from "@/contexts/StockContext";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Backtesting = () => {
  const [symbol, setSymbol] = useState("AAPL");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [trigger, setTrigger] = useState(1);
  
  const { data: backtestResult, isLoading, error, refetch } = useBacktest(
    symbol, 
    "sma_crossover", 
    startDate, 
    endDate, 
    trigger
  );

  const runBacktest = () => {
    setTrigger(t => t + 1);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Backtesting</h1>
        <p className="text-sm text-muted-foreground">Test AI models on historical data</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Configuration</h3>
        <div className="grid sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Stock Symbol</label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="h-10 bg-muted border-border">
                <SelectValue placeholder="Select stock" />
              </SelectTrigger>
              <SelectContent>
                {STOCK_SYMBOLS.map((s) => (
                  <SelectItem key={s} value={s}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{s}</span>
                      <span className="text-muted-foreground text-xs">{STOCK_NAMES[s]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 bg-muted border-border" 
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 bg-muted border-border" 
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={runBacktest}
              disabled={isLoading}
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Running..." : "Run Backtest"}
            </Button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {error && !isLoading && (
        <div className="glass-card p-6 mb-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-bearish mb-4" />
          <p className="text-foreground mb-2">Backtest failed</p>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {backtestResult && !isLoading && !error && (
        <>
          <div className="grid sm:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-5">
              <div className="text-sm text-muted-foreground">Total Return</div>
              <div className={`text-2xl font-bold ${backtestResult.total_return >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                {(backtestResult.total_return * 100).toFixed(2)}%
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
              <div className="text-2xl font-bold text-foreground">{backtestResult.sharpe_ratio.toFixed(2)}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-sm text-muted-foreground">Win Rate</div>
              <div className="text-2xl font-bold text-bullish">{(backtestResult.win_rate * 100).toFixed(1)}%</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-sm text-muted-foreground">Total Trades</div>
              <div className="text-2xl font-bold text-foreground">{backtestResult.num_trades}</div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Results — {symbol}</h3>
              <span className="text-xs text-muted-foreground">
                Date: {new Date(backtestResult.backtest_date).toLocaleDateString()}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Strategy</span>
                <span className="text-foreground font-medium">{backtestResult.strategy}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Max Drawdown</span>
                <span className="text-bearish font-medium">{(backtestResult.max_drawdown * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Backtesting;