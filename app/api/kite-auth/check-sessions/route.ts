import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accounts } = body;

    if (!accounts || !Array.isArray(accounts)) {
      return NextResponse.json(
        { error: 'Invalid request: accounts array required' },
        { status: 400 }
      );
    }

    const results = [];
    
    for (const account of accounts) {
      const result: any = {
        accountId: account.accountId,
        accountName: account.accountName,
        status: 'unknown',
        needsRefresh: false,
      };

      // Check if account has a session
      if (!account.session) {
        result.status = 'no_session';
        result.needsRefresh = true;
        results.push(result);
        continue;
      }

      // Check if session is expired
      const now = Date.now();
      const expiresAt = account.session.expiresAt;
      const hoursRemaining = (expiresAt - now) / (1000 * 60 * 60);

      if (expiresAt <= now) {
        result.status = 'expired';
        result.needsRefresh = true;
        result.hoursRemaining = 0;
      } else if (hoursRemaining < 2) {
        // Less than 2 hours remaining, suggest refresh
        result.status = 'expiring_soon';
        result.needsRefresh = true;
        result.hoursRemaining = Math.round(hoursRemaining * 10) / 10;
      } else {
        result.status = 'active';
        result.needsRefresh = false;
        result.hoursRemaining = Math.round(hoursRemaining * 10) / 10;
      }

      results.push(result);
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        active: results.filter(r => r.status === 'active').length,
        needsRefresh: results.filter(r => r.needsRefresh).length,
      },
    });
  } catch (error: any) {
    console.error('Error checking sessions:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to check sessions',
        details: error.response?.data || error.toString()
      },
      { status: 500 }
    );
  }
}

