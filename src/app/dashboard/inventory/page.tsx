'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import AddProductModal from '@/components/inventory/AddProductModal';
import ImportStockModal from '@/components/inventory/ImportStockModal';
import ProductList from '@/components/inventory/ProductList';

export default function InventoryPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-gray-400">Manage product groups and view stock levels</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FileSpreadsheet size={20} />
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Add Product Group</span>
          </button>
        </div>
      </div>

      {/* Filters (Mock) */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg hover:bg-gray-800">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading inventory...</div>
      ) : (
        <ProductList products={products} refreshProducts={fetchProducts} />
      )}

      {isAddModalOpen && (
        <AddProductModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchProducts();
          }} 
        />
      )}

      {isImportModalOpen && (
        <ImportStockModal 
          isOpen={isImportModalOpen} 
          onClose={() => setIsImportModalOpen(false)} 
          onSuccess={() => {
            setIsImportModalOpen(false);
            fetchProducts();
          }} 
        />
      )}
    </div>
  );
}
