'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

interface InventorySettingsProps {
  settings: any;
  onSave: (data: any) => void;
  role: string;
}

export default function InventorySettings({ settings, onSave, role }: InventorySettingsProps) {
  const [formData, setFormData] = useState(settings || {
    lowStockThreshold: 10,
    expiryAlertDays: 30,
    enableExpiryTracking: true,
    fifoMode: true,
    allowNegativeStock: false
  });

  const canEdit = role === 'admin' || role === 'manager';

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
      <h2 className="text-xl font-bold text-white mb-4">Inventory Configuration</h2>

      {!canEdit && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg mb-4">
          Read-only access.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Default Low Stock Threshold</label>
            <input
              type="number"
              name="lowStockThreshold"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              disabled={!canEdit}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Expiry Alert Days (Before Expiry)</label>
            <input
              type="number"
              name="expiryAlertDays"
              value={formData.expiryAlertDays}
              onChange={handleChange}
              disabled={!canEdit}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Enable Expiry Tracking</p>
              <p className="text-sm text-gray-400">Track expiration dates for all inventory units</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enableExpiryTracking"
                checked={formData.enableExpiryTracking}
                onChange={handleChange}
                disabled={!canEdit}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg opacity-75">
            <div>
              <p className="font-medium text-white">FIFO Mode (First-In-First-Out)</p>
              <p className="text-sm text-gray-400">Automatically consume oldest stock first. Cannot be disabled.</p>
            </div>
            <label className="relative inline-flex items-center cursor-not-allowed">
              <input
                type="checkbox"
                name="fifoMode"
                checked={true}
                readOnly
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-blue-600 rounded-full peer after:translate-x-full after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Allow Negative Stock</p>
              <p className="text-sm text-gray-400">Allow consumption even if stock is 0 (Not recommended)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="allowNegativeStock"
                checked={formData.allowNegativeStock}
                onChange={handleChange}
                disabled={!canEdit}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {canEdit && (
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
