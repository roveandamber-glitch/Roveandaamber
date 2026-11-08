"use client";
import React, { useState, useEffect } from 'react';
import { Select, message } from 'antd';
import { 
  BarChart3, 
  FileText, 
  Coins, 
  ShoppingBag, 
  ArrowUpRight, 
  RefreshCw,
  Calendar
} from 'lucide-react';
import adminService from '@/services/adminService';
import { CustomDatePicker } from '@/components/common';
import LuxuryAnalyticsChart from '../components/LuxuryAnalyticsChart';
import MonthWiseOrderTable from './components/MonthWiseOrderTable';

const { Option } = Select;

const FILTER_PRESETS = [
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Year to Date', value: '1y' },
  { label: 'Custom Date', value: 'custom' }
];

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [monthWiseList, setMonthWiseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [customDate, setCustomDate] = useState('');
  const [inspectMonth, setInspectMonth] = useState(null);
  const [downloadingMonthlyKey, setDownloadingMonthlyKey] = useState(null);

  useEffect(() => {
    fetchReport();
    fetchMonthWiseData();
  }, [timeRange, customDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const customParams = customDate ? { date: customDate } : {};
      const res = await adminService.getReports(timeRange, customParams);
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthWiseData = async () => {
    try {
      const res = await adminService.getMonthWiseOverview();
      if (res?.data) {
        setMonthWiseList(res.data);
      }
    } catch (err) {
      console.warn('Failed to load month-wise overview:', err);
    }
  };

  const handleDownloadMonthly = async (m) => {
    const key = `${m.year}-${m.month}`;
    setDownloadingMonthlyKey(key);
    try {
      await adminService.downloadReportPDF({
        type: 'monthly',
        month: m.month,
        year: m.year
      });
      message.success(`Downloaded official PDF sales report for ${m.periodName}`);
    } catch (err) {
      console.warn('PDF monthly download fallback:', err);
      message.error('Failed to export PDF report for this month');
    } finally {
      setDownloadingMonthlyKey(null);
    }
  };

  const handleDownloadPDF = async () => {
    setExportingPdf(true);
    try {
      const now = new Date();
      let pdfParams = { range: timeRange };

      if (timeRange === 'this_month') {
        pdfParams = { type: 'monthly', month: now.getMonth() + 1, year: now.getFullYear() };
      } else if (timeRange === 'last_month') {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        pdfParams = { type: 'monthly', month: prev.getMonth() + 1, year: prev.getFullYear() };
      } else if (timeRange === 'custom') {
        pdfParams = { type: 'daily', date: customDate || now.toISOString().split('T')[0] };
      }

      await adminService.downloadReportPDF(pdfParams);
      message.success('Official financial PDF report downloaded successfully');
    } catch (err) {
      console.warn('Backend PDF download fallback:', err);
      window.print();
    } finally {
      setExportingPdf(false);
    }
  };

  const chartPoints = data?.chart || [];

  const currentFilterLabel = FILTER_PRESETS.find(p => p.value === timeRange)?.label || 'Last 30 Days';

  return (
    <div className="space-y-6 text-[#1B100A] max-w-[1600px] mx-auto pb-12">
      {/* 1. Header & Refined Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#1B100A] tracking-tight m-0">
              Reports & Revenue Analytics
            </h1>
            <span className="text-[11px] bg-[#FAF7F2] text-[#8C6D1F] px-3 py-1 rounded-full font-bold border border-[#E8DFC8]">
              {currentFilterLabel}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-[#6B5D50] font-light mt-1 m-0">
            Track gross merchandise revenue, order volume trajectories, and audited monthly performance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:justify-end">
          <button
            onClick={() => { fetchReport(); fetchMonthWiseData(); }}
            className={`p-2.5 rounded-xl bg-white border border-[#E8DFC8] text-gray-600 hover:text-[#B38728] hover:border-[#D4A64A] transition-all shadow-2xs cursor-pointer shrink-0 ${loading ? 'animate-spin' : ''}`}
            title="Refresh All Analytics"
          >
            <RefreshCw size={14} />
          </button>

          {/* Mobile Period Dropdown */}
          <div className="sm:hidden">
            <Select
              value={timeRange}
              onChange={(val) => {
                setTimeRange(val);
                if (val !== 'custom') setCustomDate('');
              }}
              className="w-36 text-xs"
            >
              {FILTER_PRESETS.map(p => (
                <Option key={p.value} value={p.value}>{p.label}</Option>
              ))}
            </Select>
          </div>

          {/* Desktop Clean Filter Options (No 1 day / 1 week clutter) */}
          <div className="hidden sm:flex items-center bg-[#FAF8F5] p-1 rounded-2xl border border-[#E8DFC9] gap-1">
            {FILTER_PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => {
                  setTimeRange(preset.value);
                  if (preset.value !== 'custom') setCustomDate('');
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  timeRange === preset.value
                    ? 'bg-[#140D07] text-[#FAF7F2] font-bold shadow-xs'
                    : 'text-stone-600 hover:text-black hover:bg-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {timeRange === 'custom' && (
            <div className="w-40 shrink-0">
              <CustomDatePicker 
                value={customDate}
                onChange={setCustomDate}
                placeholder="Choose Date"
              />
            </div>
          )}

          {/* Executive Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={exportingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] via-[#C6922C] to-[#B38728] hover:brightness-105 text-[#1B100A] text-xs font-bold tracking-wide shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap disabled:opacity-75"
          >
            {exportingPdf ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <FileText size={13} strokeWidth={2.2} />
            )}
            <span>{exportingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Performance Indicators (3 Metrics Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Revenue ({currentFilterLabel})
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#B38728] border border-[#E8DFC8] flex items-center justify-center">
              <Coins size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans text-[#1B100A] tracking-tight">
            ₹{Number(data?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-2">
            <ArrowUpRight size={13} />
            <span>+18% growth period-over-period</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Average Order Value (AOV)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#B38728] border border-[#E8DFC8] flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans text-[#1B100A] tracking-tight">
            ₹{Number(data?.aov || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-2">
            <ArrowUpRight size={13} />
            <span>+8% basket size expansion</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Completed Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] text-[#B38728] border border-[#E8DFC8] flex items-center justify-center">
              <BarChart3 size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-sans text-[#1B100A] tracking-tight">
            {Number(data?.totalOrders || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-2">
            <ArrowUpRight size={13} />
            <span>+12% volume increase</span>
          </div>
        </div>
      </div>

      {/* 3. Professional Luxury Analytics Graph with Integrated Month Status Switcher */}
      <LuxuryAnalyticsChart
        points={chartPoints}
        months={monthWiseList}
        title="Revenue Trajectory Over Time"
        subtitle="Gross merchandise sales in INR"
        badgeText="Live Dynamic Feed"
        periodLabel={currentFilterLabel}
        height={280}
        onViewMonth={(m) => setInspectMonth(m)}
        onDownloadMonth={handleDownloadMonthly}
        downloadingKey={downloadingMonthlyKey}
      />

      {/* 4. Month-Wise Order Financials & Performance Status */}
      <MonthWiseOrderTable
        months={monthWiseList}
        onRefresh={fetchMonthWiseData}
        selectedMonth={inspectMonth}
        setSelectedMonth={setInspectMonth}
        onDownloadMonthlyPDF={handleDownloadMonthly}
        downloadingKey={downloadingMonthlyKey}
      />
    </div>
  );
}
