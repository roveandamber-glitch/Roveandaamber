"use client";
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Input, 
  Avatar, 
  Tag, 
  Button, 
  Drawer, 
  message, 
  Tooltip 
} from 'antd';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Award, 
  ShoppingBag, 
  Coins, 
  Crown, 
  Eye, 
  Clock 
} from 'lucide-react';
import adminService from '@/services/adminService';

const TIER_CONFIG = {
  Platinum: { bg: 'bg-[#F3E8FF]', text: 'text-[#6B21A8]', border: 'border-[#E9D5FF]', icon: Crown },
  Gold: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', border: 'border-[#FDE68A]', icon: Award },
  Silver: { bg: 'bg-[#F1F5F9]', text: 'text-[#334155]', border: 'border-[#E2E8F0]', icon: Award },
  Bronze: { bg: 'bg-[#FFF7ED]', text: 'text-[#9A3412]', border: 'border-[#FFEDD5]', icon: Award }
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchText.toLowerCase())
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
      title: 'City & Region',
      dataIndex: 'city',
      key: 'city',
      width: 170,
      render: (val) => <span className="text-xs text-gray-600 truncate max-w-[150px] inline-block">{val || 'Mumbai, Maharashtra'}</span>
    },
    {
      title: 'Loyalty Tier',
      key: 'tier',
      width: 130,
      render: (_, record) => {
        const tier = record.tier || 'Silver';
        const cfg = TIER_CONFIG[tier] || TIER_CONFIG.Silver;
        const IconComponent = cfg.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
            <IconComponent size={12} />
            {tier}
          </span>
        );
      }
    },
    {
      title: 'Orders Placed',
      dataIndex: 'ordersCount',
      key: 'ordersCount',
      width: 120,
      render: (count) => (
        <span className="text-xs font-semibold text-gray-800 bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E8DFC8] whitespace-nowrap">
          {count || 1} Orders
        </span>
      )
    },
    {
      title: 'Lifetime Spending',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      width: 140,
      render: (val) => (
        <span className="text-xs font-bold text-[#1B100A]">
          ₹{(val || 4950).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'Reward Points',
      dataIndex: 'rewardPoints',
      key: 'rewardPoints',
      width: 130,
      render: (val) => (
        <span className="text-xs font-semibold text-[#B38728] flex items-center gap-1 whitespace-nowrap">
          <Coins size={13} className="text-[#D4A64A]" />
          {(val || 450).toLocaleString('en-IN')} pts
        </span>
      )
    },
    {
      title: 'Joined Date',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
      width: 110,
      render: (val) => <span className="text-[11px] text-gray-400 whitespace-nowrap">{val || '29 Oct 2026'}</span>
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <button 
          onClick={() => handleOpenCustomer(record)}
          className="inline-flex items-center gap-1 text-xs text-[#1B100A] hover:text-[#D4A64A] bg-[#FAF7F2] hover:bg-[#F5EEDF] px-3 py-1.5 rounded-lg border border-[#E8DFC8] font-medium transition-colors cursor-pointer"
        >
          <Eye size={13} />
          <span>Profile</span>
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
              Customer Directory
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              {filteredCustomers.length} Fragrance Enthusiasts
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            View customer profiles, lifetime spending, loyalty points, and purchase history.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or city..."
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
          scroll={{ x: 820 }}
          pagination={{ 
            pageSize: 8, 
            showSizeChanger: false,
            className: "!px-4 !mb-4 text-xs"
          }}
          className="admin-luxury-table"
        />
      </div>

      {/* Customer Profile Drawer */}
      <Drawer
        title={
          <span className="font-serif font-medium text-base text-[#1B100A]">
            Customer Profile
          </span>
        }
        placement="right"
        width={Math.min(460, typeof window !== 'undefined' ? window.innerWidth - 20 : 460)}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className="luxury-admin-drawer"
      >
        {selectedCustomer && (
          <div className="space-y-6 text-xs">
            {/* Header info */}
            <div className="flex flex-col items-center text-center p-5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D6]">
              <Avatar src={selectedCustomer.avatar} size={70} className="border-2 border-[#B8860B] mb-3">
                {selectedCustomer.name?.[0]}
              </Avatar>
              <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
                {selectedCustomer.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{selectedCustomer.email}</p>
              
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  TIER_CONFIG[selectedCustomer.tier]?.bg || 'bg-gray-100'
                } ${TIER_CONFIG[selectedCustomer.tier]?.text || 'text-gray-700'} ${
                  TIER_CONFIG[selectedCustomer.tier]?.border || 'border-gray-200'
                }`}>
                  <Crown size={12} />
                  {selectedCustomer.tier || 'Silver'} Member
                </span>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-[#EAE3D6] text-center">
                <div className="text-[11px] text-gray-400">Total Spend</div>
                <div className="font-bold text-sm text-[#1A1A1A] mt-1">
                  ₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#EAE3D6] text-center">
                <div className="text-[11px] text-gray-400">Orders</div>
                <div className="font-bold text-sm text-[#1A1A1A] mt-1">
                  {selectedCustomer.ordersCount || 0}
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#EAE3D6] text-center">
                <div className="text-[11px] text-gray-400">Reward Points</div>
                <div className="font-bold text-sm text-[#B8860B] mt-1">
                  {(selectedCustomer.rewardPoints || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">Contact & Location</h4>
              <div className="bg-white p-3.5 rounded-xl border border-[#EAE3D6] space-y-2.5 text-gray-600">
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-[#B8860B]" />
                  <span>{selectedCustomer.phone || '+91 98765 43210'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-[#B8860B]" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={14} className="text-[#B8860B]" />
                  <span>{selectedCustomer.city || 'Mumbai, Maharashtra, India'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar size={14} className="text-[#B8860B]" />
                  <span>Customer since {selectedCustomer.joinedDate || 'October 2026'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

