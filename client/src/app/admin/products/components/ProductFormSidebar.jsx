"use client";
import React from 'react';
import { Upload, Button } from 'antd';
import { PlusOutlined, PictureOutlined, SaveOutlined } from '@ant-design/icons';

export default function ProductFormSidebar({
  fileList,
  beforeUpload,
  handleUploadChange,
  watchedOriginalPrice,
  watchedPrice,
  watchedSamplePrice,
  watchedStock,
  loading
}) {
  return (
    <div className="space-y-3">
      {/* Flacon Imagery */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#1B100A] m-0 flex items-center gap-2">
            <PictureOutlined className="text-[#B3874B]" />
            <span>Flacon Imagery</span>
          </h3>
          <span className="text-[10px] text-stone-400 font-mono">Up to 4 images</span>
        </div>

        <div className="pt-1">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleUploadChange}
            maxCount={4}
            className="luxury-admin-uploader"
          >
            {fileList.length < 4 && (
              <div className="text-center p-2">
                <PlusOutlined className="text-stone-400 text-sm" />
                <div className="text-[10px] font-medium text-stone-600 mt-1">Upload</div>
              </div>
            )}
          </Upload>
        </div>
        <p className="text-[10px] text-stone-400 m-0">
          Studio flacon photography on neutral luxury background (1000×1200px).
        </p>
      </div>

      {/* Formulation Live Snapshot & Primary Action */}
      <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E2D6C0] shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8DFC8]">
          <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#1B100A]">
            Formulation Snapshot
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            Live Sync
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-[#EAE3D6]">
            <span className="text-[9.5px] text-stone-500 uppercase tracking-wide block">Main Price (MRP)</span>
            <span className="font-mono font-semibold text-xs text-stone-500 line-through">
              {watchedOriginalPrice ? `₹${Number(watchedOriginalPrice).toLocaleString()}` : '—'}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-[#8C6D1F]/40 bg-[#FCFBF8]">
            <span className="text-[9.5px] text-[#8C6D1F] font-bold uppercase tracking-wide block">Offer Price</span>
            <span className="font-mono font-bold text-sm text-[#140D07]">
              ₹{Number(watchedPrice || 0).toLocaleString()}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-amber-300 bg-amber-50/30">
            <span className="text-[9.5px] text-amber-900 font-bold uppercase tracking-wide block">2ml Sample Price</span>
            <span className="font-mono font-bold text-sm text-[#B3874B]">
              ₹{Number(watchedSamplePrice || 199).toLocaleString()}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-[#EAE3D6]">
            <span className="text-[9.5px] text-stone-500 uppercase tracking-wide block">Total Stock</span>
            <span className="font-mono font-bold text-sm text-stone-900">
              {watchedStock || 0} Flacons
            </span>
          </div>
        </div>

        <div className="pt-1">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            className="!w-full !bg-[#B3874B] hover:!bg-[#8C6D1F] !text-white !rounded-xl !h-10 text-xs font-bold uppercase tracking-wider !border-none shadow-sm cursor-pointer"
          >
            Save Formulation Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

