'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ReceiveStockModal({ isOpen, onClose, request, onSuccess }: any) {
  const remainingQty = (request.approvedQty || 0) - (request.receivedQty || 0);
  
  const [formData, setFormData] = useState({
    receivingNow: remainingQty,
    skuSuffix: '',
    expiryDate: '',
    stockedDate: '', // Will be set in useEffect to avoid hydration mismatch
    costPrice: '',
    invoiceFiles: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      stockedDate: new Date().toISOString().slice(0, 10)
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFileError('');

    if (formData.receivingNow > remainingQty) {
      setError(`Cannot receive more than remaining quantity (${remainingQty})`);
      setLoading(false);
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please upload at least one invoice file');
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append('receivingNow', String(formData.receivingNow));
      fd.append('skuSuffix', formData.skuSuffix);
      fd.append('expiryDate', formData.expiryDate);
      fd.append('stockedDate', formData.stockedDate);
      fd.append('costPrice', String(formData.costPrice));
      selectedFiles.forEach((f) => fd.append('invoices', f));

      const res = await fetch(`/api/procurement/${request._id}/receive`, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to receive stock');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowed = new Set(['application/pdf', 'image/png', 'image/jpeg']);
    const valid: File[] = [];
    for (const f of files) {
      if (!allowed.has(f.type)) {
        setFileError('Invalid file type. Allowed: PDF, PNG, JPG');
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        setFileError('File too large. Max 10MB per file');
        continue;
      }
      valid.push(f);
    }
    setSelectedFiles(valid);
    setFormData(prev => ({ ...prev, invoiceFiles: valid.map(f => f.name) }));
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    const allowed = new Set(['application/pdf', 'image/png', 'image/jpeg']);
    const valid: File[] = [];
    for (const f of files) {
      if (!allowed.has(f.type)) {
        setFileError('Invalid file type. Allowed: PDF, PNG, JPG');
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        setFileError('File too large. Max 10MB per file');
        continue;
      }
      valid.push(f);
    }
    setSelectedFiles(prev => [...prev, ...valid]);
    setFormData(prev => ({ ...prev, invoiceFiles: [...prev.invoiceFiles, ...valid.map(f => f.name)] }));
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-lg p-6 rounded-xl border border-gray-800 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Receive Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Request Details</h3>
          <p className="text-sm text-gray-400">Product: <span className="text-white">{request.productGroupId?.productName}</span></p>
          <p className="text-sm text-gray-400">Approved Qty: <span className="text-white">{request.approvedQty}</span></p>
          <p className="text-sm text-gray-400">Already Received: <span className="text-white">{request.receivedQty || 0}</span></p>
          <p className="text-sm text-gray-400 mt-2">Remaining to Receive: <span className="text-green-400 font-bold">{remainingQty}</span></p>
        </div>

        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Receiving Quantity</label>
            <input
              type="number"
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
              value={formData.receivingNow}
              onChange={(e) => setFormData({ ...formData, receivingNow: parseInt(e.target.value) })}
              max={remainingQty}
              min={1}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              <AlertTriangle size={12} className="inline mr-1" />
              System will generate {formData.receivingNow} individual inventory records.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">SKU Suffix (Batch)</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g. BATCH-A"
                value={formData.skuSuffix}
                onChange={(e) => setFormData({ ...formData, skuSuffix: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cost Price (Per Unit)</label>
              <input
                type="number"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Expiry Date</label>
              <input
                type="date"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500 text-white"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stocked Date</label>
              <input
                type="date"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500 text-white"
                value={formData.stockedDate}
                onChange={(e) => setFormData({ ...formData, stockedDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Invoice Files</label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="w-full bg-gray-800 border border-gray-700 rounded p-4 text-sm text-gray-300"
            >
              <p className="mb-2">Drag & drop files here or use the button below.</p>
              <input
                type="file"
                multiple
                accept=".pdf,image/png,image/jpeg"
                onChange={handleFileChange}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                required
              />
              {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Selected files:</p>
                  {selectedFiles.map((file, index) => (
                    <p key={index} className="text-xs text-gray-300">{file.name}</p>
                  ))}
                </div>
              )}
            </div>
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
              className="px-4 py-2 bg-green-600 rounded text-white hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? 'Receiving...' : 'Confirm Receive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
