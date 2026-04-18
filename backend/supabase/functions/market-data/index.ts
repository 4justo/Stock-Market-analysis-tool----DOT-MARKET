const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function fetchYahooQuote(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) return null;
  
  const meta = result.meta;
  const quote = result.indicators?.quote?.[0];
  const currentPrice = meta.regularMarketPrice || meta.previousClose;
  const previousClose = meta.chartPreviousClose || meta.previousClose;
  
  return {
    ticker: symbol,
    price: currentPrice,
    open: meta.regularMarketOpen || quote?.open?.[quote.open.length - 1] || currentPrice,
    high: meta.regularMarketDayHigh || quote?.high?.[quote.high.length - 1] || currentPrice,
    low: meta.regularMarketDayLow || quote?.low?.[quote.low.length - 1] || currentPrice,
    previousClose: previousClose,
    change: currentPrice - previousClose,
    changePercent: ((currentPrice - previousClose) / previousClose) * 100,
    volume: meta.regularMarketVolume || 0,
  };
}

async function fetchYahooBatchQuotes(symbols: string[]) {
  const results = [];
  for (const symbol of symbols.slice(0, 10)) {
    try {
      const quote = await fetchYahooQuote(symbol);
      if (quote) {
        results.push(quote);
      }
    } catch (e) {
      console.error(`Failed to fetch ${symbol}:`, e);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

async function fetchYahooCandles(symbol: string, range: string, interval: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}&includePrePost=false`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result || !result.timestamp) return null;

  const quotes = result.indicators.quote[0];
  return result.timestamp.map((ts: number, i: number) => ({
    date: interval === '1d'
      ? new Date(ts * 1000).toISOString().slice(0, 10)
      : new Date(ts * 1000).toISOString(),
    open: quotes.open[i],
    high: quotes.high[i],
    low: quotes.low[i],
    close: quotes.close[i],
    volume: quotes.volume[i],
  })).filter((c: any) => c.open != null && c.close != null);
}

async function fetchStockNews(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=10&enableFuzzyParams=false`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const data = await res.json();
  const news = data?.news || [];
  
  return news.map((item: any) => ({
    title: item.title,
    source: item.publisher || 'Yahoo Finance',
    url: item.link,
    publishedAt: item.publishedTime ? new Date(item.publishedTime * 1000).toISOString() : new Date().toISOString(),
    sentiment: item.thumbnail?.primaryColor === 'green' ? 'bullish' : item.thumbnail?.primaryColor === 'red' ? 'bearish' : 'neutral',
  }));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'quote';
    const symbol = url.searchParams.get('symbol') || 'AAPL';

    switch (endpoint) {
      case 'quote': {
        const quote = await fetchYahooQuote(symbol);
        if (!quote) {
          return jsonResponse({ error: 'No data for symbol', data: null }, 404);
        }
        return jsonResponse({ data: quote, source: 'yahoo' });
      }

      case 'daily': {
        const candles = await fetchYahooCandles(symbol, '1y', '1d');
        if (!candles || candles.length === 0) {
          return jsonResponse({ error: 'No daily data available', data: null, fallback: true });
        }
        return jsonResponse({ data: candles, source: 'yahoo' });
      }

      case 'intraday': {
        const candles = await fetchYahooCandles(symbol, '1d', '5m');
        if (!candles || candles.length === 0) {
          return jsonResponse({ error: 'No intraday data available', data: null, fallback: true });
        }
        return jsonResponse({ data: candles, source: 'yahoo' });
      }

      case 'batch': {
        const symbols = (url.searchParams.get('symbols') || 'AAPL,MSFT,GOOGL').split(',').slice(0, 10);
        const results = await fetchYahooBatchQuotes(symbols);
        return jsonResponse({ data: results, source: 'yahoo' });
      }

      case 'news': {
        const news = await fetchStockNews(symbol);
        return jsonResponse({ data: news, source: 'yahoo' });
      }

      default:
        return jsonResponse({ error: `Unknown endpoint: ${endpoint}` }, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Market data error:', message);
    return jsonResponse({ error: message }, 500);
  }
});
