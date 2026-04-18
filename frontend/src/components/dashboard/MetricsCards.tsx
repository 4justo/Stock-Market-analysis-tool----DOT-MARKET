import { DollarSign, TrendingUp, Target, BarChart3, Wifi, AlertCircle } from "lucide-react";
import { useMetrics } from "@/hooks/useMarketData";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsCardsProps {
  symbol: string;
}

const MetricsCards = ({ symbol }: MetricsCardsProps) => {
  const { data, isLoading, error, refetch } = useMetrics(symbol);

  const getSentimentLabel = (sentiment: string | undefined) => {
    if (!sentiment) return '--';
    if (sentiment === 'bullish') return 'Bullish';
    if (sentiment === 'bearish') return 'Bearish';
    return 'Neutral';
  };

  const getSentimentChange = (sentiment: string | undefined, score: number | undefined) => {
    if (!sentiment || score === undefined) return '';
    const sign = score >= 0 ? '+' : '';
    return `${sign}${(score * 100).toFixed(0)}%`;
  };

  const metrics = [
    {
      label: "Current Price",
      value: data ? `$${data.currentPrice.toFixed(2)}` : '--',
      change: data ? `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%` : '',
      positive: data ? data.changePercent >= 0 : true,
      icon: DollarSign,
      sub: data?.ticker || symbol,
    },
    {
      label: "Predicted Price",
      value: data ? `$${data.predictedPrice.toFixed(2)}` : '--',
      change: data ? `${((data.predictedPrice - data.currentPrice) / data.currentPrice * 100).toFixed(2)}%` : '',
      positive: data ? data.predictedPrice >= data.currentPrice : true,
      icon: TrendingUp,
      sub: "AI forecast",
    },
    {
      label: "Prediction Confidence",
      value: data ? `${data.confidence.toFixed(1)}%` : '--',
      change: data ? (data.confidence >= 70 ? 'High' : data.confidence >= 50 ? 'Moderate' : 'Low') : '',
      positive: data ? data.confidence >= 50 : true,
      icon: Target,
      sub: "LSTM model",
    },
    {
      label: "Market Sentiment",
      value: data ? getSentimentLabel(data.sentiment) : '--',
      change: data ? getSentimentChange(data.sentiment, data.sentimentScore) : '',
      positive: data ? data.sentiment === 'bullish' : true,
      icon: BarChart3,
      sub: "AI analysis",
    },
  ];

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 col-span-full flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-bearish mb-3" />
          <p className="text-muted-foreground mb-3">Failed to load metrics</p>
          <button
            onClick={() => refetch()}
            className="text-sm text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{m.label}</span>
            <div className="flex items-center gap-2">
              {data?.isLive && (
                <Wifi className="h-3 w-3 text-bullish" />
              )}
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <m.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mb-1" />
          ) : (
            <div className="text-2xl font-bold text-foreground mb-1">{m.value}</div>
          )}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${m.positive ? 'text-bullish' : 'text-bearish'}`}>
              {m.change}
            </span>
            <span className="text-xs text-muted-foreground">{m.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
