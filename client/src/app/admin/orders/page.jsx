"use client";
import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Tag, Modal, Avatar, Select, message } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import orderService from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';

const { Option } = Select;

const OrdersList = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders();
      if (response?.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      if (response?.success) {
        message.success(`Order status updated to "${newStatus}"`);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId || o._id === String(orderId)
              ? { ...o, status: newStatus }
              : o
          )
        );
        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder._id === String(orderId))) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      } else {
        message.error(response?.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.response?.data?.message || 'Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const showModal = (record) => {
    setSelectedOrder(record);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    { 
      title: 'Order ID', 
      dataIndex: 'orderId', 
      key: 'orderId', 
      render: text => <span className="font-bold font-mono text-xs bg-gray-100 px-2.5 py-1 rounded-md">{text}</span> 
    },
    { 
      title: 'Customer Info', 
      key: 'customer',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-black text-xs">{record.customerName}</span>
          <span className="text-[11px] text-gray-500 mt-0.5">{record.phone}</span>
        </div>
      )
    },
    { 
      title: 'Product Details', 
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-14 bg-[#EFE8DC] rounded-xl p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
            <img 
              src={getImageUrl(record.productImage)} 
              alt={record.productName} 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = '/Images/brown.png'; }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-black">{record.productName}</span>
            <span className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">Size: {record.size || 'M'} • Qty: {record.quantity}</span>
          </div>
        </div>
      )
    },
    { 
      title: 'Total Amount', 
      dataIndex: 'total_amount', 
      key: 'total_amount', 
      render: (val, r) => <span className="font-bold text-black text-xs font-sans">₹{(val || r.totalPrice || 0).toLocaleString('en-IN')}</span> 
    },
    { 
      title: 'Date Placed', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      render: date => <span className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</span>
    },
    { 
      title: 'Status', 
      key: 'status',
      dataIndex: 'status',
      render: (status, record) => (
        <Select
          value={status || 'Processing'}
          onChange={(newVal) => handleStatusChange(record.id || record._id, newVal)}
          loading={updatingId === (record.id || record._id)}
          className="w-32 rounded-xl"
          dropdownStyle={{ borderRadius: '12px' }}
        >
          <Option value="Processing">
            <Tag color="orange" className="border-0 rounded-full px-2">Processing</Tag>
          </Option>
          <Option value="Shipped">
            <Tag color="cyan" className="border-0 rounded-full px-2">Shipped</Tag>
          </Option>
          <Option value="Delivered">
            <Tag color="green" className="border-0 rounded-full px-2">Delivered</Tag>
          </Option>
          <Option value="Cancelled">
            <Tag color="red" className="border-0 rounded-full px-2">Cancelled</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="default" 
          icon={<EyeOutlined />} 
          onClick={() => showModal(record)} 
          className="rounded-full text-xs font-semibold hover:border-black"
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1 font-serif">Orders Management</h1>
        <p className="text-gray-500 text-sm">Track customer orders, manage status transitions, and review details.</p>
      </div>

      <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl" bodyStyle={{ padding: '24px' }}>
        <div className="flex justify-between items-center mb-6">
          <Input 
            placeholder="Search orders by ID, Customer name or phone..." 
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-80 rounded-full bg-gray-50 border-transparent hover:border-gray-200 focus:border-black py-2"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={orders.filter(o => 
            (o.orderId && o.orderId.toLowerCase().includes(searchText.toLowerCase())) ||
            (o.customerName && o.customerName.toLowerCase().includes(searchText.toLowerCase())) ||
            (o.phone && o.phone.toLowerCase().includes(searchText.toLowerCase()))
          )} 
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="_id"
        />
      </Card>

      {/* Order Details Modal */}
      <Modal 
        title={<span className="font-serif text-lg font-bold">Order Details</span>} 
        open={isModalOpen} 
        onCancel={handleCancel}
        footer={null}
        centered
        className="rounded-2xl overflow-hidden"
      >
        {selectedOrder && (
          <div className="py-2">
            <div className="flex justify-between items-start mb-5 pb-5 border-b border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Order ID</p>
                <p className="font-bold text-lg font-mono">{selectedOrder.orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Status</p>
                <Select
                  value={selectedOrder.status || 'Processing'}
                  onChange={(newVal) => handleStatusChange(selectedOrder.id || selectedOrder._id, newVal)}
                  className="w-32 rounded-xl text-left"
                >
                  <Option value="Processing">Processing</Option>
                  <Option value="Shipped">Shipped</Option>
                  <Option value="Delivered">Delivered</Option>
                  <Option value="Cancelled">Cancelled</Option>
                </Select>
              </div>
            </div>
            
            {/* Customer Info (Cleaned - No Address) */}
            <div className="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Customer Profile</p>
              <p className="font-bold text-sm text-black">{selectedOrder.customerName}</p>
              <p className="text-gray-600 text-xs mt-0.5 font-medium">{selectedOrder.phone}</p>
            </div>

            {/* Item Details */}
            <div className="mb-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Item Details</p>
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="w-14 h-16 bg-[#EFE8DC] rounded-lg p-1 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={getImageUrl(selectedOrder.productImage)} 
                    alt="Product" 
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = '/Images/brown.png'; }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-xs text-black">{selectedOrder.productName}</p>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">Size: <span className="font-bold text-black">{selectedOrder.size || 'M'}</span> • Qty: {selectedOrder.quantity}</p>
                </div>
                <div className="text-right font-bold text-black text-sm font-sans">
                  ₹{(selectedOrder.total_amount || selectedOrder.totalPrice || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default OrdersList;
