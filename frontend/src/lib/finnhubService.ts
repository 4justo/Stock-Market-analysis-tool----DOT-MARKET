const FINNHUB_BASE_URL = import.meta.env.VITE_FINNHUB_BASE_URL || 'https://finnhub.io/api/v1';

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface FinnhubCandle {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  v: number[];
  t: number[];
  s: string;
}

export interface FinnhubSymbolLookup {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

class FinnhubService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  private checkApiKey(): boolean {
    if (!this.apiKey) {
      console.warn('Finnhub API key not set. Add VITE_FINNHUB_API_KEY to your .env file.');
      return false;
    }
    return true;
  }

  private getUrl(endpoint: string, params: Record<string, string> = {}): string {
    const queryParams = new URLSearchParams({ ...params, token: this.apiKey! }).toString();
    return `${FINNHUB_BASE_URL}${endpoint}?${queryParams}`;
  }

  async getQuote(symbol: string): Promise<FinnhubQuote | null> {
    if (!this.checkApiKey()) return null;
    
    try {
      const url = this.getUrl('/quote', { symbol });
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.c ? data : null;
    } catch (e) {
      console.error(`Finnhub getQuote(${symbol}) failed:`, e);
      return null;
    }
  }

  async getCandles(symbol: string, resolution: string = 'D', from?: number, to?: number): Promise<FinnhubCandle | null> {
    if (!this.checkApiKey()) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const fromTime = from || now - 365 * 24 * 60 * 60;
    const toTime = to || now;
    
    try {
      const url = this.getUrl('/stock/candle', { symbol, resolution, from: String(fromTime), to: String(toTime) });
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data: FinnhubCandle = await response.json();
      return data.s === 'ok' ? data : null;
    } catch (e) {
      console.error(`Finnhub getCandles(${symbol}) failed:`, e);
      return null;
    }
  }

  async searchSymbols(query: string): Promise<FinnhubSymbolLookup['result'] | []> {
    if (!this.checkApiKey()) return [];
    
    try {
      const url = this.getUrl('/search', { q: query });
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data: FinnhubSymbolLookup = await response.json();
      return data.result || [];
    } catch (e) {
      console.error(`Finnhub searchSymbols(${query}) failed:`, e);
      return [];
    }
  }

  async getCompanyProfile(symbol: string): Promise<{ name: string; ticker: string; logo: string } | null> {
    if (!this.checkApiKey()) return null;
    
    try {
      const url = this.getUrl('/stock/profile2', { symbol });
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return data.ticker ? data : null;
    } catch (e) {
      console.error(`Finnhub getCompanyProfile(${symbol}) failed:`, e);
      return null;
    }
  }
}

export const finnhubService = new FinnhubService();

const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
if (apiKey) {
  finnhubService.setApiKey(apiKey);
}
