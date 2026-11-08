"use client";
import React from 'react';
import { Calendar, Eye, FileText, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

export default function ChartMonthStatusView({
  months = [],
  onViewMonth,
  onDownloadMonth,
  downloadingKey
}) {
  if (!months || months.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-[#8C7A6B]">
        No monthly order performance archives found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 pt-2">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[620px]">
          <thead>
            <tr className="border-b border-[#ECE5D8] text-[#8C7A6B] uppercase font-bold text-[10px] tracking-wider">
              <th className="pb-2.5 pr-3">Billing Cycle</th>
              <th className="pb-2.5 px-3 text-center">Orders</th>
              <th className="pb-2.5 px-3">Fulfillment Status</th>
              <th className="pb-2.5 px-3 text-right">Gross Revenue</th>
              <th className="pb-2.5 px-3 text-right">AOV</th>
              <th className="pb-2.5 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F6F1E8]">
            {months.map((m) => {
              const key = `${m.year}-${m.month}`;
              const isDownloading = downloadingKey === key;

              return (
                <tr key={key} className="hover:bg-[#FCFAF7] transition-colors">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF6EE] text-[#B8860B] border border-[#E8DFC8] flex items-center justify-center shrink-0">
                        <Calendar size={13} />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-xs text-[#1C1714] block">
                          {m.periodName}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {m.year} • M{String(m.month).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-xs font-bold text-[#1C1714]">
                      {m.totalOrders}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={9} />
                        <span>{m.deliveredOrders} Delivered</span>
                      </span>
                      {m.processingOrders > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          <Clock size={9} />
                          <span>{m.processingOrders} Active</span>
                        </span>
                      )}
                      {m.cancelledOrders > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle size={9} />
                          <span>{m.cancelledOrders}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className="font-mono text-xs font-bold text-[#1C1714]">
                      ₹{Number(m.grossRevenue || 0).toLocaleString('en-IN')}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className="font-mono text-[11px] text-[#6B5D50]">
                      ₹{Number(m.aov || 0).toLocaleString('en-IN')}
                    </span>
                  </td>

                  <td className="py-3 pl-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onViewMonth && (
                        <button
                          type="button"
                          onClick={() => onViewMonth(m)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-[10px] font-semibold transition-all shadow-2xs cursor-pointer"
                        >
                          <Eye size={11} />
                          <span>View</span>
                        </button>
                      )}
                      {onDownloadMonth && (
                        <button
                          type="button"
                          onClick={() => onDownloadMonth(m)}
                          disabled={isDownloading}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#140D07] hover:bg-black text-[#FAF7F2] text-[10px] font-bold uppercase transition-all shadow-2xs cursor-pointer disabled:opacity-60"
                        >
                          {isDownloading ? (
                            <Loader2 size={10} className="animate-spin text-[#ECC880]" />
                          ) : (
                            <FileText size={10} className="text-[#ECC880]" />
                          )}
                          <span>PDF</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

