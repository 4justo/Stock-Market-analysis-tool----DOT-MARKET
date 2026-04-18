import { createContext, useContext, useState, type ReactNode } from 'react';

interface StockContextType {
  selectedStock: string;
  setSelectedStock: (symbol: string) => void;
}

const StockContext = createContext<StockContextType>({
  selectedStock: 'AAPL',
  setSelectedStock: () => {},
});

export const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'META', 'AMZN', 'BTC-USD'];

export const STOCK_NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft',
  GOOGL: 'Alphabet',
  NVDA: 'NVIDIA',
  TSLA: 'Tesla',
  META: 'Meta',
  AMZN: 'Amazon',
  'BTC-USD': 'Bitcoin',
};

export function StockProvider({ children }: { children: ReactNode }) {
  const [selectedStock, setSelectedStock] = useState('AAPL');

  return (
    <StockContext.Provider value={{ selectedStock, setSelectedStock }}>
      {children}
    </StockContext.Provider>
  );
}

export function useSelectedStock() {
  return useContext(StockContext);
}
