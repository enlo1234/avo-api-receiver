import React, { useState } from 'react';
import { Download, Copy, CheckCircle } from 'lucide-react';

interface AvoSchema {
  name: string;
  description?: string;
  properties: Record<string, any>;
  [key: string]: any;
}

function App() {
  const [apiUrl, setApiUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [schema, setSchema] = useState<AvoSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const encodeBasicAuth = (username: string, password: string): string => {
    return btoa(`${username}:${password}`);
  };

  // Convert external API URL to proxied URL for development
  const getProxiedUrl = (url: string): string => {
    if (url.startsWith('https://api.avo.app')) {
      return url.replace('https://api.avo.app', '/api');
    }
    return url;
  };

  const fetchSchema = async () => {
    if (!apiUrl.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add Basic Authorization header if credentials are provided
      if (username.trim() && password.trim()) {
        const encodedCredentials = encodeBasicAuth(username.trim(), password.trim());
        headers['authorization'] = `Basic ${encodedCredentials}`;
      }
      
      // Use proxied URL for the actual request
      const proxiedUrl = getProxiedUrl(apiUrl);
      
      const response = await fetch(proxiedUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSchema(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schema');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!schema) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchSchema();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Avo Schema Receiver</h1>
        <p className="text-gray-600">Fetch event schemas from Avo's API</p>
      </div>

      {/* Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">API Endpoint</label>
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://api.avo.app/workspaces/YOUR_WORKSPACE_ID/branches/YOUR_BRANCH_ID/export/v1"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="service-account-name"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="your-secret-key"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={fetchSchema}
          disabled={loading || !apiUrl.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Loading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Fetch Schema
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Schema Result */}
      {schema && (
        <div className="border rounded">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="font-medium">{schema.name || 'Schema'}</h2>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-4">
            <pre className="bg-gray-50 rounded p-3 overflow-auto text-sm">
              <code>{JSON.stringify(schema, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!schema && !loading && !error && (
        <div className="text-center py-12 text-gray-500">
          <p>Enter an API endpoint above to fetch your schema</p>
        </div>
      )}
    </div>
  );
}

export default App;