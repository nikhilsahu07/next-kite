import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, accessToken } = body;

    if (!apiKey || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Call Kite API to get user profile
    const response = await fetch('https://api.kite.trade/user/profile', {
      method: 'GET',
      headers: {
        'X-Kite-Version': '3',
        'Authorization': `token ${apiKey}:${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorData,
          message: 'Connection failed'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data,
      message: 'Connection successful!',
    });
  } catch (error: any) {
    console.error('Error testing connection:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to test connection',
        message: 'Connection failed'
      },
      { status: 500 }
    );
  }
}

