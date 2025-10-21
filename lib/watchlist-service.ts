export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  instrumentToken: number;
  lastPrice?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  ohlc?: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  addedAt: Date;
}

export interface WatchlistGroup {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: Date;
}

class WatchlistService {
  private static instance: WatchlistService;
  private watchlists: WatchlistGroup[] = [];
  private readonly STORAGE_KEY = 'kite_watchlists';
  private isServerSide: boolean;

  private constructor() {
    this.isServerSide = typeof window === 'undefined';
    this.loadFromStorage();
  }

  public static getInstance(): WatchlistService {
    if (!WatchlistService.instance) {
      WatchlistService.instance = new WatchlistService();
    }
    return WatchlistService.instance;
  }

  private loadFromStorage(): void {
    // For server-side, always create default watchlist
    if (this.isServerSide) {
      this.createDefaultWatchlist();
      return;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.watchlists = parsed.map((group: any) => ({
          ...group,
          createdAt: new Date(group.createdAt),
          items: group.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          })),
        }));
      } else {
        // Initialize with default watchlist
        this.createDefaultWatchlist();
      }
    } catch (error) {
      console.error('Error loading watchlists from storage:', error);
      this.createDefaultWatchlist();
    }
  }

  private saveToStorage(): void {
    // Only save to localStorage on client side
    if (this.isServerSide) {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.watchlists));
    } catch (error) {
      console.error('Error saving watchlists to storage:', error);
    }
  }

  private createDefaultWatchlist(): void {
    const defaultItems: WatchlistItem[] = [
      {
        id: '1',
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        exchange: 'NSE',
        instrumentToken: 256265,
        addedAt: new Date(),
      },
      {
        id: '2',
        symbol: 'SBIN',
        name: 'State Bank of India',
        exchange: 'NSE',
        instrumentToken: 738561,
        addedAt: new Date(),
      },
      {
        id: '3',
        symbol: 'INFY',
        name: 'Infosys Ltd',
        exchange: 'NSE',
        instrumentToken: 408065,
        addedAt: new Date(),
      },
      {
        id: '4',
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Ltd',
        exchange: 'NSE',
        instrumentToken: 492033,
        addedAt: new Date(),
      },
      {
        id: '5',
        symbol: 'NIFTY 50',
        name: 'Nifty 50',
        exchange: 'NSE',
        instrumentToken: 256265,
        addedAt: new Date(),
      },
      {
        id: '6',
        symbol: 'BANKNIFTY',
        name: 'Nifty Bank',
        exchange: 'NSE',
        instrumentToken: 260105,
        addedAt: new Date(),
      },
    ];

    const defaultWatchlist: WatchlistGroup = {
      id: 'default',
      name: 'My Watchlist',
      items: defaultItems,
      createdAt: new Date(),
    };

    this.watchlists = [defaultWatchlist];
    this.saveToStorage();
  }

  public getAllWatchlists(): WatchlistGroup[] {
    return [...this.watchlists];
  }

  public getWatchlist(id: string): WatchlistGroup | undefined {
    return this.watchlists.find((w) => w.id === id);
  }

  public createWatchlist(name: string): WatchlistGroup {
    const newWatchlist: WatchlistGroup = {
      id: Date.now().toString(),
      name,
      items: [],
      createdAt: new Date(),
    };

    this.watchlists.push(newWatchlist);
    this.saveToStorage();
    return newWatchlist;
  }

  public deleteWatchlist(id: string): boolean {
    if (id === 'default') {
      return false; // Cannot delete default watchlist
    }

    const index = this.watchlists.findIndex((w) => w.id === id);
    if (index !== -1) {
      this.watchlists.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public addToWatchlist(
    watchlistId: string,
    item: Omit<WatchlistItem, 'id' | 'addedAt'>
  ): boolean {
    const watchlist = this.watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) {
      return false;
    }

    // Check if item already exists
    const existingItem = watchlist.items.find(
      (i) => i.symbol === item.symbol && i.exchange === item.exchange
    );

    if (existingItem) {
      return false; // Item already exists
    }

    const newItem: WatchlistItem = {
      ...item,
      id: Date.now().toString(),
      addedAt: new Date(),
    };

    watchlist.items.push(newItem);
    this.saveToStorage();
    return true;
  }

  public removeFromWatchlist(watchlistId: string, itemId: string): boolean {
    const watchlist = this.watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) {
      return false;
    }

    const index = watchlist.items.findIndex((i) => i.id === itemId);
    if (index !== -1) {
      watchlist.items.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public updateWatchlistItem(
    watchlistId: string,
    itemId: string,
    updates: Partial<WatchlistItem>
  ): boolean {
    const watchlist = this.watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) {
      return false;
    }

    const item = watchlist.items.find((i) => i.id === itemId);
    if (!item) {
      return false;
    }

    Object.assign(item, updates);
    this.saveToStorage();
    return true;
  }

  public searchInstruments(query: string): Promise<any[]> {
    // This would typically call the Kite API to search for instruments
    // For now, return a mock response
    return Promise.resolve(
      [
        {
          instrument_token: 256265,
          tradingsymbol: 'RELIANCE',
          name: 'Reliance Industries Ltd',
          exchange: 'NSE',
          segment: 'NSE',
          instrument_type: 'EQ',
        },
        {
          instrument_token: 738561,
          tradingsymbol: 'SBIN',
          name: 'State Bank of India',
          exchange: 'NSE',
          segment: 'NSE',
          instrument_type: 'EQ',
        },
        {
          instrument_token: 408065,
          tradingsymbol: 'INFY',
          name: 'Infosys Ltd',
          exchange: 'NSE',
          segment: 'NSE',
          instrument_type: 'EQ',
        },
        {
          instrument_token: 492033,
          tradingsymbol: 'HDFCBANK',
          name: 'HDFC Bank Ltd',
          exchange: 'NSE',
          segment: 'NSE',
          instrument_type: 'EQ',
        },
        {
          instrument_token: 260105,
          tradingsymbol: 'BANKNIFTY',
          name: 'Nifty Bank',
          exchange: 'NSE',
          segment: 'NSE',
          instrument_type: 'INDEX',
        },
      ].filter(
        (item) =>
          item.tradingsymbol.toLowerCase().includes(query.toLowerCase()) ||
          item.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }

  public async updatePrices(watchlistId: string): Promise<void> {
    const watchlist = this.watchlists.find((w) => w.id === watchlistId);
    if (!watchlist || watchlist.items.length === 0) {
      return;
    }

    // Skip price updates on server side to avoid URL issues
    if (this.isServerSide) {
      return;
    }

    try {
      const instrumentTokens = watchlist.items.map(
        (item) => item.instrumentToken
      );

      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instruments: instrumentTokens }),
      });

      if (response.ok) {
        const quotes = await response.json();

        watchlist.items.forEach((item) => {
          const quote = quotes[item.instrumentToken];
          if (quote) {
            item.lastPrice = quote.last_price;
            item.change = quote.change;
            item.changePercent = quote.change_percent;
            item.volume = quote.volume;
            item.ohlc = quote.ohlc;
          }
        });

        this.saveToStorage();
      }
    } catch (error) {
      console.error('Error updating watchlist prices:', error);
    }
  }

  public getPopularStocks(): WatchlistItem[] {
    return [
      {
        id: 'popular-1',
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd',
        exchange: 'NSE',
        instrumentToken: 256265,
        addedAt: new Date(),
      },
      {
        id: 'popular-2',
        symbol: 'TCS',
        name: 'Tata Consultancy Services Ltd',
        exchange: 'NSE',
        instrumentToken: 2953217,
        addedAt: new Date(),
      },
      {
        id: 'popular-3',
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Ltd',
        exchange: 'NSE',
        instrumentToken: 492033,
        addedAt: new Date(),
      },
      {
        id: 'popular-4',
        symbol: 'INFY',
        name: 'Infosys Ltd',
        exchange: 'NSE',
        instrumentToken: 408065,
        addedAt: new Date(),
      },
      {
        id: 'popular-5',
        symbol: 'SBIN',
        name: 'State Bank of India',
        exchange: 'NSE',
        instrumentToken: 738561,
        addedAt: new Date(),
      },
    ];
  }

  public getPopularIndexes(): WatchlistItem[] {
    return [
      {
        id: 'index-1',
        symbol: 'NIFTY 50',
        name: 'Nifty 50',
        exchange: 'NSE',
        instrumentToken: 256265,
        addedAt: new Date(),
      },
      {
        id: 'index-2',
        symbol: 'BANKNIFTY',
        name: 'Nifty Bank',
        exchange: 'NSE',
        instrumentToken: 260105,
        addedAt: new Date(),
      },
      {
        id: 'index-3',
        symbol: 'NIFTY IT',
        name: 'Nifty IT',
        exchange: 'NSE',
        instrumentToken: 408065,
        addedAt: new Date(),
      },
      {
        id: 'index-4',
        symbol: 'NIFTY AUTO',
        name: 'Nifty Auto',
        exchange: 'NSE',
        instrumentToken: 779521,
        addedAt: new Date(),
      },
    ];
  }
}

export default WatchlistService;
