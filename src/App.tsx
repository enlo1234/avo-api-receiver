import React, { useState } from 'react';
import { Database, Download, Copy, CheckCircle, Terminal, Key, User, Lock, Info, AlertTriangle, HelpCircle } from 'lucide-react';

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
  const [curlCopied, setCurlCopied] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

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
    setDebugInfo(null);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add Basic Authorization header if credentials are provided - using lowercase 'authorization'
      if (username.trim() && password.trim()) {
        const encodedCredentials = encodeBasicAuth(username.trim(), password.trim());
        headers['authorization'] = `Basic ${encodedCredentials}`;
      }
      
      // Use proxied URL for the actual request
      const proxiedUrl = getProxiedUrl(apiUrl);
      
      console.log('Making request to:', proxiedUrl);
      console.log('Original URL:', apiUrl);
      console.log('Headers:', headers);
      
      const response = await fetch(proxiedUrl, { headers });
      
      // Capture debug information
      setDebugInfo({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
        originalUrl: apiUrl,
        proxiedUrl: proxiedUrl
      });
      
      if (!response.ok) {
        const responseText = await response.text();
        console.log('Response body:', responseText);
        
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        // Provide specific guidance for common errors
        if (response.status === 404) {
          errorMessage += '\n\nPossible causes:\n• Incorrect Workspace ID or Branch ID\n• API endpoint structure has changed\n• Branch or workspace doesn\'t exist';
        } else if (response.status === 401) {
          errorMessage += '\n\nAuthentication failed:\n• Check your service account credentials\n• Verify the service account has access to this workspace';
        } else if (response.status === 403) {
          errorMessage += '\n\nAccess forbidden:\n• Service account may not have permission to access this resource';
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setSchema(data);
    } catch (err) {
      console.error('Fetch error:', err);
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

  const generateCurlCommand = () => {
    if (!apiUrl.trim()) return '';
    
    let curlCommand = `curl -H "Content-Type: application/json"`;
    
    if (username.trim() && password.trim()) {
      const encodedCredentials = encodeBasicAuth(username.trim(), password.trim());
      curlCommand += ` \\\n  -H "authorization: Basic ${encodedCredentials}"`;
    }
    
    curlCommand += ` \\\n  -X GET "${apiUrl}" \\\n  -v`;
    
    return curlCommand;
  };

  const copyCurlCommand = async () => {
    const curlCommand = generateCurlCommand();
    if (!curlCommand) return;
    
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCurlCopied(true);
      setTimeout(() => setCurlCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy curl command:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchSchema();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Avo Schema Receiver</h1>
          </div>
          <p className="text-gray-600">Fetch and display event schemas from Avo's API</p>
        </div>

        {/* CORS Fix Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">CORS Issue Fixed</p>
              <p>This app now uses a Vite proxy to bypass browser CORS restrictions. Your API requests will work properly in development mode.</p>
            </div>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2" />
            Getting 404 Error? Here's how to find the correct values:
          </h2>
          
          <div className="space-y-4 text-sm text-orange-800">
            <div>
              <h3 className="font-semibold mb-2">1. Find your Workspace ID:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Log into your Avo dashboard</li>
                <li>Look at the URL: <code className="bg-orange-100 px-1 rounded">https://app.avo.app/workspaces/[WORKSPACE_ID]/...</code></li>
                <li>The Workspace ID is the part after <code>/workspaces/</code></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">2. Find your Branch ID:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>In your Avo dashboard, navigate to the branch you want</li>
                <li>Look at the URL: <code className="bg-orange-100 px-1 rounded">https://app.avo.app/workspaces/[WORKSPACE_ID]/branches/[BRANCH_ID]/...</code></li>
                <li>The Branch ID is the part after <code>/branches/</code></li>
                <li>Common branch names: <code>main</code>, <code>master</code>, <code>production</code></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">3. Alternative API endpoints to try:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code className="bg-orange-100 px-1 rounded">https://api.avo.app/workspaces/[ID]/branches/[ID]/export</code></li>
                <li><code className="bg-orange-100 px-1 rounded">https://api.avo.app/workspaces/[ID]/branches/[ID]/schema</code></li>
                <li><code className="bg-orange-100 px-1 rounded">https://api.avo.app/v1/workspaces/[ID]/branches/[ID]/export</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            API Configuration
          </h2>
          
          <div className="space-y-4">
            {/* API URL Input */}
            <div>
              <label htmlFor="api-url" className="block text-sm font-medium text-gray-700 mb-2">
                Avo API Endpoint
              </label>
              <input
                id="api-url"
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://api.avo.app/workspaces/YOUR_WORKSPACE_ID/branches/YOUR_BRANCH_ID/export/v1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              
              {/* API URL Help */}
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Example URL format:</p>
                    <code className="text-xs bg-amber-100 px-2 py-1 rounded block mb-2">
                      https://api.avo.app/workspaces/abc123/branches/main/export/v1
                    </code>
                    <p className="text-xs">Replace <code>abc123</code> with your Workspace ID and <code>main</code> with your Branch ID</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Auth Credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Basic Authentication (Service Account)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Service Account Name
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="service-account-name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={loading}
                  />
                </div>

                {/* Password/Secret */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Key className="w-4 h-4 mr-1" />
                    Service Account Secret
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="your-secret-key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded p-2">
                <strong>Basic Auth Format:</strong> Your credentials will be Base64 encoded as "name:secret" and sent as:<br />
                <code className="text-blue-800">authorization: Basic {username && password ? encodeBasicAuth(username, password) : '[Base64-encoded-credentials]'}</code>
              </div>
            </div>

            {/* Fetch Button */}
            <button
              onClick={fetchSchema}
              disabled={loading || !apiUrl.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Fetching...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Fetch Schema
                </>
              )}
            </button>
          </div>
        </div>

        {/* Debug Information */}
        {debugInfo && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Terminal className="w-5 h-5 mr-2" />
              Debug Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-800 overflow-auto">
                <code>{JSON.stringify(debugInfo, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Curl Command Display */}
        {apiUrl.trim() && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Terminal className="w-5 h-5 mr-2" />
                Exact Curl Command (matches Avo's format)
              </h3>
              <button
                onClick={copyCurlCommand}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {curlCopied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Curl
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 overflow-auto text-sm font-mono">
              <code>{generateCurlCommand()}</code>
            </pre>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Key Fix:</strong> Using lowercase <code>"authorization"</code> header as specified by Avo's documentation
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-600 font-medium">Error Details:</p>
                <pre className="text-red-600 text-sm mt-2 whitespace-pre-wrap">{error}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Schema Display */}
        {schema && (
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Schema Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{schema.name || 'Event Schema'}</h2>
                {schema.description && (
                  <p className="text-gray-600 mt-1">{schema.description}</p>
                )}
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy JSON
                  </>
                )}
              </button>
            </div>

            {/* Schema Content */}
            <div className="p-6">
              <pre className="bg-gray-50 rounded-lg p-4 overflow-auto text-sm text-gray-800">
                <code>{JSON.stringify(schema, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!schema && !loading && !error && (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Enter an Avo API endpoint above to fetch event schema</p>
            <p className="text-gray-400 text-sm mt-2">Follow the troubleshooting guide above if you're getting 404 errors</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;