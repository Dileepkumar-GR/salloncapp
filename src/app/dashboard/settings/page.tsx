'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  Users, 
  Bell, 
  Palette, 
  Database, 
  ShieldCheck 
} from 'lucide-react';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import BusinessSettings from './BusinessSettings';
import InventorySettings from './InventorySettings';
import ProcurementSettings from './ProcurementSettings';
import UserManagement from './UserManagement';
import AlertSettings from './AlertSettings';
import UISettings from './UISettings';
import DataSettings from './DataSettings';
import SecuritySettings from './SecuritySettings';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('business');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const tabs = [
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users, adminOnly: true },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'ui', label: 'UI & Theme', icon: Palette },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  const updateSettings = async (section: string, data: any) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [section]: data }),
      });

      if (!res.ok) {
        const err = await res.json();
        notify(err.error || 'Failed to update settings', 'error');
        return false;
      }

      const updated = await res.json();
      setSettings(updated);
      notify('Settings saved successfully', 'success');
      return true;
    } catch (error) {
      console.error('Failed to update settings', error);
      notify('An error occurred', 'error');
      return false;
    }
  };

  if (loading) {
    return <div className="text-white p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => {
            if (tab.adminOnly && (session?.user as any)?.role !== 'ADMIN') return null;
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 p-6 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'business' && (
                <BusinessSettings 
                  settings={settings?.business} 
                  onSave={(data: any) => updateSettings('business', data)} 
                  isAdmin={(session?.user as any)?.role === 'ADMIN'}
                  workingHours={settings?.workingHours}
                  onSaveWorkingHours={(data: any) => updateSettings('workingHours', data)}
                />
              )}
              {activeTab === 'inventory' && (
                <InventorySettings 
                  settings={settings?.inventory} 
                  onSave={(data: any) => updateSettings('inventory', data)}
                  role={(session?.user as any)?.role}
                />
              )}
              {activeTab === 'procurement' && (
                <ProcurementSettings 
                  settings={settings?.procurement} 
                  onSave={(data: any) => updateSettings('procurement', data)}
                  role={(session?.user as any)?.role}
                />
              )}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'alerts' && (
                <AlertSettings 
                  settings={settings?.alerts} 
                  onSave={(data: any) => updateSettings('alerts', data)}
                />
              )}
              {activeTab === 'ui' && (
                <UISettings 
                  settings={settings?.ui} 
                  onSave={(data: any) => updateSettings('ui', data)}
                />
              )}
              {activeTab === 'data' && (
                <DataSettings 
                  isAdmin={(session?.user as any)?.role === 'ADMIN'}
                  onNotify={notify}
                />
              )}
              {activeTab === 'security' && (
                <SecuritySettings 
                  settings={settings?.security} 
                  onSave={(data: any) => updateSettings('security', data)}
                  isAdmin={(session?.user as any)?.role === 'ADMIN'}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border ${
              toastType === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : toastType === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
