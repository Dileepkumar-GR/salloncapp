'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function NewRequestModal({ isOpen, onClose, onSuccess }: any) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productGroupId: '',
    purpose: 'RETAIL',
    requestedQty: '',
    estimatedPrice: '',
    expectedDeliveryDate: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch products for dropdown
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.productGroupId) {
        setError('Product is required');
        setLoading(false);
        return;
      }
      const qty = Number(formData.requestedQty);
      if (!Number.isFinite(qty) || qty <= 0) {
        setError('Quantity must be a positive number');
        setLoading(false);
        return;
      }
      const price = Number(formData.estimatedPrice);
      if (!Number.isFinite(price) || price < 0) {
        setError('Estimated price must be a non-negative number');
        setLoading(false);
        return;
      }
      if (!formData.expectedDeliveryDate) {
        setError('Expected delivery date is required');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess('Request created successfully');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-lg p-6 rounded-xl border border-gray-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">New Procurement Request</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Product</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
              value={formData.productGroupId}
              onChange={(e) => setFormData({ ...formData, productGroupId: e.target.value })}
              required
            >
              <option value="">Select Product</option>
              {products.map((p: any) => (
                <option key={p._id} value={p._id}>
                  {p.productName} ({p.brandName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Purpose</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              >
                <option value="RETAIL">Retail</option>
                <option value="INHOUSE">In-House Use</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Quantity</label>
              <input
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                value={formData.requestedQty}
                onChange={(e) => setFormData({ ...formData, requestedQty: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm text-gray-400 mb-1">Est. Price (Total)</label>
              <input
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                value={formData.estimatedPrice}
                onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                required
              />
            </div>
             <div>
              <label className="block text-sm text-gray-400 mb-1">Exp. Delivery</label>
              <input
                type="date"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500 text-white" // text-white for date input visibility
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Remarks</label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
