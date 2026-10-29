"use client";
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Input, 
  Button, 
  Select, 
  Modal, 
  InputNumber, 
  message, 
  Tag, 
  Tooltip 
} from 'antd';
import { 
  Warehouse, 
  AlertTriangle, 
  Search, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Minus, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter
} from 'lucide-react';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';

const { Option } = Select;

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(10);
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await adminService.getInventory();
      if (res?.data?.products) {
        setInventory(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
      message.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setAdjustmentAmount(5);
    setAdjustmentType('add');
    setNotes('');
    setAdjustModalVisible(true);
  };

  const handleSaveAdjustment = async () => {
    if (!selectedItem) return;
    const delta = adjustmentType === 'add' ? adjustmentAmount : -adjustmentAmount;
    const newStock = Math.max(0, (selectedItem.stock || 0) + delta);

    try {
      await adminService.adjustStock({
        productId: selectedItem.id,
        quantity: delta,
        notes
      });
      setInventory(prev => prev.map(p => 
        p.id === selectedItem.id ? { ...p, stock: newStock } : p
      ));
      message.success(`Stock adjusted for ${selectedItem.name} to ${newStock} units`);
      setAdjustModalVisible(false);
    } catch (err) {
      message.error('Failed to adjust stock');
    }
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                          item.sku?.toLowerCase().includes(searchText.toLowerCase());
    let matchesStatus = true;
    const stock = item.stock ?? 10;
    if (stockFilter === 'LOW') matchesStatus = stock > 0 && stock <= 5;
    else if (stockFilter === 'OUT') matchesStatus = stock === 0;
    else if (stockFilter === 'IN') matchesStatus = stock > 5;
    return matchesSearch && matchesStatus;
  });

  const lowStockCount = inventory.filter(i => (i.stock ?? 10) > 0 && (i.stock ?? 10) <= 5).length;
  const outOfStockCount = inventory.filter(i => (i.stock ?? 10) === 0).length;
  const inStockCount = inventory.filter(i => (i.stock ?? 10) > 5).length;

  const columns = [
    {
      title: 'Perfume Flacon',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-12 h-14 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
            <img 
              src={getImageUrl(record.image)} 
              alt={record.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/hero_perfume.png'; }}
            />
          </div>
          <div>
            <div className="font-serif font-medium text-sm text-[#1A1A1A]">
              {record.name}
            </div>
            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
              SKU: {record.sku || 'RM-001'}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <span className="text-xs text-gray-600">{cat || 'Fine Fragrance'}</span>
    },
    {
      title: 'Flacon Price',
      key: 'price',
      render: (_, record) => (
        <span className="text-xs font-semibold text-[#1A1A1A]">
          ₹{(record.price || 4950).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'Available Stock',
      key: 'stock',
      render: (_, record) => {
        const stock = record.stock ?? 12;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-[#1A1A1A]">{stock}</span>
            <span className="text-[11px] text-gray-400">units</span>
          </div>
        );
      }
    },
    {
      title: 'Inventory Health',
      key: 'status',
      render: (_, record) => {
        const stock = record.stock ?? 12;
        if (stock === 0) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
              <XCircle size={12} className="text-red-500" /> Out of Stock
            </span>
          );
        }
        if (stock <= 5) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertTriangle size={12} className="text-amber-500" /> Restock Urgently ({stock})
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-500" /> Optimal Level
          </span>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <button
          onClick={() => handleOpenAdjust(record)}
          className="inline-flex items-center gap-1 text-xs text-[#4A4238] hover:text-[#B8860B] bg-[#FAF7F2] hover:bg-[#FAF6F0] px-3 py-1.5 rounded-lg border border-[#EAE3D6] font-medium transition-colors"
        >
          <RotateCcw size={13} />
          <span>Adjust Stock</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE3D6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1A1A1A] tracking-tight">
              Warehouse & Inventory
            </h1>
            <span className="text-xs bg-[#EFE8DC] text-[#4A4238] px-2.5 py-0.5 rounded-full font-medium">
              Real-time Stock Levels
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Monitor perfume flacon reserves, low stock replenishment thresholds, and warehouse dispatches.
          </p>
        </div>
      </div>

      {/* 3 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Healthy Inventory</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1A1A1A]">{inStockCount} Perfumes</div>
          <p className="text-[11px] text-gray-400 mt-1">Sufficient reserves for demand</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-semibold">Low-Stock Warnings</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#996515]">{lowStockCount} Perfumes</div>
          <p className="text-[11px] text-amber-700/80 mt-1">5 or fewer flacons remaining</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50/20 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-rose-800 mb-2">
            <span className="text-xs font-semibold">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-rose-700">{outOfStockCount} Perfumes</div>
          <p className="text-[11px] text-rose-700/80 mt-1">Immediate atelier replenishment required</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by perfume name or SKU..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl focus:outline-none focus:border-[#B8860B] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Filter Stock:</span>
          </div>
          <Select
            value={stockFilter}
            onChange={setStockFilter}
            className="w-44 text-xs"
          >
            <Option value="ALL">All Perfumes</Option>
            <Option value="LOW">Low Stock (≤ 5)</Option>
            <Option value="OUT">Out of Stock (0)</Option>
            <Option value="IN">Optimal Stock (&gt; 5)</Option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EAE3D6] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <Table 
          columns={columns}
          dataSource={filteredItems.map((item, idx) => ({ ...item, key: item.id || idx }))}
          loading={loading}
          pagination={{ 
            pageSize: 8, 
            showSizeChanger: false,
            className: "!px-4 !mb-4 text-xs"
          }}
          className="admin-luxury-table"
        />
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-serif text-base text-[#1A1A1A] pb-2 border-b border-[#EAE3D6]">
            <RotateCcw size={18} className="text-[#B8860B]" />
            <span>Stock Adjustment Protocol</span>
          </div>
        }
        open={adjustModalVisible}
        onOk={handleSaveAdjustment}
        onCancel={() => setAdjustModalVisible(false)}
        okText="Confirm Adjustment"
        okButtonProps={{ className: "!bg-[#B8860B] hover:!bg-[#996515] !text-white !border-none" }}
        centered
      >
        {selectedItem && (
          <div className="py-4 space-y-4 text-xs">
            <div className="flex items-center gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE3D6]">
              <div className="w-12 h-12 bg-white rounded-lg p-1 border border-[#E5DDD0] flex items-center justify-center">
                <img 
                  src={getImageUrl(selectedItem.image)} 
                  alt={selectedItem.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">{selectedItem.name}</h4>
                <p className="text-xs text-gray-500 font-mono">Current Stock: {selectedItem.stock || 0} flacons</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    adjustmentType === 'add'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  <Plus size={14} /> Receive Flacons (+ Add)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('sub')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    adjustmentType === 'sub'
                      ? 'bg-rose-50 border-rose-500 text-rose-800'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  <Minus size={14} /> Remove / Damaged (- Deduct)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Quantity
              </label>
              <InputNumber
                min={1}
                max={500}
                value={adjustmentAmount}
                onChange={(val) => setAdjustmentAmount(val || 1)}
                className="w-full text-sm rounded-xl py-1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Reason / Batch Number
              </label>
              <input
                type="text"
                placeholder="e.g. Atelier Batch #2026-B receive"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl focus:outline-none focus:border-[#B8860B]"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

