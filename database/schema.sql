-- Initial database schema for Dot Market AI Pro
-- This SQL can be used as a reference for setting up PostgreSQL

CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Stock" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price FLOAT NOT NULL,
  change FLOAT,
  "changePercent" FLOAT,
  volume INTEGER,
  "marketCap" FLOAT,
  pe FLOAT,
  "lastUpdate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Candle" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "stockId" TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  open FLOAT NOT NULL,
  high FLOAT NOT NULL,
  low FLOAT NOT NULL,
  close FLOAT NOT NULL,
  volume INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("stockId") REFERENCES "Stock"(id) ON DELETE CASCADE
);

CREATE INDEX "Candle_stockId_timestamp_idx" ON "Candle"("stockId", timestamp);

CREATE TABLE "TechnicalIndicator" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "stockId" TEXT NOT NULL,
  type TEXT NOT NULL,
  period INTEGER NOT NULL,
  value FLOAT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("stockId") REFERENCES "Stock"(id) ON DELETE CASCADE
);

CREATE INDEX "TechnicalIndicator_stockId_type_timestamp_idx" ON "TechnicalIndicator"("stockId", type, timestamp);

CREATE TABLE "Prediction" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "stockId" TEXT NOT NULL,
  symbol TEXT NOT NULL,
  model TEXT NOT NULL,
  "predictedPrice" FLOAT NOT NULL,
  confidence FLOAT NOT NULL,
  timeframe TEXT NOT NULL,
  "actualPrice" FLOAT,
  accuracy FLOAT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("stockId") REFERENCES "Stock"(id) ON DELETE CASCADE
);

CREATE INDEX "Prediction_stockId_model_timeframe_idx" ON "Prediction"("stockId", model, timeframe);

CREATE TABLE "Sentiment" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "stockId" TEXT NOT NULL,
  symbol TEXT NOT NULL,
  score FLOAT NOT NULL,
  label TEXT NOT NULL,
  source TEXT NOT NULL,
  mentions INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("stockId") REFERENCES "Stock"(id) ON DELETE CASCADE
);

CREATE INDEX "Sentiment_stockId_createdAt_idx" ON "Sentiment"("stockId", "createdAt");

CREATE TABLE "Portfolio" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL,
  "totalValue" FLOAT DEFAULT 0,
  cash FLOAT DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE "Trade" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "portfolioId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price FLOAT NOT NULL,
  total FLOAT NOT NULL,
  fee FLOAT DEFAULT 0,
  status TEXT DEFAULT 'EXECUTED',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"(id) ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "Trade_userId_symbol_createdAt_idx" ON "Trade"("userId", symbol, "createdAt");

CREATE TABLE "Watchlist" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "stockId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "stockId"),
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY ("stockId") REFERENCES "Stock"(id) ON DELETE CASCADE
);

CREATE INDEX "Watchlist_userId_idx" ON "Watchlist"("userId");

CREATE TABLE "BacktestResult" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  strategy TEXT NOT NULL,
  symbol TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "totalReturn" FLOAT NOT NULL,
  "maxDrawdown" FLOAT NOT NULL,
  "sharpeRatio" FLOAT NOT NULL,
  trades INTEGER NOT NULL,
  "winRate" FLOAT NOT NULL,
  result JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "BacktestResult_symbol_createdAt_idx" ON "BacktestResult"(symbol, "createdAt");
