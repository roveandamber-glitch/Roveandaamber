"use client";
import React from 'react';
import { Table } from 'antd';
import { Coins, CheckCircle2, Clock } from 'lucide-react';

export default function UserWalletHistoryTable({ transactions = [], userName = '' }) {
  const historyColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type) => {
        const isRedeemed = String(type).toLowerCase().includes('redeem');
        const isAdj = String(type).toLowerCase().includes('adjust');
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap ${
            isRedeemed 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : isAdj 
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <Coins size={10} />
            {type}
          </span>
        );
      }
    },
    {
      title: 'Points Change',
      dataIndex: 'points',
      key: 'points',
      width: 120,
      render: (pts) => {
        const isPos = String(pts).startsWith('+');
        return (
          <span className={`font-mono font-bold text-xs ${isPos ? 'text-emerald-700' : 'text-rose-600'}`}>
            {pts} pts
          </span>
        );
      }
    },
    {
      title: 'Reference / Note',
      key: 'reference',
      render: (_, record) => (
        <div className="text-[11px] min-w-0">
          <div className="font-mono text-gray-600 font-medium truncate max-w-[170px]">
            {record.orderId || 'ATELIER-PRIVILEGE'}
          </div>
          {record.description && (
            <div className="text-gray-400 text-[10px] truncate max-w-[170px]">
              {record.description}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Timestamp',
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: (d) => <span className="text-[11px] text-gray-400 whitespace-nowrap">{d}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 size={10} className="text-emerald-600" />
          {status || 'Completed'}
        </span>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs overflow-hidden">
      <div className="p-3.5 border-b border-[#ECE7DE] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-[#8C6D1F]" />
          <h4 className="font-serif font-bold text-sm text-[#1C1714] m-0">
            {userName ? `${userName}'s Points History Ledger` : 'Points History Ledger'}
          </h4>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {transactions.length} {transactions.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      <Table
        columns={historyColumns}
        dataSource={transactions.map((t, idx) => ({ ...t, key: t.id || idx }))}
        pagination={{ pageSize: 5, size: 'small', className: "!px-3 !mb-3 text-xs" }}
        scroll={{ x: 600 }}
        className="admin-luxury-table"
        locale={{ emptyText: 'No points activity recorded for this customer yet.' }}
      />
    </div>
  );
}

