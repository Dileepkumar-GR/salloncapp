'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

interface AlertSettingsProps {
  settings: any;
  onSave: (data: any) => void;
}

export default function AlertSettings({ settings, onSave }: AlertSettingsProps) {
  const [formData, setFormData] = useState(settings || {
    enableLowStockAlerts: true,
    enableExpiryAlerts: true,
    notificationChannels: {
      dashboard: true,
      email: false
    },
    alertFrequency: 'daily'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('channel_')) {
      const channel = name.split('_')[1];
      setFormData({
        ...formData,
        notificationChannels: {
          ...formData.notificationChannels,
          [channel]: (e.target as HTMLInputElement).checked
        }
      });
    } else {
      setFormData({ 
        ...formData, 
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Alerts & Notifications</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Low Stock Alerts</p>
              <p className="text-sm text-gray-400">Notify when inventory falls below threshold</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enableLowStockAlerts"
                checked={formData.enableLowStockAlerts}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Expiry Alerts</p>
              <p className="text-sm text-gray-400">Notify before items expire</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enableExpiryAlerts"
                checked={formData.enableExpiryAlerts}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-800">
          <h3 className="text-lg font-medium text-white">Notification Channels</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <input
                type="checkbox"
                name="channel_dashboard"
                checked={formData.notificationChannels.dashboard}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 bg-gray-700 border-gray-600"
              />
              <label className="text-sm font-medium text-gray-300">In-App Dashboard</label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <input
                type="checkbox"
                name="channel_email"
                checked={formData.notificationChannels.email}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 bg-gray-700 border-gray-600"
              />
              <label className="text-sm font-medium text-gray-300">Email Notifications</label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Alert Frequency</label>
          <select
            name="alertFrequency"
            value={formData.alertFrequency}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily Summary</option>
            <option value="weekly">Weekly Report</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
