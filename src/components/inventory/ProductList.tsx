'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertCircle, ShoppingBag } from 'lucide-react';
import BulkConsumeModal from './BulkConsumeModal';

export default function ProductList({ products, refreshProducts }: any) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
        <p className="text-gray-400">No products found. Add your first product group.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {products.map((product: any) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);

  const fetchUnits = async () => {
      setLoadingUnits(true);
      try {
        const res = await fetch(`/api/products/${product._id}`);
        const data = await res.json();
        setUnits(data.units || []);
      } catch (error) {
        console.error('Failed to fetch units', error);
      } finally {
        setLoadingUnits(false);
      }
  };

  const toggleExpand = async () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && units.length === 0) {
      await fetchUnits();
    }
  };

  const handleConsumeSuccess = async () => {
    await fetchUnits();
    // Also might want to refresh parent list if total stock changed, but that requires passing refreshProducts down or lifting state.
    // For now, updating units is good.
  };

  const getStockStatus = (count: number, threshold: number) => {
    if (count === 0) return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Out of Stock' };
    if (count <= threshold) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Low Stock' };
    return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'In Stock' };
  };

  const status = getStockStatus(product.totalStock, product.lowStockThreshold);

  const handleConsume = async (unitId: string) => {
    if (!confirm('Mark this unit as CONSUMED?')) return;
    try {
      await fetch(`/api/inventory/${unitId}/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'MANUAL_CONSUMPTION' }),
      });
      // Refresh units
      const res = await fetch(`/api/products/${product._id}`);
      const data = await res.json();
      setUnits(data.units || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all hover:border-gray-700">
      <div 
        onClick={toggleExpand}
        className="p-6 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-white">{product.productName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color} font-medium`}>
              {status.label} ({product.totalStock})
            </span>
          </div>
          <p className="text-sm text-gray-400">
            {product.brandName} • {product.subCategory} • {product.quantityPerItem} {product.unit}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
             <p className="text-sm text-gray-500">Selling Price</p>
             <p className="font-bold text-white">${product.sellingPrice}</p>
          </div>
          <button
             onClick={(e) => {
               e.stopPropagation();
               setIsConsumeModalOpen(true);
             }}
             className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg border border-gray-700 transition-colors"
             title="Consume Stock"
          >
            <ShoppingBag size={20} />
          </button>
          {isExpanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
        </div>
      </div>

      <BulkConsumeModal 
        isOpen={isConsumeModalOpen}
        onClose={() => setIsConsumeModalOpen(false)}
        product={product}
        onSuccess={handleConsumeSuccess}
      />

      {isExpanded && (
        <motion.div 
          initial={{ height: 0 }} 
          animate={{ height: 'auto' }}
          className="border-t border-gray-800 bg-gray-950/50"
        >
          <div className="p-6">
            <h4 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-wider">Inventory Units</h4>
            
            {loadingUnits ? (
              <p className="text-sm text-gray-500">Loading units...</p>
            ) : units.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No inventory units found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">SKU</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Expiry Date</th>
                      <th className="px-4 py-3">Stocked Date</th>
                      <th className="px-4 py-3 rounded-r-lg">Cost Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((unit: any) => (
                      <tr key={unit._id} className="border-b border-gray-800 last:border-0 hover:bg-gray-900/30">
                        <td className="px-4 py-3 font-mono text-gray-300">{unit.sku}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${unit.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 
                              unit.status === 'EXPIRED' ? 'bg-red-500/10 text-red-500' : 
                              'bg-gray-500/10 text-gray-500'}`}>
                            {unit.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {new Date(unit.expiryDate).toLocaleDateString()}
                          {new Date(unit.expiryDate) < new Date() && unit.status === 'ACTIVE' && (
                             <AlertCircle size={14} className="inline ml-2 text-red-500" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{new Date(unit.stockedDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-400">${unit.costPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
