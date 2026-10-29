"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Table, 
  Input, 
  Button, 
  Select, 
  Tag, 
  message, 
  Modal, 
  InputNumber, 
  Popconfirm,
  Tooltip 
} from 'antd';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Filter, 
  AlertTriangle, 
  Eye, 
  CheckCircle2, 
  Package, 
  ExternalLink 
} from 'lucide-react';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';

const { Option } = Select;

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getProducts();
      if (res?.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteProduct(id);
      message.success('Product deleted successfully');
      setProducts(prev => prev.filter(p => p.id !== id && p._id !== id));
    } catch (err) {
      message.error('Failed to delete product');
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
      setProducts(prev => prev.map(p => {
        if (p.id === currentProduct.id || p._id === currentProduct._id) {
          return { ...p, stock: adjustQty };
        }
        return p;
      }));
      message.success(`Stock updated for ${currentProduct.name}`);
      setStockModalVisible(false);
    } catch (err) {
      message.error('Failed to update stock');
    }
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                          item.sku?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const columns = [
    {
      title: 'Perfume Product',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-12 h-14 rounded-xl bg-[#FAF6F0] border border-[#EAE3D6] overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
            <img 
              src={getImageUrl(record.image || record.images?.[0])} 
              alt={record.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/hero_perfume.png'; }}
            />
          </div>
          <div>
            <div className="font-serif font-medium text-sm text-[#1A1A1A] hover:text-[#B8860B] transition-colors">
              {record.name}
            </div>
            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-2 mt-0.5">
              <span>SKU: {record.sku || `RM-${String(record.id).padStart(3, '0')}`}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="text-[#888]">{record.category || 'Eau de Parfum'}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => (
        <span className="text-xs text-gray-700 bg-[#F4EFEA] px-2.5 py-1 rounded-lg border border-[#E5DDD0]">
          {cat || 'Fragrance'}
        </span>
      )
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => (
        <div>
          <span className="text-sm font-semibold text-[#1A1A1A]">₹{(record.price || 4950).toLocaleString('en-IN')}</span>
          {record.discountPrice && (
            <span className="text-xs text-gray-400 line-through ml-2">₹{record.discountPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      )
    },
    {
      title: 'Stock Status',
      key: 'stock',
      render: (_, record) => {
        const stock = record.stock ?? 18;
        if (stock === 0) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of Stock
            </span>
          );
        }
        if (stock <= 5) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Low Stock ({stock})
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock ({stock})
          </span>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1.5">
          <Tooltip title="Quick Adjust Stock">
            <button 
              onClick={() => handleOpenStockModal(record)}
              className="p-1.5 text-gray-500 hover:text-[#B8860B] hover:bg-[#FAF6F0] rounded-lg transition-colors border border-transparent hover:border-[#EAE3D6]"
            >
              <Package size={15} />
            </button>
          </Tooltip>
          <Tooltip title="Edit Perfume">
            <Link 
              href={`/admin/products/edit/${record.id || record._id || 1}`}
              className="p-1.5 text-gray-500 hover:text-[#B8860B] hover:bg-[#FAF6F0] rounded-lg transition-colors border border-transparent hover:border-[#EAE3D6]"
            >
              <Edit3 size={15} />
            </Link>
          </Tooltip>
          <Popconfirm
            title="Delete Perfume"
            description="Are you sure you want to remove this perfume from catalog?"
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id || record._id)}
          >
            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={15} />
            </button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE3D6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1A1A1A] tracking-tight">
              Perfume Catalog
            </h1>
            <span className="text-xs bg-[#EFE8DC] text-[#4A4238] px-2.5 py-0.5 rounded-full font-medium">
              {filteredProducts.length} Items
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage your artisanal fragrance line, formulations, stock levels and pricing.
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#996515] text-white text-xs font-semibold shadow-sm hover:brightness-105 transition-all w-fit"
        >
          <Plus size={16} />
          <span>Add New Perfume</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search perfumes by name or SKU..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl focus:outline-none focus:border-[#B8860B] transition-colors"
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
            className="w-48 text-xs"
            popupClassName="text-xs"
          >
            <Option value="ALL">All Fragrance Families</Option>
            <Option value="Woody Oriental">Woody Oriental</Option>
            <Option value="Warm Oriental">Warm Oriental</Option>
            <Option value="Floral Amber">Floral Amber</Option>
            <Option value="Gourmand Amber">Gourmand Amber</Option>
            <Option value="Citrus Woody">Citrus Woody</Option>
          </Select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <Table 
          columns={columns}
          dataSource={filteredProducts.map((p, idx) => ({ ...p, key: p.id || p._id || idx }))}
          loading={loading}
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
          <div className="flex items-center gap-2 font-serif text-base text-[#1A1A1A] pb-2 border-b border-[#EAE3D6]">
            <Package size={18} className="text-[#B8860B]" />
            <span>Update Stock Inventory</span>
          </div>
        }
        open={stockModalVisible}
        onOk={handleSaveStock}
        onCancel={() => setStockModalVisible(false)}
        okText="Save Inventory"
        okButtonProps={{ className: "!bg-[#B8860B] hover:!bg-[#996515] !text-white !border-none" }}
        centered
      >
        {currentProduct && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE3D6]">
              <div className="w-12 h-12 bg-white rounded-lg p-1 border border-[#E5DDD0] flex items-center justify-center">
                <img 
                  src={getImageUrl(currentProduct.image || currentProduct.images?.[0])} 
                  alt={currentProduct.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">{currentProduct.name}</h4>
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
    </div>
  );
}
