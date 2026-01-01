'use client';

import { useState } from 'react';
import { X, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportStockModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error('Excel file is empty');
      }

      // Send to API
      const res = await fetch('/api/inventory/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: jsonData }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Import failed');
      }

      setSuccessMsg(`Successfully imported ${result.importedCount} units!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to process file');
      console.error(err);
    } finally {
      setLoading(false);
      // Clear input
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-lg p-6 rounded-xl border border-gray-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="text-green-500" />
            Import Stock from Excel
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
        {successMsg && <div className="bg-green-500/10 text-green-500 p-3 rounded mb-4 text-sm">{successMsg}</div>}

        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Upload an Excel file (.xlsx, .xls) with the following columns:
            <br />
            <code className="text-xs bg-gray-800 p-1 rounded">Brand, SubCategory, ProductName, QtyPerItem, Unit, SellingPrice, CostPrice, ExpiryDate (YYYY-MM-DD)</code>
          </p>

          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={loading}
            />
            <div className="flex flex-col items-center gap-2">
              <Upload size={32} className="text-blue-500" />
              <span className="text-gray-300 font-medium">
                {loading ? 'Processing...' : 'Click to Upload Excel'}
              </span>
              {fileName && <span className="text-xs text-gray-500">{fileName}</span>}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            * Dates should be in YYYY-MM-DD format.
            <br />
            * One row = One Inventory Unit.
            <br />
            * Product Group will be created if it doesn't exist.
          </div>
        </div>
      </div>
    </div>
  );
}
