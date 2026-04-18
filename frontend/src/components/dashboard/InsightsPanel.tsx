import { useTechnicalIndicators } from "@/hooks/useMarketData";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface InsightsPanelProps {
  symbol: string;
}

const InsightsPanel = ({ symbol }: InsightsPanelProps) => {
  const { data: ti, isLoading, error, refetch } = useTechnicalIndicators(symbol);

  const rsiStatus = ti ? (ti.rsi > 70 ? 'Overbought' : ti.rsi < 30 ? 'Oversold' : 'Neutral') : '';
  const rsiColor = ti ? (ti.rsi > 70 ? 'text-bearish' : ti.rsi < 30 ? 'text-bullish' : 'text-primary') : '';
  const macdStatus = ti && ti.macd.histogram > 0 ? 'Bullish Cross' : 'Bearish Cross';
  const macdColor = ti && ti.macd.histogram > 0 ? 'text-bullish' : 'text-bearish';
  const riskLevel = ti ? (ti.volatility > 25 ? 'High' : ti.volatility < 15 ? 'Low' : 'Medium') : '';

  if (error) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-8 w-8 text-bearish mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load indicators</p>
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
      <h3 className="text-lg font-semibold text-foreground mb-4">AI Insights & Indicators</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">RSI (14)</div>
          {isLoading ? (
            <Skeleton className="h-7 w-16 mb-1" />
          ) : (
            <div className="text-lg font-bold text-foreground">{ti?.rsi.toFixed(1)}</div>
          )}
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <div className={`text-xs font-medium ${rsiColor}`}>{rsiStatus}</div>
          )}
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">MACD</div>
          {isLoading ? (
            <Skeleton className="h-7 w-16 mb-1" />
          ) : (
            <div className={`text-lg font-bold ${macdColor}`}>
              {ti && ti.macd.histogram >= 0 ? '+' : ''}{ti?.macd.histogram.toFixed(2)}
            </div>
          )}
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <div className={`text-xs font-medium ${macdColor}`}>{macdStatus}</div>
          )}
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">Risk Level</div>
          {isLoading ? (
            <Skeleton className="h-7 w-16 mb-1" />
          ) : (
            <div className="text-lg font-bold text-primary">{riskLevel}</div>
          )}
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <div className="text-xs text-muted-foreground">Volatility: {ti?.volatility.toFixed(1)}%</div>
          )}
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-xs text-muted-foreground mb-1">AI Signal</div>
          {isLoading ? (
            <Skeleton className="h-7 w-12 mb-1" />
          ) : (
            <div className={`text-lg font-bold ${ti && ti.rsi < 70 && ti.rsi > 30 ? 'text-bullish' : 'text-muted-foreground'}`}>
              {ti && ti.rsi < 70 && ti.rsi > 30 ? 'BUY' : 'HOLD'}
            </div>
          )}
          <div className="text-xs text-muted-foreground">Strong consensus</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">SMA (20)</span>
          {isLoading ? (
            <Skeleton className="h-4 w-14" />
          ) : (
            <span className="text-foreground">${ti?.sma20.toFixed(2)}</span>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">SMA (50)</span>
          {isLoading ? (
            <Skeleton className="h-4 w-14" />
          ) : (
            <span className="text-foreground">${ti?.sma50.toFixed(2)}</span>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Bollinger Upper</span>
          {isLoading ? (
            <Skeleton className="h-4 w-14" />
          ) : (
            <span className="text-foreground">${ti?.bollingerUpper.toFixed(2)}</span>
          )}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Bollinger Lower</span>
          {isLoading ? (
            <Skeleton className="h-4 w-14" />
          ) : (
            <span className="text-foreground">${ti?.bollingerLower.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
