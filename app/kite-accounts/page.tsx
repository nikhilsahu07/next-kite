'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
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

// Account Card Component
const AccountCard = ({ account, onRefresh, onDelete, onLogin }: any) => {
  const [expanded, setExpanded] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/kite/auth/validate/${account.accountId}`);
      setConnectionStatus(response.data);
    } catch (error: any) {
      setConnectionStatus({ success: false, connected: false, error: error.message });
    } finally {
      setTesting(false);
    }
  };

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
    <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold">{account.accountName}</h3>
            <p className="text-indigo-100 mt-1">{account.clientId}</p>
            <div className="flex items-center space-x-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()} border`}>
                {sessionStatus === 'active' ? '🟢 Active Session' : sessionStatus === 'expired' ? '🟡 Expired' : '⚪ No Session'}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                {account.accountType.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? '▼' : '▶'}
            </button>
            <button
              onClick={onRefresh}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{account.status}</div>
            <div className="text-xs text-gray-500 uppercase mt-1">Status</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">
              {account.hasActiveSession ? <CheckIcon /> : <XIcon />}
            </div>
            <div className="text-xs text-gray-500 uppercase mt-1">Connected</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
              {new Date(account.createdAt).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500 uppercase mt-1">Created</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
              {new Date(account.updatedAt).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-500 uppercase mt-1">Updated</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => onLogin(account.accountId)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            🔐 Login
          </button>
          <button
            onClick={testConnection}
            disabled={testing}
            className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors ${
              testing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {testing ? '⏳ Testing...' : '🔍 Test Connection'}
          </button>
          <button
            onClick={() => window.open(`${API_BASE_URL}/kite/profile/${account.accountId}`, '_blank')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            📊 View Profile
          </button>
          <button
            onClick={() => onDelete(account.accountId)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            🗑️ Delete
          </button>
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
                  🎫 Active Session
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CopyableField label="Session ID" value={account.session.sessionId} />
                  <CopyableField label="Access Token" value={account.session.accessToken} secret />
                  <CopyableField label="Request Token" value={account.session.requestToken} />
                  <CopyableField label="Encrypted Token" value={account.session.enctoken} secret />
                  <CopyableField 
                    label="Created At" 
                    value={new Date(account.session.createdAt).toLocaleString()} 
                  />
                  <CopyableField 
                    label="Expires At" 
                    value={new Date(account.session.expiresAt).toLocaleString()} 
                  />
                  <CopyableField 
                    label="Last Used" 
                    value={new Date(account.session.lastUsed).toLocaleString()} 
                  />
                  <CopyableField label="Status" value={account.session.status} />
                </div>
              </div>
            )}

            {/* Raw API URLs */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                🔗 API Endpoints
              </h4>
              <div className="space-y-2">
                <CopyableField 
                  label="Profile API" 
                  value={`${API_BASE_URL}/kite/profile/${account.accountId}`} 
                />
                <CopyableField 
                  label="Holdings API" 
                  value={`${API_BASE_URL}/kite/holdings/${account.accountId}`} 
                />
                <CopyableField 
                  label="Positions API" 
                  value={`${API_BASE_URL}/kite/positions/${account.accountId}`} 
                />
                <CopyableField 
                  label="Orders API" 
                  value={`${API_BASE_URL}/kite/orders/${account.accountId}`} 
                />
                <CopyableField 
                  label="Margins API" 
                  value={`${API_BASE_URL}/kite/margins/${account.accountId}`} 
                />
              </div>
            </div>

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
  const [formData, setFormData] = useState({
    accountName: '',
    clientId: '',
    phoneNumber: '',
    password: '',
    apiKey: '',
    apiSecret: '',
    accountType: 'live',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/kite/accounts`, {
        ...formData,
        userId,
      });
      if (response.data.success) {
        onAdd(response.data.account);
        onClose();
        setFormData({
          accountName: '',
          clientId: '',
          phoneNumber: '',
          password: '',
          apiKey: '',
          apiSecret: '',
          accountType: 'live',
        });
      }
    } catch (error: any) {
      console.error('Error adding account:', error);
      alert('Failed to add account: ' + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-black rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Add New Kite Account</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Account
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
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
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('user123'); // TODO: Get from auth context

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/kite/accounts/user/${userId}/with-sessions?includeSecrets=true`
      );
      if (response.data.success) {
        setAccounts(response.data.accounts);
      } else {
        setError(response.data.error);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAccounts();
    }
  }, [userId]);

  const handleLogin = async (accountId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kite/auth/login-url/${accountId}`);
      if (response.data.success) {
        window.open(response.data.loginUrl, '_blank');
      }
    } catch (error: any) {
      alert('Failed to get login URL: ' + error.message);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/kite/accounts/${accountId}`);
      if (response.data.success) {
        fetchAccounts();
      }
    } catch (error: any) {
      alert('Failed to delete account: ' + error.message);
    }
  };

  const handleAddAccount = () => {
    fetchAccounts();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  🎯 Kite Accounts Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your Kite trading accounts, sessions, and credentials
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchAccounts}
                  disabled={loading}
                  className={`px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? '⏳ Loading...' : '🔄 Refresh'}
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  ➕ Add Account
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{accounts.length}</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 uppercase mt-1">Total Accounts</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                  {accounts.filter(a => a.hasActiveSession).length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 uppercase mt-1">Active Sessions</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                  {accounts.filter(a => !a.hasActiveSession).length}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400 uppercase mt-1">Inactive</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                  {accounts.filter(a => a.accountType === 'live').length}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 uppercase mt-1">Live Accounts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">Error Loading Accounts</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">No accounts found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                ➕ Add Your First Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {accounts.map((account) => (
                <AccountCard
                  key={account.accountId}
                  account={account}
                  onRefresh={fetchAccounts}
                  onDelete={handleDelete}
                  onLogin={handleLogin}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Account Modal */}
        <AddAccountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAccount}
          userId={userId}
        />
      </div>
    </div>
  );
}

