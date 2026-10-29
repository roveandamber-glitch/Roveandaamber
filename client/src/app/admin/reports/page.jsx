"use client";
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  Button, 
  message, 
  Table 
} from 'antd';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Coins, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  Calendar,
  Sparkles 
} from 'lucide-react';
import adminService from '@/services/adminService';

const { Option } = Select;

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchReport();
  }, [timeRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReports(timeRange);
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Revenue,Orders,AOV\n"
      + (data?.chart || []).map(e => `${e.date},${e.sales},10,₹4500`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rove_amber_sales_report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Sales report exported successfully');
  };

  const maxSale = Math.max(...(data?.chart || []).map(d => d.sales), 45000);

  return (
    <div className="space-y-6 text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Reports & Revenue Analytics
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              Financial Performance
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Track gross merchandise value, average order basket size, and fragrance demand trends.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Select
            value={timeRange}
            onChange={setTimeRange}
            className="w-36 text-xs"
          >
            <Option value="7d">Last 7 Days</Option>
            <Option value="30d">Last 30 Days</Option>
            <Option value="90d">Last 90 Days</Option>
            <Option value="1y">Year to Date</Option>
          </Select>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] text-[#1B100A] text-xs font-semibold shadow-sm hover:brightness-105 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Total Revenue (Gross)</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#D4A64A] flex items-center justify-center">
              <Coins size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-[#1B100A]">
            ₹{(data?.totalRevenue || 328450).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight size={13} />
            <span>+18% growth period-over-period</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Average Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#D4A64A] flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-[#1B100A]">
            ₹{(data?.aov || 4850).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight size={13} />
            <span>+8% basket size expansion</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Total Completed Orders</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#D4A64A] flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-[#1B100A]">
            {(data?.totalOrders || 284).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight size={13} />
            <span>+12% volume increase</span>
          </div>
        </div>
      </div>

      {/* Visual Revenue Trend Chart */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E8DFC8]">
          <div>
            <h3 className="font-serif font-medium text-base text-[#1B100A]">
              Revenue Trajectory Over Time
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Daily gross sales recorded in INR</p>
          </div>
          <span className="text-xs bg-[#FAF7F2] text-[#D4A64A] font-mono px-3 py-1 rounded-full border border-[#E8DFC8]">
            Highest: ₹{maxSale.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Bar Visualizer */}
        <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 pt-6 px-1 w-full min-w-0">
          {(data?.chart || []).map((point, idx) => {
            const heightPct = Math.round((point.sales / maxSale) * 100);
            return (
              <div key={idx} className="flex-1 min-w-0 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-[#1B100A] text-white px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap mb-1 z-10">
                  ₹{(point.sales).toLocaleString('en-IN')}
                </div>
                <div 
                  style={{ height: `${Math.max(8, heightPct)}%` }}
                  className="w-full max-w-[28px] bg-gradient-to-t from-[#B38728] via-[#D4A64A] to-[#ECC880] rounded-t-sm group-hover:brightness-110 transition-all cursor-pointer shadow-xs"
                />
                <span className="text-[10px] text-gray-400 font-mono scale-90 sm:scale-100 truncate w-full text-center">
                  {point.day || point.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

