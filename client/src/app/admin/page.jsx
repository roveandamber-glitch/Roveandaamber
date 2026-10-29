"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Coins, 
  Users, 
  Package, 
  Calendar, 
  Plus, 
  ArrowUpRight, 
  ArrowRight, 
  TrendingUp, 
  ChevronDown, 
  Crown, 
  AlertTriangle,
  Gift,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw
} from 'lucide-react';
import { Dropdown, message, Tooltip } from 'antd';
import adminService from '@/services/adminService';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('Oct 1, 2026 - Oct 29, 2026');
  const [salesFilter, setSalesFilter] = useState('Last 30 Days');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboardStats();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    totalOrders: 284,
    totalRevenue: 328450,
    totalCustomers: 1842,
    totalProducts: 126,
    ordersDelta: '+12%',
    revenueDelta: '+18%',
    customersDelta: '+10%',
    productsDelta: '+5%'
  };

  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const lowStock = data?.lowStock || [];
  const latestCustomers = data?.latestCustomers || [];
  const salesChart = data?.salesChart || [];
  const rewards = data?.rewards || {
    totalMembers: 1284,
    pointsIssued: 45680,
    rewardsRedeemed: 320,
    tierMembers: 215,
    membersDelta: '+12%',
    pointsDelta: '+18%',
    redeemedDelta: '+25%',
    tierDelta: '+10%'
  };

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'processing':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'shipped':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'pending':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const getPaymentBadge = (payment) => {
    if (payment === 'Paid') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (payment === 'COD') {
      return 'bg-stone-100 text-stone-700 border-stone-200';
    }
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-[#1A1A1A]">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-serif text-[#160E09] font-normal tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-light mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>

        {/* Date Filter & + Add Product Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E6DEC7] text-xs font-medium text-gray-700 shadow-2xs">
            <Calendar size={14} className="text-[#DEB368]" />
            <span>{timeRange}</span>
            <ChevronDown size={13} className="text-gray-400" />
          </div>

          <Link
            href="/admin/products/add"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C99E32] to-[#B38728] hover:brightness-110 text-[#1A1008] text-xs font-semibold tracking-wide shadow-md shadow-amber-900/10 active:scale-95 transition-all"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 2. FOUR SUMMARY METRIC CARDS (Exact match to reference design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE7DD] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-[#FBF7F0] border border-[#F2E8D5] flex items-center justify-center text-[#B8860B]">
              <ShoppingBag size={17} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#160E09] tracking-tight">
              {stats.totalOrders}
            </h3>
            {/* Sparkline mini wave */}
            <svg className="w-20 h-8 text-[#DEB368]" viewBox="0 0 80 30" fill="none">
              <path d="M0 25 C 20 28, 30 10, 50 18 C 65 24, 70 8, 80 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="font-semibold">{stats.ordersDelta}</span>
            <span className="text-gray-400 font-light">vs last month</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE7DD] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-[#FBF7F0] border border-[#F2E8D5] flex items-center justify-center text-[#B8860B]">
              <Coins size={17} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#160E09] tracking-tight">
              ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
            </h3>
            <svg className="w-20 h-8 text-[#DEB368]" viewBox="0 0 80 30" fill="none">
              <path d="M0 22 C 15 25, 25 15, 45 12 C 60 10, 70 5, 80 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="font-semibold">{stats.revenueDelta}</span>
            <span className="text-gray-400 font-light">vs last month</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE7DD] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Total Customers</span>
            <div className="w-9 h-9 rounded-xl bg-[#FBF7F0] border border-[#F2E8D5] flex items-center justify-center text-[#B8860B]">
              <Users size={17} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#160E09] tracking-tight">
              {(stats.totalCustomers || 0).toLocaleString('en-IN')}
            </h3>
            <svg className="w-20 h-8 text-[#DEB368]" viewBox="0 0 80 30" fill="none">
              <path d="M0 26 C 20 20, 35 25, 55 14 C 65 8, 72 10, 80 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="font-semibold">{stats.customersDelta}</span>
            <span className="text-gray-400 font-light">vs last month</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE7DD] shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Total Products</span>
            <div className="w-9 h-9 rounded-xl bg-[#FBF7F0] border border-[#F2E8D5] flex items-center justify-center text-[#B8860B]">
              <Package size={17} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#160E09] tracking-tight">
              {stats.totalProducts}
            </h3>
            <svg className="w-20 h-8 text-[#DEB368]" viewBox="0 0 80 30" fill="none">
              <path d="M0 24 C 20 26, 40 18, 55 12 C 68 8, 74 6, 80 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="font-semibold">{stats.productsDelta}</span>
            <span className="text-gray-400 font-light">vs last month</span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE ROW: RECENT ORDERS & SALES OVERVIEW CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* RECENT ORDERS TABLE (7 Cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EDE7DD] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-serif text-[#160E09] font-medium">
              Recent Orders
            </h2>
            <Link 
              href="/admin/orders" 
              className="text-xs font-semibold text-[#B8860B] hover:text-[#916704] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F2ECE1] text-gray-400 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Product(s)</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Payment</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F0E6]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors group">
                    <td className="py-3 font-medium text-gray-700">
                      <Link href={`/admin/orders?id=${order.id}`} className="hover:text-[#B8860B]">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {order.customer?.avatar ? (
                          <img src={order.customer.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#F5EEDF] text-[#8C6514] font-bold text-[10px] flex items-center justify-center">
                            {order.customer?.name?.[0] || 'C'}
                          </div>
                        )}
                        <span className="font-medium text-gray-900 truncate max-w-[110px]">{order.customer?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600 truncate max-w-[130px]">
                      {order.productSummary || order.items?.[0]?.name}
                    </td>
                    <td className="py-3 font-semibold text-gray-900">
                      ₹{(order.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getPaymentBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-[11px] whitespace-nowrap">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SALES OVERVIEW (5 Cols on desktop) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EDE7DD] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base sm:text-lg font-serif text-[#160E09] font-medium">
                Sales Overview
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#EBE4D8] text-[11px] font-medium text-gray-700">
              <span>{salesFilter}</span>
              <ChevronDown size={12} className="text-gray-400" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold font-sans text-[#160E09]">
              ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              ↗ {stats.revenueDelta} <span className="text-gray-400 font-normal ml-1">vs last month</span>
            </span>
          </div>

          {/* Interactive Responsive Bar Chart (Matching Reference) */}
          <div className="pt-2 pb-1">
            <div className="h-44 w-full flex items-end gap-1.5 sm:gap-2">
              {salesChart.map((point, idx) => {
                const maxVal = 45000;
                const heightPercent = Math.max(12, Math.round((point.sales / maxVal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 hidden group-hover:flex bg-[#160E09] text-white text-[9px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-20">
                      ₹{point.sales.toLocaleString('en-IN')}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full rounded-t-sm bg-[#D4AF37]/80 group-hover:bg-[#B8860B] transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Dates matching reference: Oct 1, Oct 5, Oct 10, Oct 15, Oct 20, Oct 25, Oct 29 */}
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 border-t border-[#F2ECE1] pt-1.5">
              <span>Oct 1</span>
              <span>Oct 5</span>
              <span>Oct 10</span>
              <span>Oct 15</span>
              <span>Oct 20</span>
              <span>Oct 25</span>
              <span>Oct 29</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. THIRD ROW: TOP PRODUCTS, ORDERS BY STATUS, LOW STOCK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* TOP PRODUCTS (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EDE7DD] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-serif text-[#160E09] font-medium">
              Top Products
            </h2>
            <Link href="/admin/products" className="text-xs font-semibold text-[#B8860B] hover:text-[#916704] flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4 font-semibold">{p.rank}</span>
                <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover border border-[#EFE8DC]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-400">{p.sales} sales • ₹{p.revenue.toLocaleString('en-IN')}</p>
                </div>
                {/* Gold progress bar */}
                <div className="w-20 text-right">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-0.5">
                    <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-full" style={{ width: `${p.percentage}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold">{p.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ORDERS BY STATUS (3.5 Cols) */}
        <div className="lg:col-span-3.5 bg-white rounded-2xl border border-[#EDE7DD] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
          <h2 className="text-base sm:text-lg font-serif text-[#160E09] font-medium mb-3">
            Orders by Status
          </h2>

          {/* Donut Chart representation matching reference design */}
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-36 h-36" viewBox="0 0 100 100">
              {/* Delivered: 42% -> 132 deg (Green) */}
              <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="12" fill="none" strokeDasharray="105 150" strokeDashoffset="0" />
              {/* Processing: 28% -> 88 deg (Amber) */}
              <circle cx="50" cy="50" r="38" stroke="#F59E0B" strokeWidth="12" fill="none" strokeDasharray="70 170" strokeDashoffset="-105" />
              {/* Shipped: 18% -> 56 deg (Blue) */}
              <circle cx="50" cy="50" r="38" stroke="#0EA5E9" strokeWidth="12" fill="none" strokeDasharray="45 195" strokeDashoffset="-175" />
              {/* Pending: 8% (Rose) */}
              <circle cx="50" cy="50" r="38" stroke="#F43F5E" strokeWidth="12" fill="none" strokeDasharray="20 220" strokeDashoffset="-220" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-sans text-gray-900">{stats.totalOrders}</span>
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">Total Orders</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-xs text-gray-600 mt-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Delivered</span>
              <span className="font-semibold text-gray-800">42%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Processing</span>
              <span className="font-semibold text-gray-800">28%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" />Shipped</span>
              <span className="font-semibold text-gray-800">18%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" />Pending</span>
              <span className="font-semibold text-gray-800">8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400" />Cancelled</span>
              <span className="font-semibold text-gray-800">4%</span>
            </div>
          </div>
        </div>

        {/* LOW STOCK PRODUCTS (3.5 Cols) */}
        <div className="lg:col-span-3.5 bg-white rounded-2xl border border-[#EDE7DD] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-serif text-[#160E09] font-medium">
              Low Stock Products
            </h2>
            <Link href="/admin/inventory" className="text-xs font-semibold text-[#B8860B] hover:text-[#916704] flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {lowStock.map((prod) => (
              <div key={prod.id} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F2] border border-[#EFE8DC]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={prod.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{prod.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{prod.sku}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-red-600 bg-red-50 border border-red-200">
                    {prod.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/admin/inventory"
            className="w-full mt-3 py-2 rounded-xl border border-dashed border-[#DEB368] text-[#B8860B] hover:bg-[#FBF7F0] text-xs font-semibold text-center block transition-colors"
          >
            Adjust Stock & Restock
          </Link>
        </div>
      </div>

      {/* 5. BOTTOM ROW: REWARDS & LOYALTY HIGHLIGHT BANNER + LATEST CUSTOMERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* REWARDS & LOYALTY LUXURY HIGHLIGHT BANNER (8 Cols) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#FBF8F2] via-[#F8F3EA] to-[#EFE7D8] rounded-3xl border border-[#E6DAC7] p-6 sm:p-7 shadow-[0_6px_24px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ECC880] to-[#B8860B] text-[#1E1108] flex items-center justify-center shadow-md shadow-amber-900/10 shrink-0">
                <Crown size={20} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-serif text-[#160E09] font-medium tracking-tight">
                  Rewards & Loyalty
                </h2>
                <p className="text-xs text-[#5C4D3E] font-light mt-0.5">
                  Manage customer rewards, points and loyalty programs.
                </p>
              </div>
            </div>

            <Link
              href="/admin/rewards"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-[#1A1008] text-xs font-semibold tracking-wide shadow-md hover:brightness-105 active:scale-95 transition-all shrink-0 self-start sm:self-auto"
            >
              <span>Manage Rewards</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>

          {/* 4 Metrics Inside the Rewards Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 relative z-10">
            <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-[#E8DEC9] shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Total Members</span>
              <p className="text-lg font-bold font-sans text-gray-900 mt-1">
                {(rewards.totalMembers || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">{rewards.membersDelta}</span>
            </div>

            <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-[#E8DEC9] shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Points Issued</span>
              <p className="text-lg font-bold font-sans text-gray-900 mt-1">
                {(rewards.pointsIssued || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">{rewards.pointsDelta}</span>
            </div>

            <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-[#E8DEC9] shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Rewards Redeemed</span>
              <p className="text-lg font-bold font-sans text-gray-900 mt-1">
                {(rewards.rewardsRedeemed || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">{rewards.redeemedDelta}</span>
            </div>

            <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-[#E8DEC9] shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Tier Members</span>
              <p className="text-lg font-bold font-sans text-gray-900 mt-1">
                {(rewards.tierMembers || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">{rewards.tierDelta}</span>
            </div>
          </div>
        </div>

        {/* LATEST CUSTOMERS (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#EDE7DD] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-serif text-[#160E09] font-medium">
              Latest Customers
            </h2>
            <Link href="/admin/customers" className="text-xs font-semibold text-[#B8860B] hover:text-[#916704] flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3 divide-y divide-[#F6F0E6]">
            {latestCustomers.map((cust, idx) => (
              <div key={cust.id} className={`flex items-center justify-between gap-3 ${idx > 0 ? 'pt-2.5' : ''}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={cust.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{cust.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{cust.email}</p>
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">{cust.joinedDate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
