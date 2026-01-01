'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

interface BusinessSettingsProps {
  settings: any;
  onSave: (data: any) => Promise<boolean>;
  isAdmin: boolean;
  workingHours?: { openingTime: string; closingTime: string; weeklyOffDay: string };
  onSaveWorkingHours?: (data: { openingTime: string; closingTime: string; weeklyOffDay: string }) => Promise<boolean>;
}

export default function BusinessSettings({ settings, onSave, isAdmin, workingHours, onSaveWorkingHours }: BusinessSettingsProps) {
  const [formData, setFormData] = useState(settings || {
    shopName: '',
    contactNumber: '',
    email: '',
    address: '',
    businessType: 'Salon',
    gstNumber: '',
    defaultTaxPercent: 0,
    taxType: 'Inclusive',
    invoicePrefix: 'SAL',
    invoiceFooterMessage: '',
    logoUrl: '',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY'
  });

  const [hours, setHours] = useState(workingHours || {
    openingTime: '09:00',
    closingTime: '21:00',
    weeklyOffDay: 'Sunday'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'defaultTaxPercent') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData({ ...formData, logoUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHours({ ...hours, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onSave(formData);
    if (ok && isAdmin && onSaveWorkingHours) {
      await onSaveWorkingHours(hours);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Business & Shop Settings</h2>
      
      {!isAdmin && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg mb-4">
          Read-only access. Only Admin can edit these settings.
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Salon / Shop Name</label>
          <input
            type="text"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Business Type</label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="Salon">Salon</option>
            <option value="Barbershop">Barbershop</option>
            <option value="Spa">Spa</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-gray-400">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Default Tax %</label>
          <input
            type="number"
            name="defaultTaxPercent"
            value={formData.defaultTaxPercent}
            onChange={handleChange}
            disabled={!isAdmin}
            min={0}
            max={100}
            step={0.01}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Tax Type</label>
          <select
            name="taxType"
            value={formData.taxType}
            onChange={handleChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="Inclusive">Inclusive</option>
            <option value="Exclusive">Exclusive</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Invoice Prefix</label>
          <input
            type="text"
            name="invoicePrefix"
            value={formData.invoicePrefix}
            onChange={handleChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-gray-400">Invoice Footer Message</label>
          <input
            type="text"
            name="invoiceFooterMessage"
            value={formData.invoiceFooterMessage}
            onChange={handleChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Currency Symbol</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="₹">₹ (INR)</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
            <option value="£">£ (GBP)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Timezone</label>
          <select
             name="timezone"
             value={formData.timezone}
             onChange={handleChange}
             disabled={!isAdmin}
             className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Date Format</label>
          <select
             name="dateFormat"
             value={formData.dateFormat}
             onChange={handleChange}
             disabled={!isAdmin}
             className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Salon Logo</label>
          <input
            type="file"
            name="logoFile"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white file:bg-gray-700 file:text-white disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Opening Time</label>
          <input
            type="time"
            name="openingTime"
            value={hours.openingTime}
            onChange={handleHoursChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Closing Time</label>
          <input
            type="time"
            name="closingTime"
            value={hours.closingTime}
            onChange={handleHoursChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Weekly Off Day</label>
          <select
            name="weeklyOffDay"
            value={hours.weeklyOffDay}
            onChange={handleHoursChange}
            disabled={!isAdmin}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
          </select>
        </div>

        {isAdmin && (
          <div className="md:col-span-2 flex justify-end">
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
