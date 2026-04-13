const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('FINNHUB_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'FINNHUB_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'quote';
    const symbol = url.searchParams.get('symbol') || 'AAPL';

    switch (endpoint) {
      case 'quote': {
        const res = await fetch(`${FINNHUB_BASE}/quote?symbol=${symbol}&token=${apiKey}`);
        const q = await res.json();
        if (!q || q.c === 0) {
          return jsonResponse({ error: 'No data for symbol', data: null }, 404);
        }
        return jsonResponse({
          data: {
            ticker: symbol,
            price: q.c,
            open: q.o,
            high: q.h,
            low: q.l,
            previousClose: q.pc,
            change: q.d,
            changePercent: q.dp,
            volume: 0, // quote endpoint doesn't include volume
          },
          source: 'finnhub',
        });
      }

      case 'daily': {
        const now = Math.floor(Date.now() / 1000);
        const from = now - 365 * 86400;
        const res = await fetch(
          `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${now}&token=${apiKey}`
        );
        const data = await res.json();
        console.log('Finnhub candle response status:', data.s, 'keys:', Object.keys(data));
        if (data.s !== 'ok' || !data.t) {
          console.log('Finnhub candle raw:', JSON.stringify(data).slice(0, 500));
          return jsonResponse({ error: 'No daily data available', data: null, fallback: true });
        }
        const candles = data.t.map((timestamp: number, i: number) => ({
          date: new Date(timestamp * 1000).toISOString().slice(0, 10),
          open: data.o[i],
          high: data.h[i],
          low: data.l[i],
          close: data.c[i],
          volume: data.v[i],
        }));
        return jsonResponse({ data: candles, source: 'finnhub' });
      }

      case 'intraday': {
        const now = Math.floor(Date.now() / 1000);
        const from = now - 86400; // last 24h
        const res = await fetch(
          `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=5&from=${from}&to=${now}&token=${apiKey}`
        );
        const data = await res.json();
        if (data.s !== 'ok' || !data.t) {
          return jsonResponse({ error: 'No intraday data available', data: null, fallback: true });
        }
        const candles = data.t.map((timestamp: number, i: number) => ({
          date: new Date(timestamp * 1000).toISOString(),
          open: data.o[i],
          high: data.h[i],
          low: data.l[i],
          close: data.c[i],
          volume: data.v[i],
        }));
        return jsonResponse({ data: candles, source: 'finnhub' });
      }

      case 'batch': {
        const symbols = (url.searchParams.get('symbols') || 'AAPL,MSFT,GOOGL').split(',').slice(0, 10);
        const results = [];
        for (const sym of symbols) {
          const s = sym.trim();
          const res = await fetch(`${FINNHUB_BASE}/quote?symbol=${s}&token=${apiKey}`);
          const q = await res.json();
          if (q && q.c !== 0) {
            results.push({
              ticker: s,
              price: q.c,
              change: q.dp,
              volume: 0,
              high: q.h,
              low: q.l,
              open: q.o,
              previousClose: q.pc,
            });
          }
          await new Promise(r => setTimeout(r, 100));
        }
        return jsonResponse({ data: results, source: 'finnhub' });
      }

      default:
        return jsonResponse({ error: `Unknown endpoint: ${endpoint}` }, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Market data error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
