/**
 * Automated OAuth Authentication Server
 * This script starts a local server, opens the Kite login page,
 * and automatically captures the request_token to generate access_token
 * 
 * Run: npm run auth-server
 */

import { KiteConnect } from 'kiteconnect';
import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

const apiKey = process.env.KITE_API_KEY || 'h4wkw57p0r9qppx2';
const apiSecret = process.env.KITE_API_SECRET || 'ioc97qnesxr8u9psjfd4jcsgb19mag15';
const redirectUrl = 'http://127.0.0.1:3000';

const kc = new KiteConnect({ api_key: apiKey });

let server: http.Server;

// Create HTTP server to handle OAuth callback
const handleRequest = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Handle OAuth callback
  if (pathname === '/' && query.request_token) {
    const requestToken = query.request_token as string;
    const status = query.status as string;

    if (status === 'success') {
      try {
        console.log('\n✅ Request token received:', requestToken);
        console.log('🔄 Exchanging request_token for access_token...\n');

        // Exchange request_token for access_token
        const session = await kc.generateSession(requestToken, apiSecret);

        console.log('✅ Authentication Successful!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('User ID:', session.user_id);
        console.log('User Name:', session.user_name);
        console.log('Email:', session.email);
        console.log('Access Token:', '\x1b[32m%s\x1b[0m', session.access_token);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Save to .env.local
        const envPath = path.join(process.cwd(), '.env.local');
        let envContent = '';

        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf-8');
        }

        // Update or add tokens
        const accessTokenLine = `KITE_ACCESS_TOKEN=${session.access_token}`;
        const userIdLine = `KITE_USER_ID=${session.user_id}`;
        const userNameLine = `KITE_USER_NAME=${session.user_name}`;

        // Update existing or append new
        if (envContent.includes('KITE_ACCESS_TOKEN=')) {
          envContent = envContent.replace(/KITE_ACCESS_TOKEN=.*/g, accessTokenLine);
        } else {
          envContent += `\n${accessTokenLine}`;
        }

        if (envContent.includes('KITE_USER_ID=')) {
          envContent = envContent.replace(/KITE_USER_ID=.*/g, userIdLine);
        } else {
          envContent += `\n${userIdLine}`;
        }

        if (envContent.includes('KITE_USER_NAME=')) {
          envContent = envContent.replace(/KITE_USER_NAME=.*/g, userNameLine);
        } else {
          envContent += `\n${userNameLine}`;
        }

        fs.writeFileSync(envPath, envContent.trim() + '\n');

        console.log('💾 Access token saved to .env.local');
        console.log('\n🎉 You can now use the app!');
        console.log('   Run: npm run fetch-data (to view data in terminal)');
        console.log('   Or:  npm run dev (to start web app)\n');

        // Send success response to browser
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Authentication Successful</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #10b981; margin: 0 0 1rem 0; font-size: 2rem; }
              p { color: #666; line-height: 1.6; margin: 0.5rem 0; }
              .token { 
                background: #f3f4f6; 
                padding: 1rem; 
                border-radius: 0.5rem; 
                margin: 1rem 0;
                word-break: break-all;
                font-family: monospace;
                font-size: 0.875rem;
              }
              .success-icon { font-size: 4rem; margin-bottom: 1rem; }
              .info { 
                background: #dbeafe; 
                padding: 1rem; 
                border-radius: 0.5rem;
                margin-top: 1rem;
                color: #1e40af;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success-icon">✅</div>
              <h1>Authentication Successful!</h1>
              <p><strong>User:</strong> ${session.user_name} (${session.user_id})</p>
              <p><strong>Email:</strong> ${session.email}</p>
              <div class="token">
                <strong>Access Token:</strong><br>
                ${session.access_token}
              </div>
              <div class="info">
                <strong>✓</strong> Token saved to .env.local<br>
                <strong>✓</strong> You can close this window<br>
                <strong>✓</strong> Check your terminal for next steps
              </div>
            </div>
            <script>
              setTimeout(() => {
                window.close();
              }, 5000);
            </script>
          </body>
          </html>
        `);

        // Close server after successful auth
        setTimeout(() => {
          console.log('🛑 Shutting down auth server...\n');
          server.close();
          process.exit(0);
        }, 2000);

      } catch (error: any) {
        console.error('\n❌ Authentication failed:', error.message);

        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Authentication Failed</title>
            <style>
              body {
                font-family: sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #fee;
              }
              .error {
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                max-width: 500px;
              }
              h1 { color: #dc2626; }
              pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>❌ Authentication Failed</h1>
              <p>Error: ${error.message}</p>
              <pre>${error.stack}</pre>
              <p>Please try again or check your API credentials.</p>
            </div>
          </body>
          </html>
        `);

        setTimeout(() => server.close(), 3000);
      }
    } else {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Authentication cancelled or failed</h1>');
      setTimeout(() => server.close(), 2000);
    }
  } else {
    // Default response
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kite Auth Server</title>
        <style>
          body {
            font-family: sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔄 Waiting for authentication...</h1>
          <p>Please complete the login in the opened browser window.</p>
        </div>
      </body>
      </html>
    `);
  }
};

// Start server
async function startAuthFlow() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Kite Connect Authentication Server       ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Create server
  server = http.createServer(handleRequest);

  server.listen(3000, () => {
    console.log('🚀 Auth server started at http://127.0.0.1:3000\n');

    // Generate login URL
    const loginUrl = `https://kite.zerodha.com/connect/login?api_key=${apiKey}&v=3`;

    console.log('📋 Login URL:');
    console.log('\x1b[36m%s\x1b[0m\n', loginUrl);

    console.log('🌐 Opening browser for login...\n');

    // Open browser automatically
    const openCommand = process.platform === 'win32' ? 'start' : 
                       process.platform === 'darwin' ? 'open' : 'xdg-open';
    
    exec(`${openCommand} "${loginUrl}"`, (error) => {
      if (error) {
        console.log('⚠️  Could not open browser automatically.');
        console.log('Please open this URL manually:\n');
        console.log('\x1b[36m%s\x1b[0m\n', loginUrl);
      }
    });

    console.log('⏳ Waiting for authentication...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  // Handle server errors
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error('❌ Port 3000 is already in use.');
      console.error('Please stop any running server on port 3000 and try again.\n');
    } else {
      console.error('❌ Server error:', error.message);
    }
    process.exit(1);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Authentication cancelled by user.\n');
  if (server) server.close();
  process.exit(0);
});

// Start the authentication flow
startAuthFlow();

