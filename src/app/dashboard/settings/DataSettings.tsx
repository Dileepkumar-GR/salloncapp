'use client';

import { useState } from 'react';
import { Download, Upload, RotateCcw, FileSpreadsheet, Database } from 'lucide-react';
import ImportStockModal from '@/components/inventory/ImportStockModal';

interface DataSettingsProps {
  isAdmin: boolean;
  onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function DataSettings({ isAdmin, onNotify }: DataSettingsProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleExport = (type: string) => {
    if (type === 'Inventory') {
      handleDownloadExport('/api/export/inventory', 'inventory');
    } else if (type === 'Procurement') {
      handleDownloadExport('/api/export/procurement', 'procurement');
    }
  };

  const handleReset = () => {
    if (!isAdmin) return;
    if (onNotify) onNotify('This feature is under development and will be available soon.', 'info');
  };

  const handleDownloadExport = async (endpoint: string, baseName: string) => {
    try {
      setDownloading(true);
      const res = await fetch(`${endpoint}?format=csv`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to export');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `${baseName}_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onNotify && onNotify('Export downloaded', 'success');
    } catch (e: any) {
      onNotify && onNotify(e.message || 'Export failed. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadTemplate = async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      setDownloading(true);
      const res = await fetch(`/api/import-template/products?format=${format}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to download template');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'xlsx' ? 'products_template.xlsx' : 'products_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onNotify && onNotify('Template downloaded', 'success');
    } catch (e: any) {
      onNotify && onNotify(e.message || 'Download failed', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleUploadFilledTemplate = async (file: File) => {
    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/import/products', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      const { inserted, updated, errors } = data.summary || {};
      onNotify && onNotify(`Import finished: +${inserted} inserts, ${updated} updates, ${errors} errors`, 'success');
    } catch (e: any) {
      onNotify && onNotify(e.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Download size={24} />
            </div>
            <h3 className="font-semibold text-white">Export Data</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">Download your data in CSV/Excel format for external analysis or backup.</p>
          <div className="space-y-3">
            <button 
              onClick={() => handleExport('Inventory')}
              disabled={downloading || !isAdmin}
              title={!isAdmin ? 'Admin only' : undefined}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors disabled:opacity-50"
            >
              <span>Export Inventory</span>
              <FileSpreadsheet size={16} />
            </button>
            <button 
              onClick={() => handleExport('Procurement')}
              disabled={downloading || !isAdmin}
              title={!isAdmin ? 'Admin only' : undefined}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors disabled:opacity-50"
            >
              <span>Export Procurement History</span>
              <FileSpreadsheet size={16} />
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <Upload size={24} />
            </div>
            <h3 className="font-semibold text-white">Import Data</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">Bulk import products and inventory using Excel templates.</p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button 
              onClick={() => handleDownloadTemplate('csv')}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet size={18} />
              {downloading ? 'Downloading...' : 'Download Product Template (CSV)'}
            </button>
            <button 
              onClick={() => handleDownloadTemplate('xlsx')}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet size={18} />
              {downloading ? 'Downloading...' : 'Download Product Template (XLSX)'}
            </button>
          </div>
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">Upload Filled Template</label>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUploadFilledTemplate(f);
                e.currentTarget.value = '';
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-2">Accepted: CSV or XLSX. Columns: product_name, sku, category, cost_price, selling_price, tax_rate, stock_qty, status.</p>
          </div>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
          >
            <FileSpreadsheet size={18} />
            Import Products from Excel
          </button>
        </div>

        {/* System Logs */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Database size={24} />
            </div>
            <h3 className="font-semibold text-white">System Logs</h3>
          </div>
          <p className="text-gray-400 text-sm mb-6">View system activity and audit trails.</p>
          <div className="h-32 bg-gray-900 rounded-lg p-3 overflow-y-auto text-xs font-mono text-gray-500">
            <p>[2023-10-25 10:00:01] System initialized</p>
            <p>[2023-10-25 10:05:22] User admin logged in</p>
            <p>[2023-10-25 10:15:00] Inventory sync completed</p>
            <p>[2023-10-25 11:30:45] Backup scheduled</p>
          </div>
        </div>

        {/* Danger Zone */}
        {isAdmin && (
          <div className="bg-red-900/10 rounded-lg p-6 border border-red-900/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                <RotateCcw size={24} />
              </div>
              <h3 className="font-semibold text-red-400">Danger Zone</h3>
            </div>
            <p className="text-red-300/70 text-sm mb-6">Irreversible actions. Please proceed with caution.</p>
            <button 
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-lg font-medium transition-colors"
            >
              Reset Demo Data
            </button>
          </div>
        )}
      </div>

      <ImportStockModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={() => onNotify && onNotify('Import successful', 'success')} 
      />
    </div>
  );
}
