'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

interface UISettingsProps {
  settings: any;
  onSave: (data: any) => void;
}

export default function UISettings({ settings, onSave }: UISettingsProps) {
  const [formData, setFormData] = useState(settings || {
    theme: 'dark',
    accentColor: '#3b82f6',
    layoutDensity: 'comfortable',
    enableAnimations: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">UI & Theme Customization</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Theme Mode</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer border rounded-lg p-4 flex items-center justify-center gap-2 transition-all ${formData.theme === 'dark' ? 'bg-blue-600/20 border-blue-600 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={formData.theme === 'dark'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-medium">Dark Mode</span>
              </label>
              <label className={`cursor-pointer border rounded-lg p-4 flex items-center justify-center gap-2 transition-all ${formData.theme === 'light' ? 'bg-blue-600/20 border-blue-600 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={formData.theme === 'light'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-medium">Light Mode</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Accent Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                name="accentColor"
                value={formData.accentColor}
                onChange={handleChange}
                className="w-12 h-12 bg-transparent border-none cursor-pointer rounded-lg"
              />
              <span className="text-gray-400 uppercase">{formData.accentColor}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Layout Density</label>
            <select
              name="layoutDensity"
              value={formData.layoutDensity}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="comfortable">Comfortable (Default)</option>
              <option value="compact">Compact (High Density)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-white">Enable Animations</p>
              <p className="text-sm text-gray-400">Smooth transitions and effects throughout the app</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enableAnimations"
                checked={formData.enableAnimations}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
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
