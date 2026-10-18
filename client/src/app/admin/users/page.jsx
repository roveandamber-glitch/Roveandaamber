"use client";
import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Tag, Avatar, message, Button } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import adminService from '@/services/adminService';

const UsersList = () => {
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers();
      if (response?.success && response.data) {
        // Filter out admin users strictly
        const customerList = response.data.filter(u => u.role !== 'admin');
        setUsers(customerList);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load registered customers');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Customer ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (text, record) => <span className="font-mono font-bold text-gray-700">{text || `#USR-${String(record.id).padStart(4, '0')}`}</span>
    },
    {
      title: 'Customer Profile',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            icon={<UserOutlined />} 
            className="bg-[#EFE8DC] text-black border border-gray-200" 
            size="large"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-black text-sm">{record.name}</span>
            <span className="text-xs text-gray-400">{record.email}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Account Type',
      dataIndex: 'role',
      key: 'role',
      render: () => (
        <Tag color="blue" className="rounded-full px-3 py-1 border-0 uppercase font-semibold text-[10px]">
          Customer
        </Tag>
      )
    },
    {
      title: 'Orders Placed',
      dataIndex: 'orders_count',
      key: 'orders_count',
      render: (count) => (
        <span className="font-semibold text-sm text-gray-800">
          {count || 0} {count === 1 ? 'order' : 'orders'}
        </span>
      )
    },
    {
      title: 'Total Spent',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (spent) => (
        <span className="font-bold text-black text-sm">
          ₹{(spent || 0).toLocaleString('en-IN')}
        </span>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1 font-serif">Customers & Users List</h1>
        <p className="text-gray-500 text-sm">View all registered customers, shopping frequency, and order histories.</p>
      </div>

      <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl" bodyStyle={{ padding: '24px' }}>
        <div className="flex justify-between items-center mb-6">
          <Input 
            placeholder="Search customers by name or email..." 
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-80 rounded-full bg-gray-50 border-transparent hover:border-gray-200 focus:border-black py-2.5"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={users.filter(u => 
            (u.name && u.name.toLowerCase().includes(searchText.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(searchText.toLowerCase()))
          )} 
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="id"
          className="border-t border-gray-50"
        />
      </Card>
    </motion.div>
  );
};

export default UsersList;
