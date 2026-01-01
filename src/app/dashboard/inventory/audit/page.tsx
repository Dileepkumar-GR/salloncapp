'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function InventoryAuditPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/inventory/units');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load units');
      setUnits(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const markStatus = async (id: string, status: 'ACTIVE' | 'EXPIRED' | 'CONSUMED') => {
    try {
      const res = await fetch(`/api/inventory/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      setUnits(prev => prev.map(u => u._id === id ? { ...u, status } : u));
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Unit Inventory Audit</h1>
      <p className="text-sm text-gray-400">Review all individual units, verify physical stock, and mark missing/damaged/expired units.</p>

      {error && <div className="bg-red-500/10 text-red-500 p-3 rounded">{error}</div>}

      {loading ? (
        <div className="text-gray-500">Loading units...</div>
      ) : units.length === 0 ? (
        <div className="text-gray-500">No units found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Stocked</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u: any) => (
                <tr key={u._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-900/30">
                  <td className="px-4 py-3 text-gray-300">{u.productGroupId?.productName}</td>
                  <td className="px-4 py-3 font-mono text-gray-300">{u.sku}</td>
                  <td className="px-4 py-3 text-gray-300">{new Date(u.expiryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.stockedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 
                        u.status === 'EXPIRED' ? 'bg-red-500/10 text-red-500' : 
                        'bg-gray-500/10 text-gray-500'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      className="px-2 py-1 bg-green-600 rounded text-white text-xs hover:bg-green-500"
                      title="Mark Active"
                      onClick={() => markStatus(u._id, 'ACTIVE')}
                    >
                      <CheckCircle size={14} />
                    </button>
                    <button
                      className="px-2 py-1 bg-red-600 rounded text-white text-xs hover:bg-red-500"
                      title="Mark Expired"
                      onClick={() => markStatus(u._id, 'EXPIRED')}
                    >
                      <AlertTriangle size={14} />
                    </button>
                    <button
                      className="px-2 py-1 bg-gray-600 rounded text-white text-xs hover:bg-gray-500"
                      title="Mark Consumed"
                      onClick={() => markStatus(u._id, 'CONSUMED')}
                    >
                      <XCircle size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
