"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

export default function AddProductHeader({ name, loading, onCancel, onSave }) {
  return (
    <div className="bg-white rounded-2xl px-5 py-3 border border-[#EAE3D6] shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="w-9 h-9 rounded-xl border border-[#E2D6C0] flex items-center justify-center text-stone-600 hover:text-[#B3874B] hover:border-[#B3874B] hover:bg-[#FAF7F2] transition-colors"
          title="Back to Catalog"
        >
          <ArrowLeftOutlined className="text-sm" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-serif font-bold text-[#1B100A] leading-tight m-0">
              {name || 'New Perfume Flacon Formulation'}
            </h1>
            <span className="text-[10px] font-sans font-bold bg-[#FAF7F2] text-[#8C6D1F] px-2 py-0.5 rounded-full border border-[#E2D6C0]">
              NEW DRAFT
            </span>
          </div>
          <p className="text-[11px] text-stone-500 m-0">
            Define olfactory notes, set main & offer pricing, and specify initial flacon stock.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onCancel}
          className="!rounded-xl !h-9 px-4 text-xs font-semibold !border-stone-300 text-stone-700 hover:!border-stone-400"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={onSave}
          loading={loading}
          icon={<PlusOutlined />}
          className="!bg-[#B3874B] hover:!bg-[#8C6D1F] !text-white !rounded-xl !h-9 px-5 text-xs font-bold !border-none shadow-xs uppercase tracking-wider"
        >
          Publish Perfume
        </Button>
      </div>
    </div>
  );
}

