import { Search, Bell, User, ChevronDown, Circle, Wifi, WifiOff, Brain, BrainCircuit } from "lucide-react";
import { useSelectedStock, STOCK_SYMBOLS, STOCK_NAMES } from "@/contexts/StockContext";
import { useSystemStatus } from "@/hooks/useMarketData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TopNav = () => {
  const { selectedStock, setSelectedStock } = useSelectedStock();
  const { data: status } = useSystemStatus();

  const isLive = status?.denoProxy && status?.aiEngine;

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border cursor-pointer hover:bg-muted/70 transition-colors">
              <Circle
                className={`w-2.5 h-2.5 ${isLive ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase">System Status</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Market Data</span>
                  </div>
                  <Circle
                    className={`w-2 h-2 ${status?.denoProxy ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">AI Engine</span>
                  </div>
                  <Circle
                    className={`w-2 h-2 ${status?.aiEngine ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`}
                  />
                </div>
              </div>
              {status?.lastChecked && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Last checked: {status.lastChecked.toLocaleTimeString()}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <Select value={selectedStock} onValueChange={setSelectedStock}>
          <SelectTrigger className="w-[200px] h-10 bg-muted border-border">
            <SelectValue placeholder="Select stock" />
          </SelectTrigger>
          <SelectContent>
            {STOCK_SYMBOLS.map((symbol) => (
              <SelectItem key={symbol} value={symbol}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{symbol}</span>
                  <span className="text-muted-foreground text-xs">{STOCK_NAMES[symbol]}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search stocks, indices..."
            className="pl-10 h-10 bg-muted border border-border rounded-md w-full max-w-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
      </div>
    </header>
  );
};

export default TopNav;
