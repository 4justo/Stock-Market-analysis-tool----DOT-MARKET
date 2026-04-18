import { useState, useEffect, useRef, useMemo } from "react";
import { createChart, type IChartApi, type UTCTimestamp } from "lightweight-charts";
import { useDailyCandles, useIntradayCandles, useStockQuote, useAIPrediction, STOCK_NAMES } from "@/hooks/useMarketData";
import { Skeleton } from "@/components/ui/skeleton";
import { Wifi, AlertCircle } from "lucide-react";

const timeFilters = ["5M", "15M", "1H", "4H", "1D", "1W", "1M", "3M", "1Y"] as const;

const intradayTimeFilters = ["5M", "15M", "1H", "4H", "1D"] as const;

const parseDateToTimestamp = (dateStr: string | undefined): UTCTimestamp => {
  if (!dateStr) return Math.floor(Date.now() / 1000) as UTCTimestamp;
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return Math.floor(new Date(dateStr).getTime() / 1000) as UTCTimestamp;
  }
  if (dateStr.includes("T")) {
    return Math.floor(new Date(dateStr).getTime() / 1000) as UTCTimestamp;
  }
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) {
    return Math.floor(Date.now() / 1000) as UTCTimestamp;
  }
  return Math.floor(dt.getTime() / 1000) as UTCTimestamp;
};

interface TradingChartProps {
  symbol: string;
}

const TradingChart = ({ symbol }: TradingChartProps) => {
  const [activeFilter, setActiveFilter] = useState<string>("3M");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const { data: dailyData, isLoading: dailyLoading, error: dailyError, refetch: refetchDaily } = useDailyCandles(symbol);
  const { data: intradayData, isLoading: intradayLoading, error: intradayError, refetch: refetchIntraday } = useIntradayCandles(symbol);
  const { data: quote } = useStockQuote(symbol);
  const currentPrice = quote?.price ?? 0;
  const { data: aiPrediction, error: aiError } = useAIPrediction(symbol, currentPrice);

  const isIntraday = intradayTimeFilters.includes(activeFilter as typeof intradayTimeFilters[number]);
  const hasData = (dailyData && dailyData.length > 0) || (intradayData && intradayData.length > 0);
  const hasError = dailyError || intradayError || aiError;

  const chartData = useMemo(() => {
    let sourceData: { date?: string; open: number; high: number; low: number; close: number; volume: number }[] = [];

    if (isIntraday && intradayData && intradayData.length > 0) {
      sourceData = intradayData;
    } else if (dailyData && dailyData.length > 0) {
      const sliceDays = { "1W": 5, "1M": 22, "3M": 66, "1Y": 252 }[activeFilter] || 66;
      sourceData = dailyData.slice(-sliceDays);
    }

    // Map to candle format
    const candles = sourceData.map((d) => ({
      time: parseDateToTimestamp(d.date),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candles.sort((a, b) => Number(a.time) - Number(b.time));

    // Get actual prices from data
    const lastClose = candles.length > 0 ? candles[candles.length - 1].close : (currentPrice || 270);
    const predictedPrice = aiPrediction?.predictedPrice ?? lastClose;
    
    // Prediction line - 5 days only with star at end
    const predictions: { time: UTCTimestamp; value: number }[] = [];
    const predictionStars: { time: UTCTimestamp; value: number }[] = [];
    
    if (candles.length > 0 && predictedPrice !== lastClose) {
      const stepSec = 86400;
      const lastTime = candles[candles.length - 1].time;
      const predictionDays = 5;
      
      // Start from last close
      predictions.push({ time: lastTime, value: lastClose });
      
      // Draw sloped line to predicted price over 5 days
      for (let j = 1; j <= predictionDays; j++) {
        const time = (Number(lastTime) + stepSec * j) as UTCTimestamp;
        const progress = j / predictionDays;
        const value = lastClose + (predictedPrice - lastClose) * progress;
        
        predictions.push({
          time: time,
          value: Number(value.toFixed(2)),
        });
      }
      
      // Star at the predicted end point
      predictionStars.push({
        time: (Number(lastTime) + stepSec * predictionDays) as UTCTimestamp,
        value: predictedPrice
      });
    }

    const volumes = sourceData.map((d, i) => ({
      time: candles[i].time,
      value: d.volume,
      color: d.close >= d.open ? "rgba(38, 198, 118, 0.5)" : "rgba(255, 75, 75, 0.5)",
    }));

    return { candles, predictions, predictionStars, volumes };
  }, [dailyData, intradayData, activeFilter, isIntraday, aiPrediction, currentPrice]);

  const isLoading = dailyLoading || intradayLoading;

  useEffect(() => {
    if (!chartContainerRef.current || isLoading) return;
    if (chartData.candles.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "transparent" },
        textColor: "#7a8599",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: "#2d3748",
      },
      timeScale: {
        borderColor: "#2d3748",
        timeVisible: isIntraday,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26c676",
      downColor: "#ff4b4b",
      borderUpColor: "#26c676",
      borderDownColor: "#ff4b4b",
      wickUpColor: "#26c676",
      wickDownColor: "#ff4b4b",
    });
    candleSeries.setData(chartData.candles);

    const predictionSeries = chart.addLineSeries({
      color: "#00bfff",
      lineWidth: 2,
      lineStyle: 2,
      crosshairMarkerVisible: false,
    });
    predictionSeries.setData(chartData.predictions);

    // Star markers at predicted end point
    if (chartData.predictionStars && chartData.predictionStars.length > 0) {
      const lastPred = chartData.predictionStars[chartData.predictionStars.length - 1];
      predictionSeries.setMarkers([
        {
          time: lastPred.time,
          position: 'aboveBar',
          shape: 'star',
          text: `$${lastPred.value.toFixed(2)}`,
          color: '#00bfff',
          size: 14,
        },
      ]);
    }

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    volumeSeries.setData(chartData.volumes);
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    });
    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [chartData, isLoading, isIntraday]);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {symbol} — {STOCK_NAMES[symbol] || symbol}
            </h3>
            {hasData && <Wifi className="h-4 w-4 text-bullish" />}
          </div>
          <p className="text-sm text-muted-foreground">
            {hasData ? "Live market data via Yahoo Finance" : "Loading market data..."}
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
      ) : hasError ? (
        <div className="w-full h-[400px] flex flex-col items-center justify-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mb-4 text-bearish" />
          <p>Failed to load chart data</p>
          <button
            onClick={() => { refetchDaily(); refetchIntraday(); }}
            className="text-sm text-primary hover:underline mt-2"
          >
            Retry
          </button>
        </div>
      ) : !hasData ? (
        <div className="w-full h-[400px] flex flex-col items-center justify-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
          <p>No data available for {symbol}</p>
          <p className="text-sm">Check your connection or try another symbol</p>
        </div>
      ) : (
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      )}

      {hasData && (
        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-bullish/80" />
            <span>Bullish</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-bearish/80" />
            <span>Bearish</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-0.5"
              style={{ borderBottom: "2px dashed hsl(195, 100%, 50%)" }}
            />
            <span>AI Prediction</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingChart;
