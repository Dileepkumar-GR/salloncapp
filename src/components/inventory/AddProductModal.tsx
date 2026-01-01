'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function AddProductModal({ isOpen, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    brandName: '',
    subCategory: '',
    productName: '',
    quantityPerItem: '',
    unit: 'ml',
    sellingPrice: '',
    lowStockThreshold: '10',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create product');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-lg p-6 rounded-xl border border-gray-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add New Product Group</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Brand Name</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sub Category</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Product Name</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Qty Per Item</label>
              <input
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                value={formData.quantityPerItem}
                onChange={(e) => setFormData({ ...formData, quantityPerItem: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Unit</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="piece">piece</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Selling Price</label>
              <input
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
             <label className="block text-sm text-gray-400 mb-1">Low Stock Threshold</label>
             <input
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              />
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
              className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
