"use client";
import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  FileText, 
  Eye, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  TrendingUp,
  X,
  Loader2
} from 'lucide-react';
import { Modal, message } from 'antd';
import adminService from '@/services/adminService';

export default function MonthWiseOrderTable({ 
  months = [], 
  onRefresh,
  selectedMonth: externalSelectedMonth,
  setSelectedMonth: externalSetSelectedMonth,
  onDownloadMonthlyPDF: externalDownloadPDF,
  downloadingKey: externalDownloadingKey
}) {
  const [internalSelectedMonth, setInternalSelectedMonth] = useState(null);
  const [internalDownloadingKey, setInternalDownloadingKey] = useState(null);

  const selectedMonth = externalSelectedMonth !== undefined ? externalSelectedMonth : internalSelectedMonth;
  const setSelectedMonth = externalSetSelectedMonth || setInternalSelectedMonth;
  const downloadingKey = externalDownloadingKey !== undefined ? externalDownloadingKey : internalDownloadingKey;

  const handleDownloadMonthlyPDF = async (m) => {
    if (externalDownloadPDF) {
      return externalDownloadPDF(m);
    }
    const key = `${m.year}-${m.month}`;
    setInternalDownloadingKey(key);
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
      setInternalDownloadingKey(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E8DFC8] shadow-[0_4px_24px_rgba(30,20,10,0.03)] space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F4EFE6]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1B100A] tracking-tight m-0">
              Month-Wise Order Financials & Performance Status
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF0D4] text-[#8C6D1F] border border-[#E8DEC8]">
              Monthly Archives
            </span>
          </div>
          <p className="text-xs text-[#6B5D50] font-light mt-0.5 m-0">
            Review month-by-month order volumes, delivery fulfillment statuses, and export official audited reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#8C6D1F] bg-[#FAF8F5] px-3 py-1 rounded-xl border border-[#E8DFC8]">
            {months.length} Active Billing Cycles
          </span>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-[#ECE5D8] text-[#8C7A6B] uppercase font-bold text-[10px] tracking-wider">
              <th className="pb-3 pr-4 font-bold">Billing Month</th>
              <th className="pb-3 px-4 font-bold text-center">Orders</th>
              <th className="pb-3 px-4 font-bold">Fulfillment Status</th>
              <th className="pb-3 px-4 font-bold text-right">Gross Revenue</th>
              <th className="pb-3 px-4 font-bold text-right">AOV</th>
              <th className="pb-3 pl-4 font-bold text-right">Audited Reports</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F6F1E8]">
            {months.length > 0 ? (
              months.map((m) => {
                const key = `${m.year}-${m.month}`;
                const isDownloading = downloadingKey === key;

                return (
                  <tr key={key} className="hover:bg-[#FCFAF7] transition-colors group">
                    {/* Month & Year */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] text-[#B8860B] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                          <Calendar size={15} />
                        </div>
                        <div>
                          <span className="font-serif font-bold text-sm text-[#1C1714] block leading-tight">
                            {m.periodName}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            CY {m.year} • M{String(m.month).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total Orders */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono text-sm font-bold text-[#1C1714]">
                        {m.totalOrders}
                      </span>
                    </td>

                    {/* Order Status Breakdown */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={10} />
                          <span>{m.deliveredOrders} Delivered</span>
                        </span>
                        {m.processingOrders > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            <Clock size={10} />
                            <span>{m.processingOrders} Active</span>
                          </span>
                        )}
                        {m.cancelledOrders > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle size={10} />
                            <span>{m.cancelledOrders} Cancelled</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Gross Revenue */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-sm font-bold text-[#1C1714]">
                        ₹{Number(m.grossRevenue || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Average Order Value */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-xs font-medium text-[#6B5D50]">
                        ₹{Number(m.aov || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Action Controls: View & Download PDF */}
                    <td className="py-4 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMonth(m)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-[11px] font-semibold transition-all shadow-2xs cursor-pointer"
                          title="View Month Summary"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadMonthlyPDF(m)}
                          disabled={isDownloading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#140D07] hover:bg-black text-[#FAF7F2] text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer disabled:opacity-60"
                          title="Download Official PDF Report"
                        >
                          {isDownloading ? (
                            <Loader2 size={11} className="animate-spin text-[#ECC880]" />
                          ) : (
                            <FileText size={11} className="text-[#ECC880]" />
                          )}
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-10 text-center text-stone-400 italic">
                  No monthly billing cycles logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Month Detail Inspection Modal */}
      {selectedMonth && (
        <Modal
          open={Boolean(selectedMonth)}
          onCancel={() => setSelectedMonth(null)}
          footer={null}
          centered
          width={600}
          closeIcon={null}
        >
          <div className="bg-[#FAF9F7] -m-6 p-6 rounded-3xl border border-[#E8DFC9] space-y-5 text-stone-900 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE5D8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF0D4] text-[#8C6D1F] border border-[#E8DEC8] flex items-center justify-center font-bold">
                  <Calendar size={18} />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-black m-0">
                    {selectedMonth.periodName} Report Summary
                  </h4>
                  <p className="text-xs text-stone-500 m-0 font-light">
                    Audited monthly performance & order fulfillment metrics
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMonth(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-black hover:text-white border border-stone-200 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC9] text-center">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Gross Sales</span>
                <span className="font-mono text-base font-bold text-black mt-0.5 block">
                  ₹{Number(selectedMonth.grossRevenue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC9] text-center">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Orders</span>
                <span className="font-mono text-base font-bold text-black mt-0.5 block">
                  {selectedMonth.totalOrders}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DFC9] text-center">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">AOV</span>
                <span className="font-mono text-base font-bold text-[#8C6D1F] mt-0.5 block">
                  ₹{Number(selectedMonth.aov || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Fulfillment Breakdown Box */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8DFC9] space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Fulfillment Status Breakdown
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-700 font-medium">Delivered & Closed</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedMonth.deliveredOrders} orders</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="text-stone-700 font-medium">Active / In-Transit Logistics</span>
                  <span className="font-mono font-bold text-amber-700">{selectedMonth.processingOrders} orders</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-700 font-medium">Cancelled & Refunded</span>
                  <span className="font-mono font-bold text-rose-700">{selectedMonth.cancelledOrders} orders</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadMonthlyPDF(selectedMonth)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] via-[#C6922C] to-[#B38728] text-black text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Download size={13} />
                <span>Download Month PDF Report</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMonth(null)}
                className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:border-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
