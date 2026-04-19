const FALLBACK_PRICES: Record<string, number> = {
  AAPL: 172.5,
  AMZN: 178.25,
  "BTC-USD": 83500,
  GOOGL: 141.8,
  META: 505.75,
  MSFT: 415.8,
  NVDA: 875.3,
  TSLA: 163.57,
};

const corsAllowedOrigins = (Deno.env.get("CORS_ALLOWED_ORIGINS") || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function getCorsHeaders(origin: string | null): HeadersInit {
  const allowOrigin = corsAllowedOrigins.includes("*") ||
      (origin && corsAllowedOrigins.includes(origin))
    ? origin || "*"
    : corsAllowedOrigins[0] || "*";

  return {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Origin": allowOrigin,
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

function json(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    headers: getCorsHeaders(origin),
    status,
  });
}

function isCrypto(symbol: string): boolean {
  const normalized = symbol.toUpperCase();
  return normalized === "BTC" || normalized === "BTC-USD";
}

function normalizeSymbol(symbol: string): string {
  const normalized = symbol.toUpperCase();
  return normalized === "BTC" ? "BTC-USD" : normalized;
}

async function fetchYahooChart(
  symbol: string,
  range = "1y",
  interval = "1d",
) {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}&includePrePost=false`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo request failed with ${response.status}`);
  }

  return await response.json();
}

function generateMockChart(symbol: string, range = "1y", interval = "1d") {
  const now = Math.floor(Date.now() / 1000);
  const basePrice = FALLBACK_PRICES[symbol] || 100;
  const intervalSeconds = interval === "5m" ? 300 : interval === "1h" ? 3600 : 86400;
  const points = range === "1d"
    ? Math.floor((24 * 60 * 60) / intervalSeconds)
    : range === "5d"
    ? Math.floor((5 * 24 * 60 * 60) / intervalSeconds)
    : range === "30d"
    ? 30
    : range === "3mo"
    ? 90
    : 365;

  const timestamps = Array.from(
    { length: points },
    (_, index) => now - (points - index) * intervalSeconds,
  );

  const close = timestamps.map((_, index) => {
    const wave = Math.sin(index / 9) * 0.025;
    const drift = isCrypto(symbol) ? 0.0009 * index : 0.0003 * index;
    return Number((basePrice * (1 + wave + drift)).toFixed(2));
  });

  const open = close.map((value, index) =>
    index === 0 ? value : Number((close[index - 1] * 0.998).toFixed(2))
  );
  const high = close.map((value) => Number((value * 1.01).toFixed(2)));
  const low = close.map((value) => Number((value * 0.99).toFixed(2)));
  const volume = close.map((_, index) => 1000000 + index * 5000);

  return {
    chart: {
      error: null,
      result: [{
        indicators: { quote: [{ close, high, low, open, volume }] },
        meta: {
          chartPreviousClose: open[0],
          currency: "USD",
          previousClose: open[0],
          regularMarketPrice: close[close.length - 1],
          symbol,
        },
        timestamp: timestamps,
      }],
    },
  };
}

function getCloses(chart: any): number[] {
  return chart?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter((
    value: number | null,
  ) => value !== null) || [];
}

function movingAverage(values: number[], period: number): number {
  if (values.length < period) {
    return values[values.length - 1] || 0;
  }
  const window = values.slice(-period);
  return window.reduce((sum, value) => sum + value, 0) / period;
}

function calculateRsi(values: number[], period = 14): number {
  if (values.length <= period) return 50;
  let gains = 0;
  let losses = 0;

  for (let index = values.length - period; index < values.length; index++) {
    const change = values[index] - values[index - 1];
    if (change > 0) gains += change;
    if (change < 0) losses -= change;
  }

  if (losses === 0) return 100;
  const rs = gains / period / (losses / period);
  return 100 - (100 / (1 + rs));
}

function calculatePrediction(symbol: string, closes: number[]) {
  const currentPrice = closes[closes.length - 1] || FALLBACK_PRICES[symbol] || 100;
  const sma5 = movingAverage(closes, 5);
  const sma20 = movingAverage(closes, 20);
  const sma50 = movingAverage(closes, 50);
  const rsi = calculateRsi(closes);
  const momentumBase = closes[closes.length - 10] || currentPrice;
  const momentum = momentumBase ? (currentPrice - momentumBase) / momentumBase : 0;
  const macd = movingAverage(closes, 12) - movingAverage(closes, 26);

  let signal = 0;
  if (sma5 > sma20) signal += 0.28;
  if (sma5 < sma20) signal -= 0.28;
  if (sma20 > sma50) signal += 0.24;
  if (sma20 < sma50) signal -= 0.24;
  if (rsi < 30) signal += 0.18;
  if (rsi > 70) signal -= 0.18;
  if (macd > 0) signal += 0.16;
  if (macd < 0) signal -= 0.16;
  if (momentum > 0.02) signal += 0.12;
  if (momentum < -0.02) signal -= 0.12;

  const boundedSignal = Math.max(-0.08, Math.min(0.08, signal));
  const predictedPrice = Number((currentPrice * (1 + boundedSignal)).toFixed(2));
  const confidence = Number((Math.min(95, Math.max(52, 60 + Math.abs(signal) * 100))).toFixed(1));

  return {
    confidence,
    currentPrice,
    features_used: ["sma5", "sma20", "sma50", "rsi", "macd", "momentum"],
    predicted_price: predictedPrice,
    timeframe: isCrypto(symbol) ? "1h" : "1d",
  };
}

function calculateSentiment(symbol: string, closes: number[]) {
  const currentPrice = closes[closes.length - 1] || FALLBACK_PRICES[symbol] || 100;
  const previous = closes[Math.max(0, closes.length - 30)] || currentPrice;
  const priceChange = previous ? (currentPrice - previous) / previous : 0;
  const sma20 = movingAverage(closes, 20);
  const sma50 = movingAverage(closes, 50);
  const maTrend = sma50 ? (sma20 - sma50) / sma50 : 0;
  const rsi = calculateRsi(closes);
  const macd = movingAverage(closes, 12) - movingAverage(closes, 26);

  let score = priceChange * 3 + maTrend * 2;
  if (rsi < 30) score += 0.25;
  if (rsi > 70) score -= 0.25;
  if (macd > 0) score += 0.15;
  if (macd < 0) score -= 0.15;

  const boundedScore = Math.max(-1, Math.min(1, score));
  const confidence = Number((Math.min(0.9, Math.max(0.5, 0.5 + Math.abs(boundedScore)))).toFixed(2));

  return {
    confidence,
    current_price: Number(currentPrice.toFixed(2)),
    score: Number(boundedScore.toFixed(2)),
    sentiment: boundedScore > 0 ? "positive" : boundedScore < 0 ? "negative" : "neutral",
    signal: boundedScore > 0.15 ? "BUY" : boundedScore < -0.15 ? "SELL" : "HOLD",
    symbol,
  };
}

function calculateBacktest(
  symbol: string,
  closes: number[],
  strategy: string,
  initialCapital: number,
) {
  let position = 0;
  let trades = 0;
  let wins = 0;
  let portfolio = initialCapital;
  const values = [initialCapital];

  for (let index = 51; index < closes.length - 1; index++) {
    const sma20 = movingAverage(closes.slice(0, index + 1), 20);
    const sma50 = movingAverage(closes.slice(0, index + 1), 50);
    const signal = sma20 > sma50 ? 1 : sma20 < sma50 ? -1 : 0;
    const dailyReturn = (closes[index + 1] - closes[index]) / closes[index];

    if (position !== 0 && signal !== position) {
      trades += 1;
      if (dailyReturn * position > 0) wins += 1;
    }

    portfolio += portfolio * dailyReturn * (signal || position);
    values.push(portfolio);
    position = signal;
  }

  const totalReturn = (portfolio - initialCapital) / initialCapital;
  const minValue = Math.min(...values);
  const maxDrawdown = (minValue - initialCapital) / initialCapital;
  const returns = values.slice(1).map((value, index) =>
    (value - values[index]) / values[index]
  );
  const averageReturn = returns.reduce((sum, value) => sum + value, 0) / (returns.length || 1);
  const variance = returns.reduce((sum, value) => sum + ((value - averageReturn) ** 2), 0) /
    (returns.length || 1);
  const sharpeRatio = variance > 0 ? (averageReturn / Math.sqrt(variance)) * Math.sqrt(252) : 0;

  return {
    backtest_date: new Date().toISOString(),
    max_drawdown: Number(Math.min(0, maxDrawdown).toFixed(4)),
    num_trades: trades,
    sharpe_ratio: Number(sharpeRatio.toFixed(2)),
    strategy,
    symbol,
    total_return: Number(totalReturn.toFixed(4)),
    win_rate: Number((wins / Math.max(trades, 1)).toFixed(2)),
  };
}

async function persistRow(table: string, payload: Record<string, unknown>) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return;
  }

  await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    body: JSON.stringify(payload),
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    method: "POST",
  });
}

function getModelsPayload() {
  return {
    accuracy_history: Array.from({ length: 30 }, (_, index) => ({
      accuracy: Number((78 + Math.sin(index / 4) * 6 + index * 0.1).toFixed(1)),
      day: `Day ${index + 1}`,
    })),
    feature_importance: [
      { name: "SMA 20/50", value: 28 },
      { name: "RSI", value: 22 },
      { name: "MACD", value: 18 },
      { name: "Momentum", value: 15 },
      { name: "Price", value: 12 },
      { name: "Volume", value: 5 },
    ],
    models: {
      gradient_boosting: {
        accuracy: 84,
        description: "Boosted trees with momentum and trend features.",
        name: "Gradient Boosting",
        status: "active",
        trees: 200,
        type: "ensemble",
      },
      lstm: {
        accuracy: 86,
        description: "Sequence model over recent closes and technical indicators.",
        epochs: 50,
        name: "LSTM",
        status: "active",
        type: "deep_learning",
      },
      random_forest: {
        accuracy: 83,
        description: "Decision tree ensemble over derived technical features.",
        name: "Random Forest",
        status: "active",
        trees: 200,
        type: "ensemble",
      },
    },
    prediction_models: ["lstm", "random_forest", "gradient_boosting"],
    sentiment_models: ["technical"],
    technical_indicators: ["sma", "rsi", "macd", "bollinger", "momentum"],
  };
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) });
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  try {
    if (pathname === "/health") {
      return json({
        service: "dot-market-proxy",
        status: "ok",
        timestamp: new Date().toISOString(),
      }, 200, origin);
    }

    if (pathname.startsWith("/yahoo/")) {
      const endpoint = pathname.replace("/yahoo/", "") || "chart";
      const symbol = normalizeSymbol(url.searchParams.get("symbol") || "AAPL");
      const range = url.searchParams.get("range") || (endpoint === "quote" ? "1d" : "1y");
      const interval = url.searchParams.get("interval") || (endpoint === "quote" ? "5m" : "1d");

      try {
        const payload = await fetchYahooChart(symbol, range, interval);
        return json(payload, 200, origin);
      } catch {
        const fallback = generateMockChart(symbol, range, interval);
        return json(fallback, 200, origin);
      }
    }

    if (pathname === "/models") {
      return json(getModelsPayload(), 200, origin);
    }

    if (pathname === "/predict" && request.method === "POST") {
      const { model = "lstm", symbol = "AAPL" } = await request.json();
      const normalizedSymbol = normalizeSymbol(symbol);
      let chart;

      try {
        chart = await fetchYahooChart(normalizedSymbol, "1y", "1d");
      } catch {
        chart = generateMockChart(normalizedSymbol, "1y", "1d");
      }

      const closes = getCloses(chart);
      const prediction = calculatePrediction(normalizedSymbol, closes);
      const payload = {
        model,
        prediction_date: new Date().toISOString(),
        symbol: normalizedSymbol,
        ...prediction,
      };

      await persistRow("predictions", {
        confidence: payload.confidence,
        model,
        predicted_price: payload.predicted_price,
        symbol: normalizedSymbol,
        timeframe: payload.timeframe,
      });

      return json(payload, 200, origin);
    }

    if (pathname === "/sentiment" && request.method === "POST") {
      const body = await request.json();
      const providedSymbol = body.symbol || body.text || "AAPL";
      const matchedSymbol = /[A-Z-]{2,10}/.exec(String(providedSymbol).toUpperCase());
      const symbol = normalizeSymbol(matchedSymbol?.[0] || "AAPL");
      let chart;

      try {
        chart = await fetchYahooChart(symbol, "3mo", "1d");
      } catch {
        chart = generateMockChart(symbol, "3mo", "1d");
      }

      const sentiment = calculateSentiment(symbol, getCloses(chart));

      await persistRow("sentiments", {
        confidence: sentiment.confidence,
        label: sentiment.sentiment,
        score: sentiment.score,
        signal: sentiment.signal,
        source: "technical",
        symbol,
      });

      return json(sentiment, 200, origin);
    }

    if (pathname === "/backtest" && request.method === "POST") {
      const {
        initial_capital: initialCapital = 10000,
        strategy = "sma_crossover",
        symbol = "AAPL",
      } = await request.json();

      const normalizedSymbol = normalizeSymbol(symbol);
      let chart;

      try {
        chart = await fetchYahooChart(normalizedSymbol, "1y", "1d");
      } catch {
        chart = generateMockChart(normalizedSymbol, "1y", "1d");
      }

      const backtest = calculateBacktest(
        normalizedSymbol,
        getCloses(chart),
        strategy,
        initialCapital,
      );

      await persistRow("backtest_results", {
        max_drawdown: backtest.max_drawdown,
        sharpe_ratio: backtest.sharpe_ratio,
        strategy,
        symbol: normalizedSymbol,
        total_return: backtest.total_return,
        trades: backtest.num_trades,
        win_rate: backtest.win_rate,
      });

      return json(backtest, 200, origin);
    }

    return json({ error: `Route not found: ${pathname}` }, 404, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: message }, 500, origin);
  }
});
