"use client";
import React, { useState, useEffect, useMemo } from 'react';
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
  Tooltip,
  Spin,
  Divider
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
  ExternalLink,
  RefreshCw,
  Printer,
  Sparkles,
  Gift,
  FileText,
  AlertCircle
} from 'lucide-react';
import adminService from '@/services/adminService';
import { CustomDatePicker } from '@/components/common';
import { getImageUrl } from '@/utils/imageHelper';

const { Option } = Select;

const STATUS_CONFIG = {
  Processing: { bg: 'bg-[#FAF3E0]', text: 'text-[#996515]', border: 'border-[#F0DCB1]', icon: Clock },
  Dispatch: { bg: 'bg-[#EBF3FB]', text: 'text-[#1D63B8]', border: 'border-[#CFE3F7]', icon: Truck },
  Dispatched: { bg: 'bg-[#EBF3FB]', text: 'text-[#1D63B8]', border: 'border-[#CFE3F7]', icon: Truck },
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
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Tracking edit form states inside Drawer
  const [courierInput, setCourierInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [estimatedDeliveryInput, setEstimatedDeliveryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [statusNoteInput, setStatusNoteInput] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await adminService.getOrders();
      if (res?.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
        setOrders(list);
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
    setCourierInput(order.tracking?.courierName && order.tracking.courierName !== 'BlueDart Luxury Express' ? order.tracking.courierName : 'Delhivery');
    setTrackingNumberInput(order.tracking?.trackingNumber || order.trackingNumber || '');
    setLocationInput(order.tracking?.currentLocation || 'Delhivery Hub, Mumbai');
    setEstimatedDeliveryInput(
      order.tracking?.estimatedDelivery 
        ? new Date(order.tracking.estimatedDelivery).toISOString().slice(0, 10) 
        : ''
    );
    setStatusNoteInput('');
    setDrawerOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const targetId = selectedOrder.id || selectedOrder._id;
      const trimmedTracking = trackingNumberInput.trim();
      const payload = {
        status: newStatus,
        courierName: courierInput.trim() || 'Delhivery',
        trackingNumber: trimmedTracking || selectedOrder.tracking?.trackingNumber || '',
        trackingUrl: 'https://www.delhivery.com/',
        currentLocation: locationInput || selectedOrder.tracking?.currentLocation || 'Delhivery Hub, Mumbai',
        estimatedDelivery: estimatedDeliveryInput || selectedOrder.tracking?.estimatedDelivery,
        statusNote: statusNoteInput || `Status updated to ${newStatus} with Delhivery consignment.`,
        notifyPatron: true
      };

      const res = await adminService.updateOrderStatus(targetId, payload);
      const updatedOrder = res?.data || {
        ...selectedOrder,
        status: newStatus,
        tracking: {
          ...selectedOrder.tracking,
          courierName: payload.courierName,
          trackingNumber: payload.trackingNumber,
          trackingUrl: payload.trackingUrl,
          currentLocation: payload.currentLocation
        }
      };

      setOrders(prev => prev.map(o => 
        (o.id === targetId || o._id === targetId) ? { ...o, ...updatedOrder, status: newStatus } : o
      ));
      setSelectedOrder(prev => ({ ...prev, ...updatedOrder, status: newStatus }));
      message.success(
        payload.trackingNumber 
          ? `Order ${selectedOrder.orderNumber || selectedOrder.orderId} updated to ${newStatus} & Delhivery Track ID sent to customer.`
          : `Order ${selectedOrder.orderNumber || selectedOrder.orderId} updated to ${newStatus}.`
      );
    } catch (err) {
      console.error('Status update failed:', err);
      message.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const targetId = selectedOrder.id || selectedOrder._id;
      const res = await adminService.updateOrderStatus(targetId, { paymentStatus: newPaymentStatus });
      const updatedOrder = res?.data || {
        ...selectedOrder,
        paymentStatus: newPaymentStatus,
        payment: { ...selectedOrder.payment, status: newPaymentStatus }
      };

      setOrders(prev => prev.map(o => 
        (o.id === targetId || o._id === targetId) ? { ...o, ...updatedOrder, paymentStatus: newPaymentStatus } : o
      ));
      setSelectedOrder(prev => ({ ...prev, ...updatedOrder, paymentStatus: newPaymentStatus }));
      message.success(`Payment status updated to ${newPaymentStatus}`);
    } catch (err) {
      message.error('Failed to update payment status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveTrackingDetails = async () => {
    if (!selectedOrder) return;
    const trimmedTracking = trackingNumberInput.trim();
    setUpdatingStatus(true);
    try {
      const targetId = selectedOrder.id || selectedOrder._id;
      const targetStatus = selectedOrder.status === 'Pending' ? 'Dispatch' : selectedOrder.status;
      const payload = {
        status: targetStatus,
        courierName: courierInput.trim() || 'Delhivery',
        trackingNumber: trimmedTracking,
        trackingUrl: 'https://www.delhivery.com/',
        currentLocation: locationInput.trim() || 'Delhivery Hub, Mumbai',
        estimatedDelivery: estimatedDeliveryInput,
        statusNote: statusNoteInput.trim() || (trimmedTracking ? `Dispatched via Delhivery (Track ID: ${trimmedTracking}). Track at https://www.delhivery.com/` : 'Fulfillment tracking details updated via Delhivery.'),
        notifyPatron: true
      };
      const res = await adminService.updateOrderStatus(targetId, payload);
      const updated = res?.data || {
        ...selectedOrder,
        status: targetStatus,
        tracking: {
          ...selectedOrder.tracking,
          ...payload
        }
      };
      
      setOrders(prev => prev.map(o => 
        (o.id === targetId || o._id === targetId) ? { ...o, ...updated, status: targetStatus } : o
      ));
      setSelectedOrder(prev => ({ ...prev, ...updated, status: targetStatus }));
      message.success('Delhivery Track ID saved and dispatch notification sent to customer via email & profile.');
    } catch (err) {
      message.error('Failed to update tracking details');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Dynamic Status Metrics
  const statusCounts = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return {
      ALL: list.length,
      Pending: list.filter(o => o.status === 'Pending').length,
      Processing: list.filter(o => o.status === 'Processing').length,
      Dispatch: list.filter(o => ['Dispatch', 'Dispatched', 'Shipped'].includes(o.status)).length,
      Delivered: list.filter(o => o.status === 'Delivered').length,
      Cancelled: list.filter(o => o.status === 'Cancelled').length
    };
  }, [orders]);

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(o => {
    const q = (searchText || '').trim().toLowerCase();
    const orderNum = (o.orderNumber || o.orderId || '').toLowerCase();
    const cName = (o.customer?.name || o.customerName || o.customer_name || '').toLowerCase();
    const cEmail = (o.customer?.email || o.email || '').toLowerCase();

    const matchesSearch = !q || orderNum.includes(q) || cName.includes(q) || cEmail.includes(q);
    
    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'Dispatch') {
        matchesStatus = ['Dispatch', 'Dispatched', 'Shipped'].includes(o.status);
      } else {
        matchesStatus = o.status?.toLowerCase() === statusFilter.toLowerCase();
      }
    }

    const pStatus = (o.payment?.status || o.paymentStatus || '').toLowerCase();
    const matchesPayment = paymentFilter === 'ALL' || 
      (paymentFilter === 'COD' ? (pStatus.includes('cod') || pStatus.includes('delivery')) : pStatus === paymentFilter.toLowerCase());

    let matchesDate = true;
    if (dateFilter) {
      const rawDate = o.createdAt || o.date;
      if (rawDate) {
        const dStr = new Date(rawDate).toISOString().slice(0, 10);
        matchesDate = dStr === dateFilter;
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 110,
      render: (text, record) => {
        const displayId = record.orderNumber || record.orderId || `#ORD-${String(record._id || record.id).slice(-4).toUpperCase()}`;
        return (
          <span 
            onClick={() => handleOpenOrder(record)}
            className="font-mono text-xs font-bold text-[#1B100A] hover:text-[#D4A64A] cursor-pointer inline-flex items-center gap-1 group"
          >
            <span>{displayId}</span>
            <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D4A64A]" />
          </span>
        );
      }
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 200,
      render: (_, record) => {
        const custName = record.customer?.name || record.customerName || record.customer_name || 'Valued Patron';
        const custEmail = record.customer?.email || record.email || 'customer@roveandamber.com';
        return (
          <div className="flex items-center gap-2.5 py-1">
            <Avatar 
              src={record.customer?.avatar} 
              className="border border-[#E8DFC8] bg-[#FAF7F2] text-[#D4A64A] font-bold shrink-0"
              size={32}
            >
              {custName[0]?.toUpperCase() || 'P'}
            </Avatar>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#1B100A] truncate max-w-[130px]">{custName}</div>
              <div className="text-[10px] text-gray-400 font-light truncate max-w-[130px]">{custEmail}</div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Perfumes Ordered',
      key: 'items',
      width: 220,
      render: (_, record) => {
        const items = record.items || [];
        const count = items.length;
        const first = items[0];
        const firstName = first?.name || first?.product_name || 'Fine Fragrance Flacon';
        return (
          <div className="text-xs text-gray-700 truncate max-w-[210px]">
            <span className="font-serif font-medium">{firstName}</span>
            {count > 1 && (
              <span className="text-[11px] text-[#D4A64A] ml-1.5 font-semibold whitespace-nowrap">
                +{count - 1} more
              </span>
            )}
            {record.isGift && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FAF3E0] text-[#B8860B] border border-[#F0DCB1]">
                GIFT
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: 'Total Amount',
      key: 'total',
      width: 120,
      render: (_, record) => (
        <span className="text-xs font-bold text-[#1B100A] font-mono">
          ₹{Number(record.total ?? record.total_amount ?? record.totalPrice ?? 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'Payment',
      key: 'payment',
      width: 110,
      render: (_, record) => {
        const pStatus = record.payment?.status || record.paymentStatus || 'Pending';
        const isPaid = pStatus.toLowerCase() === 'paid';
        const isFailed = pStatus.toLowerCase() === 'failed';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            isPaid 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : isFailed
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
            {pStatus}
          </span>
        );
      }
    },
    {
      title: 'Fulfillment Status',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const rawStatus = record.status || 'Pending';
        const displayStatus = (rawStatus === 'Shipped' || rawStatus === 'Dispatched') ? 'Dispatch' : rawStatus;
        const cfg = STATUS_CONFIG[displayStatus] || STATUS_CONFIG[rawStatus] || STATUS_CONFIG.Processing;
        const IconComponent = cfg.icon || Clock;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
            <IconComponent size={12} />
            {displayStatus}
          </span>
        );
      }
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (val, record) => {
        const rawDate = val || record?.date;
        const formatted = rawDate 
          ? new Date(rawDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
          : 'Recent';
        return <span className="text-[11px] text-gray-500 whitespace-nowrap">{formatted}</span>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <button
          onClick={() => handleOpenOrder(record)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 hover:text-black bg-[#FAF8F5] hover:bg-[#F3ECE2] border border-[#E8DFC8] transition-all cursor-pointer"
        >
          <Eye size={12} />
          <span>View Details</span>
        </button>
      )
    }
  ];

  const currentDisplayStatus = selectedOrder?.status === 'Shipped' || selectedOrder?.status === 'Dispatched' 
    ? 'Dispatch' 
    : (selectedOrder?.status || 'Pending');

  return (
    <div className="space-y-6 text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Order Fulfillment Console
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-semibold border border-[#E8DFC8]">
              {orders.length} Active Orders
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time atelier orders, dispatch pipeline status, courier tracking, and customer invoices.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1B100A] text-xs font-semibold border border-[#E8DFC8] shadow-2xs hover:shadow-xs transition-all w-fit cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin text-[#B8860B]' : 'text-gray-500'} />
          <span>Sync Orders</span>
        </button>
      </div>

      {/* Dynamic Status Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { key: 'ALL', label: 'All Orders', count: statusCounts.ALL, color: 'text-gray-900', border: 'border-gray-200' },
          { key: 'Pending', label: 'Pending', count: statusCounts.Pending, color: 'text-rose-700', border: 'border-rose-200' },
          { key: 'Processing', label: 'Processing', count: statusCounts.Processing, color: 'text-amber-800', border: 'border-amber-200' },
          { key: 'Dispatch', label: 'Dispatch', count: statusCounts.Dispatch, color: 'text-sky-700', border: 'border-sky-200' },
          { key: 'Delivered', label: 'Delivered', count: statusCounts.Delivered, color: 'text-emerald-700', border: 'border-emerald-200' },
          { key: 'Cancelled', label: 'Cancelled', count: statusCounts.Cancelled, color: 'text-gray-500', border: 'border-gray-200' }
        ].map((tab) => {
          const isSelected = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-[#18110D] text-white border-[#18110D] shadow-sm' 
                  : 'bg-white hover:bg-[#FAF8F5] text-gray-700 border-[#E8DFC8]'
              }`}
            >
              <div className="text-[10px] font-medium uppercase tracking-wider opacity-75">{tab.label}</div>
              <div className="text-lg font-bold font-mono mt-0.5 flex items-center justify-between">
                <span>{tab.count}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-normal ${isSelected ? 'bg-white/20 text-[#ECC880]' : tab.color}`}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-4">
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
            <span className="text-xs text-gray-500">Filter By:</span>
          </div>

          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-36 text-xs"
          >
            <Option value="ALL">All Statuses ({statusCounts.ALL})</Option>
            <Option value="Pending">Pending ({statusCounts.Pending})</Option>
            <Option value="Processing">Processing ({statusCounts.Processing})</Option>
            <Option value="Dispatch">Dispatch ({statusCounts.Dispatch})</Option>
            <Option value="Delivered">Delivered ({statusCounts.Delivered})</Option>
            <Option value="Cancelled">Cancelled ({statusCounts.Cancelled})</Option>
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

          <div className="w-48">
            <CustomDatePicker 
              value={dateFilter}
              onChange={setDateFilter}
              placeholder="Filter by Order Date"
              showPresets={true}
            />
          </div>

          {(searchText || statusFilter !== 'ALL' || paymentFilter !== 'ALL' || dateFilter) && (
            <button
              onClick={() => {
                setSearchText('');
                setStatusFilter('ALL');
                setPaymentFilter('ALL');
                setDateFilter('');
              }}
              className="text-xs text-[#B8860B] hover:underline cursor-pointer font-medium ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <Table 
          columns={columns}
          dataSource={filteredOrders.map((o, idx) => ({ ...o, key: o.id || o._id || idx }))}
          loading={loading}
          scroll={{ x: 960 }}
          pagination={{ 
            pageSize: 10, 
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            className: "!px-4 !mb-4 text-xs"
          }}
          className="admin-luxury-table"
        />
      </div>

      {/* Full Dynamic Order Detail Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-2">
            <div className="flex items-center gap-2.5">
              <span className="font-serif font-bold text-base text-[#1B100A]">
                {selectedOrder?.orderNumber || selectedOrder?.orderId || 'Order Details'}
              </span>
              <span className="text-[11px] bg-[#FAF7F2] text-[#D4A64A] font-mono px-2 py-0.5 rounded border border-[#E8DFC8]">
                {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Active Order'}
              </span>
            </div>

            {selectedOrder?.isGift && (
              <Tag color="gold" className="text-[10px] font-bold">GIFT ORDER</Tag>
            )}
          </div>
        }
        placement="right"
        size="large"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className="luxury-admin-drawer"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* 1. Fulfillment & Status Management Card */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE3D6] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-semibold">Active Fulfillment Stage:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  STATUS_CONFIG[currentDisplayStatus]?.bg || 'bg-gray-100'
                } ${STATUS_CONFIG[currentDisplayStatus]?.text || 'text-gray-700'} ${
                  STATUS_CONFIG[currentDisplayStatus]?.border || 'border-gray-200'
                }`}>
                  <Truck size={13} />
                  <span>{currentDisplayStatus}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#EAE3D6]">
                <div>
                  <span className="text-[11px] font-semibold text-gray-700 block mb-1">Update Order Status:</span>
                  <Select
                    value={currentDisplayStatus}
                    onChange={handleStatusChange}
                    loading={updatingStatus}
                    className="w-full text-xs"
                  >
                    <Option value="Pending">Pending</Option>
                    <Option value="Processing">Processing</Option>
                    <Option value="Dispatch">Dispatch</Option>
                    <Option value="Delivered">Delivered</Option>
                    <Option value="Cancelled">Cancelled</Option>
                  </Select>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-gray-700 block mb-1">Payment Status:</span>
                  <Select
                    value={selectedOrder.payment?.status || selectedOrder.paymentStatus || 'Pending'}
                    onChange={handlePaymentStatusChange}
                    loading={updatingStatus}
                    className="w-full text-xs"
                  >
                    <Option value="Pending">Pending Payment</Option>
                    <Option value="Paid">Paid / Verified</Option>
                    <Option value="Failed">Failed</Option>
                    <Option value="Refunded">Refunded</Option>
                  </Select>
                </div>
              </div>

              {/* Courier & Tracking Inputs */}
              <div className="pt-3 border-t border-[#EAE3D6] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-800 flex items-center gap-1.5">
                    <Truck size={13} className="text-[#B8860B]" />
                    <span>Delhivery Courier & AWB Tracking Details</span>
                  </span>
                  <a 
                    href="https://www.delhivery.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#B8860B] hover:text-[#7A5807] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>delhivery.com</span>
                    <ExternalLink size={10} />
                  </a>
                </div>

                <div className="bg-[#FAF5ED] border border-[#ECDCC4] p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-[#8C6228]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#B8860B]" />
                      <span>Patron Notification & Delhivery Portal</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    When status changes or tracking is saved, the patron receives an email containing this Track ID and direct link to{' '}
                    <a href="https://www.delhivery.com/" target="_blank" rel="noopener noreferrer" className="text-[#8C6228] font-bold underline">
                      https://www.delhivery.com/
                    </a>{' '}
                    to track their order live.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium block mb-0.5">Courier Partner</label>
                    <Input
                      value={courierInput}
                      onChange={(e) => setCourierInput(e.target.value)}
                      placeholder="Delhivery"
                      className="rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] text-gray-700 font-bold block">
                        Delhivery Track ID / AWB #
                      </label>
                      {trackingNumberInput && (
                        <a 
                          href="https://www.delhivery.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[9px] text-[#B8860B] hover:underline flex items-center gap-0.5 font-medium"
                        >
                          <span>delhivery.com</span>
                          <ExternalLink size={9} />
                        </a>
                      )}
                    </div>
                    <Input
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      placeholder="e.g. 128492019482"
                      className="rounded-lg text-xs font-mono font-bold border-[#C49A45] focus:border-[#8C6228]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium block mb-0.5">Estimated Delivery Date</label>
                    <CustomDatePicker
                      value={estimatedDeliveryInput}
                      onChange={setEstimatedDeliveryInput}
                      placeholder="Select delivery date"
                      disablePast={true}
                      showPresets={true}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium block mb-0.5">Current Checkpoint / Location</label>
                    <Input
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="e.g. Delhivery Hub, Mumbai"
                      className="rounded-xl text-xs py-2 bg-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveTrackingDetails}
                  disabled={updatingStatus}
                  className="w-full mt-1 bg-[#18110D] hover:bg-black text-[#ECC880] py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={13} className="text-[#DEB368]" />
                  <span>Save Tracking & Notify Patron via Email</span>
                </button>
              </div>
            </div>

            {/* 2. Customer Information Card */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
                <span>Customer Profile & Dispatch Address</span>
              </h4>
              <div className="bg-white p-4 rounded-xl border border-[#EAE3D6] space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={selectedOrder.customer?.avatar} 
                    size={42} 
                    className="border border-[#EAE3D6] bg-[#FAF8F5] text-[#B8860B] font-bold"
                  >
                    {(selectedOrder.customer?.name || selectedOrder.customerName || selectedOrder.customer_name)?.[0]?.toUpperCase() || 'P'}
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm text-[#1A1A1A]">
                      {selectedOrder.customer?.name || selectedOrder.customerName || selectedOrder.customer_name || 'Valued Customer'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {selectedOrder.customer?.email || selectedOrder.email || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#B8860B] shrink-0" />
                    <span>{selectedOrder.customer?.phone || selectedOrder.phone || 'Contact not provided'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="text-[#B8860B] shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      {selectedOrder.address || (typeof selectedOrder.shippingAddress === 'string' ? selectedOrder.shippingAddress : (selectedOrder.shippingAddress?.addressLine1 ? `${selectedOrder.shippingAddress.addressLine1}, ${selectedOrder.shippingAddress.city}` : 'Atelier Direct Dispatch'))}
                    </span>
                  </div>
                </div>

                {/* Gift Recipient if applicable */}
                {selectedOrder.isGift && selectedOrder.giftRecipient?.name && (
                  <div className="p-3 bg-[#FFFBF0] rounded-xl border border-[#F3E7C4] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#B8860B] flex items-center gap-1">
                      <Gift size={11} />
                      <span>Gift Recipient</span>
                    </span>
                    <p className="font-semibold text-gray-900 text-xs">{selectedOrder.giftRecipient.name} ({selectedOrder.giftRecipient.phone})</p>
                    <p className="text-[11px] text-gray-600">{selectedOrder.giftRecipient.address}</p>
                    {selectedOrder.giftMessage && (
                      <p className="text-[11px] italic font-serif text-gray-800 pt-1 border-t border-[#F3E7C4]">
                        &ldquo;{selectedOrder.giftMessage}&rdquo;
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Ordered Perfumes List */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center justify-between">
                <span>Ordered Flacons & Coffrets</span>
                <span className="text-xs font-mono font-normal text-gray-500">
                  {selectedOrder.items?.length || 1} Item(s)
                </span>
              </h4>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, idx) => {
                  const itemImg = getImageUrl(item.image || item.product_image || item.images?.[0]);
                  const unitPrice = Number(item.price || 0);
                  const qty = Number(item.quantity || 1);
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#EAE3D6]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-14 rounded-lg bg-[#FAF7F2] p-1 border border-[#EAE3D6] flex items-center justify-center shrink-0">
                          <img 
                            src={itemImg} 
                            alt={item.name || 'Perfume'} 
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.src = '/images/perfumes/signature_collection.jpg'; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif font-semibold text-xs text-[#1A1A1A] truncate">{item.name || item.product_name}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Qty: <strong className="text-gray-700">{qty}</strong> × ₹{unitPrice.toLocaleString('en-IN')}
                            {item.size && <span className="ml-1.5 px-1.5 py-0.2 rounded bg-gray-100 text-[10px] text-gray-700 font-semibold">{item.size}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-xs text-[#1A1A1A] font-mono shrink-0 pl-3">
                        ₹{(unitPrice * qty).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Financial Breakdown */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE3D6] space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono">₹{Number(selectedOrder.subtotal || selectedOrder.total_amount || selectedOrder.total || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Method</span>
                <span className="text-emerald-700 font-semibold">
                  {selectedOrder.shipping === 0 || !selectedOrder.shipping ? 'Complimentary Luxury Express' : `₹${selectedOrder.shipping}`}
                </span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Loyalty Privilege Discount</span>
                  <span className="font-mono">-₹{Number(selectedOrder.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#EAE3D6] flex justify-between font-bold text-sm text-[#1A1A1A]">
                <span>Total Amount Paid</span>
                <span className="text-[#B8860B] font-mono">
                  ₹{Number(selectedOrder.total ?? selectedOrder.total_amount ?? selectedOrder.totalPrice ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* 5. Live Tracking History Timeline */}
            {selectedOrder.tracking?.history?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center gap-1.5">
                  <Clock size={14} className="text-[#B8860B]" />
                  <span>Fulfillment Checkpoints Timeline</span>
                </h4>
                <div className="bg-white p-3.5 rounded-xl border border-[#EAE3D6] space-y-3">
                  {selectedOrder.tracking.history.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#B8860B] mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{h.stage || h.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {h.timestamp ? new Date(h.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{h.description || h.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
