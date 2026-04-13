import { DollarSign, TrendingUp, Target, BarChart3, Wifi, WifiOff } from "lucide-react";
import { useMetrics } from "@/hooks/useMarketData";
import { Skeleton } from "@/components/ui/skeleton";

const MetricsCards = () => {
  const { data, isLoading } = useMetrics('AAPL');

  const metrics = [
    {
      label: "Current Price",
      value: data ? `$${data.currentPrice.toFixed(2)}` : '--',
      change: data ? `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%` : '',
      positive: data ? data.changePercent >= 0 : true,
      icon: DollarSign,
      sub: data?.ticker || 'AAPL',
    },
    {
      label: "Predicted Price",
      value: data ? `$${data.predictedPrice.toFixed(2)}` : '--',
      change: data ? `${((data.predictedPrice - data.currentPrice) / data.currentPrice * 100).toFixed(2)}%` : '',
      positive: data ? data.predictedPrice >= data.currentPrice : true,
      icon: TrendingUp,
      sub: "24h forecast",
    },
    {
      label: "Prediction Confidence",
      value: data ? `${data.confidence}%` : '--',
      change: data ? (data.confidence >= 85 ? 'High' : 'Moderate') : '',
      positive: data ? data.confidence >= 85 : true,
      icon: Target,
      sub: "Model accuracy",
    },
    {
      label: "Market Sentiment",
      value: data ? (data.trend === 'bullish' ? 'Bullish' : 'Bearish') : '--',
      change: data ? `${data.confidence}% confidence` : '',
      positive: data ? data.trend === 'bullish' : true,
      icon: BarChart3,
      sub: "AI analysis",
    },
  ];

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
