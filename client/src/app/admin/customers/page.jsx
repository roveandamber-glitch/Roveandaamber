"use client";
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Avatar, 
  Modal, 
  Tooltip, 
  message 
} from 'antd';
import { 
  Search, 
  Coins, 
  Eye, 
  Ban, 
  ShieldCheck, 
  ShieldAlert, 
  SlidersHorizontal 
} from 'lucide-react';
import adminService from '@/services/adminService';

import CustomerProfileDrawer from './components/CustomerProfileDrawer';
import UserWalletModal from '../rewards/components/UserWalletModal';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // User Wallet Modal
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletTargetUser, setWalletTargetUser] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers();
      if (res?.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCustomer = (customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  const handleOpenWalletModal = (customer) => {
    setWalletTargetUser(customer);
    setWalletModalOpen(true);
  };

  const handleToggleBlock = async (customer, nextStatus) => {
    setActionLoading(true);
    try {
      const res = await adminService.toggleBlockUser(customer.id || customer._id, nextStatus);
      if (res?.success) {
        message.success(nextStatus ? `${customer.name} has been blocked.` : `${customer.name} has been unblocked.`);
        
        // Update local list
        setCustomers(prev => prev.map(c => 
          (String(c.id || c._id) === String(customer.id || customer._id)) 
            ? { ...c, isBlocked: nextStatus } 
            : c
        ));

        // Update selected customer in drawer if open
        setSelectedCustomer(prev => {
          if (!prev) return null;
          if (String(prev.id || prev._id) === String(customer.id || customer._id)) {
            return { ...prev, isBlocked: nextStatus };
          }
          return prev;
        });
      } else {
        message.error(res?.message || 'Failed to update customer status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      message.error(err.response?.data?.message || 'Failed to update customer block status');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmBlockCustomer = (customer) => {
    Modal.confirm({
      title: 'Block Customer Account?',
      icon: <ShieldAlert className="text-rose-600 mr-2" size={22} />,
      content: (
        <div className="text-xs space-y-2 mt-2 text-gray-600">
          <p>
            Are you sure you want to block <strong className="text-gray-900">{customer.name}</strong> ({customer.email})?
          </p>
          <p className="text-rose-600">
            This customer will immediately be prohibited from signing in and will see an alert to contact admin for support.
          </p>
        </div>
      ),
      okText: 'Yes, Block Account',
      okType: 'danger',
      cancelText: 'Cancel',
      okButtonProps: { className: '!bg-rose-600 hover:!bg-rose-700' },
      onOk: () => handleToggleBlock(customer, true)
    });
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar 
            src={record.avatar} 
            size={38}
            className="border border-[#E8DFC8] bg-[#FAF7F2] text-[#D4A64A] font-bold shrink-0"
          >
            {record.name?.[0]}
          </Avatar>
          <div className="min-w-0">
            <div 
              onClick={() => handleOpenCustomer(record)}
              className="text-xs font-semibold text-[#1B100A] hover:text-[#D4A64A] cursor-pointer truncate max-w-[140px]"
            >
              {record.name}
            </div>
            <div className="text-[11px] text-gray-400 truncate max-w-[140px]">
              {record.email}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isBlocked',
      key: 'status',
      width: 120,
      render: (isBlocked) => (
        isBlocked ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-3 py-0.5 rounded-full font-medium whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Blocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 rounded-full font-medium whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        )
      )
    },
    {
      title: 'Orders Placed',
      dataIndex: 'ordersCount',
      key: 'ordersCount',
      width: 120,
      render: (_, record) => {
        const count = record.ordersCount ?? record.orders_count ?? 0;
        return (
          <span className="text-xs font-semibold text-gray-800 bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E8DFC8] whitespace-nowrap">
            {count} {count === 1 ? 'Order' : 'Orders'}
          </span>
        );
      }
    },
    {
      title: 'Lifetime Spending',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 140,
      render: (_, record) => {
        const val = record.totalSpent ?? record.total_spent ?? 0;
        return (
          <span className="text-xs font-bold text-[#1B100A]">
            ₹{Number(val).toLocaleString('en-IN')}
          </span>
        );
      }
    },
    {
      title: 'Reward Points',
      dataIndex: 'rewardPoints',
      key: 'rewardPoints',
      width: 140,
      render: (_, record) => {
        const spent = record.totalSpent ?? record.total_spent ?? 0;
        const val = record.rewardPoints ?? Math.floor(spent * 0.1);
        return (
          <Tooltip title="Click to view points history, adjust points, or toggle wallet">
            <button
              type="button"
              onClick={() => handleOpenWalletModal(record)}
              className="text-xs font-semibold text-[#B38728] hover:text-[#8C6D1F] bg-[#FAF7F2] hover:bg-[#F5EEDF] px-2.5 py-1 rounded-lg border border-[#E8DFC8] flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
            >
              <Coins size={13} className="text-[#D4A64A]" />
              <span>{val.toLocaleString('en-IN')} pts</span>
            </button>
          </Tooltip>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 170,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1.5">
          <button 
            onClick={() => handleOpenCustomer(record)}
            className="inline-flex items-center gap-1 text-xs text-[#1B100A] hover:text-[#D4A64A] bg-[#FAF7F2] hover:bg-[#F5EEDF] px-2.5 py-1.5 rounded-lg border border-[#E8DFC8] font-medium transition-colors cursor-pointer"
          >
            <Eye size={12} />
            <span>Profile</span>
          </button>
          
          {record.isBlocked ? (
            <button
              onClick={() => handleToggleBlock(record, false)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-medium transition-colors cursor-pointer"
              title="Unblock Customer"
            >
              <ShieldCheck size={12} />
              <span>Unblock</span>
            </button>
          ) : (
            <button
              onClick={() => confirmBlockCustomer(record)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 font-medium transition-colors cursor-pointer"
              title="Block Customer"
            >
              <Ban size={12} />
              <span>Block</span>
            </button>
          )}
        </div>
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
              Customer Directory
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              {filteredCustomers.length} Fragrance Enthusiasts
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            View customer profiles, manage account access, lifetime spending, and purchase history.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl focus:outline-none focus:border-[#D4A64A] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <Table 
          columns={columns}
          dataSource={filteredCustomers.map((c, idx) => ({ ...c, key: c.id || idx }))}
          loading={loading}
          scroll={{ x: 860 }}
          pagination={{ 
            pageSize: 8, 
            showSizeChanger: false,
            className: "!px-4 !mb-4 text-xs"
          }}
          className="admin-luxury-table"
        />
      </div>

      {/* Customer Profile Drawer */}
      <CustomerProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedCustomer={selectedCustomer}
        actionLoading={actionLoading}
        handleToggleBlock={handleToggleBlock}
        confirmBlockCustomer={confirmBlockCustomer}
        onOpenWallet={handleOpenWalletModal}
      />

      {/* User Wallet & Points Adjustment Modal */}
      <UserWalletModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        targetUser={walletTargetUser}
        onUserUpdated={fetchCustomers}
      />
    </div>
  );
}
