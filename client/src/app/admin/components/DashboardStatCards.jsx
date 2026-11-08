"use client";
import React from 'react';
import { Coins, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';

export default function DashboardStatCards({ stats = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Total Revenue */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#B38728] group-hover:scale-105 transition-transform">
            <Coins size={18} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight m-0">
            ₹{Number(stats.totalRevenue || 0).toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp size={12} />
            {stats.revenueDelta || '+0.0%'}
          </span>
          <span className="text-xs text-gray-400 font-light">vs last period</span>
        </div>
      </div>

      {/* Total Orders */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Total Orders
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#B38728] group-hover:scale-105 transition-transform">
            <ShoppingBag size={18} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight m-0">
            {Number(stats.totalOrders || 0).toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp size={12} />
            {stats.ordersDelta || '+0.0%'}
          </span>
          <span className="text-xs text-gray-400 font-light">vs last period</span>
        </div>
      </div>

      {/* Total Customers */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Patrons & Customers
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#B38728] group-hover:scale-105 transition-transform">
            <Users size={18} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight m-0">
            {Number(stats.totalCustomers || 1).toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Registered
          </span>
          <span className="text-xs text-gray-400 font-light">Active boutique accounts</span>
        </div>
      </div>

      {/* Total Products */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Catalog Products
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#B38728] group-hover:scale-105 transition-transform">
            <Package size={18} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight m-0">
            {Number(stats.totalProducts || 0).toLocaleString('en-IN')}
          </h3>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FAF7F2] text-[#8C6D1F] border border-[#E8DFC8]">
            Formulations
          </span>
          <span className="text-xs text-gray-400 font-light">Live fragrance catalog</span>
        </div>
      </div>
    </div>
  );
}

