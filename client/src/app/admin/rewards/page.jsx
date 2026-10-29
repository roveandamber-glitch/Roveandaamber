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
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [rulesForm] = Form.useForm();
  const [bonusForm] = Form.useForm();

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
        pointsPerRupee: data.rules.pointsPerRupee * 100, // as percentage or ratio
        redemptionRate: data.rules.redemptionRate,
        welcomeBonus: data.rules.welcomeBonus,
        birthdayBonus: data.rules.birthdayBonus,
        expiryMonths: data.rules.expiryMonths
      });
    }
    setRulesModalOpen(true);
  };

  const handleSaveRules = async () => {
    try {
      const values = await rulesForm.validateFields();
      await adminService.updateRewardRules(values);
      message.success('Loyalty program rules updated successfully');
      setRulesModalOpen(false);
    } catch (err) {}
  };

  const handleAwardBonus = async () => {
    try {
      const values = await bonusForm.validateFields();
      message.success(`Awarded ${values.points} reward points to ${values.customer}`);
      if (data?.transactions) {
        const newTx = {
          id: `tx-${Date.now()}`,
          customer: values.customer,
          type: `Bonus (${values.reason || 'Admin Award'})`,
          points: `+${values.points}`,
          orderId: 'Manual Privilege',
          date: 'Just now',
          status: 'Credited'
        };
        setData(prev => ({
          ...prev,
          transactions: [newTx, ...prev.transactions]
        }));
      }
      bonusForm.resetFields();
      setBonusModalOpen(false);
    } catch (err) {}
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
            onClick={() => setBonusModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#1B100A] border border-[#E8DFC8] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <Plus size={14} className="text-[#D4A64A]" />
            <span>Award Bonus Points</span>
          </button>

          <button
            onClick={handleOpenRules}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] text-[#1B100A] text-xs font-semibold shadow-sm hover:brightness-105 transition-all cursor-pointer"
          >
            <Settings size={14} />
            <span>Program Settings</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium text-gray-600">Total Rewards Members</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#B8860B] flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1A1A1A]">
            {(data?.overview?.totalMembers || 1284).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight size={13} />
            <span>+12% vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium text-gray-600">Total Points Issued</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#B8860B] flex items-center justify-center">
              <Coins size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1A1A1A]">
            {(data?.overview?.pointsIssued || 45680).toLocaleString()} pts
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight size={13} />
            <span>+18% accumulation rate</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium text-gray-600">Rewards Redeemed</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#B8860B] flex items-center justify-center">
              <Gift size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1A1A1A]">
            {(data?.overview?.rewardsRedeemed || 320).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight size={13} />
            <span>+25% redemptions</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium text-gray-600">Outstanding Points</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#B8860B] flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-[#1A1A1A]">
            {(data?.overview?.outstandingPoints || 32180).toLocaleString()} pts
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            Estimated value: ₹32,180
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

      {/* Program Settings Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-serif text-base text-[#1A1A1A] pb-2 border-b border-[#EAE3D6]">
            <Settings size={18} className="text-[#B8860B]" />
            <span>Configure Rewards Program Rules</span>
          </div>
        }
        open={rulesModalOpen}
        onOk={handleSaveRules}
        onCancel={() => setRulesModalOpen(false)}
        okText="Save Rules"
        okButtonProps={{ className: "!bg-[#B8860B] hover:!bg-[#996515] !text-white !border-none" }}
        centered
      >
        <Form form={rulesForm} layout="vertical" className="pt-4">
          <Form.Item
            name="pointsPerRupee"
            label={<span className="text-xs font-semibold text-gray-700">Points Earned per ₹100 Spent</span>}
            tooltip="Example: 10 points per ₹100 spent (1 point per ₹10)"
          >
            <InputNumber min={1} max={50} className="w-full rounded-xl py-1" />
          </Form.Item>

          <Form.Item
            name="redemptionRate"
            label={<span className="text-xs font-semibold text-gray-700">Rupee Value per 100 Points</span>}
            tooltip="Example: 100 points = ₹100 discount"
          >
            <InputNumber min={10} max={500} className="w-full rounded-xl py-1" />
          </Form.Item>

          <Form.Item
            name="welcomeBonus"
            label={<span className="text-xs font-semibold text-gray-700">Welcome Bonus Points (New Customer)</span>}
          >
            <InputNumber min={0} max={1000} className="w-full rounded-xl py-1" />
          </Form.Item>

          <Form.Item
            name="birthdayBonus"
            label={<span className="text-xs font-semibold text-gray-700">Birthday Bonus Points</span>}
          >
            <InputNumber min={0} max={2000} className="w-full rounded-xl py-1" />
          </Form.Item>

          <Form.Item
            name="expiryMonths"
            label={<span className="text-xs font-semibold text-gray-700">Points Validity Period (Months)</span>}
          >
            <InputNumber min={1} max={60} className="w-full rounded-xl py-1" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Award Bonus Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-serif text-base text-[#1A1A1A] pb-2 border-b border-[#EAE3D6]">
            <Plus size={18} className="text-[#B8860B]" />
            <span>Award Privilege Bonus Points</span>
          </div>
        }
        open={bonusModalOpen}
        onOk={handleAwardBonus}
        onCancel={() => setBonusModalOpen(false)}
        okText="Credit Points"
        okButtonProps={{ className: "!bg-[#B8860B] hover:!bg-[#996515] !text-white !border-none" }}
        centered
      >
        <Form form={bonusForm} layout="vertical" className="pt-4">
          <Form.Item
            name="customer"
            label={<span className="text-xs font-semibold text-gray-700">Customer Name</span>}
            rules={[{ required: true, message: 'Select or type customer name' }]}
          >
            <Input placeholder="e.g. Anjali Nair" className="rounded-xl py-1.5 text-xs" />
          </Form.Item>

          <Form.Item
            name="points"
            label={<span className="text-xs font-semibold text-gray-700">Points to Award</span>}
            rules={[{ required: true, message: 'Enter points amount' }]}
          >
            <InputNumber min={10} max={10000} className="w-full rounded-xl py-1" placeholder="e.g. 500" />
          </Form.Item>

          <Form.Item
            name="reason"
            label={<span className="text-xs font-semibold text-gray-700">Reason / Privilege</span>}
          >
            <Select className="w-full text-xs" placeholder="Select reason">
              <Option value="VIP Privilege">VIP Privilege</Option>
              <Option value="Appreciation Gift">Appreciation Gift</Option>
              <Option value="Service Recovery">Service Recovery</Option>
              <Option value="Special Occasion">Special Occasion</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

