import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Save, AlertCircle, CheckCircle2, Lock, Mail, User, Shield, Clock, Calendar } from 'lucide-react';
import { adminApi } from '../../utils/api';

interface ProfileData {
  id: number;
  username: string;
  email?: string;
  role: string;
  authSource: string;
  canChangePassword: boolean;
  last_login?: string;
  created_at?: string;
  message?: string;
}

export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Email update state
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await adminApi.getProfile();
      setProfile(data);
      setEmail(data.email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const data = await adminApi.updatePassword(passwordForm);

      setMessage({ type: 'success', text: data.message || 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Auto-logout after 2 seconds so the new password takes effect cleanly
      setTimeout(() => {
        logout().catch((error) => {
          console.error('Logout after password change failed:', error);
          window.location.href = '/admin/login';
        });
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to change password',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await adminApi.updateEmail(email);

      setMessage({ type: 'success', text: 'Email updated successfully!' });
      await fetchProfile();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update email',
      });
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-zinc-400">Manage your account settings and credentials</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Account Info */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-orange-500" />
          Account Information
        </h2>

        {profile?.message && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm">
            {profile.message}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-zinc-700">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-zinc-400" />
              <div>
                <div className="text-sm text-zinc-500">Username</div>
                <div className="text-white font-medium">{profile?.username}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-zinc-700">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-zinc-400" />
              <div>
                <div className="text-sm text-zinc-500">Role</div>
                <div className="text-white font-medium capitalize">{profile?.role}</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
              {profile?.role}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-zinc-700">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-zinc-400" />
              <div>
                <div className="text-sm text-zinc-500">Authentication Source</div>
                <div className="text-white font-medium capitalize">{profile?.authSource}</div>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                profile?.authSource === 'database'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              {profile?.authSource}
            </span>
          </div>

          {profile?.last_login && (
            <div className="flex items-center justify-between py-3 border-b border-zinc-700">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-zinc-400" />
                <div>
                  <div className="text-sm text-zinc-500">Last Login</div>
                  <div className="text-white font-medium">
                    {new Date(profile.last_login).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {profile?.created_at && (
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-zinc-400" />
                <div>
                  <div className="text-sm text-zinc-500">Account Created</div>
                  <div className="text-white font-medium">
                    {new Date(profile.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Update */}
      {profile?.canChangePassword && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-500" />
            Email Address
          </h2>

          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                placeholder="admin@ak-chauffage.be"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving || email === profile?.email}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </div>
      )}

      {/* Password Change */}
      {profile?.canChangePassword && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-500" />
            Change Password
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                minLength={8}
                required
              />
              <p className="text-xs text-zinc-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-sm text-red-400">Passwords do not match</p>
            )}

            <button
              type="submit"
              disabled={saving || passwordForm.newPassword !== passwordForm.confirmPassword}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              {saving ? 'Updating...' : 'Change Password'}
            </button>

            <p className="text-sm text-zinc-500">
              Note: You will be logged out after changing your password
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
