'use client';

import { useState } from 'react';
import { Check, Clock, Truck, Package, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import ReceiveStockModal from './ReceiveStockModal';

export default function ProcurementList({ requests, refreshRequests }: any) {
  const { data: session } = useSession();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  const handleApprove = async (id: string, requestedQty: number) => {
    if (!confirm('Are you sure you want to approve this request?')) return;
    try {
      await fetch(`/api/procurement/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedQty: requestedQty }), // Default to full approval
      });
      refreshRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const openInvoices = async (req: any) => {
    setSelectedRequest(req);
    try {
      const res = await fetch(`/api/procurement/${req._id}/invoices`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load invoices');
      setInvoices(data);
      setIsInvoicesModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Clock };
      case 'APPROVED': return { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Check };
      case 'PARTIALLY_RECEIVED': return { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: Truck };
      case 'RECEIVED': return { color: 'text-green-500', bg: 'bg-green-500/10', icon: Package };
      default: return { color: 'text-gray-500', bg: 'bg-gray-500/10', icon: Clock };
    }
  };

  if (requests.length === 0) {
     return (
      <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
        <p className="text-gray-400">No procurement requests found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-950/50 text-gray-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Purpose</th>
              <th className="px-6 py-4">Qty (Req/App/Rec)</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {requests.map((req: any) => {
              const status = getStatusBadge(req.status);
              const StatusIcon = status.icon;
              return (
                <tr key={req._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{req.productGroupId?.productName || 'Unknown Product'}</p>
                    <p className="text-xs text-gray-500">{req.productGroupId?.brandName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{req.purpose}</td>
                  <td className="px-6 py-4 text-sm font-mono">
                    {req.requestedQty} / {req.approvedQty || '-'} / {req.receivedQty || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit text-xs font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon size={14} />
                      {req.status.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {req.status === 'PENDING' && session?.user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleApprove(req._id, req.requestedQty)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {(req.status === 'APPROVED' || req.status === 'PARTIALLY_RECEIVED') && (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsReceiveModalOpen(true);
                          }}
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
                        >
                          Receive
                        </button>
                      )}
                      <button
                        onClick={() => openInvoices(req)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                      >
                        View Invoices
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isReceiveModalOpen && selectedRequest && (
        <ReceiveStockModal 
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          request={selectedRequest}
          onSuccess={() => {
            setIsReceiveModalOpen(false);
            refreshRequests();
          }}
        />
      )}

      {isInvoicesModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 w-full max-w-lg p-6 rounded-xl border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Invoices</h2>
              <button onClick={() => setIsInvoicesModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            {invoices.length === 0 ? (
              <p className="text-gray-500">No invoices uploaded</p>
            ) : (
              <ul className="space-y-2">
                {invoices.map((inv: any) => (
                  <li key={inv._id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400">Uploaded: {new Date(inv.uploadedAt || inv.createdAt).toLocaleString()}</div>
                    <div className="mt-2 space-y-1">
                      {(inv.files || []).map((file: any, i: number) => (
                        <div key={`${inv._id}-${i}`} className="flex gap-3 items-center">
                          <a
                            href={`/api/invoices/download?file=${encodeURIComponent(file.path)}&disposition=inline`}
                            className="text-blue-400 hover:underline text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                          <a
                            href={`/api/invoices/download?file=${encodeURIComponent(file.path)}`}
                            className="text-blue-400 hover:underline text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download {file.fileName}
                          </a>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
