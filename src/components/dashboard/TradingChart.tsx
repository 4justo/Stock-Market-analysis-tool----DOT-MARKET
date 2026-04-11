import { useState, useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { useDailyCandles, useIntradayCandles } from "@/hooks/useMarketData";
import { generateCandlestickData } from "@/lib/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import { Wifi } from "lucide-react";

const timeFilters = ["1D", "1W", "1M", "3M", "1Y"] as const;

const TradingChart = () => {
  const [activeFilter, setActiveFilter] = useState<string>("3M");
  const [symbol] = useState('AAPL');

  const { data: dailyData, isLoading: dailyLoading } = useDailyCandles(symbol);
  const { data: intradayData, isLoading: intradayLoading } = useIntradayCandles(symbol);

  const isLive = (dailyData && dailyData.length > 0) || (intradayData && intradayData.length > 0);

  const filteredData = useMemo(() => {
    let sourceData: any[];

    if (activeFilter === '1D' && intradayData && intradayData.length > 0) {
      sourceData = intradayData;
    } else if (dailyData && dailyData.length > 0) {
      const sliceDays = { "1D": 1, "1W": 5, "1M": 22, "3M": 66, "1Y": 100 }[activeFilter] || 66;
      sourceData = dailyData.slice(-sliceDays);
    } else {
      // Mock fallback
      const mockDays = { "1D": 1, "1W": 7, "1M": 30, "3M": 90, "1Y": 365 }[activeFilter] || 90;
      const mock = generateCandlestickData(365);
      sourceData = mock.slice(-mockDays);
    }

    return sourceData.map((d: any) => {
      const dateLabel = d.date?.length > 10
        ? new Date(d.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : d.date?.includes('-')
          ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : d.date;

      return {
        ...d,
        dateLabel,
        bodyTop: Math.max(d.open, d.close),
        bodyBottom: Math.min(d.open, d.close),
        bodyHeight: Math.abs(d.close - d.open),
        isUp: d.close >= d.open,
        prediction: +(d.close + (Math.random() - 0.3) * 3).toFixed(2),
      };
    });
  }, [dailyData, intradayData, activeFilter]);

  const isLoading = dailyLoading && intradayLoading;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{symbol} — Apple Inc.</h3>
            {isLive && <Wifi className="h-4 w-4 text-bullish" />}
            {!isLive && !isLoading && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Mock</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isLive ? 'Live market data via Alpha Vantage' : 'Simulated data — API fallback'}
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {timeFilters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-[400px]" />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={filteredData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 20%, 15%)" />
            <XAxis dataKey="dateLabel" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(225, 35%, 10%)',
                border: '1px solid hsl(225, 20%, 18%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 96%)',
              }}
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`,
                name === 'prediction' ? 'AI Prediction' : name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />

            <Bar dataKey="volume" yAxisId="volume" fill="hsl(195, 100%, 50%)" opacity={0.1} />

            <Bar dataKey="bodyHeight" stackId="candle" fill="transparent">
              {filteredData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isUp ? 'hsl(145, 70%, 50%)' : 'hsl(0, 100%, 65%)'}
                  opacity={0.8}
                />
              ))}
            </Bar>

            <Line type="monotone" dataKey="close" stroke="hsl(210, 40%, 96%)" strokeWidth={1.5} dot={false} />
            <Line
              type="monotone"
              dataKey="prediction"
              stroke="hsl(195, 100%, 50%)"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
            />

            <YAxis yAxisId="volume" orientation="right" hide domain={[0, (d: number) => d * 8]} />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-foreground" />
          <span>Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary" style={{ borderBottom: '2px dashed hsl(195, 100%, 50%)' }} />
          <span>AI Prediction</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-bullish/80" />
          <span>Bullish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-bearish/80" />
          <span>Bearish</span>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
