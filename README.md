# DOT-MARKET | AI-Powered Stock Market Predictions

An AI-powered stock market prediction platform with real-time market data, machine learning predictions, and interactive trading charts.

![DOT-MARKET](https://via.placeholder.com/800x400/1e293b/ffffff?text=DOT-MARKET+AI)

## Features

- **Real-time Market Data** - Live stock prices from Yahoo Finance
- **AI-Powered Predictions** - LSTM and Random Forest models for price forecasting
- **Interactive Charts** - Candlestick charts with prediction lines
- **Stock Selector** - Major stocks: AAPL, MSFT, GOOGL, NVDA, TSLA, META, AMZN, BTC-USD
- **Sentiment Analysis** - Technical-based trading signals (BUY/SELL/HOLD)
- **Portfolio Management** - Track and analyze investments
- **Backtesting** - Test trading strategies against historical data
- **AI Insights** - Model accuracy and feature importance
- **Responsive Design** - Works on desktop and mobile

## Quick Start

### Prerequisites

- **Node.js 18+** - [Install](https://nodejs.org/)
- **Bun** (recommended) - `curl -fsSL https://bun.sh/install | bash`
- **PostgreSQL** - For user data (optional)

### 1. Install Dependencies

```bash
# Frontend
cd frontend
bun install

# Backend
cd ../backend
npm install
```

### 2. Start Services

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
# Runs on: http://localhost:3000
```

**Terminal 2 - Frontend**
```bash
cd frontend
bun run dev
# Runs on: http://localhost:5173 (or 8080)
```

### 3. Open Browser

Navigate to `http://localhost:5173`

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                 │
│              http://localhost:5173 (Dev)                   │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express + Node)                  │
│                   http://localhost:3000                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │   /health   │ │  /predict   │ │  /sentiment         │  │
│  │  Health    │ │AI Predictions│ │ Trading Signals    │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
│                             │                             │
│                             ▼                             │
│                    Yahoo Finance API                      │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **TanStack Query** - Data fetching
- **Lightweight Charts** - Trading charts
- **Recharts** - Data visualization

### Backend
- **Express.js** - Web server
- **Node.js** - Runtime
- **Yahoo Finance API** - Market data

## API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```
Response: `{"status":"ok","timestamp":"2026-04-18T..."}`

### Price Prediction
```bash
curl -X POST http://localhost:3000/predict \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "model": "lstm"}'
```
Response:
```json
{
  "symbol": "AAPL",
  "model": "lstm",
  "predicted_price": 179.40,
  "confidence": 58.0,
  "timeframe": "1d",
  "features_used": ["sma5", "sma20", "sma50", "rsi", "macd", "momentum"]
}
```

### Sentiment / Trading Signal
```bash
curl -X POST http://localhost:3000/sentiment \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL"}'
```
Response:
```json
{
  "sentiment": "positive",
  "score": 0.15,
  "confidence": 0.65,
  "signal": "BUY",
  "current_price": 172.50,
  "symbol": "AAPL"
}
```

### Backtesting
```bash
curl -X POST http://localhost:3000/backtest \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "strategy": "sma_crossover"}'
```
Response:
```json
{
  "symbol": "AAPL",
  "strategy": "sma_crossover",
  "total_return": 0.1008,
  "max_drawdown": -0.1534,
  "sharpe_ratio": 0.03,
  "num_trades": 12,
  "win_rate": 0.50,
  "backtest_date": "2026-04-18T..."
}
```

## Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/dashboard` | Main overview with charts |
| Market | `/market` | Indices and sector performance |
| Predictions | `/predictions` | AI price predictions |
| Portfolio | `/portfolio` | Investment tracking |
| AI Insights | `/insights` | Model accuracy & features |
| Backtesting | `/backtesting` | Strategy testing |
| Settings | `/settings` | User configuration |

## Available Stocks

| Symbol | Name | Price (Approx.) |
|--------|------|----------------|
| AAPL | Apple Inc. | $172.50 |
| MSFT | Microsoft | $415.80 |
| GOOGL | Alphabet | $141.80 |
| NVDA | NVIDIA | $875.30 |
| TSLA | Tesla | $163.57 |
| META | Meta | $505.75 |
| AMZN | Amazon | $178.25 |
| BTC-USD | Bitcoin | $83,500 |

## Technical Indicators Used

- **SMA 5/20/50** - Simple Moving Averages for trend
- **RSI** - Relative Strength Index (oversold/overbought)
- **MACD** - Moving Average Convergence Divergence
- **Momentum** - Price rate of change
- **Bollinger Bands** - Volatility measure

## Trading Signals

The AI generates signals based on:

| Signal | Condition |
|--------|-----------|
| **BUY** | Price rising + RSI oversold (<30) + MACD bullish |
| **SELL** | Price falling + RSI overbought (>70) + MACD bearish |
| **HOLD** | Mixed or neutral indicators |

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_FINNHUB_API_KEY=your_key_here
```

### Backend (.env)
```env
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key
```

## Project Structure

```
Stock-Market-analysis-tool/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   └── dashboard/      # Dashboard components
│   │   ├── hooks/             # Data hooks
│   │   ├── lib/               # API services
│   │   └── pages/             # App pages
│   ├── .env                  # Environment config
│   └── package.json
├── backend/                     # Express backend
│   ├── src/
│   │   └── server.ts         # Main server
│   ├── .env                  # Environment config
│   └── package.json
├── ai-engine/                  # Python AI (legacy)
└── README.md
```

## Deployment

### Frontend Only (Static)

1. Build: `cd frontend && npm run build`
2. Deploy the `dist` folder to any static host (Netlify, Vercel, Cloudflare Pages)
3. Update `VITE_API_URL` to point to your backend

### Full Stack

1. **Frontend**: Deploy to Netlify/Vercel
2. **Backend**: Deploy to Railway, Render, or VPS
   ```bash
   cd backend
   npm run build
   npm start
   ```
3. Set environment variables on host
4. Update frontend `VITE_API_URL` to production backend URL

## Troubleshooting

### Chart not loading
- Check backend is running on port 3000
- Verify `curl http://localhost:3000/health` returns ok
- Check browser console for errors

### Predictions off
- Yahoo Finance API may be rate limited
- Falls back to historical price models
- Predictions improve with more training data

### Port already in use
```bash
# Find process on port
lsof -ti :3000 | xargs kill
# Or
npx kill-port 3000
```

## Development Commands

```bash
# Frontend
cd frontend
bun run dev      # Development server
bun run build    # Production build
bun run lint     # Code linting

# Backend
cd backend
npm run dev      # Development server
npm run build    # Production build
```

## Disclaimer

**Disclaimer**: This application is for educational purposes only. Stock predictions and AI analysis are not financial advice. Always do your own research before making investment decisions.

---

Built with ❤️ using React, Express, and AI/ML