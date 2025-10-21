/**
 * One-time authentication script to get your access token
 * 
 * Steps:
 * 1. Run this script: npm run auth
 * 2. Open the displayed URL in your browser
 * 3. Login with your Zerodha credentials
 * 4. After redirect, copy the request_token from URL
 * 5. Paste it when prompted
 * 6. Your access_token will be saved to .env.local
 */

import { KiteConnect } from 'kiteconnect';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

const apiKey = process.env.KITE_API_KEY || 'h4wkw57p0r9qppx2';
const apiSecret = process.env.KITE_API_SECRET || 'ioc97qnesxr8u9psjfd4jcsgb19mag15';
const redirectUrl = process.env.KITE_REDIRECT_URL || 'http://127.0.0.1:3000/api/auth/callback';

const kc = new KiteConnect({ api_key: apiKey });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function authenticate() {
  console.log('\n=== Kite Connect Authentication ===\n');
  
  const loginUrl = `https://kite.zerodha.com/connect/login?api_key=${apiKey}&v=3`;
  
  console.log('Step 1: Open this URL in your browser:');
  console.log('\x1b[36m%s\x1b[0m', loginUrl);
  console.log('\nStep 2: Login with your Zerodha credentials');
  console.log('Step 3: After login, you will be redirected to a URL');
  console.log('Step 4: Copy the "request_token" from the redirected URL\n');
  console.log('Example URL: http://127.0.0.1:3000/...?request_token=ABC123&action=login');
  console.log('Copy only the token part: ABC123\n');

  rl.question('Enter the request_token: ', async (requestToken) => {
    try {
      if (!requestToken || requestToken.trim() === '') {
        console.error('\x1b[31m%s\x1b[0m', 'Error: Request token is required');
        rl.close();
        return;
      }

      console.log('\nGenerating session...');
      const session = await kc.generateSession(requestToken.trim(), apiSecret);
      
      console.log('\n✅ Authentication successful!\n');
      console.log('Access Token:', '\x1b[32m%s\x1b[0m', session.access_token);
      console.log('User ID:', session.user_id);
      console.log('User Name:', session.user_name);
      console.log('Email:', session.email);
      
      // Save to .env.local
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }
      
      // Update or add KITE_ACCESS_TOKEN
      const accessTokenLine = `KITE_ACCESS_TOKEN=${session.access_token}`;
      const userIdLine = `KITE_USER_ID=${session.user_id}`;
      
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
      
      fs.writeFileSync(envPath, envContent.trim() + '\n');
      
      console.log('\n✅ Token saved to .env.local');
      console.log('\nYou can now run the app with: npm run dev');
      console.log('\nNote: This token expires daily. Run this script again when it expires.\n');
      
    } catch (error: any) {
      console.error('\n\x1b[31m%s\x1b[0m', '❌ Authentication failed:');
      console.error(error.message);
      if (error.message.includes('Token is invalid')) {
        console.log('\nThe request_token might be expired or invalid.');
        console.log('Please try the process again with a fresh token.\n');
      }
    } finally {
      rl.close();
    }
  });
}

authenticate();

