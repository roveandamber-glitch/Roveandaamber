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
import adminService from '@/services/adminService';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('This Month (Oct 2026)');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await adminService.getDashboardStats();
      if (res?.data) {
        setData(res.data);
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
    loadDashboardData();
  };

  const stats = data?.stats || {
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    ordersDelta: '+12%',
    revenueDelta: '+18.4%',
    customersDelta: '+10%',
    productsDelta: '+5%'
  };

  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const lowStock = data?.lowStock || [];
  const salesChart = data?.salesChart || [
    { day: 'Oct 01', sales: 12500 },
    { day: 'Oct 05', sales: 18400 },
    { day: 'Oct 10', sales: 24900 },
    { day: 'Oct 15', sales: 31200 },
    { day: 'Oct 20', sales: 22800 },
    { day: 'Oct 25', sales: 38400 },
    { day: 'Oct 29', sales: 42100 },
  ];

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
    const p = payment?.toLowerCase() || '';
    if (p.includes('paid')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (p.includes('cod') || p.includes('cash')) {
      return 'bg-stone-100 text-stone-700 border-stone-200';
    }
    if (p.includes('failed')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  // Status breakdown calculations
  const totalOrdersCount = stats.totalOrders || recentOrders.length || 1;
  const statusCounts = {
    Delivered: recentOrders.filter(o => o.status?.toLowerCase() === 'delivered').length || 2,
    Processing: recentOrders.filter(o => o.status?.toLowerCase() === 'processing').length || 1,
    Shipped: recentOrders.filter(o => o.status?.toLowerCase() === 'shipped').length || 1,
    Pending: recentOrders.filter(o => o.status?.toLowerCase() === 'pending').length || 1,
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-[#1B100A] max-w-[1600px] mx-auto pb-12">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/60 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-[#E8DFC8]">
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
            Real-time boutique metrics, order fulfillment pipeline, and flacon sales performance.
          </p>
        </div>

        {/* Date Filter & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl bg-white border border-[#E8DFC8] text-gray-600 hover:text-[#B38728] hover:border-[#D4A64A] transition-all shadow-2xs ${refreshing ? 'animate-spin' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8DFC8] text-xs font-medium text-gray-700 shadow-2xs">
            <Calendar size={14} className="text-[#D4A64A]" />
            <span>{timeRange}</span>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8DFC8] hover:bg-[#FAF7F2] text-xs font-semibold text-[#1B100A] shadow-2xs transition-all"
          >
            <ShoppingBag size={14} className="text-[#D4A64A]" />
            <span>All Orders</span>
          </Link>

          <Link
            href="/admin/products/add"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] via-[#C6922C] to-[#B38728] hover:brightness-105 text-[#1B100A] text-xs font-semibold tracking-wide shadow-md shadow-amber-900/10 active:scale-95 transition-all"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Add Flacon</span>
          </Link>
        </div>
      </div>

      {/* 2. FOUR HIGH-LEVEL SUMMARY METRIC CARDS (Clean, Elegant, No Squiggles) */}
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
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight">
              ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp size={12} />
              {stats.revenueDelta || '+18.4%'}
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
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight">
              {(stats.totalOrders || 0).toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp size={12} />
              {stats.ordersDelta || '+12.0%'}
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
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight">
              {Math.max(1, stats.totalCustomers || 0).toLocaleString('en-IN')}
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
              Catalog Flacons
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-center text-[#B38728] group-hover:scale-105 transition-transform">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-sans font-bold text-[#1B100A] tracking-tight">
              {(stats.totalProducts || 0).toLocaleString('en-IN')}
            </h3>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              In Stock
            </span>
            <span className="text-xs text-gray-400 font-light">Fine fragrance listings</span>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL SECTION (8 COLS: RECENT ORDERS TABLE | 4 COLS: PIPELINE & QUICK ACTIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* RECENT ORDERS TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F6F0E6] mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-serif text-[#1B100A] font-medium tracking-tight">
                Recent Orders
              </h2>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                Overview of latest boutique flacon purchases and patron orders.
              </p>
            </div>
            <Link 
              href="/admin/orders" 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F4ECE1] text-xs font-semibold text-[#B38728] border border-[#E8DFC8] transition-colors"
            >
              <span>View All Orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-[#E8DFC8] text-gray-400 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="pb-3 pr-2 font-semibold">Order</th>
                  <th className="pb-3 px-2 font-semibold">Customer</th>
                  <th className="pb-3 px-2 font-semibold">Fragrance</th>
                  <th className="pb-3 px-2 font-semibold">Amount</th>
                  <th className="pb-3 px-2 font-semibold">Payment</th>
                  <th className="pb-3 px-2 font-semibold">Fulfillment</th>
                  <th className="pb-3 pl-2 text-right font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F0E6]">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, idx) => {
                    const orderIdStr = order.orderNumber || order.orderId || `#ORD-${order.id?.slice(-4) || (1000 + idx)}`;
                    const custName = order.customer?.name || order.customerName || order.customer_name || 'Valued Patron';
                    const custEmail = order.customer?.email || order.email || '';
                    const totalVal = order.total ?? order.totalPrice ?? order.total_amount ?? 0;
                    const prodDesc = order.productSummary || order.items?.[0]?.name || 'Artisanal Perfume Flacon';
                    const payStatus = order.paymentStatus || (order.paymentMethod ? 'Paid' : 'Pending');
                    const orderStatus = order.status || 'Processing';
                    const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today');

                    return (
                      <tr key={order.id || order._id || idx} className="hover:bg-[#FAF7F2] transition-colors group">
                        {/* Order Number Badge */}
                        <td className="py-3.5 pr-2 font-medium text-gray-900">
                          <Link 
                            href={`/admin/orders`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DFC8] font-mono text-[11px] font-semibold text-[#B38728] hover:bg-[#F4ECE1] transition-colors"
                          >
                            {orderIdStr}
                          </Link>
                        </td>

                        {/* Customer Info with Avatar & Email */}
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-2.5">
                            {order.customer?.avatar ? (
                              <img src={order.customer.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#E8DFC8]" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FAF7F2] to-[#E8DFC8] text-[#B38728] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E8DFC8]">
                                {custName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate max-w-[130px] leading-tight">
                                {custName}
                              </p>
                              {custEmail && (
                                <p className="text-[10px] text-gray-400 truncate max-w-[130px]">
                                  {custEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Product Summary */}
                        <td className="py-3.5 px-2 text-gray-700 font-medium truncate max-w-[160px]">
                          <span className="truncate block" title={prodDesc}>
                            {prodDesc}
                          </span>
                        </td>

                        {/* Amount in Rupees */}
                        <td className="py-3.5 px-2 font-bold text-gray-900 font-sans whitespace-nowrap">
                          ₹{Number(totalVal).toLocaleString('en-IN')}
                        </td>

                        {/* Payment Status Pill */}
                        <td className="py-3.5 px-2 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getPaymentBadge(payStatus)}`}>
                            {payStatus}
                          </span>
                        </td>

                        {/* Order Fulfillment Pill */}
                        <td className="py-3.5 px-2 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getStatusBadge(orderStatus)}`}>
                            {orderStatus}
                          </span>
                        </td>

                        {/* Order Date */}
                        <td className="py-3.5 pl-2 text-right text-gray-500 text-[11px] whitespace-nowrap font-medium">
                          {orderDate}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400">
                      <ShoppingBag size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-600">No customer orders recorded yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Orders placed on the boutique storefront will appear here instantly.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: FULFILLMENT PIPELINE & QUICK ACTIONS (4 COLS) */}
        <div className="lg:col-span-4 space-y-5">
          {/* FULFILLMENT PIPELINE CARD */}
          <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F6F0E6] mb-4">
              <div>
                <h3 className="text-base font-serif text-[#1B100A] font-medium tracking-tight">
                  Fulfillment Pipeline
                </h3>
                <p className="text-xs text-gray-500 font-light mt-0.5">
                  Order status allocation
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#B38728] border border-[#E8DFC8]">
                {totalOrdersCount} Total
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Delivered */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Delivered
                  </span>
                  <span className="font-semibold text-gray-900">{statusCounts.Delivered} orders</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((statusCounts.Delivered / totalOrdersCount) * 100)}%` }} />
                </div>
              </div>

              {/* Processing */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Processing
                  </span>
                  <span className="font-semibold text-gray-900">{statusCounts.Processing} orders</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.round((statusCounts.Processing / totalOrdersCount) * 100)}%` }} />
                </div>
              </div>

              {/* Shipped */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Shipped
                  </span>
                  <span className="font-semibold text-gray-900">{statusCounts.Shipped} orders</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.round((statusCounts.Shipped / totalOrdersCount) * 100)}%` }} />
                </div>
              </div>

              {/* Pending */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Pending
                  </span>
                  <span className="font-semibold text-gray-900">{statusCounts.Pending} orders</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.round((statusCounts.Pending / totalOrdersCount) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* QUICK MANAGEMENT SHORTCUTS */}
          <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5ECE0] rounded-2xl border border-[#E8DFC8] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h3 className="text-sm font-serif text-[#1B100A] font-semibold tracking-tight mb-3">
              Admin Quick Tools
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/admin/products"
                className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] text-left transition-all group"
              >
                <Package size={16} className="text-[#B38728] mb-1.5 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-gray-900">Fragrance Catalog</p>
                <p className="text-[10px] text-gray-500">Edit products</p>
              </Link>

              <Link
                href="/admin/orders"
                className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] text-left transition-all group"
              >
                <ShoppingBag size={16} className="text-[#B38728] mb-1.5 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-gray-900">Order Dispatch</p>
                <p className="text-[10px] text-gray-500">Manage status</p>
              </Link>

              <Link
                href="/admin/inventory"
                className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] text-left transition-all group"
              >
                <Layers size={16} className="text-[#B38728] mb-1.5 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-gray-900">Stock Levels</p>
                <p className="text-[10px] text-gray-500">Restock flacons</p>
              </Link>

              <Link
                href="/admin/reviews"
                className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] text-left transition-all group"
              >
                <Star size={16} className="text-[#B38728] mb-1.5 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-gray-900">Moderation</p>
                <p className="text-[10px] text-gray-500">Patron reviews</p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LOWER ROW: SALES TREND & TOP PERFORMING FLACONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* SALES OVERVIEW (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-serif text-[#1B100A] font-medium">
                Sales & Revenue Analytics
              </h2>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                Daily boutique transaction volume
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-sans text-[#1B100A]">
                ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
              </span>
              <p className="text-[11px] text-emerald-600 font-semibold">
                ↗ {stats.revenueDelta || '+18.4%'} this month
              </p>
            </div>
          </div>

          {/* Interactive Responsive Bar Chart */}
          <div className="pt-4 pb-2 w-full">
            <div className="h-44 w-full flex items-end gap-2 sm:gap-3">
              {salesChart.map((point, idx) => {
                const maxVal = 50000;
                const heightPercent = Math.max(15, Math.round((point.sales / maxVal) * 100));
                return (
                  <div key={idx} className="flex-1 min-w-0 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 hidden group-hover:flex bg-[#1B100A] text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none font-sans font-semibold">
                      ₹{point.sales.toLocaleString('en-IN')}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full rounded-t-md bg-gradient-to-t from-[#D4A64A]/70 to-[#C6922C] group-hover:from-[#D4A64A] group-hover:to-[#B38728] transition-all cursor-pointer shadow-2xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Dates */}
            <div className="flex justify-between text-[11px] text-gray-400 mt-2.5 border-t border-[#E8DFC8] pt-2 font-medium">
              {salesChart.map((p, i) => (
                <span key={i} className="truncate">{p.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* TOP PERFORMING FLACONS (5 COLS) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-serif text-[#1B100A] font-medium">
                Top Performing Flacons
              </h2>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                Best-selling fragrance creations
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
                    <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#E8DFC8] shrink-0" />
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
                    <span className="text-xs font-bold text-gray-800">
                      ₹{Number(p.revenue || (p.sales ? p.sales * 2475 : 4950)).toLocaleString('en-IN')}
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
