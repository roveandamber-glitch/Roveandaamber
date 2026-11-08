"use client";
import React from 'react';
import { Input, InputNumber } from 'antd';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function UserWalletAdjustForm({
  adjustPoints,
  setAdjustPoints,
  adjustReason,
  setAdjustReason,
  handleAdjustPoints,
  savingPoints,
  currentPoints
}) {
  const diff = Number(adjustPoints || 0) - Number(currentPoints || 0);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DFC8] shadow-2xs space-y-4">
      {/* Form Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DE]">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-[#B38728]" />
          <h4 className="font-serif font-bold text-sm text-[#1C1714] m-0">
            Edit Patron Points
          </h4>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">Real-time ledger sync</span>
      </div>

      <form onSubmit={handleAdjustPoints} className="space-y-4">
        {/* Balanced Grid for Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
          {/* Points Input */}
          <div className="sm:col-span-5">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Patron Points Balance *
            </label>
            <InputNumber
              min={0}
              max={1000000}
              value={adjustPoints}
              onChange={(val) => setAdjustPoints(val !== null && val !== undefined ? val : 0)}
              addonAfter={<span className="text-xs font-bold text-[#8C6D1F]">pts</span>}
              className="w-full !rounded-xl"
              size="large"
            />
            <p className="text-[11px] text-gray-500 mt-1 m-0">
              Directly type the customer&apos;s new points total.
            </p>
          </div>

          {/* Reason Input */}
          <div className="sm:col-span-7">
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Reason / Note <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <Input
              placeholder="e.g. Points updated by boutique concierge..."
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="rounded-xl py-2 text-xs"
              size="large"
            />
            <p className="text-[11px] text-gray-500 mt-1 m-0">
              Recorded in the patron&apos;s activity audit ledger.
            </p>
          </div>
        </div>

        {/* Status & Save Changes Action Bar */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
            <span>Current: <strong>{currentPoints.toLocaleString()} pts</strong></span>
            <ArrowRight size={12} className="text-gray-400 shrink-0" />
            <span>
              New Balance:{' '}
              <strong className="text-sm font-bold text-[#8C6D1F]">
                {Number(adjustPoints || 0).toLocaleString()} pts
              </strong>
            </span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold ${
              diff > 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : diff < 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {diff > 0 ? `+${diff.toLocaleString()} pts` : diff < 0 ? `${diff.toLocaleString()} pts` : 'No change'}
            </span>
          </div>

          <button
            type="submit"
            disabled={savingPoints}
            className="px-5 py-2.5 rounded-xl bg-[#1C1714] hover:bg-black text-[#ECC880] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0 inline-flex items-center justify-center gap-1.5"
          >
            {savingPoints ? (
              <span>Saving...</span>
            ) : (
              <>
                <CheckCircle2 size={13} className="text-[#ECC880]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
