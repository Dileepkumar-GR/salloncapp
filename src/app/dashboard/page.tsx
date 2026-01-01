'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Package, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    expired: 0,
    pendingRequests: 0,
  });
  const [alerts, setAlerts] = useState({
    lowStock: [],
    expiringSoon: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        setStats(data.stats);
        setAlerts(data.alerts);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Low Stock', value: stats.lowStock, icon: TrendingDown, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Expired Units', value: stats.expired, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { title: 'Pending Orders', value: stats.pendingRequests, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl border border-gray-800 bg-gray-900 ${stat.bg}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-2">{loading ? '-' : stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingDown className="text-yellow-500" /> Low Stock Alerts
          </h2>
          {loading ? (
             <div className="text-gray-500">Loading...</div>
          ) : alerts.lowStock.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No low stock alerts
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.lowStock.map((item: any) => (
                <div key={item._id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <span className="font-medium">{item.productName}</span>
                  <span className="text-yellow-500 font-bold">{item.stockCount} / {item.lowStockThreshold}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry Alerts */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> Expiring Soon (30 Days)
          </h2>
          {loading ? (
             <div className="text-gray-500">Loading...</div>
          ) : alerts.expiringSoon.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No expiry alerts
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-64">
              {alerts.expiringSoon.map((unit: any) => (
                <div key={unit._id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium text-white">{unit.productGroupId?.productName}</span>
                    <span className="text-red-400 text-sm font-mono">{unit.sku}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-sm text-gray-400">
                     <span>Exp: {new Date(unit.expiryDate).toLocaleDateString()}</span>
                     <span>Stocked: {new Date(unit.stockedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
