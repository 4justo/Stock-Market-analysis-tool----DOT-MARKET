import { useMetrics } from "@/hooks/useMarketData";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface PredictionGaugeProps {
  symbol: string;
}

const PredictionGauge = ({ symbol }: PredictionGaugeProps) => {
  const { data: metrics, isLoading, error, refetch } = useMetrics(symbol);
  
  const confidence = metrics?.confidence ?? 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(confidence, 100) / 100) * circumference;

  const trendLabel = metrics?.trend === 'bullish' ? '▲ Bullish' : '▼ Bearish';
  const trendColor = metrics?.trend === 'bullish' ? 'text-bullish' : 'text-bearish';
  const signalLabel = metrics?.trend === 'bullish' ? 'BUY' : 'SELL';
  const signalBg = metrics?.trend === 'bullish' ? 'bg-bullish/20 text-bullish' : 'bg-bearish/20 text-bearish';

  const getConfidenceColor = (conf: number) => {
    if (conf >= 70) return 'hsl(145, 70%, 50%)';
    if (conf >= 50) return 'hsl(45, 100%, 50%)';
    return 'hsl(0, 100%, 65%)';
  };

  if (error) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-8 w-8 text-bearish mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load prediction</p>
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
      <h3 className="text-lg font-semibold text-foreground mb-4">AI Prediction</h3>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="hsl(225, 25%, 15%)"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={getConfidenceColor(confidence)}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-3xl font-bold text-foreground">{confidence.toFixed(0)}%</span>
            )}
            <span className="text-xs text-muted-foreground">Confidence</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Trend Direction</span>
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span className={`text-sm font-semibold ${trendColor}`}>{trendLabel}</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Signal</span>
          {isLoading ? (
            <Skeleton className="h-5 w-10" />
          ) : (
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${signalBg}`}>{signalLabel}</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Model</span>
          <span className="text-sm text-foreground">LSTM Neural Network</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Target Price</span>
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span className="text-sm font-semibold text-foreground">
              ${metrics?.predictedPrice != null ? metrics.predictedPrice.toFixed(2) : '--'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionGauge;
