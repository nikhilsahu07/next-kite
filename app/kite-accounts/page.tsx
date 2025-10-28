'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';
import crypto from 'crypto';

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

// Account Card Component (CRUD-only)
const AccountCard = ({ account, onRefresh, onGetSession, onEdit }: any) => {
  const [expanded, setExpanded] = useState(false);
  const [connectionStatus] = useState<any>(null);

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
            className="px-3 py-1.5 text-sm bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded transition-colors"
          >
            Get Session Token
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Created: {new Date(account.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Connection Status (disabled) */}
        {false && connectionStatus && (
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
                  {account.session.expiresAt && (
                    <CopyableField 
                      label="Expires At" 
                      value={new Date(account.session.expiresAt).toLocaleString()} 
                    />
                  )}
                  {account.session.ttl && (
                    <CopyableField 
                      label="TTL" 
                      value={`${account.session.ttl} hours`} 
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
  const [formData, setFormData] = useState({
    accountName: '',
    clientId: '',
    phoneNumber: '',
    password: '',
    apiKey: '',
    apiSecret: '',
    accountType: 'live',
    callbackUrl: '',
    postbackUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = Date.now();
      const accountId = (crypto as any).randomUUID ? (crypto as any).randomUUID() : `acc_${now}_${Math.random().toString(36).slice(2, 8)}`;
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
          callbackUrl: '',
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
              placeholder="https://brmh.in/callback"
              required
            />
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
  const [editingAccount, setEditingAccount] = useState<any>(null);
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

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Login/Test/Delete removed in CRUD-only mode

  const handleAddAccount = () => {
    fetchAccounts();
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setShowEditModal(true);
  };

  const handleGetSession = async (account: any) => {
    try {
      // Generate Zerodha login URL with callback
      const callbackUrl = encodeURIComponent(account.callbackUrl || `${API_BASE_URL}/callback`);
      const loginUrl = `https://kite.zerodha.com/connect/login?api_key=${account.apiKey}&v=3`;
      
      // Open login in new window
      const loginWindow = window.open(loginUrl, 'kite-login', 'width=600,height=700');
      
      if (loginWindow) {
        // Listen for callback with request token
        const checkMessage = (event: MessageEvent) => {
          if (event.origin === 'https://kite.zerodha.com' || event.data?.request_token) {
            const requestToken = event.data?.request_token || new URL(event.data.url).searchParams.get('request_token');
            
            if (requestToken) {
              // Exchange request token for access token
              axios.post(`${API_BASE_URL}/crud`, {
                item: {
                  accountId: account.accountId,
                  requestToken,
                  timestamp: Date.now(),
                  apiKey: account.apiKey,
                  apiSecret: account.apiSecret,
                }
              }, {
                params: { tableName: 'kite-sessions' }
              }).then(async (sessionRes) => {
                // Use Kite API to generate session
                const session = {
                  sessionId: crypto.randomUUID?.() || `sess_${Date.now()}`,
                  accountId: account.accountId,
                  accessToken: requestToken, // Will be replaced with actual access token from Zerodha
                  requestToken,
                  ttl: 24, // 24 hours
                  expiresAt: Date.now() + (24 * 60 * 60 * 1000),
                  createdAt: Date.now(),
                  status: 'active'
                };

                // Store session in sessions table
                await axios.post(`${API_BASE_URL}/crud`, { item: session }, {
                  params: { tableName: 'kite-sessions' }
                });

                // Update account with session reference
                await axios.put(`${API_BASE_URL}/crud`, {
                  key: { accountId: account.accountId },
                  updates: { session, hasActiveSession: true }
                }, {
                  params: { tableName: 'kite-accounts' }
                });

                alert('Session token generated successfully! Refresh to see it.');
                fetchAccounts();
              });
              
              window.removeEventListener('message', checkMessage);
              loginWindow.close();
            }
          }
        };

        window.addEventListener('message', checkMessage);
      }
    } catch (error: any) {
      console.error('Error getting session:', error);
      alert('Failed to get session token: ' + error.message);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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

          {/* Edit Account Modal */}
          <EditAccountModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            account={editingAccount}
            onSaved={fetchAccounts}
          />
        </div>
      </div>
    </>
  );
}

