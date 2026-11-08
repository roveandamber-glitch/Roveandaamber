"use client";
import React from 'react';
import { Modal, Form, InputNumber } from 'antd';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function RewardsRulesModal({
  open,
  onClose,
  form,
  onSave,
  saving
}) {
  return (
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
      open={open}
      onCancel={() => !saving && onClose()}
      footer={null}
      width={560}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onSave} className="pt-4 space-y-4">
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
              <span>Spend ₹1,000 → Earn <strong>{((form.getFieldValue('pointsPerHundred') || 10) * 10).toLocaleString()} pts</strong></span>
            </div>
            <div className="p-2 rounded-xl bg-white/70 border border-[#E6D7B6]">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Redemption</span>
              <span>100 pts → <strong>₹{(form.getFieldValue('redemptionRate') || 100).toLocaleString()}</strong> boutique credit</span>
            </div>
          </div>
        </div>

        {/* Luxury Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EAE3D6]">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#D5C9B8] bg-white hover:bg-stone-50 text-gray-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] hover:from-[#C89B3F] hover:to-[#A3791F] text-[#1B100A] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
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
  );
}

