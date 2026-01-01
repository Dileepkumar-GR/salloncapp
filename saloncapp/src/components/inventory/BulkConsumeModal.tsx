'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function BulkConsumeModal({ isOpen, onClose, product, onSuccess }: any) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('SALES');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/inventory/consume-fifo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productGroupId: product._id, 
          quantity, 
          reason 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to consume stock');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-md p-6 rounded-xl border border-gray-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Consume Stock (FIFO)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="bg-blue-500/10 p-4 rounded-lg mb-6 border border-blue-500/20">
          <h3 className="text-sm font-semibold text-blue-400 mb-1 flex items-center gap-2">
             <AlertTriangle size={16} /> FIFO Engine Active
          </h3>
          <p className="text-xs text-gray-400">
            System will automatically select the oldest units (Earliest Expiry → Earliest Stocked) for consumption.
          </p>
        </div>

        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Product</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-gray-300"
              value={product.productName}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Quantity to Consume</label>
            <input
              type="number"
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              min={1}
              max={product.totalStock}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Available Stock: {product.totalStock}
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Reason</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="SALES">Retail Sales</option>
              <option value="SERVICE">Service Consumption</option>
              <option value="INTERNAL">Internal Use</option>
              <option value="DAMAGED">Damaged / Expired</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Consumption'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
