import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useTopStocks } from "@/hooks/useMarketData";
import { ArrowUp, ArrowDown, TrendingUp, DollarSign, BarChart3, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const PORTFOLIO_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'AMZN'];

const LOCAL_HOLDINGS: Record<string, { shares: number; avgCost: number }> = {
  AAPL: { shares: 150, avgCost: 165.20 },
  MSFT: { shares: 80, avgCost: 340.50 },
  GOOGL: { shares: 200, avgCost: 125.80 },
  NVDA: { shares: 45, avgCost: 420.00 },
  AMZN: { shares: 100, avgCost: 155.30 },
};

const Portfolio = () => {
  const { data: stocks, isLoading: stocksLoading, error, refetch } = useTopStocks();
  const [holdings, setHoldings] = useState<Array<{
    ticker: string;
    name: string;
    shares: number;
    avgCost: number;
    currentPrice: number;
    predicted: number;
    confidence: number;
    change: number;
  }>>([]);

  useEffect(() => {
    if (stocks) {
      const filtered = stocks.filter(s => PORTFOLIO_TICKERS.includes(s.ticker));
      const withHoldings = filtered.map(s => {
        const local = LOCAL_HOLDINGS[s.ticker];
        return {
          ticker: s.ticker,
          name: s.name,
          shares: local.shares,
          avgCost: local.avgCost,
          currentPrice: s.price,
          predicted: s.predicted,
          confidence: s.confidence,
          change: s.change,
        };
      });
      setHoldings(withHoldings);
    }
  }, [stocks]);

  const totalValue = holdings.reduce((s, h) => s + h.currentPrice * h.shares, 0);
  const totalCost = holdings.reduce((s, h) => s + h.avgCost * h.shares, 0);
  const totalGain = totalValue - totalCost;
  const gainPct = totalCost > 0 ? ((totalGain / totalCost) * 100).toFixed(2) : '0.00';

  const predictedTotal = holdings.reduce((s, h) => s + h.predicted * h.shares, 0);
  const predictedGrowth = totalValue > 0 ? ((predictedTotal - totalValue) / totalValue * 100).toFixed(1) : '0.0';

  if (error) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Track your holdings and AI-predicted growth</p>
        </div>
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-bearish mb-4" />
          <p className="text-muted-foreground mb-4">Failed to load portfolio data</p>
          <button onClick={() => refetch()} className="text-primary hover:underline">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  if (stocksLoading && holdings.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading portfolio data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Track your holdings and AI-predicted growth</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-foreground">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-bullish" />
            <span className="text-sm text-muted-foreground">Total Gain/Loss</span>
          </div>
          <div className="text-2xl font-bold text-bullish">
            +${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({gainPct}%)
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Predicted Growth</span>
          </div>
          <div className="text-2xl font-bold text-primary">+{predictedGrowth}%</div>
          <div className="text-xs text-muted-foreground">Next 30 days</div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Ticker', 'Shares', 'Avg Cost', 'Current', 'Predicted', 'P&L', 'Allocation'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground pb-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const pnl = (h.currentPrice - h.avgCost) * h.shares;
                const pnlPct = ((h.currentPrice - h.avgCost) / h.avgCost * 100).toFixed(1);
                const isUp = pnl >= 0;
                const allocation = totalValue > 0 ? ((h.currentPrice * h.shares) / totalValue * 100).toFixed(0) : '0';
                return (
                  <tr key={h.ticker} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 text-sm font-semibold text-foreground">{h.ticker}</td>
                    <td className="py-3 text-sm text-foreground">{h.shares}</td>
                    <td className="py-3 text-sm text-muted-foreground">${h.avgCost.toFixed(2)}</td>
                    <td className="py-3 text-sm text-foreground">${h.currentPrice.toFixed(2)}</td>
                    <td className="py-3 text-sm text-primary">${h.predicted.toFixed(2)}</td>
                    <td className="py-3">
                      <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                        {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        ${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({pnlPct}%)
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${allocation}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{allocation}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
