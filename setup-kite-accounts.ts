#!/usr/bin/env tsx

/**
 * Kite Accounts Setup Script
 * 
 * This script helps set up the Kite Accounts management system
 * by checking the configuration and providing guidance.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Config {
  backendUrl: string;
  hasEnvFile: boolean;
  envContent: string;
}

function checkConfiguration(): Config {
  const envPath = join(process.cwd(), '.env.local');
  const hasEnvFile = existsSync(envPath);
  
  let envContent = '';
  if (hasEnvFile) {
    envContent = readFileSync(envPath, 'utf-8');
  }
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://brmh.in';
  
  return {
    backendUrl,
    hasEnvFile,
    envContent
  };
}

function validateConfiguration(config: Config): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!config.hasEnvFile) {
    issues.push('❌ .env.local file not found');
  }
  
  if (!config.envContent.includes('NEXT_PUBLIC_BACKEND_URL')) {
    issues.push('❌ NEXT_PUBLIC_BACKEND_URL not found in .env.local');
  }
  
  if (config.backendUrl === 'http://localhost:5001') {
    issues.push('⚠️  Backend URL is set to localhost - should be https://brmh.in');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

function printSetupInstructions() {
  console.log('\n📋 Setup Instructions:');
  console.log('1. Ensure brmh.in backend is running and accessible');
  console.log('2. Create .env.local file with:');
  console.log('   NEXT_PUBLIC_BACKEND_URL=https://brmh.in');
  console.log('3. Start the Next.js frontend:');
  console.log('   npm run dev');
  console.log('4. Navigate to http://localhost:3000/kite-accounts');
}

function main() {
  console.log('🚀 Kite Accounts Setup Checker\n');
  
  const config = checkConfiguration();
  const validation = validateConfiguration(config);
  
  console.log('📊 Configuration Status:');
  console.log(`Backend URL: ${config.backendUrl}`);
  console.log(`Environment file: ${config.hasEnvFile ? '✅ Found' : '❌ Missing'}`);
  
  if (validation.issues.length > 0) {
    console.log('\n⚠️  Issues found:');
    validation.issues.forEach(issue => console.log(`  ${issue}`));
    printSetupInstructions();
  } else {
    console.log('\n✅ Configuration looks good!');
    console.log('🎉 You can now start using the Kite Accounts system');
  }
  
  console.log('\n📚 Documentation:');
  console.log('- Quick Start: QUICK_START_GUIDE.md');
  console.log('- Full Setup: KITE_ACCOUNTS_SETUP.md');
  console.log('- Integration: INTEGRATION_SUMMARY.md');
}

if (require.main === module) {
  main();
}

export { checkConfiguration, validateConfiguration };
