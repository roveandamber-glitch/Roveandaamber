"use client";
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Input, 
  Form, 
  message, 
  Tooltip 
} from 'antd';
import { 
  Trophy, 
  Coins, 
  Settings, 
  CheckCircle2, 
  Search,
  SlidersHorizontal,
  Eye
} from 'lucide-react';
import adminService from '@/services/adminService';

import RewardsMetricsCards from './components/RewardsMetricsCards';
import RewardsTiersGrid from './components/RewardsTiersGrid';
import RewardsRulesModal from './components/RewardsRulesModal';
import UserWalletModal from './components/UserWalletModal';

export default function AdminRewardsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  // Rules modal state
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [rulesForm] = Form.useForm();

  // User Wallet & History Modal state
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRewards();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load rewards data:', err);
      message.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRules = () => {
    if (data?.rules) {
      rulesForm.setFieldsValue({
        pointsPerHundred: data.rules.pointsPerHundred ?? (data.rules.pointsPerRupee ? Math.round(data.rules.pointsPerRupee * 100) : 10),
        redemptionRate: data.rules.redemptionRate ?? 100,
        welcomeBonus: data.rules.welcomeBonus ?? 100
      });
    } else {
      rulesForm.setFieldsValue({
        pointsPerHundred: 10,
        redemptionRate: 100,
        welcomeBonus: 100
      });
    }
    setRulesModalOpen(true);
  };

  const handleSaveRules = async () => {
    try {
      const values = await rulesForm.validateFields();
      setSavingRules(true);
      await adminService.updateRewardRules(values);
      message.success('Loyalty program rules updated successfully');
      setRulesModalOpen(false);
      await fetchRewards();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Failed to update rules');
    } finally {
      setSavingRules(false);
    }
  };

  const handleOpenUserWallet = (record) => {
    setSelectedUser({
      ...record,
      userId: record.userId || record.customerEmail || record.customerName || record.customer || record.id
    });
    setWalletModalOpen(true);
  };

  const transactionColumns = [
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 180,
      render: (text, record) => (
        <Tooltip title="Click to view points history & manage wallet">
          <button
            type="button"
            onClick={() => handleOpenUserWallet(record)}
            className="font-serif font-semibold text-xs text-[#1B100A] hover:text-[#B38728] underline decoration-[#B38728]/40 underline-offset-2 transition-colors cursor-pointer text-left truncate block max-w-[160px]"
          >
            {text}
          </button>
        </Tooltip>
      )
    },
    {
      title: 'Transaction Type',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type) => {
        const isRedeemed = String(type).toLowerCase().includes('redeem');
        const isAdj = String(type).toLowerCase().includes('adjust');
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap ${
            isRedeemed 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : isAdj
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <Coins size={11} />
            {type}
          </span>
        );
      }
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      width: 130,
      render: (points, record) => {
        const isPos = String(points).startsWith('+');
        return (
          <Tooltip title="Click to edit user points or disable wallet">
            <button
              type="button"
              onClick={() => handleOpenUserWallet(record)}
              className={`font-mono font-bold text-xs hover:opacity-80 transition-opacity cursor-pointer ${
                isPos ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {points} pts
            </button>
          </Tooltip>
        );
      }
    },
    {
      title: 'Related Order / Reference',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 170,
      render: (id) => <span className="font-mono text-xs text-gray-500">{id}</span>
    },
    {
      title: 'Timestamp',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      render: (d) => <span className="text-[11px] text-gray-400 whitespace-nowrap">{d}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 size={11} className="text-emerald-600" />
          {status}
        </span>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 130,
      align: 'right',
      render: (_, record) => (
        <button
          type="button"
          onClick={() => handleOpenUserWallet(record)}
          className="inline-flex items-center gap-1 text-xs text-[#1B100A] hover:text-[#B38728] bg-[#FAF7F2] hover:bg-[#F5EEDF] px-2.5 py-1 rounded-lg border border-[#E8DFC8] font-medium transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <SlidersHorizontal size={11} />
          <span>Manage Wallet</span>
        </button>
      )
    }
  ];

  const filteredTransactions = (data?.transactions || []).filter(t => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return (
      (t.customer || '').toLowerCase().includes(q) ||
      (t.orderId || '').toLowerCase().includes(q) ||
      (t.type || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Rewards & Loyalty Program
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              Circle of Connoisseurs
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage points issued for flacon purchases, tier escalation, and fragrance privilege redemptions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenRules}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] text-[#1B100A] text-xs font-semibold shadow-sm hover:brightness-105 transition-all cursor-pointer"
          >
            <Settings size={14} />
            <span>Program Settings</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <RewardsMetricsCards data={data} />

      {/* Loyalty Tiers Grid */}
      <RewardsTiersGrid tiers={data?.tiers || []} />

      {/* Recent Rewards Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 border-b border-[#E8DFC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-[#D4A64A]" />
            <h3 className="font-serif font-medium text-sm text-[#1B100A] m-0">
              Recent Points Activity & Ledger
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search customer, order..."
                prefix={<Search size={13} className="text-gray-400 mr-1" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="rounded-xl text-xs py-1.5 bg-[#FAF8F5] border-[#E8DFC8]"
              />
            </div>
            <span className="text-xs text-gray-400 font-mono shrink-0 hidden sm:inline">Real-time ledger</span>
          </div>
        </div>

        <Table 
          columns={transactionColumns}
          dataSource={filteredTransactions.map((t, idx) => ({ ...t, key: t.id || idx }))}
          loading={loading}
          scroll={{ x: 850 }}
          pagination={{ pageSize: 6, className: "!px-4 !mb-4 text-xs" }}
          className="admin-luxury-table"
        />
      </div>

      {/* Program Settings Modal */}
      <RewardsRulesModal
        open={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
        form={rulesForm}
        onSave={handleSaveRules}
        saving={savingRules}
      />

      {/* Patron Wallet & Points Management Modal */}
      <UserWalletModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        targetUser={selectedUser}
        onUserUpdated={fetchRewards}
      />
    </div>
  );
}
