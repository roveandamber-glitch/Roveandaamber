"use client";
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Modal, 
  Form, 
  InputNumber, 
  Switch, 
  message, 
  Popconfirm,
  Tooltip 
} from 'antd';
import { 
  Gift, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Sparkles, 
  Package, 
  CheckCircle2, 
  ShoppingBag,
  ExternalLink 
} from 'lucide-react';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';

const { TextArea } = Input;

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getGifts();
      if (res?.data) {
        setGifts(res.data);
      }
    } catch (err) {
      console.error('Failed to load gifts:', err);
      message.error('Failed to load gifts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingGift(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (gift) => {
    setEditingGift(gift);
    form.setFieldsValue({
      name: gift.name,
      price: gift.price,
      originalPrice: gift.originalPrice,
      stock: gift.stock,
      description: gift.description,
      status: gift.status === 'Active'
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const statusStr = values.status ? 'Active' : 'Inactive';
      if (editingGift) {
        setGifts(prev => prev.map(g => 
          g.id === editingGift.id ? { ...g, ...values, status: statusStr } : g
        ));
        message.success('Gift coffret updated successfully');
      } else {
        const newGift = {
          id: `gift-${Date.now()}`,
          name: values.name,
          price: values.price,
          originalPrice: values.originalPrice || values.price,
          stock: values.stock || 10,
          description: values.description,
          image: '/images/perfumes/gift_set_royal_elegance.jpg',
          ordersCount: 0,
          status: statusStr
        };
        setGifts(prev => [newGift, ...prev]);
        message.success('New luxury gift coffret created');
      }
      setModalOpen(false);
    } catch (err) {}
  };

  const handleDelete = (id) => {
    setGifts(prev => prev.filter(g => g.id !== id));
    message.success('Gift set removed');
  };

  const handleToggleStatus = (id, checked) => {
    setGifts(prev => prev.map(g => 
      g.id === id ? { ...g, status: checked ? 'Active' : 'Inactive' } : g
    ));
    message.success('Gift set status updated');
  };

  const filteredGifts = gifts.filter(g => 
    g.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE3D6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1A1A1A] tracking-tight">
              Curated Gift Sets & Coffrets
            </h1>
            <span className="text-xs bg-[#EFE8DC] text-[#4A4238] px-2.5 py-0.5 rounded-full font-medium">
              {gifts.length} Gift Editions
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage celebratory packaging, customized message ribbons, and bespoke fragrance discovery chests.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#996515] text-white text-xs font-semibold shadow-sm hover:brightness-105 transition-all w-fit cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Gift Set</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search gift sets..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl focus:outline-none focus:border-[#B8860B] transition-colors"
          />
        </div>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredGifts.map((gift) => (
          <div 
            key={gift.id}
            className="bg-white rounded-2xl border border-[#EAE3D6] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image Banner */}
              <div className="relative h-48 w-full bg-[#FAF7F2] p-2 flex items-center justify-center overflow-hidden border-b border-[#EAE3D6]">
                <img 
                  src={getImageUrl(gift.image)} 
                  alt={gift.name}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = '/hero_perfume.png'; }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    gift.stock <= 5 
                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {gift.stock} in stock
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[#B8860B] font-bold">
                    Curated Coffret
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {gift.ordersCount || 0} orders
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-[#1A1A1A] line-clamp-1">
                  {gift.name}
                </h3>
                <p className="text-xs text-[#555] line-clamp-2 leading-relaxed">
                  {gift.description}
                </p>
                <div className="pt-2 flex items-baseline gap-2">
                  <span className="font-bold text-sm text-[#1A1A1A]">
                    ₹{(gift.price || 4950).toLocaleString('en-IN')}
                  </span>
                  {gift.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{gift.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0 flex items-center justify-between border-t border-[#F2ECE3] mt-2">
              <div className="flex items-center gap-1.5 pt-2">
                <span className="text-[11px] text-gray-500">Status:</span>
                <Switch 
                  size="small" 
                  checked={gift.status === 'Active'}
                  onChange={(checked) => handleToggleStatus(gift.id, checked)}
                  className={gift.status === 'Active' ? '!bg-[#B8860B]' : ''}
                />
              </div>

              <div className="flex items-center gap-1 pt-2">
                <button
                  onClick={() => handleOpenEdit(gift)}
                  className="p-1.5 text-gray-500 hover:text-[#B8860B] hover:bg-[#FAF6F0] rounded-lg border border-transparent hover:border-[#EAE3D6] transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <Popconfirm
                  title="Delete Gift Set"
                  description="Remove this luxury coffret from the gift shop?"
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDelete(gift.id)}
                >
                  <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </Popconfirm>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-serif text-base text-[#1A1A1A] pb-2 border-b border-[#EAE3D6]">
            <Gift size={18} className="text-[#B8860B]" />
            <span>{editingGift ? 'Edit Gift Coffret' : 'Create New Gift Set'}</span>
          </div>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editingGift ? 'Update Gift' : 'Create Gift'}
        okButtonProps={{ className: "!bg-[#B8860B] hover:!bg-[#996515] !text-white !border-none" }}
        centered
      >
        <Form form={form} layout="vertical" className="pt-4" initialValues={{ status: true, stock: 15 }}>
          <Form.Item
            name="name"
            label={<span className="text-xs font-semibold text-gray-700">Gift Set Name</span>}
            rules={[{ required: true, message: 'Please enter gift set name' }]}
          >
            <Input placeholder="e.g. Royal Elegance Gift Set" className="rounded-xl py-1.5 text-xs" />
          </Form.Item>

          <div className="grid grid-cols-3 gap-3">
            <Form.Item
              name="price"
              label={<span className="text-xs font-semibold text-gray-700">Price (₹)</span>}
              rules={[{ required: true, message: 'Enter price' }]}
            >
              <InputNumber min={500} max={50000} className="w-full rounded-xl py-1" />
            </Form.Item>

            <Form.Item
              name="originalPrice"
              label={<span className="text-xs font-semibold text-gray-700">Original (₹)</span>}
            >
              <InputNumber min={500} max={50000} className="w-full rounded-xl py-1" />
            </Form.Item>

            <Form.Item
              name="stock"
              label={<span className="text-xs font-semibold text-gray-700">Stock Units</span>}
            >
              <InputNumber min={0} max={1000} className="w-full rounded-xl py-1" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={<span className="text-xs font-semibold text-gray-700">Description & Packaging</span>}
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Included flacons, silk presentation box, ribbon, gift notes..." className="rounded-xl text-xs" />
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-xs font-semibold text-gray-700">Active in Store</span>}
            valuePropName="checked"
          >
            <Switch className="!bg-[#B8860B]" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

