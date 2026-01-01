'use client';

import { useEffect, useState } from 'react';
import { Plus, FileDown } from 'lucide-react';

export default function SalesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    customerName: '',
    customerEmail: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 0,
    notes: '',
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales-invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const addItem = () => {
    setForm((prev: any) => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const updateItem = (idx: number, key: string, val: any) => {
    setForm((prev: any) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [key]: val };
      return { ...prev, items };
    });
  };

  const removeItem = (idx: number) => {
    setForm((prev: any) => {
      const items = prev.items.filter((_: any, i: number) => i !== idx);
      return { ...prev, items };
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        items: form.items.map((it: any) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
        taxRate: Number(form.taxRate),
        notes: form.notes,
      };
      const res = await fetch('/api/sales-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create invoice');
      }
      setForm({
        customerName: '',
        customerEmail: '',
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        taxRate: 0,
        notes: '',
      });
      fetchInvoices();
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-gray-400">Generate and download sales invoices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Create Sales Invoice</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Customer Name</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Customer Email</label>
                <input
                  type="email"
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-gray-400">Items</label>
                <button type="button" onClick={addItem} className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded">
                  <Plus size={14} /> Add Item
                </button>
              </div>
              <div className="space-y-3">
                {form.items.map((it: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                    <input
                      className="col-span-6 bg-gray-800 border border-gray-700 rounded p-2"
                      placeholder="Description"
                      value={it.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      className="col-span-2 bg-gray-800 border border-gray-700 rounded p-2"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      min={1}
                      required
                    />
                    <input
                      type="number"
                      className="col-span-3 bg-gray-800 border border-gray-700 rounded p-2"
                      placeholder="Unit Price"
                      value={it.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                      min={0}
                      required
                    />
                    <button type="button" onClick={() => removeItem(idx)} className="col-span-1 text-gray-400 hover:text-red-400">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-green-600 rounded text-white hover:bg-green-500 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Sales Invoices</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="text-gray-500">No invoices yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-950/50 text-gray-400 text-sm uppercase">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {invoices.map((inv: any) => (
                    <tr key={inv._id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3">{inv.customerName}</td>
                      <td className="px-4 py-3">{Number(inv.totalAmount).toFixed(2)}</td>
                      <td className="px-4 py-3">{new Date(inv.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`/api/sales-invoices/${inv._id}/pdf`}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileDown size={14} /> PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

