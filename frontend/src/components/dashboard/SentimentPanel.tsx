import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useMarketNews, useMarketSentiment } from "@/hooks/useMarketData";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface SentimentPanelProps {
  symbol: string;
}

const SentimentPanel = ({ symbol }: SentimentPanelProps) => {
  const { data: sentiment, isLoading: sentimentLoading, error: sentimentError, refetch: refetchSentiment } = useMarketSentiment(symbol);
  const { data: news, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useMarketNews(symbol);

  const getValues = () => {
    if (sentimentLoading) {
      return { positive: 33, negative: 33, neutral: 34 };
    }
    if (!sentiment) {
      return { positive: 0, negative: 0, neutral: 100 };
    }


    const { score, sentiment: label } = sentiment;
    
    if (label === 'bullish') {
      const intensity = Math.min(Math.abs(score) * 50 + 30, 80);
      return { 
        positive: Math.round(30 + intensity), 
        negative: Math.round((100 - (30 + intensity)) * 0.3), 
        neutral: Math.round(100 - 30 - intensity - (100 - (30 + intensity)) * 0.3) 
      };
    } else if (label === 'bearish') {
      const intensity = Math.min(Math.abs(score) * 50 + 30, 80);
      return { 
        positive: Math.round((100 - (30 + intensity)) * 0.3), 
        negative: Math.round(30 + intensity), 
        neutral: Math.round(100 - 30 - intensity - (100 - (30 + intensity)) * 0.3) 
      };
    }
    
    return { positive: 33, negative: 33, neutral: 34 };
  };

  const { positive, negative, neutral } = getValues();

  const sentimentData = [
    { name: 'Positive', value: positive, color: 'hsl(145, 70%, 50%)' },
    { name: 'Neutral', value: neutral, color: 'hsl(215, 20%, 55%)' },
    { name: 'Negative', value: negative, color: 'hsl(0, 100%, 65%)' },
  ];

  const getSentimentLabel = () => {
    if (!sentiment) return '--';
    if (sentiment.sentiment === 'bullish') return 'Bullish';
    if (sentiment.sentiment === 'bearish') return 'Bearish';
    return 'Neutral';
  };

  if (sentimentError || newsError) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-8 w-8 text-bearish mb-3" />
        <p className="text-muted-foreground mb-3">Failed to load data</p>
        <div className="flex gap-3">
          {sentimentError && (
            <button onClick={() => refetchSentiment()} className="text-sm text-primary hover:underline">
              Retry Sentiment
            </button>
          )}
          {newsError && (
            <button onClick={() => refetchNews()} className="text-sm text-primary hover:underline">
              Retry News
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment Analysis</h3>

      <div className="flex items-center gap-6 mb-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
              >
                {sentimentData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {sentimentLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <div className="text-sm font-semibold text-foreground">
              {getSentimentLabel()}
            </div>
          )}
          {sentimentData.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-muted-foreground">{s.name}</span>
              <span className="text-sm font-semibold text-foreground ml-auto">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <h4 className="text-sm font-semibold text-foreground mb-3">Market Data</h4>
      <div className="space-y-3">
        {newsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-2 h-2 rounded-full mt-1.5" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          : news?.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  item.sentiment === 'bullish' ? 'bg-bullish' : item.sentiment === 'bearish' ? 'bg-bearish' : 'bg-muted-foreground'
                }`} />
                <div className="min-w-0">
                  <p className="text-sm text-foreground leading-tight truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.source} · {item.time}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default SentimentPanel;
