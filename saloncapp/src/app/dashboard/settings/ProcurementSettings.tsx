'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

interface ProcurementSettingsProps {
  settings: any;
  onSave: (data: any) => void;
  role: string;
}

export default function ProcurementSettings({ settings, onSave, role }: ProcurementSettingsProps) {
  const [formData, setFormData] = useState(settings || {
    requireAdminApproval: true,
    allowPartialReceive: true,
    maxReceiveQuantity: 100,
    invoiceMandatory: true
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
      <h2 className="text-xl font-bold text-white mb-4">Procurement Workflow</h2>

      {!canEdit && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg mb-4">
          Read-only access.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Require Admin Approval</p>
              <p className="text-sm text-gray-400">All procurement requests must be approved by an admin</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="requireAdminApproval"
                checked={formData.requireAdminApproval}
                onChange={handleChange}
                disabled={!canEdit}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Allow Partial Receive</p>
              <p className="text-sm text-gray-400">Allow receiving partial quantities against an order</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="allowPartialReceive"
                checked={formData.allowPartialReceive}
                onChange={handleChange}
                disabled={!canEdit}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Invoice Mandatory</p>
              <p className="text-sm text-gray-400">Require invoice upload when receiving stock</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="invoiceMandatory"
                checked={formData.invoiceMandatory}
                onChange={handleChange}
                disabled={!canEdit}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Max Receive Quantity (Validation)</label>
          <input
            type="number"
            name="maxReceiveQuantity"
            value={formData.maxReceiveQuantity}
            onChange={handleChange}
            disabled={!canEdit}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500">Maximum allowed quantity per receive transaction to prevent errors.</p>
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
