"use client";
import React, { useMemo } from 'react';
import { Form, Input, Select, InputNumber, Tooltip } from 'antd';
import { TagOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Option } = Select;
export const PRESET_SIZES = ['50ml', '100ml', '30ml', 'Discovery Coffret (3x30ml)', 'Discovery Set'];

export default function ProductFormDetails({ form, categories, watchedOriginalPrice, watchedPrice, watchedFlaconSize, watchedStock, watchedSamplePrice }) {
  const discountPercent = useMemo(() => {
    const orig = Number(watchedOriginalPrice);
    const curr = Number(watchedPrice);
    if (orig && curr && orig > curr) {
      return Math.round(((orig - curr) / orig) * 100);
    }
    return null;
  }, [watchedOriginalPrice, watchedPrice]);

  return (
    <div className="bg-white rounded-2xl p-4.5 border border-[#EAE3D6] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
        <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#1B100A] m-0 flex items-center gap-2">
          <TagOutlined className="text-[#B3874B]" />
          <span>Fragrance Details, Pricing & Inventory</span>
        </h3>
        <span className="text-[10px] text-stone-500 font-mono bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8DFC9]">
          UNIFIED FORM
        </span>
      </div>

      {/* Row 1: Perfume Name & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-7">
          <Form.Item
            label={<span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Perfume Name</span>}
            name="name"
            className="!mb-0"
            rules={[{ required: true, message: 'Please enter perfume name' }]}
          >
            <Input 
              placeholder="e.g. Royal Elegance Extrait de Parfum" 
              className="rounded-xl py-1.5 text-xs font-serif font-medium border-stone-300" 
            />
          </Form.Item>
        </div>
        <div className="sm:col-span-5">
          <Form.Item
            label={<span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Collection / Category</span>}
            name="category_id"
            className="!mb-0"
            rules={[{ required: true, message: 'Select category' }]}
          >
            <Select className="w-full text-xs">
              {categories.map((c) => (
                <Option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </div>

      {/* Row 2: 3 Distinct Pricing Inputs (Main Price, Offer Price, Sample Product Price) */}
      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFC9] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D1F]">
            Atelier Pricing Structure
          </span>
          {discountPercent && (
            <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Save {discountPercent}% Off MRP
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 1. Main Price (Original Price / MRP) */}
          <Form.Item
            label={
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-stone-600 flex items-center justify-between w-full">
                <span>Main Price (MRP ₹)</span>
                <Tooltip title="Original catalog/list price before discount. Displayed with strike-through on product page.">
                  <span className="cursor-help opacity-70">ⓘ</span>
                </Tooltip>
              </span>
            }
            name="originalPrice"
            className="!mb-0"
          >
            <InputNumber 
              min={0} 
              step={50}
              placeholder="e.g. 7650"
              formatter={value => value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              className="w-full rounded-xl py-0.5 text-xs font-mono font-medium border-stone-300" 
            />
          </Form.Item>

          {/* 2. Offer Price (Selling Price) */}
          <Form.Item
            label={
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#140D07] flex items-center justify-between w-full">
                <span className="font-extrabold text-[#140D07]">Offer Price (₹)</span>
                <span className="text-[8.5px] bg-[#140D07] text-[#FAF7F2] px-1.5 py-0.2 rounded font-bold uppercase">
                  Selling
                </span>
              </span>
            }
            name="price"
            className="!mb-0"
            rules={[{ required: true, message: 'Please enter offer price' }]}
          >
            <InputNumber 
              min={0} 
              step={50}
              placeholder="5999"
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              className="w-full rounded-xl py-0.5 text-xs font-mono font-bold border-[#8C6D1F] bg-white ring-1 ring-[#8C6D1F]/20" 
            />
          </Form.Item>

          {/* 3. Sample Product Price */}
          <Form.Item
            label={
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#B3874B] flex items-center justify-between w-full">
                <span>Sample Price (₹)</span>
                <span className="text-[8.5px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold uppercase">
                  ★ 2ml
                </span>
              </span>
            }
            name="samplePrice"
            className="!mb-0"
            rules={[{ required: true, message: 'Specify 2ml sample vial price' }]}
          >
            <InputNumber 
              min={0} 
              step={10}
              placeholder="199"
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/₹\s?|(,*)/g, '')}
              className="w-full rounded-xl py-0.5 text-xs font-mono font-bold border-amber-300 bg-amber-50/40" 
            />
          </Form.Item>
        </div>
      </div>

      {/* Row 3: Unified Stock & Flacon Size */}
      <div className="p-3 bg-white rounded-xl border border-[#EAE3D6] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#1B100A]">
            Inventory Allocation & Flacon Size
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            Number(watchedStock || 0) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {Number(watchedStock || 0) > 0 ? `${watchedStock} Units Available` : 'Out of Stock'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Flacon Stock */}
          <div className="sm:col-span-4">
            <Form.Item
              label={<span className="text-[10.5px] font-bold uppercase tracking-wider text-stone-700">Flacon Stock (Units)</span>}
              name="stock"
              className="!mb-0"
              rules={[{ required: true, message: 'Enter total flacon stock' }]}
            >
              <InputNumber 
                min={0} 
                placeholder="22" 
                className="w-full rounded-xl py-0.5 text-xs font-mono font-bold border-stone-300" 
              />
            </Form.Item>
          </div>

          {/* Flacon Size */}
          <div className="sm:col-span-5">
            <Form.Item
              label={<span className="text-[10.5px] font-bold uppercase tracking-wider text-stone-700">Flacon Size / Format</span>}
              name="flaconSize"
              className="!mb-0"
              rules={[{ required: true, message: 'Enter flacon size' }]}
            >
              <Input 
                placeholder="e.g. 50ml or Discovery Coffret (3x30ml)" 
                className="rounded-xl py-1 text-xs border-stone-300 font-medium" 
              />
            </Form.Item>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {PRESET_SIZES.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => form.setFieldsValue({ flaconSize: preset })}
                  className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                    watchedFlaconSize === preset 
                      ? 'bg-[#140D07] text-white border-black font-bold' 
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 2ml Sample Stock */}
          <div className="sm:col-span-3">
            <Form.Item
              label={<span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-900">2ml Sample Stock</span>}
              name="sampleStock"
              className="!mb-0"
            >
              <InputNumber 
                min={0} 
                placeholder="25" 
                className="w-full rounded-xl py-0.5 text-xs font-mono font-bold border-amber-300 bg-amber-50/30" 
              />
            </Form.Item>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2 text-[10.5px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <SafetyCertificateOutlined className="text-amber-700 text-xs shrink-0" />
            <span className="text-amber-950 truncate">
              <strong>7-Day Home Trial Guarantee:</strong> 2ml discovery vial allows customer return on sealed flacon.
            </span>
          </div>
          <span className="font-mono font-bold text-[#8C6D1F] shrink-0">
            ₹{watchedSamplePrice || 199}/vial
          </span>
        </div>
      </div>

      {/* Row 4: Olfactory Description */}
      <div>
        <Form.Item
          label={<span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Olfactory Description & Notes</span>}
          name="description"
          className="!mb-0"
        >
          <Input.TextArea 
            rows={2} 
            placeholder="Top notes: Bergamot, Pink Pepper. Heart: Damask Rose. Base: Oud, Ambergris." 
            className="rounded-xl text-xs border-stone-300" 
          />
        </Form.Item>
      </div>
    </div>
  );
}

