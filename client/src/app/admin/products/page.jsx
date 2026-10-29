"use client";
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  App,
  Table, 
  Input, 
  Select, 
  Modal, 
  InputNumber, 
  Tooltip,
  Spin
} from 'antd';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  Package
} from 'lucide-react';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';
import { CommonDelete } from '@/components/common';

const { Option } = Select;

function ProductsContent() {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'ALL';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState(0);

  // Common Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const catParam = searchParams?.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getProducts();
      // Ensure products is always an Array regardless of backend shape
      const raw = res?.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.products)
        ? raw.products
        : Array.isArray(res?.products)
        ? res.products
        : [];
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products:', err);
      message.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories();
      if (res?.data && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      // Non-blocking
    }
  };

  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const targetId = productToDelete.id || productToDelete._id;
    const targetName = productToDelete.name;
    setDeleting(true);

    try {
      await adminService.deleteProduct(targetId);
      message.success(`Perfume "${targetName}" deleted successfully`);
      setProducts(prev => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.filter(p => p.id !== targetId && p._id !== targetId);
      });
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      message.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenStockModal = (product) => {
    setCurrentProduct(product);
    setAdjustQty(product.stock || 0);
    setStockModalVisible(true);
  };

  const handleSaveStock = async () => {
    if (!currentProduct) return;
    try {
      await adminService.updateStock(currentProduct.id || currentProduct._id, { stock: adjustQty });
      setProducts(prev => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.map(p => {
          if (p.id === currentProduct.id || p._id === currentProduct._id) {
            return { ...p, stock: adjustQty };
          }
          return p;
        });
      });
      message.success(`Stock updated for ${currentProduct.name}`);
      setStockModalVisible(false);
    } catch (err) {
      message.error('Failed to update stock');
    }
  };

  const productList = Array.isArray(products) ? products : [];
  const filteredProducts = productList.filter(item => {
    if (!item) return false;
    const nameMatch = (item.name || '').toLowerCase().includes(searchText.toLowerCase());
    const skuMatch = (item.sku || '').toLowerCase().includes(searchText.toLowerCase());
    const matchesSearch = nameMatch || skuMatch;

    const catName = (item.category || item.categoryName || '').toLowerCase();
    const matchesCat = selectedCategory === 'ALL' || catName === selectedCategory.toLowerCase();

    return matchesSearch && matchesCat;
  });

  // Unique list of categories for filter dropdown
  const categoryOptions = Array.from(
    new Set([
      ...categories.map(c => c.name),
      ...productList.map(p => p.category || p.categoryName).filter(Boolean)
    ])
  );

  const columns = [
    {
      title: 'Perfume Product',
      key: 'product',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-12 h-14 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] overflow-hidden shrink-0 flex items-center justify-center p-1">
            <img 
              src={getImageUrl(record.image || record.images?.[0])} 
              alt={record.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/hero_perfume.png'; }}
            />
          </div>
          <div className="min-w-0">
            <div className="font-serif font-medium text-sm text-[#1B100A] hover:text-[#D4A64A] transition-colors truncate max-w-[200px]">
              {record.name}
            </div>
            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-2 mt-0.5">
              <span>SKU: {record.sku || `RM-${String(record.id || '').slice(-3) || '001'}`}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
              <span className="text-gray-500 truncate">{record.category || record.categoryName || 'Eau de Parfum'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (_, record) => {
        const cat = record.category || record.categoryName || 'Fragrance';
        return (
          <span className="text-xs text-gray-700 bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E8DFC8] whitespace-nowrap">
            {cat}
          </span>
        );
      }
    },
    {
      title: 'Price',
      key: 'price',
      width: 140,
      render: (_, record) => (
        <div>
          <span className="text-sm font-semibold text-[#1B100A]">₹{(record.price || 4950).toLocaleString('en-IN')}</span>
          {record.discountPrice && (
            <span className="text-xs text-gray-400 line-through ml-2">₹{record.discountPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      )
    },
    {
      title: 'Stock Status',
      key: 'stock',
      width: 150,
      render: (_, record) => {
        const stock = record.stock ?? 18;
        if (stock === 0) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of Stock
            </span>
          );
        }
        if (stock <= 5) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Low Stock ({stock})
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock ({stock})
          </span>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip title="Quick Adjust Stock">
            <button 
              type="button"
              onClick={() => handleOpenStockModal(record)}
              className="p-1.5 text-gray-500 hover:text-[#D4A64A] hover:bg-[#FAF7F2] rounded-lg transition-colors border border-transparent hover:border-[#E8DFC8] cursor-pointer"
            >
              <Package size={15} />
            </button>
          </Tooltip>
          <Tooltip title="Edit Perfume">
            <Link 
              href={`/admin/products/edit/${record.id || record._id || 1}`}
              className="p-1.5 text-gray-500 hover:text-[#D4A64A] hover:bg-[#FAF7F2] rounded-lg transition-colors border border-transparent hover:border-[#E8DFC8]"
            >
              <Edit3 size={15} />
            </Link>
          </Tooltip>
          <button 
            type="button"
            onClick={() => handleOpenDelete(record)}
            title="Delete Perfume"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 text-[#1B100A]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Perfume Catalog
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              {filteredProducts.length} Items
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage your artisanal fragrance line, formulations, stock levels and pricing.
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] text-[#1B100A] text-xs font-semibold shadow-sm hover:brightness-105 transition-all w-fit"
        >
          <Plus size={16} />
          <span>Add New Perfume</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search perfumes by name or SKU..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl focus:outline-none focus:border-[#D4A64A] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Category:</span>
          </div>
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="w-56 text-xs"
            classNames={{ popup: { root: 'text-xs' } }}
          >
            <Option value="ALL">All Fragrance Families</Option>
            {categoryOptions.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <Table 
          columns={columns}
          dataSource={filteredProducts.map((p, idx) => ({ ...p, key: p.id || p._id || idx }))}
          loading={loading}
          scroll={{ x: 780 }}
          pagination={{ 
            pageSize: 8, 
            showSizeChanger: false,
            className: "!px-4 !mb-4 text-xs"
          }}
          className="admin-luxury-table"
        />
      </div>

      {/* Quick Stock Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-serif text-base text-[#1B100A] pb-2 border-b border-[#E8DFC8]">
            <Package size={18} className="text-[#D4A64A]" />
            <span>Update Stock Inventory</span>
          </div>
        }
        open={stockModalVisible}
        onOk={handleSaveStock}
        onCancel={() => setStockModalVisible(false)}
        okText="Save Inventory"
        okButtonProps={{ className: "!bg-[#D4A64A] hover:!bg-[#B38728] !text-[#1B100A] !font-semibold !border-none" }}
        centered
      >
        {currentProduct && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFC8]">
              <div className="w-12 h-12 bg-white rounded-lg p-1 border border-[#E8DFC8] flex items-center justify-center">
                <img 
                  src={getImageUrl(currentProduct.image || currentProduct.images?.[0])} 
                  alt={currentProduct.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#1B100A]">{currentProduct.name}</h4>
                <p className="text-xs text-gray-500 font-mono">SKU: {currentProduct.sku || 'RM-001'}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Current Units in Stock
              </label>
              <InputNumber
                min={0}
                max={10000}
                value={adjustQty}
                onChange={(val) => setAdjustQty(val || 0)}
                className="w-full text-sm rounded-xl py-1"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Threshold warning will trigger when inventory drops to 5 units or lower.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Common Delete Confirmation Modal */}
      <CommonDelete
        open={deleteModalOpen}
        onCancel={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setProductToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Perfume Product"
        itemName={productToDelete?.name}
        itemType="perfume product"
        description="Are you sure you want to remove this perfume from the catalog? This will remove its inventory and store visibility."
        confirmText="Delete Perfume"
        loading={deleting}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <App>
      <Suspense fallback={<div className="p-8 text-center"><Spin /></div>}>
        <ProductsContent />
      </Suspense>
    </App>
  );
}
