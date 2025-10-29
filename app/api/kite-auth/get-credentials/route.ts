import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

/**
 * Get Credentials API
 * 
 * This endpoint retrieves the full credentials for the currently selected account
 * from the database, so that API calls can be made without relying on .env
 */

export async function GET(request: NextRequest) {
  try {
    // Get selected account ID from cookies
    const selectedAccountId = request.cookies.get('kite_selected_account')?.value;
    const accessToken = request.cookies.get('kite_access_token')?.value;
    const apiKey = request.cookies.get('kite_api_key')?.value;

    if (!selectedAccountId) {
      return NextResponse.json({
        success: false,
        error: 'No account selected',
        message: 'Please select an account from the Kite Accounts page',
      }, { status: 400 });
    }

    // Fetch full account details from database
    const response = await axios.get(`${API_BASE_URL}/crud`, {
      params: { 
        tableName: 'kite-accounts',
        key: JSON.stringify({ accountId: selectedAccountId })
      },
    });
    
    const account = response.data?.item || response.data?.Items?.[0] || response.data;
    
    if (!account) {
      return NextResponse.json({
        success: false,
        error: 'Account not found in database',
        message: 'The selected account no longer exists',
      }, { status: 404 });
    }

    // Check if session is still valid
    if (!account.session || account.session.expiresAt <= Date.now()) {
      return NextResponse.json({
        success: false,
        error: 'Session expired',
        message: 'Please refresh the session for this account',
        sessionExpired: true,
      }, { status: 401 });
    }

    // Return credentials
    return NextResponse.json({
      success: true,
      credentials: {
        accountId: account.accountId,
        accountName: account.accountName,
        clientId: account.clientId,
        apiKey: account.apiKey,
        apiSecret: account.apiSecret,
        accessToken: account.session.accessToken,
        redirectUrl: account.callbackUrl,
        userId: account.session.userId,
        userName: account.session.userName,
        email: account.session.email,
        expiresAt: account.session.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Error getting credentials:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to get credentials',
        details: error.response?.data || error.toString()
      },
      { status: 500 }
    );
  }
}

