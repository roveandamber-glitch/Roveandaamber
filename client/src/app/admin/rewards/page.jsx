"use client";
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Modal, 
  Form, 
  InputNumber, 
  message, 
  Tag, 
  Tooltip 
} from 'antd';
import { 
  Trophy, 
  Crown, 
  Award, 
  Coins, 
  Sparkles, 
  Gift, 
  Settings, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Users, 
  Search,
  ExternalLink
} from 'lucide-react';
import adminService from '@/services/adminService';

const { Option } = Select;

export default function AdminRewardsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [rulesForm] = Form.useForm();
  const watchedRules = Form.useWatch([], rulesForm);

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

  const transactionColumns = [
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 170,
      render: (text) => (
        <span className="font-serif font-semibold text-xs text-[#1B100A] truncate block max-w-[150px]">{text}</span>
      )
    },
    {
      title: 'Transaction Type',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type) => {
        const isRedeemed = type.toLowerCase().includes('redeem');
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap ${
            isRedeemed 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
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
      width: 120,
      render: (points) => {
        const isPos = String(points).startsWith('+');
        return (
          <span className={`font-mono font-bold text-xs ${isPos ? 'text-emerald-700' : 'text-rose-600'}`}>
            {points} pts
          </span>
        );
      }
    },
    {
      title: 'Related Order / Reference',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 160,
      render: (id) => <span className="font-mono text-xs text-gray-500">{id}</span>
    },
    {
      title: 'Timestamp',
      dataIndex: 'date',
      key: 'date',
      width: 120,
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
    }
  ];

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

      {/* Top 4 Metrics - Standard Atelier Dashboard Card Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Rewards Members */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Rewards Members
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#B38728] group-hover:scale-105 transition-transform">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight">
              {Number(data?.overview?.totalMembers || 1284).toLocaleString()}
            </h3>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp size={12} />
              +12%
            </span>
            <span className="text-xs text-gray-400 font-light">vs last month</span>
          </div>
        </div>

        {/* Total Points Issued */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Points Issued
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#B38728] group-hover:scale-105 transition-transform">
              <Coins size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight">
              {Number(data?.overview?.pointsIssued || 45680).toLocaleString()} <span className="text-sm sm:text-base font-semibold text-gray-400">pts</span>
            </h3>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp size={12} />
              +18%
            </span>
            <span className="text-xs text-gray-400 font-light">accumulation rate</span>
          </div>
        </div>

        {/* Rewards Redeemed */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Rewards Redeemed
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#B38728] group-hover:scale-105 transition-transform">
              <Gift size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight">
              {Number(data?.overview?.rewardsRedeemed || 320).toLocaleString()}
            </h3>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp size={12} />
              +25%
            </span>
            <span className="text-xs text-gray-400 font-light">redemptions</span>
          </div>
        </div>

        {/* Outstanding Points */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Outstanding Points
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#B38728] group-hover:scale-105 transition-transform">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight">
              {Number(data?.overview?.outstandingPoints || 32180).toLocaleString()} <span className="text-sm sm:text-base font-semibold text-gray-400">pts</span>
            </h3>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FAF7F2] text-[#8C6D1F] border border-[#E8DFC8]">
              Est. Value: ₹{Number(data?.overview?.outstandingPoints || 32180).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Loyalty Tiers Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
            Privilege Tier Structure
          </h3>
          <span className="text-xs text-gray-500">4 Tier Escalation Tiers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data?.tiers || []).map((tier, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#B8860B]/10 to-transparent rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-base text-[#1A1A1A]">
                    {tier.name}
                  </span>
                  <span className="text-xs bg-[#FAF7F2] text-[#B8860B] font-semibold px-2 py-0.5 rounded-full border border-[#EAE3D6]">
                    {tier.membersCount} Members
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3 font-medium">
                  Spending: <span className="text-[#1A1A1A] font-semibold">{tier.threshold}</span>
                </div>
                <div className="text-xs text-gray-700 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE3D6] leading-relaxed">
                  {tier.multiplier}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Rewards Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-4 border-b border-[#E8DFC8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-[#D4A64A]" />
            <h3 className="font-serif font-medium text-sm text-[#1B100A]">
              Recent Points Activity & Ledger
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">Real-time ledger</span>
        </div>

        <Table 
          columns={transactionColumns}
          dataSource={(data?.transactions || []).map((t, idx) => ({ ...t, key: t.id || idx }))}
          loading={loading}
          scroll={{ x: 750 }}
          pagination={{ pageSize: 6, className: "!px-4 !mb-4 text-xs" }}
          className="admin-luxury-table"
        />
      </div>

      {/* Configure Rewards Program Rules Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 pb-3 border-b border-[#EAE3D6]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FAF3E0] to-[#F3E5C8] border border-[#E0D0A5] text-[#B8860B] flex items-center justify-center shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-[#1A1A1A] tracking-tight">
                Configure Rewards Program Rules
              </h3>
              <p className="text-[11px] text-gray-500 font-normal">
                Define fragrance purchase point accrual, redemption value, and welcome privileges.
              </p>
            </div>
          </div>
        }
        open={rulesModalOpen}
        onCancel={() => !savingRules && setRulesModalOpen(false)}
        footer={null}
        width={560}
        centered
        destroyOnClose
      >
        <Form form={rulesForm} layout="vertical" onFinish={handleSaveRules} className="pt-4 space-y-4">
          {/* Rule 1: Points Earned per ₹100 Spent */}
          <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#EAE3D6] transition-all hover:border-[#D4AF37]/60">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] block">
                  Points Earned per ₹100 Spent
                </label>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  Points credited to patron ledger for every ₹100 spent on bespoke flacons.
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] font-semibold shrink-0">
                Accrual
              </span>
            </div>
            <Form.Item
              name="pointsPerHundred"
              rules={[
                { required: true, message: 'Please enter points earned per ₹100' },
                { type: 'number', min: 1, max: 100, message: 'Must be between 1 and 100 points' }
              ]}
              className="!mb-0"
            >
              <InputNumber
                min={1}
                max={100}
                addonAfter={<span className="text-xs font-medium text-gray-600">pts / ₹100</span>}
                className="w-full rounded-xl"
                size="large"
              />
            </Form.Item>
          </div>

          {/* Rule 2: Rupee Value per 100 Points */}
          <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#EAE3D6] transition-all hover:border-[#D4AF37]/60">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] block">
                  Rupee Value per 100 Points
                </label>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  Direct order discount received by patron when redeeming 100 points.
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] font-semibold shrink-0">
                Redemption
              </span>
            </div>
            <Form.Item
              name="redemptionRate"
              rules={[
                { required: true, message: 'Please enter rupee value per 100 points' },
                { type: 'number', min: 10, max: 1000, message: 'Must be between ₹10 and ₹1,000' }
              ]}
              className="!mb-0"
            >
              <InputNumber
                min={10}
                max={1000}
                prefix={<span className="text-xs font-bold text-gray-500 mr-1">₹</span>}
                addonAfter={<span className="text-xs font-medium text-gray-600">/ 100 pts</span>}
                className="w-full rounded-xl"
                size="large"
              />
            </Form.Item>
          </div>

          {/* Rule 3: Welcome Bonus Points */}
          <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#EAE3D6] transition-all hover:border-[#D4AF37]/60">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] block">
                  Welcome Bonus Points (New Customer)
                </label>
                <span className="text-[11px] text-gray-500 block mt-0.5">
                  Complimentary privilege balance credited automatically upon account registration.
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
                Sign-up Gift
              </span>
            </div>
            <Form.Item
              name="welcomeBonus"
              rules={[
                { required: true, message: 'Please enter welcome bonus points' },
                { type: 'number', min: 0, max: 5000, message: 'Must be between 0 and 5,000' }
              ]}
              className="!mb-0"
            >
              <InputNumber
                min={0}
                max={5000}
                addonAfter={<span className="text-xs font-medium text-gray-600">pts</span>}
                className="w-full rounded-xl"
                size="large"
              />
            </Form.Item>
          </div>

          {/* Live Dynamic Preview Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FAF3E0]/70 to-[#F9EED4]/50 border border-[#E0D0A5] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#8C6D1F]">
              <Sparkles size={14} />
              <span>Live Loyalty Program Conversion Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4A3B22] pt-1">
              <div className="p-2 rounded-xl bg-white/70 border border-[#E6D7B6]">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Acquisition</span>
                <span>Spend ₹1,000 → Earn <strong>{((rulesForm.getFieldValue('pointsPerHundred') || 10) * 10).toLocaleString()} pts</strong></span>
              </div>
              <div className="p-2 rounded-xl bg-white/70 border border-[#E6D7B6]">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Redemption</span>
                <span>100 pts → <strong>₹{(rulesForm.getFieldValue('redemptionRate') || 100).toLocaleString()}</strong> boutique credit</span>
              </div>
            </div>
          </div>

          {/* Luxury Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE3D6]">
            <button
              type="button"
              disabled={savingRules}
              onClick={() => setRulesModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#D5C9B8] bg-white hover:bg-stone-50 text-gray-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingRules}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] hover:from-[#C89B3F] hover:to-[#A3791F] text-[#1B100A] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {savingRules ? (
                <span>Saving Rules...</span>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Save Program Rules</span>
                </>
              )}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

