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
  ArrowRight, 
  TrendingUp, 
  ChevronDown, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Layers,
  Star,
  Eye,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import { Dropdown } from 'antd';
import adminService from '@/services/adminService';
import { CustomDatePicker } from '@/components/common';
import { getImageUrl } from '@/utils/imageHelper';
import DashboardRecentOrdersTable from './components/DashboardRecentOrdersTable';
import DashboardStatCards from './components/DashboardStatCards';
import DashboardPipelineCard from './components/DashboardPipelineCard';
import LuxuryAnalyticsChart from './components/LuxuryAnalyticsChart';

const TIME_RANGES = [
  'All Time',
  'This Month',
  'Last 30 Days',
  'Last 7 Days'
];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [monthsOverview, setMonthsOverview] = useState([]);
  const [timeRange, setTimeRange] = useState('All Time');
  const [customDateFilter, setCustomDateFilter] = useState('');

  useEffect(() => {
    loadDashboardData(timeRange);
  }, [timeRange]);

  const loadDashboardData = async (range = timeRange) => {
    try {
      const [res, monthsRes] = await Promise.all([
        adminService.getDashboardStats({ range }).catch(() => null),
        adminService.getMonthWiseOverview().catch(() => null)
      ]);
      if (res?.data) {
        setData(res.data);
      }
      if (monthsRes?.data) {
        setMonthsOverview(monthsRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData(timeRange);
  };

  const stats = data?.stats || {
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    ordersDelta: '+0%',
    revenueDelta: '+0%',
    ordersByStatus: {
      Delivered: 0,
      Processing: 0,
      Shipped: 0,
      Pending: 0,
      Cancelled: 0
    }
  };

  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const salesChart = data?.salesChart || [];

  // Dynamic Status breakdown strictly from live MongoDB database
  const ordersByStatus = stats.ordersByStatus || {};
  const statusCounts = {
    Delivered: Number(ordersByStatus.Delivered || 0),
    Processing: Number(ordersByStatus.Processing || 0),
    Dispatch: Number(ordersByStatus.Dispatch || ordersByStatus.Dispatched || ordersByStatus.Shipped || 0),
    Shipped: Number(ordersByStatus.Dispatch || ordersByStatus.Dispatched || ordersByStatus.Shipped || 0),
    Pending: Number(ordersByStatus.Pending || 0),
    Cancelled: Number(ordersByStatus.Cancelled || 0)
  };

  const totalOrdersCount = stats.totalOrders || 
    (statusCounts.Delivered + statusCounts.Processing + statusCounts.Shipped + statusCounts.Pending + statusCounts.Cancelled) || 
    recentOrders.length || 0;

  // Status badge styling helper
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
    const p = String(payment || '').toLowerCase();
    if (p.includes('paid') || p.includes('success')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (p.includes('cod') || p.includes('cash') || p.includes('delivery')) {
      return 'bg-stone-100 text-stone-700 border-stone-200';
    }
    if (p.includes('failed')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  const timeRangeMenuItems = TIME_RANGES.map((label) => ({
    key: label,
    label: (
      <span className={`text-xs font-medium ${timeRange === label ? 'text-[#B38728] font-bold' : 'text-gray-700'}`}>
        {label}
      </span>
    ),
    onClick: () => setTimeRange(label)
  }));

  // Calculate dynamic scale for chart
  const maxChartSales = Math.max(...salesChart.map(p => Number(p.sales || 0)), 1000);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-[#1B100A] max-w-[1600px] mx-auto pb-12">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-white/70 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif text-[#1B100A] font-normal tracking-tight">
              Dashboard Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-amber-50 text-amber-800 border border-amber-200">
              Atelier Command
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5C4D3E] font-light mt-1">
            Real-time boutique metrics, order fulfillment pipeline, and product sales performance.
          </p>
        </div>

        {/* Date Filter & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap xl:flex-nowrap xl:justify-end">
          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl bg-white border border-[#E8DFC8] text-gray-600 hover:text-[#B38728] hover:border-[#D4A64A] transition-all shadow-2xs cursor-pointer shrink-0 ${refreshing ? 'animate-spin' : ''}`}
            title="Refresh Live Data"
          >
            <RefreshCw size={15} />
          </button>

          {/* Interactive Dynamic Time Range Filter */}
          <Dropdown menu={{ items: timeRangeMenuItems }} trigger={['click']}>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8DFC8] text-xs font-semibold text-gray-800 shadow-2xs hover:border-[#D4A64A] transition-colors cursor-pointer shrink-0 whitespace-nowrap">
              <Calendar size={13} className="text-[#D4A64A]" />
              <span>{timeRange}</span>
              <ChevronDown size={12} className="text-gray-400 ml-0.5" />
            </button>
          </Dropdown>

          <div className="w-36 sm:w-40 shrink-0">
            <CustomDatePicker
              value={customDateFilter}
              onChange={(d) => {
                setCustomDateFilter(d);
                if (d) setTimeRange(d);
                else setTimeRange('All Time');
              }}
              placeholder="Pick Custom Date"
            />
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8DFC8] hover:bg-[#FAF7F2] text-xs font-semibold text-[#1B100A] shadow-2xs transition-all shrink-0 whitespace-nowrap"
          >
            <ShoppingBag size={13} className="text-[#D4A64A]" />
            <span>All Orders</span>
          </Link>

          <Link
            href="/admin/products/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] via-[#C6922C] to-[#B38728] hover:brightness-105 text-[#1B100A] text-xs font-semibold tracking-wide shadow-sm shadow-amber-900/10 active:scale-95 transition-all shrink-0 whitespace-nowrap ml-auto xl:ml-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 2. FOUR HIGH-LEVEL SUMMARY METRIC CARDS */}
      <DashboardStatCards stats={stats} />

      {/* 3. OPERATIONAL SECTION (8 COLS: RECENT ORDERS TABLE | 4 COLS: PIPELINE & QUICK ACTIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* RECENT ORDERS TABLE (8 COLS) */}
        <DashboardRecentOrdersTable
          recentOrders={recentOrders}
          getStatusBadge={getStatusBadge}
          getPaymentBadge={getPaymentBadge}
        />

        {/* RIGHT COLUMN: FULFILLMENT PIPELINE & QUICK ACTIONS (4 COLS) */}
        <DashboardPipelineCard
          totalOrdersCount={totalOrdersCount}
          statusCounts={statusCounts}
        />
      </div>

      {/* 4. LOWER ROW: SALES TREND & TOP PERFORMING FLACONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* SALES OVERVIEW (7 COLS) */}
        <div className="lg:col-span-7">
          <LuxuryAnalyticsChart
            points={salesChart}
            months={monthsOverview}
            title="Sales & Revenue Analytics"
            subtitle="Daily boutique transaction volume"
            periodLabel={timeRange}
            badgeText="Live Velocity"
            height={210}
          />
        </div>

        {/* TOP PERFORMING PRODUCTS (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-serif text-[#1B100A] font-medium">
                Top Performing Products
              </h2>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                Best-selling fragrance creations from actual orders
              </p>
            </div>
            <Link href="/admin/products" className="text-xs font-semibold text-[#B38728] hover:text-[#D4A64A] flex items-center gap-1">
              <span>Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-3.5">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 4).map((p, idx) => (
                <div key={p.id || idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors border border-transparent hover:border-[#E8DFC8]">
                  <span className="w-5 text-center text-xs font-bold text-[#B38728] shrink-0">
                    #{idx + 1}
                  </span>
                  {p.image ? (
                    <img 
                      src={getImageUrl(p.image)} 
                      alt={p.name} 
                      className="w-9 h-9 rounded-lg object-contain bg-[#FAF7F2] border border-[#E8DFC8] shrink-0 p-0.5"
                      onError={(e) => { e.currentTarget.src = '/images/perfumes/signature_collection.jpg'; }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#B38728] shrink-0">
                      <Package size={16} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{p.name || 'Artisanal Perfume'}</p>
                    <p className="text-[11px] text-gray-400">
                      {p.sales || 0} units sold • ₹{Number(p.revenue || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-gray-800 font-sans">
                      ₹{Number(p.revenue || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">
                No product metrics recorded yet.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F6F0E6] flex items-center justify-between text-xs text-gray-500">
            <span>Boutique Inventory Health</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={13} /> 100% Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
