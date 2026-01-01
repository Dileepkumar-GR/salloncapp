'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

interface SecuritySettingsProps {
  settings: any;
  onSave: (data: any) => void;
  isAdmin: boolean;
}

export default function SecuritySettings({ settings, onSave, isAdmin }: SecuritySettingsProps) {
  const [formData, setFormData] = useState(settings || {
    autoLogoutMinutes: 30,
    sessionTimeout: 60,
    enable2FA: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : Number(e.target.value);
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Security Policies</h2>

      {!isAdmin && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg mb-4">
          Read-only access. Only Admin can modify security settings.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Auto Logout Time (Minutes)</label>
            <input
              type="number"
              name="autoLogoutMinutes"
              value={formData.autoLogoutMinutes}
              onChange={handleChange}
              disabled={!isAdmin}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500">Automatically logout inactive users after this duration.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Session Timeout (Minutes)</label>
            <input
              type="number"
              name="sessionTimeout"
              value={formData.sessionTimeout}
              onChange={handleChange}
              disabled={!isAdmin}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500">Maximum duration for a single login session.</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg opacity-75">
            <div>
              <p className="font-medium text-white">Enable 2FA (Coming Soon)</p>
              <p className="text-sm text-gray-400">Two-factor authentication for all users</p>
            </div>
            <label className="relative inline-flex items-center cursor-not-allowed">
              <input
                type="checkbox"
                name="enable2FA"
                checked={formData.enable2FA}
                disabled
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-800">
          <h3 className="text-lg font-medium text-white">Device Login History</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">No login history available.</p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
