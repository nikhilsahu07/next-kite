import { NextResponse } from 'next/server';

/**
 * Legacy Login Route
 * 
 * This route is no longer used in the new multi-account system.
 * The new system generates login URLs per-account in the kite-accounts page.
 * 
 * This route is kept for backward compatibility.
 */

export async function GET() {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Please use /kite-accounts to manage accounts and generate login URLs.',
      message: 'Visit /kite-accounts to add and authenticate your trading accounts.'
    },
    { status: 410 } // 410 Gone - indicates the resource is no longer available
  );
}

