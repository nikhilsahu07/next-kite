'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import axios from 'axios';

// Use the brmh.in backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// Copy to clipboard utility
const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  console.log(`Copied ${label}: ${text}`);
};

// Icon components
const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Copyable Field Component
const CopyableField = ({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(!secret);

  const handleCopy = () => {
    copyToClipboard(value, label);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayValue = secret && !revealed ? '••••••••••••' : value || 'N/A';

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
        <code className="flex-1 text-sm font-mono text-gray-900 dark:text-gray-100 truncate">
          {displayValue}
        </code>
        <div className="flex items-center space-x-1">
          {secret && (
            <button
              onClick={() => setRevealed(!revealed)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title={revealed ? 'Hide' : 'Reveal'}
            >
              {revealed ? '👁️' : '👁️‍🗨️'}
            </button>
          )}
          {value && (
            <button
              onClick={handleCopy}
              className={`p-1 rounded transition-colors ${
                copied ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              title="Copy to clipboard"
            >
              {copied ? '✓' : <CopyIcon />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Account Card Component (CRUD-only)
const AccountCard = ({ account, onRefresh, onGetSession, onEdit, onManageAccount, onSelectForTrading, onTestConnection }: any) => {
  const [expanded, setExpanded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    // Check if this account is selected for trading
    const checkSelected = async () => {
      try {
        const response = await axios.get('/api/kite-auth/select-account');
        if (response.data.success && response.data.selectedAccount?.accountId === account.accountId) {
          setIsSelected(true);
        }
      } catch (err) {
        // Ignore error
      }
    };
    checkSelected();
  }, [account.accountId]);

  const sessionStatus = account.session
    ? account.session.expiresAt > Date.now()
      ? 'active'
      : 'expired'
    : 'none';

  const getStatusColor = () => {
    if (sessionStatus === 'active') return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200';
    if (sessionStatus === 'expired') return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{account.accountName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{account.clientId}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              sessionStatus === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              sessionStatus === 'expired' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {sessionStatus === 'active' ? 'Active' : sessionStatus === 'expired' ? 'Expired' : 'No Session'}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
              {account.accountType}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(account)}
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Edit"
            >
              Edit
            </button>
            <button
              onClick={onRefresh}
              className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Refresh"
            >
              <RefreshIcon />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => onGetSession(account)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors font-medium"
          >
            <KeyIcon />
            {sessionStatus === 'active' ? 'Refresh Access Token' : 'Get Access Token'}
          </button>
          {sessionStatus === 'active' && (
            <>
              <button
                onClick={() => onTestConnection(account)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                <CheckCircleIcon />
                Test Connection
              </button>
              <button
                onClick={() => onManageAccount(account)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors font-medium"
              >
                <ChartIcon />
                Open Trading Dashboard
              </button>
              <button
                onClick={() => onSelectForTrading(account)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                  isSelected
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white'
                }`}
              >
                {isSelected ? <><CheckIcon /> Selected for Trading</> : <><PlayIcon /> Use for Trading</>}
              </button>
            </>
          )}
          <div className="flex-1" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Created: {new Date(account.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Connection Status */}
        {connectionStatus && (
          <div className={`p-4 rounded-lg mb-6 ${
            connectionStatus.connected ? 'bg-green-50 border border-green-200 dark:bg-green-900/20' : 'bg-red-50 border border-red-200 dark:bg-red-900/20'
          }`}>
            <div className="flex items-start space-x-2">
              <span className="text-lg">{connectionStatus.connected ? '✅' : '❌'}</span>
              <div>
                <p className={`font-semibold ${connectionStatus.connected ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {connectionStatus.connected ? 'Connection Successful' : 'Connection Failed'}
                </p>
                {connectionStatus.profile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    User: {connectionStatus.profile.user_name} ({connectionStatus.profile.email})
                  </p>
                )}
                {connectionStatus.error && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{connectionStatus.error}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            {/* Account Credentials */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                🔑 Account Credentials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CopyableField label="Account ID" value={account.accountId} />
                <CopyableField label="User ID" value={account.userId} />
                <CopyableField label="Client ID" value={account.clientId} />
                <CopyableField label="Phone Number" value={account.phoneNumber} />
                <CopyableField label="API Key" value={account.apiKey} secret />
                <CopyableField label="API Secret" value={account.apiSecret} secret />
                <CopyableField label="Password" value={account.password} secret />
              </div>
            </div>

                    {/* Session Information */}
                    {account.session && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                          🎫 Access Token
                  {sessionStatus === 'active' && (
                    <span className="ml-3 px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                      Valid for {Math.round((account.session.expiresAt - Date.now()) / (1000 * 60 * 60))} hours
                    </span>
                  )}
                  {sessionStatus === 'expired' && (
                    <span className="ml-3 px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                      Expired
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CopyableField label="User ID" value={account.session.userId || 'N/A'} />
                  <CopyableField label="User Name" value={account.session.userName || 'N/A'} />
                  <CopyableField label="Email" value={account.session.email || 'N/A'} />
                  <CopyableField label="Broker" value={account.session.broker || 'N/A'} />
                  <CopyableField label="Session ID" value={account.session.sessionId} />
                  <CopyableField label="Access Token" value={account.session.accessToken} secret />
                  {account.session.loginTime && (
                    <CopyableField 
                      label="Login Time" 
                      value={new Date(account.session.loginTime).toLocaleString()} 
                    />
                  )}
                  {account.session.expiresAt && (
                    <CopyableField 
                      label="Expires At" 
                      value={new Date(account.session.expiresAt).toLocaleString()} 
                    />
                  )}
                </div>
              </div>
            )}

            {/* API Endpoints removed for CRUD-only */}

            {/* Raw JSON Data */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                📄 Raw JSON Data
              </h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs font-mono">
                  {JSON.stringify(account, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add Account Modal
const AddAccountModal = ({ isOpen, onClose, onAdd, userId }: any) => {
  const defaultCallbackUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/kite-callback` 
    : 'http://localhost:3000/kite-callback';

  const [formData, setFormData] = useState({
    accountName: '',
    clientId: '',
    phoneNumber: '',
    password: '',
    apiKey: '',
    apiSecret: '',
    accountType: 'live',
    callbackUrl: defaultCallbackUrl,
    postbackUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = Date.now();
      const accountId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `acc_${now}_${Math.random().toString(36).slice(2, 8)}`;
      const item: any = {
        accountId,
        status: 'active',
        hasActiveSession: false,
        createdAt: now,
        updatedAt: now,
        ...formData,
      };
      if (userId) item.userId = userId;
      const response = await axios.post(`${API_BASE_URL}/crud`, { item }, {
        params: { tableName: 'kite-accounts' },
        headers: { 'Content-Type': 'application/json' },
      });
      const saved = response.data?.item || response.data?.Items || response.data;
      if (saved) {
        onAdd(saved);
        onClose();
        setFormData({
          accountName: '',
          clientId: '',
          phoneNumber: '',
          password: '',
          apiKey: '',
          apiSecret: '',
          accountType: 'live',
          callbackUrl: defaultCallbackUrl,
          postbackUrl: '',
        });
      }
    } catch (error: any) {
      console.error('Error adding account:', error);
      alert('Failed to add account: ' + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Account</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Name</label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="My Trading Account"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client ID / Username</label>
            <input
              type="text"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="ABC123"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="+91 9876543210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
            <input
              type="text"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="your_api_key"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Secret</label>
            <input
              type="password"
              value={formData.apiSecret}
              onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="your_api_secret"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Type</label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="live">Live</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Callback URL *</label>
            <input
              type="url"
              value={formData.callbackUrl}
              onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/kite-callback`}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ⚠️ Must match the redirect URL configured in your Zerodha App settings
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Postback URL (Optional)</label>
            <input
              type="url"
              value={formData.postbackUrl}
              onChange={(e) => setFormData({ ...formData, postbackUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://brmh.in/postback"
            />
          </div>
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded transition-colors"
            >
              Add Account
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Manage Account Modal
const ManageAccountModal = ({ isOpen, onClose, account }: any) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen || !account || !account.session) return null;

  const testConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      // Test the connection via our backend API (to avoid CORS issues)
      const response = await axios.post('/api/kite-auth/test-connection', {
        apiKey: account.apiKey,
        accessToken: account.session.accessToken,
      });

      setTestResult({
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.response?.data?.error || error.message,
        message: error.response?.data?.message || 'Connection failed!',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Manage Account: {account.accountName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {account.session.userName} ({account.session.email})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex space-x-4 px-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('credentials')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'credentials'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Credentials
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'test'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Test Connection
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">Active</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expires In</div>
                  <div className="text-lg font-semibold">
                    {Math.round((account.session.expiresAt - Date.now()) / (1000 * 60 * 60))} hours
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">User Type</div>
                  <div className="text-lg font-semibold">{account.session.userType || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Broker</div>
                  <div className="text-lg font-semibold">{account.session.broker || 'N/A'}</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.open('https://kite.zerodha.com/', '_blank')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Open Kite Dashboard
                  </button>
                  <button
                    onClick={() => window.open('https://console.zerodha.com/', '_blank')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Open Console
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'credentials' && (
            <div className="space-y-4">
              <CopyableField label="API Key" value={account.apiKey} />
              <CopyableField label="API Secret" value={account.apiSecret} secret />
              <CopyableField label="Access Token" value={account.session.accessToken} secret />
              <CopyableField label="User ID" value={account.session.userId} />
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-sm mb-2">Using these credentials</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Use these credentials to make API calls to Zerodha Kite. Example authorization header:
                </p>
                <code className="block bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                  Authorization: token {account.apiKey}:{account.session.accessToken}
                </code>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test the connection to verify the session is working correctly.
              </p>
              
              <button
                onClick={testConnection}
                disabled={testing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>

              {testResult && (
                <div className={`p-4 rounded-lg border ${
                  testResult.success
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}>
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{testResult.success ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        {testResult.message}
                      </p>
                      {testResult.data && (
                        <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                          {JSON.stringify(testResult.data, null, 2)}
                        </pre>
                      )}
                      {testResult.error && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {JSON.stringify(testResult.error, null, 2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Account Modal
const EditAccountModal = ({ isOpen, onClose, account, onSaved }: any) => {
  const [formData, setFormData] = useState({ ...account });

  useEffect(() => {
    setFormData({ ...account });
  }, [account]);

  if (!isOpen || !account) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/crud`, {
        key: { accountId: account.accountId },
        updates: {
          accountName: formData.accountName,
          clientId: formData.clientId,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          apiKey: formData.apiKey,
          apiSecret: formData.apiSecret,
          accountType: formData.accountType,
          callbackUrl: formData.callbackUrl,
          postbackUrl: formData.postbackUrl,
          updatedAt: Date.now(),
        },
      }, {
        params: { tableName: 'kite-accounts' },
        headers: { 'Content-Type': 'application/json' },
      });
      onSaved();
      onClose();
    } catch (e:any) {
      alert(e?.message || 'Failed to save');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Account</h2>
        </div>
        <form onSubmit={save} className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Name</label>
            <input className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg" value={formData.accountName || ''} onChange={(e)=>setFormData({ ...formData, accountName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client ID / Username</label>
            <input className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg" value={formData.clientId || ''} onChange={(e)=>setFormData({ ...formData, clientId: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <input className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg" value={formData.phoneNumber || ''} onChange={(e)=>setFormData({ ...formData, phoneNumber: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input type="password" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg" value={formData.password || ''} onChange={(e)=>setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
            <input className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg" value={formData.apiKey || ''} onChange={(e)=>setFormData({ ...formData, apiKey: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Secret</label>
            <input type="password" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg" value={formData.apiSecret || ''} onChange={(e)=>setFormData({ ...formData, apiSecret: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Type</label>
            <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg" value={formData.accountType || 'live'} onChange={(e)=>setFormData({ ...formData, accountType: e.target.value })}>
              <option value="live">Live</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Callback URL *</label>
            <input type="url" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg" value={formData.callbackUrl || ''} onChange={(e)=>setFormData({ ...formData, callbackUrl: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Postback URL (Optional)</label>
            <input type="url" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100 rounded-lg" value={formData.postbackUrl || ''} onChange={(e)=>setFormData({ ...formData, postbackUrl: e.target.value })} />
          </div>
          <div className="flex space-x-2 pt-4">
            <button type="submit" className="flex-1 px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded transition-colors">Save</button>
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function KiteAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [managingAccount, setManagingAccount] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Optional: set from auth context when available

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/crud`, {
        params: { tableName: 'kite-accounts' },
      });
      const raw = response.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.Items)
            ? raw.Items
            : raw?.item
              ? [raw.item]
              : [];
      const filtered = list.filter((a: any) => !userId || a.userId === userId);
      setAccounts(filtered);
    } catch (error: any) {
      // Gracefully handle 404 (e.g., user has no accounts yet)
      if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)) {
        setAccounts([]);
        setError(null);
      } else {
        setError(error.message);
        console.error('Error fetching accounts:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAllSessions = async () => {
    if (accounts.length === 0) return;

    try {
      const response = await axios.post('/api/kite-auth/check-sessions', {
        accounts: accounts,
      });

      if (response.data.success) {
        const { results, summary } = response.data;
        
        // Show notification if any sessions need refresh
        const expiredAccounts = results.filter((r: any) => r.status === 'expired');
        const expiringSoon = results.filter((r: any) => r.status === 'expiring_soon');
        
        if (expiredAccounts.length > 0) {
          console.log(`⚠️ ${expiredAccounts.length} account(s) have expired sessions`);
        }
        
        if (expiringSoon.length > 0) {
          console.log(`⏰ ${expiringSoon.length} account(s) expiring soon (< 2 hours)`);
        }

        // Update UI to reflect session status (already handled by expiresAt check in render)
      }
    } catch (error: any) {
      console.error('Error checking sessions:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
    
    // Auto-check sessions every 5 minutes
    const intervalId = setInterval(() => {
      checkAllSessions();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Check sessions when accounts are loaded
    if (accounts.length > 0) {
      checkAllSessions();
    }
  }, [accounts.length]);

  // Login/Test/Delete removed in CRUD-only mode

  const handleAddAccount = () => {
    fetchAccounts();
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setShowEditModal(true);
  };

  const handleManageAccount = async (account: any) => {
    try {
      // Check if session is still active
      if (!account.session || account.session.expiresAt <= Date.now()) {
        alert('Access token has expired. Please get a new access token first.');
        return;
      }

      console.log('🔐 Opening Trading Dashboard for:', account.accountName);
      console.log('📊 Account data being passed:', {
        accountId: account.accountId,
        hasSession: !!account.session,
        hasAccessToken: !!account.session?.accessToken,
        expiresAt: account.session?.expiresAt ? new Date(account.session.expiresAt).toLocaleString() : 'N/A',
        hoursRemaining: account.session?.expiresAt 
          ? Math.round((account.session.expiresAt - Date.now()) / (1000 * 60 * 60))
          : 'N/A'
      });

      // Store account data in sessionStorage for the popup to access
      // Use a unique key per account to support multiple windows
      const storageKey = `kite_trading_account_${account.accountId}`;
      sessionStorage.setItem(storageKey, JSON.stringify({
        accountId: account.accountId,
        accountName: account.accountName,
        apiKey: account.apiKey,
        accessToken: account.session.accessToken,
        session: account.session,
        timestamp: Date.now()
      }));

      // Open in popup window for multi-account management
      const popupWidth = 1200;
      const popupHeight = 800;
      const left = (window.screen.width - popupWidth) / 2;
      const top = (window.screen.height - popupHeight) / 2;
      
      const popup = window.open(
        `/manage-account?accountId=${account.accountId}`,
        `manage_${account.accountId}`,
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!popup) {
        alert('Failed to open popup. Please allow popups for this site.');
        sessionStorage.removeItem(storageKey);
      } else {
        // Clean up sessionStorage after popup loads (5 seconds grace period)
        setTimeout(() => {
          sessionStorage.removeItem(storageKey);
        }, 5000);
      }
    } catch (error: any) {
      console.error('Error managing account:', error);
      alert('Failed to open account management: ' + error.message);
    }
  };

  const handleGetSession = async (account: any) => {
    try {
      // Store account info in sessionStorage so callback can access it
      sessionStorage.setItem('kite_auth_account', JSON.stringify({
        accountId: account.accountId,
        accountName: account.accountName,
        apiKey: account.apiKey,
        apiSecret: account.apiSecret,
      }));
      
      // Generate Zerodha login URL
      const loginUrl = `https://kite.zerodha.com/connect/login?api_key=${account.apiKey}&v=3`;
      
      console.log('Opening Kite login...');
      console.log('Login URL:', loginUrl);
      
      // Open login in new window
      const loginWindow = window.open(loginUrl, 'kite-login', 'width=600,height=700');
      
      if (!loginWindow) {
        alert('Failed to open login window. Please allow popups for this site.');
        return;
      }

      // Listen for message from callback page
      const handleMessage = (event: MessageEvent) => {
        // Verify origin
        if (event.origin !== window.location.origin) {
          return;
        }

        const { type, requestToken, error } = event.data;

        if (type === 'KITE_AUTH_SUCCESS') {
          console.log('Received auth success message with request token:', requestToken);
          
          // Exchange request token for access token
          exchangeRequestToken(account, requestToken);
          
          // Clean up
          sessionStorage.removeItem('kite_auth_account');
          window.removeEventListener('message', handleMessage);
        } else if (type === 'KITE_AUTH_FAILURE') {
          console.error('Auth failed:', error);
          alert('Authentication failed: ' + (error || 'Unknown error'));
          
          // Clean up
          sessionStorage.removeItem('kite_auth_account');
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Clean up if window is closed manually
      const checkClosed = setInterval(() => {
        if (loginWindow.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          sessionStorage.removeItem('kite_auth_account');
        }
      }, 1000);
    } catch (error: any) {
      console.error('Error getting session:', error);
      alert('Failed to get access token: ' + error.message);
      sessionStorage.removeItem('kite_auth_account');
    }
  };

  const exchangeRequestToken = async (account: any, requestToken: string) => {
    try {
      console.log('🔄 Exchanging request token for access token...');
      
      // Call our API to generate session using the account's credentials
      const sessionResponse = await axios.post('/api/kite-auth/generate-session', {
        requestToken,
        apiKey: account.apiKey,
        apiSecret: account.apiSecret,
      });

      if (!sessionResponse.data.success) {
        throw new Error(sessionResponse.data.error || 'Failed to generate session');
      }

      const sessionData = sessionResponse.data.data;
      const now = Date.now();
      
      // Use consistent sessionId based on accountId so we update the same session
      const sessionId = `sess_${account.accountId}`;
      
      // Create session object
      const session = {
        sessionId: sessionId,
        accountId: account.accountId,
        accessToken: sessionData.access_token,
        requestToken: requestToken,
        userId: sessionData.user_id,
        userName: sessionData.user_name,
        userShortname: sessionData.user_shortname,
        email: sessionData.email,
        userType: sessionData.user_type,
        broker: sessionData.broker,
        loginTime: sessionData.login_time,
        ttl: 24, // 24 hours
        expiresAt: now + (24 * 60 * 60 * 1000),
        createdAt: account.session?.createdAt || now, // Keep original creation time
        updatedAt: now,
        status: 'active'
      };

      console.log('💾 Saving session to database...', {
        sessionId,
        accountId: account.accountId,
        expiresAt: new Date(session.expiresAt).toLocaleString(),
      });

      // Separate key from updates (DynamoDB doesn't allow updating key fields)
      const { sessionId: _sessionId, ...sessionUpdates } = session;

      // Try to update existing session first
      try {
        await axios.put(`${API_BASE_URL}/crud`, {
          key: { sessionId: sessionId },
          updates: sessionUpdates
        }, {
          params: { tableName: 'kite-sessions' }
        });
        console.log('✅ Session updated successfully');
      } catch (updateError: any) {
        // If update fails (session doesn't exist), create new one
        console.log('📝 Session does not exist, creating new one...');
        await axios.post(`${API_BASE_URL}/crud`, {
          item: session
        }, {
          params: { tableName: 'kite-sessions' }
        });
        console.log('✅ Session created successfully');
      }

      console.log('📝 Updating account with session reference...');

      // Update account with session reference
      await axios.put(`${API_BASE_URL}/crud`, {
        key: { accountId: account.accountId },
        updates: { 
          session, 
          hasActiveSession: true,
          lastLoginAt: now,
          updatedAt: now
        }
      }, {
        params: { tableName: 'kite-accounts' }
      });

      console.log('✅ Access token generated and saved successfully!');
      alert('✅ Access token generated successfully!\n\nValid for 24 hours.');
      
      // Refresh accounts to show the new session
      fetchAccounts();
    } catch (error: any) {
      console.error('❌ Error exchanging request token:', error);
      alert('Failed to generate access token: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSelectForTrading = async (account: any) => {
    if (!account.session || account.session.expiresAt <= Date.now()) {
      alert('Please generate a valid access token first before using this account for trading.');
      return;
    }

    try {
      const response = await axios.post('/api/kite-auth/select-account', {
        accountId: account.accountId,
        accessToken: account.session.accessToken,
        apiKey: account.apiKey,
      });

      if (response.data.success) {
        alert(`✓ Account "${account.accountName}" is now selected for trading!\n\nYou can now use the dashboard and trading features.`);
        fetchAccounts(); // Refresh to update UI
      }
    } catch (error: any) {
      console.error('Error selecting account for trading:', error);
      alert('Failed to select account: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleTestConnection = async (account: any) => {
    if (!account.session || account.session.expiresAt <= Date.now()) {
      alert('Access token has expired. Please refresh the access token first.');
      return;
    }

    try {
      const response = await axios.post('/api/kite-auth/test-connection', {
        apiKey: account.apiKey,
        accessToken: account.session.accessToken,
      });

      if (response.data.success) {
        alert(`✅ Connection Successful!\n\nAccount: ${account.accountName}\nUser: ${response.data.data.user_name}\nEmail: ${response.data.data.email}`);
      } else {
        alert(`❌ Connection Failed!\n\n${response.data.message}`);
      }
    } catch (error: any) {
      console.error('Error testing connection:', error);
      alert(`❌ Connection Failed!\n\n${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Kite Accounts
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage your trading accounts and sessions
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchAccounts}
                  disabled={loading}
                  className={`px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded transition-colors"
                >
                  Add Account
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{accounts.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                  {accounts.filter(a => a.hasActiveSession).length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-2xl font-semibold text-gray-400">
                  {accounts.filter(a => !a.hasActiveSession).length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Inactive</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {accounts.filter(a => a.accountType === 'live').length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Live</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Accounts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-900 dark:border-gray-100 border-t-transparent"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No accounts found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 text-sm bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded transition-colors"
              >
                Add Your First Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <AccountCard
                  key={account.accountId}
                  account={account}
                  onRefresh={fetchAccounts}
                  onGetSession={handleGetSession}
                  onEdit={handleEditAccount}
                  onManageAccount={handleManageAccount}
                  onSelectForTrading={handleSelectForTrading}
                  onTestConnection={handleTestConnection}
                />
              ))}
            </div>
          )}

          {/* Add Account Modal */}
          <AddAccountModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddAccount}
            userId={userId}
          />

          {/* Manage Account Modal */}
          <ManageAccountModal
            isOpen={showManageModal}
            onClose={() => setShowManageModal(false)}
            account={managingAccount}
          />

          {/* Edit Account Modal */}
          <EditAccountModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            account={editingAccount}
            onSaved={fetchAccounts}
          />
      </div>
    </MainLayout>
  );
}

