"use client";
import React from 'react';
import { Input, InputNumber } from 'antd';
import { Sparkles, Plus, Minus, Equal, CheckCircle2 } from 'lucide-react';

export default function UserWalletAdjustForm({
  adjustMode,
  setAdjustMode,
  adjustPoints,
  setAdjustPoints,
  adjustReason,
  setAdjustReason,
  handleAdjustPoints,
  savingPoints,
  currentPoints,
  previewNewPoints
}) {
  const presetReasons = [
    'Customer Goodwill Bonus',
    'Order Delivery Delay Compensation',
    'VIP Tier Upgrade Perk',
    'Administrative Balance Correction'
  ];

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#E8DFC8] shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#ECE7DE]">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#B38728]" />
          <h4 className="font-serif font-bold text-sm text-[#1C1714] m-0">
            Edit Patron Points Balance
          </h4>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">Real-time ledger sync</span>
      </div>

      <form onSubmit={handleAdjustPoints} className="space-y-3">
        {/* Mode Selector: Increase / Decrease / Set */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-700 mr-1">Action:</span>
          
          <button
            type="button"
            onClick={() => setAdjustMode('increase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              adjustMode === 'increase'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Plus size={12} />
            <span>Increase Points (+)</span>
          </button>

          <button
            type="button"
            onClick={() => setAdjustMode('decrease')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              adjustMode === 'decrease'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Minus size={12} />
            <span>Decrease Points (-)</span>
          </button>

          <button
            type="button"
            onClick={() => setAdjustMode('set')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              adjustMode === 'set'
                ? 'bg-[#1C1714] text-[#ECC880] shadow-2xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Equal size={12} />
            <span>Set Exact Total</span>
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          {/* Points Amount */}
          <div className="sm:col-span-4">
            <label className="text-[11px] font-semibold text-gray-700 block mb-1">
              {adjustMode === 'set' ? 'New Points Total' : 'Points Amount'} *
            </label>
            <InputNumber
              min={1}
              max={100000}
              value={adjustPoints}
              onChange={(val) => setAdjustPoints(val || 0)}
              addonAfter={<span className="text-xs font-semibold">pts</span>}
              className="w-full !rounded-xl"
              size="large"
            />
          </div>

          {/* Reason Note */}
          <div className="sm:col-span-8">
            <label className="text-[11px] font-semibold text-gray-700 block mb-1">
              Reason / Administrative Note *
            </label>
            <Input
              placeholder="e.g. VIP loyalty bonus, Order compensation, Correction..."
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="rounded-xl py-2 text-xs"
              size="large"
            />
          </div>
        </div>

        {/* Quick Preset Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Presets:</span>
          {presetReasons.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setAdjustReason(preset)}
              className="text-[10.5px] bg-[#FAF8F5] hover:bg-[#F2ECE0] text-[#7A5E2E] border border-[#E0D0A5] px-2 py-0.5 rounded-full transition-colors cursor-pointer"
            >
              + {preset}
            </button>
          ))}
        </div>

        {/* Live Preview & Submit Bar */}
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            <span>Current: <strong>{currentPoints.toLocaleString()} pts</strong></span>
            <span>→</span>
            <span>
              New Balance:{' '}
              <strong className="text-sm font-bold text-[#8C6D1F]">
                {previewNewPoints.toLocaleString()} pts
              </strong>
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              ({adjustMode === 'increase' ? `+${adjustPoints}` : adjustMode === 'decrease' ? `-${adjustPoints}` : `=${adjustPoints}`})
            </span>
          </div>

          <button
            type="submit"
            disabled={savingPoints}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] hover:from-[#C89B3F] hover:to-[#A3791F] text-[#1B100A] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0 inline-flex items-center gap-1.5"
          >
            {savingPoints ? (
              <span>Applying...</span>
            ) : (
              <>
                <CheckCircle2 size={13} />
                <span>Save Points Adjustment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

