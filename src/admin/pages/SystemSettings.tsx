import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Mail, Server, Send, Shield, Info } from 'lucide-react';

interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  from: string;
  source: string;
  hasPassword?: boolean;
}

export default function SystemSettings() {
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    host: '',
    port: 465,
    user: '',
    from: '',
    source: 'environment',
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    fetchSMTPConfig();
  }, []);

  const fetchSMTPConfig = async () => {
    try {
      const response = await fetch('/api/system-settings/smtp', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch SMTP config');

      const data = await response.json();
      setSmtpConfig(data);
    } catch (error) {
      console.error('Error fetching SMTP config:', error);
      setMessage({ type: 'error', text: 'Failed to load SMTP configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/system-settings/smtp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          host: smtpConfig.host,
          port: smtpConfig.port,
          user: smtpConfig.user,
          pass: password,
          from: smtpConfig.from,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save SMTP configuration');
      }

      setMessage({ type: 'success', text: 'SMTP configuration saved successfully!' });
      setPassword(''); // Clear password field
      await fetchSMTPConfig(); // Refresh config
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save SMTP configuration',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/system-settings/smtp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          host: smtpConfig.host,
          port: smtpConfig.port,
          user: smtpConfig.user,
          pass: password || undefined, // Use new password if provided
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Connection test failed');
      }

      setMessage({ type: 'success', text: data.message || 'SMTP connection successful!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'SMTP connection failed',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-zinc-400">Manage core system configuration</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : message.type === 'info'
              ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : message.type === 'info' ? (
            <Info className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Configuration Source Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-blue-400 mb-1">Current Source: {smtpConfig.source}</div>
            <p className="text-sm text-blue-300">
              {smtpConfig.source === 'database'
                ? 'SMTP configuration is stored in the database. Changes here will override .env settings.'
                : 'Currently using .env file for SMTP. Save settings below to override and use database storage.'}
            </p>
          </div>
        </div>
      </div>

      {/* SMTP Configuration */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-orange-500" />
          SMTP Configuration
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                <Server className="w-4 h-4 inline mr-1" />
                SMTP Host
              </label>
              <input
                type="text"
                value={smtpConfig.host}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Port</label>
              <input
                type="number"
                value={smtpConfig.port}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="465"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">Usually 465 (SSL) or 587 (TLS)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Username / Email</label>
            <input
              type="text"
              value={smtpConfig.user}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="your-email@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Password {smtpConfig.hasPassword && <span className="text-green-400">(Saved)</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder={smtpConfig.hasPassword ? 'Leave empty to keep current password' : 'SMTP password'}
            />
            {smtpConfig.hasPassword && (
              <p className="text-xs text-zinc-500 mt-1">
                Leave empty to keep current password, or enter new password to update
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">From Address</label>
            <input
              type="email"
              value={smtpConfig.from}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="noreply@ak-chauffage.be"
              required
            />
            <p className="text-xs text-zinc-500 mt-1">Email address that appears in the "From" field</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !smtpConfig.host || !smtpConfig.user}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Common SMTP Providers</h3>
            <div className="grid md:grid-cols-2 gap-3 text-xs text-zinc-400">
              <div>
                <strong className="text-zinc-300">Gmail:</strong> smtp.gmail.com:465
                <br />
                <span className="text-zinc-500">Requires app-specific password</span>
              </div>
              <div>
                <strong className="text-zinc-300">Outlook:</strong> smtp-mail.outlook.com:587
              </div>
              <div>
                <strong className="text-zinc-300">SendGrid:</strong> smtp.sendgrid.net:465
              </div>
              <div>
                <strong className="text-zinc-300">Mailgun:</strong> smtp.mailgun.org:587
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Security Notice */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-400">
            <strong className="text-zinc-300">Security:</strong> SMTP passwords are encrypted using AES-256-CBC before being stored in the database. Only authorized administrators can view or update these settings.
          </div>
        </div>
      </div>
    </div>
  );
}
