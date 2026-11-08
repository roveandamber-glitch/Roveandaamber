"use client";
import React from 'react';
import { Users, Coins, Gift, Sparkles, TrendingUp } from 'lucide-react';

export default function RewardsMetricsCards({ data }) {
  return (
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
            {Number(data?.overview?.totalMembers || 0).toLocaleString()}
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
            {Number(data?.overview?.pointsIssued || 0).toLocaleString()}{' '}
            <span className="text-sm sm:text-base font-semibold text-gray-400">pts</span>
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
            {Number(data?.overview?.rewardsRedeemed || 0).toLocaleString()}
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
            {Number(data?.overview?.outstandingPoints || 0).toLocaleString()}{' '}
            <span className="text-sm sm:text-base font-semibold text-gray-400">pts</span>
          </h3>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FAF7F2] text-[#8C6D1F] border border-[#E8DFC8]">
            Est. Value: ₹{Number(data?.overview?.outstandingPoints || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

    </div>
  );
}

