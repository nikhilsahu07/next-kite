import { NextRequest, NextResponse } from 'next/server';
import WatchlistService from '@/lib/watchlist-service';

export async function GET(request: NextRequest) {
  try {
    const watchlistService = WatchlistService.getInstance();
    const watchlists = watchlistService.getAllWatchlists();

    return NextResponse.json({ watchlists });
  } catch (error) {
    console.error('Error fetching watchlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const watchlistService = WatchlistService.getInstance();

    switch (action) {
      case 'create_watchlist':
        const newWatchlist = watchlistService.createWatchlist(data.name);
        return NextResponse.json({ watchlist: newWatchlist });

      case 'add_item':
        const success = watchlistService.addToWatchlist(
          data.watchlistId,
          data.item
        );
        if (success) {
          return NextResponse.json({ success: true });
        } else {
          return NextResponse.json(
            { error: 'Item already exists or watchlist not found' },
            { status: 400 }
          );
        }

      case 'remove_item':
        const removed = watchlistService.removeFromWatchlist(
          data.watchlistId,
          data.itemId
        );
        if (removed) {
          return NextResponse.json({ success: true });
        } else {
          return NextResponse.json(
            { error: 'Item not found' },
            { status: 404 }
          );
        }

      case 'delete_watchlist':
        const deleted = watchlistService.deleteWatchlist(data.watchlistId);
        if (deleted) {
          return NextResponse.json({ success: true });
        } else {
          return NextResponse.json(
            { error: 'Cannot delete default watchlist' },
            { status: 400 }
          );
        }

      case 'search_instruments':
        const instruments = await watchlistService.searchInstruments(
          data.query
        );
        return NextResponse.json({ instruments });

      case 'update_prices':
        await watchlistService.updatePrices(data.watchlistId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error handling watchlist action:', error);
    return NextResponse.json(
      { error: 'Failed to process watchlist action' },
      { status: 500 }
    );
  }
}
