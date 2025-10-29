import { NextRequest, NextResponse } from 'next/server';

/**
 * Select Account API
 * 
 * This endpoint helps set a selected account for trading operations.
 * It sets a cookie with the account's access token so that trading routes work.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, accessToken, apiKey } = body;

    if (!accountId || !accessToken || !apiKey) {
      return NextResponse.json(
        { error: 'Account ID, access token, and API key are required' },
        { status: 400 }
      );
    }

    // Set cookies for the selected account
    const response = NextResponse.json({
      success: true,
      message: 'Account selected for trading',
      accountId,
    });

    // Set access token cookie
    response.cookies.set('kite_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Set API key cookie (for reference)
    response.cookies.set('kite_api_key', apiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Set selected account ID cookie
    response.cookies.set('kite_selected_account', accountId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    console.error('Error selecting account:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to select account',
        details: error.response?.data || error.toString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const selectedAccountId = request.cookies.get('kite_selected_account')?.value;
    const accessToken = request.cookies.get('kite_access_token')?.value;
    const apiKey = request.cookies.get('kite_api_key')?.value;

    if (!selectedAccountId || !accessToken || !apiKey) {
      return NextResponse.json({
        success: false,
        message: 'No account selected',
        selectedAccount: null,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account is selected',
      selectedAccount: {
        accountId: selectedAccountId,
        hasToken: !!accessToken,
        hasApiKey: !!apiKey,
      },
    });
  } catch (error: any) {
    console.error('Error getting selected account:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to get selected account',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear selected account cookies
    const response = NextResponse.json({
      success: true,
      message: 'Account deselected',
    });

    response.cookies.delete('kite_access_token');
    response.cookies.delete('kite_api_key');
    response.cookies.delete('kite_selected_account');

    return response;
  } catch (error: any) {
    console.error('Error deselecting account:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to deselect account',
      },
      { status: 500 }
    );
  }
}

