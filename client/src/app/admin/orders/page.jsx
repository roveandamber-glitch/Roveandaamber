"use client";
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Input, 
  Button, 
  Select, 
  Tag, 
  Modal, 
  Avatar, 
  message, 
  Drawer,
  Tooltip 
} from 'antd';
import { 
  Search, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  XCircle, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard,
  Calendar,
  Filter,
  ExternalLink
} from 'lucide-react';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';

const { Option } = Select;

const STATUS_CONFIG = {
  Processing: { bg: 'bg-[#FAF3E0]', text: 'text-[#996515]', border: 'border-[#F0DCB1]', icon: Clock },
  Shipped: { bg: 'bg-[#EBF3FB]', text: 'text-[#1D63B8]', border: 'border-[#CFE3F7]', icon: Truck },
  Delivered: { bg: 'bg-[#EAF7EE]', text: 'text-[#1E7E34]', border: 'border-[#C2E8CC]', icon: CheckCircle2 },
  Pending: { bg: 'bg-[#FFF0F0]', text: 'text-[#C92A2A]', border: 'border-[#F8D2D2]', icon: Clock },
  Cancelled: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: XCircle }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrders();
      if (res?.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      await adminService.updateOrderStatus(selectedOrder.id, { status: newStatus });
      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id ? { ...o, status: newStatus } : o
      ));
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      message.success(`Order ${selectedOrder.orderNumber} status updated to ${newStatus}`);
    } catch (err) {
      message.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      o.customer?.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || o.payment?.status === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 100,
      render: (text, record) => (
        <span 
          onClick={() => handleOpenOrder(record)}
          className="font-mono text-xs font-bold text-[#1B100A] hover:text-[#D4A64A] cursor-pointer"
        >
          {text}
        </span>
      )
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-2.5 py-1">
          <Avatar 
            src={record.customer?.avatar} 
            className="border border-[#E8DFC8] bg-[#FAF7F2] text-[#D4A64A] font-bold"
            size={34}
          >
            {record.customer?.name?.[0]}
          </Avatar>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#1B100A] truncate max-w-[130px]">
              {record.customer?.name}
            </div>
            <div className="text-[11px] text-gray-400 truncate max-w-[130px]">
              {record.customer?.email}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Perfumes Ordered',
      key: 'items',
      width: 220,
      render: (_, record) => {
        const first = record.items?.[0];
        const count = record.items?.length || 1;
        return (
          <div className="text-xs text-gray-700 truncate max-w-[200px]">
            <span className="font-serif font-medium">{first?.name || 'Perfume Flacon'}</span>
            {count > 1 && (
              <span className="text-[11px] text-[#D4A64A] ml-1.5 font-medium whitespace-nowrap">
                +{count - 1} more
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: 'Total Amount',
      key: 'total',
      width: 130,
      render: (_, record) => (
        <span className="text-xs font-bold text-[#1B100A]">
          ₹{(record.total || 4950).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'Payment',
      key: 'payment',
      width: 120,
      render: (_, record) => {
        const pStatus = record.payment?.status || 'Paid';
        const isPaid = pStatus === 'Paid';
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
            isPaid 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            {pStatus}
          </span>
        );
      }
    },
    {
      title: 'Fulfillment Status',
      key: 'status',
      width: 140,
      render: (_, record) => {
        const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.Processing;
        const IconComponent = cfg.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
            <IconComponent size={12} />
            {record.status}
          </span>
        );
      }
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (val) => <span className="text-[11px] text-gray-400 whitespace-nowrap">{val || '29 Oct 2026'}</span>
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <button 
          onClick={() => handleOpenOrder(record)}
          className="inline-flex items-center gap-1 text-xs text-[#1B100A] hover:text-[#D4A64A] bg-[#FAF7F2] hover:bg-[#F5EEDF] px-3 py-1.5 rounded-lg border border-[#E8DFC8] font-medium transition-colors cursor-pointer"
        >
          <Eye size={13} />
          <span>View Details</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Order Fulfillment
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              {filteredOrders.length} Orders
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track customer orders, manage dispatched flacons, and update shipping details.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer, email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl focus:outline-none focus:border-[#D4A64A] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Status:</span>
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-36 text-xs"
          >
            <Option value="ALL">All Statuses</Option>
            <Option value="Processing">Processing</Option>
            <Option value="Shipped">Shipped</Option>
            <Option value="Delivered">Delivered</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>

          <Select
            value={paymentFilter}
            onChange={setPaymentFilter}
            className="w-32 text-xs"
          >
            <Option value="ALL">All Payments</Option>
            <Option value="Paid">Paid</Option>
            <Option value="Pending">Pending</Option>
            <Option value="COD">Cash on Del.</Option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <Table 
          columns={columns}
          dataSource={filteredOrders.map((o, idx) => ({ ...o, key: o.id || idx }))}
          loading={loading}
          scroll={{ x: 880 }}
          pagination={{ 
            pageSize: 8, 
            showSizeChanger: false,
            className: "!px-4 !mb-4 text-xs"
          }}
          className="admin-luxury-table"
        />
      </div>

      {/* Order Detail Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="font-serif font-medium text-base text-[#1B100A]">
                Order {selectedOrder?.orderNumber}
              </span>
              <span className="text-xs bg-[#FAF7F2] text-[#D4A64A] font-mono px-2 py-0.5 rounded border border-[#E8DFC8]">
                {selectedOrder?.createdAt}
              </span>
            </div>
          </div>
        }
        placement="right"
        width={Math.min(520, typeof window !== 'undefined' ? window.innerWidth - 20 : 520)}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className="luxury-admin-drawer"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Status & Update Action */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE3D6] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Order Status:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  STATUS_CONFIG[selectedOrder.status]?.bg || 'bg-gray-100'
                } ${STATUS_CONFIG[selectedOrder.status]?.text || 'text-gray-700'} ${
                  STATUS_CONFIG[selectedOrder.status]?.border || 'border-gray-200'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="pt-2 border-t border-[#EAE3D6] flex items-center justify-between gap-3">
                <span className="text-gray-600 font-medium">Update Status:</span>
                <Select
                  value={selectedOrder.status}
                  onChange={handleStatusChange}
                  loading={updatingStatus}
                  className="w-44 text-xs"
                >
                  <Option value="Pending">Pending</Option>
                  <Option value="Processing">Processing</Option>
                  <Option value="Shipped">Shipped</Option>
                  <Option value="Delivered">Delivered</Option>
                  <Option value="Cancelled">Cancelled</Option>
                </Select>
              </div>

              {selectedOrder.trackingNumber && (
                <div className="pt-2 border-t border-[#EAE3D6] flex items-center justify-between text-gray-500">
                  <span className="flex items-center gap-1.5"><Truck size={14} /> Tracking Number:</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">{selectedOrder.trackingNumber}</span>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
                <span>Customer Information</span>
                {selectedOrder.customer?.tier && (
                  <span className="text-[10px] bg-[#B8860B]/10 text-[#B8860B] font-bold px-2 py-0.5 rounded-full border border-[#B8860B]/20">
                    {selectedOrder.customer.tier} Tier
                  </span>
                )}
              </h4>
              <div className="bg-white p-3.5 rounded-xl border border-[#EAE3D6] space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar src={selectedOrder.customer?.avatar} size={40} className="border border-[#EAE3D6]">
                    {selectedOrder.customer?.name?.[0]}
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm text-[#1A1A1A]">{selectedOrder.customer?.name}</div>
                    <div className="text-gray-400 text-[11px]">{selectedOrder.customer?.email}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-[#B8860B]" />
                    <span>{selectedOrder.customer?.phone || '+91 98765 43210'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#B8860B]" />
                    <span className="truncate">{selectedOrder.shippingAddress?.city || 'Mumbai, MH'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchased Items */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
                Ordered Perfumes ({selectedOrder.items?.length || 1})
              </h4>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EAE3D6]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 rounded-lg bg-[#FAF7F2] p-1 border border-[#EAE3D6] flex items-center justify-center">
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name} 
                          className="w-full h-full object-contain"
                          onError={(e) => { e.currentTarget.src = '/hero_perfume.png'; }}
                        />
                      </div>
                      <div>
                        <div className="font-serif font-semibold text-xs text-[#1A1A1A]">{item.name}</div>
                        <div className="text-[11px] text-gray-400">
                          Qty: {item.quantity} × ₹{(item.price || 2475).toLocaleString('en-IN')} ({item.size || '100ml'})
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-xs text-[#1A1A1A]">
                      ₹{((item.price || 2475) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE3D6] space-y-2">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{(selectedOrder.subtotal || selectedOrder.total || 4950).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping (Luxury Express)</span>
                <span className="text-emerald-700 font-medium">
                  {selectedOrder.shipping === 0 ? 'Complimentary' : `₹${selectedOrder.shipping || 0}`}
                </span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Loyalty Discount</span>
                  <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#EAE3D6] flex justify-between font-bold text-sm text-[#1A1A1A]">
                <span>Total Amount Paid</span>
                <span className="text-[#B8860B] font-mono">₹{(selectedOrder.total || 4950).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
