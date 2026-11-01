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
  Tooltip,
  Tag,
  Tabs
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
  ExternalLink,
  Heart,
  Mail,
  User,
  Calendar,
  Clock,
  Check
} from 'lucide-react';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';

const { TextArea } = Input;

const DEFAULT_GIFT_SETS = [
  {
    id: 'gift-royal-elegance',
    name: 'Royal Elegance Gift Set',
    price: 5850,
    originalPrice: 7200,
    stock: 12,
    description: 'Amber Royal Eau de Parfum (100ml) paired with artisanal amber candle and gold velvet coffret.',
    image: '/images/perfumes/gift_set_royal_elegance.jpg',
    ordersCount: 38,
    status: 'Active'
  },
  {
    id: 'gift-oud-luxury',
    name: 'Oud Luxury Coffret',
    price: 6250,
    originalPrice: 7800,
    stock: 8,
    description: 'Oud Noir Extrait (100ml) accompanied by Cambodian Oud travel flacon in obsidian silk box.',
    image: '/images/perfumes/gift_set_oud_luxury.jpg',
    ordersCount: 64,
    status: 'Active'
  },
  {
    id: 'gift-velvet-romance',
    name: 'Velvet Romance Coffret',
    price: 4950,
    originalPrice: 6100,
    stock: 15,
    description: 'Rose Elixir (100ml) with nourishing perfumed body silk and greeting card in blush coffret.',
    image: '/images/perfumes/gift_set_velvet_romance.jpg',
    ordersCount: 42,
    status: 'Active'
  },
  {
    id: 'gift-signature-collection',
    name: 'Signature Discovery Set',
    price: 7450,
    originalPrice: 9200,
    stock: 6,
    description: 'Duo grand flacons: Amber Royal & Oud Noir (100ml each) presented in heavy embossed gold foil chest.',
    image: '/images/perfumes/gift_set_signature_coffret.jpg',
    ordersCount: 89,
    status: 'Active'
  }
];

export default function AdminGiftsPage() {
  const [gifts, setGifts] = useState(DEFAULT_GIFT_SETS);
  const [giftOrders, setGiftOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('coffrets');
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
        if (Array.isArray(res.data)) {
          setGifts(res.data);
        } else if (Array.isArray(res.data.giftOrders)) {
          setGiftOrders(res.data.giftOrders);
        }
      } else if (Array.isArray(res?.giftOrders)) {
        setGiftOrders(res.giftOrders);
      }
    } catch (err) {
      console.error('Failed to load gifts:', err);
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
        setGifts(prev => {
          const list = Array.isArray(prev) ? prev : DEFAULT_GIFT_SETS;
          return list.map(g => 
            g.id === editingGift.id ? { ...g, ...values, status: statusStr } : g
          );
        });
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
        setGifts(prev => {
          const list = Array.isArray(prev) ? prev : DEFAULT_GIFT_SETS;
          return [newGift, ...list];
        });
        message.success('New luxury gift coffret created');
      }
      setModalOpen(false);
    } catch (err) {}
  };

  const handleDelete = (id) => {
    setGifts(prev => {
      const list = Array.isArray(prev) ? prev : DEFAULT_GIFT_SETS;
      return list.filter(g => g.id !== id);
    });
    message.success('Gift set removed');
  };

  const handleToggleStatus = (id, checked) => {
    setGifts(prev => {
      const list = Array.isArray(prev) ? prev : DEFAULT_GIFT_SETS;
      return list.map(g => 
        g.id === id ? { ...g, status: checked ? 'Active' : 'Inactive' } : g
      );
    });
    message.success('Gift set status updated');
  };

  const giftList = Array.isArray(gifts) ? gifts : DEFAULT_GIFT_SETS;
  const filteredGifts = giftList.filter(g => 
    g?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    g?.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const orderList = Array.isArray(giftOrders) ? giftOrders : [];
  const filteredOrders = orderList.filter(o => 
    o?.orderId?.toLowerCase().includes(searchText.toLowerCase()) ||
    o?.senderName?.toLowerCase().includes(searchText.toLowerCase()) ||
    o?.giftRecipient?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    o?.occasion?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6 text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Curated Gift Sets & Celebratory Packaging
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              {giftList.length} Coffrets · {orderList.length} Gift Orders
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage celebratory packaging, customized message ribbons, and bespoke fragrance discovery chests.
          </p>
        </div>

        {activeTab === 'coffrets' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] text-[#1B100A] text-xs font-semibold shadow-sm hover:brightness-105 transition-all w-fit cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Gift Set</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('coffrets')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'coffrets'
                ? 'bg-[#18110D] text-[#E5B869] shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-[#FAF8F5]'
            }`}
          >
            Curated Coffrets ({giftList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#18110D] text-[#E5B869] shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-[#FAF8F5]'
            }`}
          >
            Patron Gift Orders ({orderList.length})
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'coffrets' ? "Search gift sets..." : "Search by patron, recipient, order ID..."}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl focus:outline-none focus:border-[#D4A64A] transition-colors"
          />
        </div>
      </div>

      {/* View 1: Curated Coffrets Grid */}
      {activeTab === 'coffrets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredGifts.map((gift) => (
            <div 
              key={gift.id}
              className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-48 w-full bg-[#FAF7F2] p-2 flex items-center justify-center overflow-hidden border-b border-[#E8DFC8]">
                  <img 
                    src={getImageUrl(gift.image)} 
                    alt={gift.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = '/images/perfumes/signature_collection.jpg'; }}
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
                    <span className="text-[10px] uppercase tracking-wider text-[#D4A64A] font-bold">
                      Curated Coffret
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {gift.ordersCount || 0} orders
                    </span>
                  </div>
                  <h3 className="font-serif font-medium text-sm text-[#1B100A] line-clamp-1">
                    {gift.name}
                  </h3>
                  <p className="text-xs text-[#555] line-clamp-2 leading-relaxed">
                    {gift.description}
                  </p>
                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="font-bold text-sm text-[#1B100A]">
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
              <div className="p-4 pt-0 flex items-center justify-between border-t border-[#E8DFC8]/60 mt-2">
                <div className="flex items-center gap-1.5 pt-2">
                  <span className="text-[11px] text-gray-500">Status:</span>
                  <Switch 
                    size="small" 
                    checked={gift.status === 'Active'}
                    onChange={(checked) => handleToggleStatus(gift.id, checked)}
                    className={gift.status === 'Active' ? '!bg-[#D4A64A]' : ''}
                  />
                </div>

                <div className="flex items-center gap-1 pt-2">
                  <button
                    onClick={() => handleOpenEdit(gift)}
                    className="p-1.5 text-gray-500 hover:text-[#D4A64A] hover:bg-[#FAF7F2] rounded-lg border border-transparent hover:border-[#E8DFC8] transition-colors cursor-pointer"
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
                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 2: Patron Gift Orders with Custom Packaging Notes */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E8DFC8] text-center space-y-3">
              <Gift size={40} className="mx-auto text-gray-300" />
              <p className="text-sm font-serif font-medium text-gray-700">No Gift Orders Found</p>
              <p className="text-xs text-gray-400">Patron gift requests with customized messages and ribbons will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-black">{ord.orderId}</span>
                        <Tag color="gold" className="text-[10px] font-bold">GIFT ORDER</Tag>
                        {ord.giftWrap && (
                          <Tag color="cyan" className="text-[10px]">GOLD RIBBON WRAP</Tag>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Occasion: <strong className="text-gray-800">{ord.occasion}</strong>
                      </p>
                    </div>
                    <span className="text-xs font-bold text-black font-sans">
                      ₹{(ord.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Sender & Recipient Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE7DD]">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Patron / Sender</span>
                      <p className="font-semibold text-gray-900 truncate">{ord.senderName}</p>
                      <p className="text-[10px] text-gray-500 truncate">{ord.senderPhone || ord.senderEmail}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Gift Recipient</span>
                      <p className="font-semibold text-gray-900 truncate">{ord.giftRecipient?.name || 'Valued Recipient'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{ord.giftRecipient?.address || 'Standard Address'}</p>
                    </div>
                  </div>

                  {/* Personalized Greeting Message */}
                  {ord.giftMessage && (
                    <div className="p-3 rounded-xl bg-[#FFFBF0] border border-[#F3E7C4] text-xs space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#B8860B] block">Personalized Calligraphy Note</span>
                      <p className="font-serif italic text-gray-800 text-[12px] leading-relaxed">
                        &ldquo;{ord.giftMessage}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Included Items */}
                  <div className="text-xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Coffret Contents</span>
                    <div className="space-y-1">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-gray-700 text-[11px]">
                          <span>{it.quantity}x {it.name || it.product_name} ({it.size || 'Flacon'})</span>
                          <span className="font-mono text-gray-500">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fulfillment Status */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-500">
                      Status: <strong className="text-black">{ord.giftFulfillment?.status || ord.orderStatus || 'Pending'}</strong>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-serif text-base text-[#1B100A] pb-2 border-b border-[#E8DFC8]">
            <Gift size={18} className="text-[#D4A64A]" />
            <span>{editingGift ? 'Edit Gift Coffret' : 'Create New Gift Set'}</span>
          </div>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editingGift ? 'Update Gift' : 'Create Gift'}
        okButtonProps={{ className: "!bg-[#D4A64A] hover:!bg-[#B38728] !text-[#1B100A] !font-semibold !border-none" }}
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
