export const generateCandlestickData = (days: number = 90) => {
  const data = [];
  let price = 182.40;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    const open = price + (Math.random() - 0.48) * 3;
    const close = open + (Math.random() - 0.45) * 4;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    const volume = Math.floor(50000000 + Math.random() * 30000000);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date,
      open: +open.toFixed(2),
      close: +close.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      volume,
      prediction: +(close + (Math.random() - 0.3) * 5).toFixed(2),
    });
    price = close;
  }
  return data;
};

export const topStocks = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 182.40, predicted: 186.80, confidence: 94, trend: 'bullish' as const, change: 2.41 },
  { ticker: 'MSFT', name: 'Microsoft', price: 378.91, predicted: 385.20, confidence: 91, trend: 'bullish' as const, change: 1.66 },
  { ticker: 'GOOGL', name: 'Alphabet', price: 141.80, predicted: 145.30, confidence: 88, trend: 'bullish' as const, change: 2.47 },
  { ticker: 'NVDA', name: 'NVIDIA', price: 495.22, predicted: 510.40, confidence: 92, trend: 'bullish' as const, change: 3.06 },
  { ticker: 'TSLA', name: 'Tesla', price: 248.42, predicted: 242.10, confidence: 76, trend: 'bearish' as const, change: -2.54 },
  { ticker: 'META', name: 'Meta', price: 356.20, predicted: 362.80, confidence: 85, trend: 'bullish' as const, change: 1.85 },
  { ticker: 'AMZN', name: 'Amazon', price: 178.25, predicted: 183.50, confidence: 89, trend: 'bullish' as const, change: 2.94 },
  { ticker: 'JPM', name: 'JPMorgan', price: 172.85, predicted: 168.40, confidence: 72, trend: 'bearish' as const, change: -2.57 },
];

export const sentimentData = [
  { name: 'Positive', value: 58, color: 'hsl(145, 70%, 50%)' },
  { name: 'Neutral', value: 27, color: 'hsl(215, 20%, 55%)' },
  { name: 'Negative', value: 15, color: 'hsl(0, 100%, 65%)' },
];

export const portfolioHoldings = [
  { ticker: 'AAPL', shares: 150, avgCost: 165.20, currentPrice: 182.40, predicted: 186.80, allocation: 28 },
  { ticker: 'MSFT', shares: 80, avgCost: 340.50, currentPrice: 378.91, predicted: 385.20, allocation: 22 },
  { ticker: 'GOOGL', shares: 200, avgCost: 125.80, currentPrice: 141.80, predicted: 145.30, allocation: 18 },
  { ticker: 'NVDA', shares: 45, avgCost: 420.00, currentPrice: 495.22, predicted: 510.40, allocation: 16 },
  { ticker: 'AMZN', shares: 100, avgCost: 155.30, currentPrice: 178.25, predicted: 183.50, allocation: 16 },
];

export const marketIndices = [
  { name: 'S&P 500', value: 4783.35, change: 1.23, ticker: 'SPX' },
  { name: 'NASDAQ', value: 15055.65, change: 1.58, ticker: 'IXIC' },
  { name: 'DOW', value: 37440.34, change: 0.87, ticker: 'DJI' },
  { name: 'Russell 2000', value: 2012.75, change: -0.42, ticker: 'RUT' },
];

export const sectorPerformance = [
  { name: 'Technology', change: 2.4 },
  { name: 'Healthcare', change: 1.1 },
  { name: 'Finance', change: 0.8 },
  { name: 'Energy', change: -1.2 },
  { name: 'Consumer', change: 1.5 },
  { name: 'Industrial', change: 0.3 },
  { name: 'Real Estate', change: -0.6 },
  { name: 'Utilities', change: 0.1 },
];

export const newsItems = [
  { title: 'Fed signals potential rate cuts in early 2025', sentiment: 'bullish' as const, time: '2h ago', source: 'Reuters' },
  { title: 'NVIDIA announces next-gen AI chips', sentiment: 'bullish' as const, time: '4h ago', source: 'Bloomberg' },
  { title: 'Oil prices surge amid Middle East tensions', sentiment: 'bearish' as const, time: '5h ago', source: 'CNBC' },
  { title: 'Apple Vision Pro sales exceed expectations', sentiment: 'bullish' as const, time: '6h ago', source: 'WSJ' },
  { title: 'Inflation data comes in below forecast', sentiment: 'bullish' as const, time: '8h ago', source: 'FT' },
];

export const technicalIndicators = {
  rsi: 62.4,
  macd: { value: 2.34, signal: 1.89, histogram: 0.45 },
  sma20: 178.50,
  sma50: 175.20,
  ema12: 180.10,
  bollingerUpper: 190.20,
  bollingerLower: 174.60,
  volatility: 18.5,
  volume24h: 82500000,
  avgVolume: 75000000,
};
