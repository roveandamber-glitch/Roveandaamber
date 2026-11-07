"use client";
import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, Tooltip } from 'antd';
import { 
  TagOutlined, 
  SafetyCertificateOutlined, 
  PictureOutlined, 
  PlusOutlined, 
  SaveOutlined,
  DeleteOutlined,
  Layers,
  Sparkles
} from '@ant-design/icons';

const { Option } = Select;
export const PRESET_SIZES = ['30ml', '50ml', '100ml', 'Discovery Coffret (3x30ml)', 'Discovery Set'];

export default function ProductUnifiedForm({
  form,
  categories = [],
  fileList = [],
  beforeUpload,
  handleUploadChange,
  variants = [],
  setVariants,
  tieredPricing = [],
  setTieredPricing,
  loading = false,
  isEdit = false,
  onCancel
}) {
  const [showTieredPricing, setShowTieredPricing] = useState(tieredPricing.length > 0);

  // Add new quantity / size variant
  const handleAddVariant = (presetSize = '') => {
    const nextId = String(Date.now());
    const newVariant = {
      id: nextId,
      size: presetSize || '50ml',
      price: variants.length > 0 ? variants[variants.length - 1].price : 4950,
      originalPrice: variants.length > 0 ? variants[variants.length - 1].originalPrice : '',
      stock: 20
    };
    setVariants([...variants, newVariant]);
  };

  // Update variant field
  const handleVariantChange = (id, field, value) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  // Remove variant (keeps at least 1)
  const handleRemoveVariant = (id) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter(v => v.id !== id));
  };

  // Add quantity bulk discount tier
  const handleAddTier = () => {
    const nextMin = tieredPricing.length > 0 ? (tieredPricing[tieredPricing.length - 1].minQty || 1) + 1 : 2;
    setTieredPricing([
      ...tieredPricing,
      { minQty: nextMin, discountPercent: 10 }
    ]);
  };

  const handleRemoveTier = (index) => {
    setTieredPricing(tieredPricing.filter((_, i) => i !== index));
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tieredPricing];
    updated[index] = { ...updated[index], [field]: value };
    setTieredPricing(updated);
  };

  const totalFlaconStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D6] shadow-xs space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* 1. Header Bar Inside Card */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE1]">
        <div>
          <h2 className="font-serif font-bold text-base sm:text-lg text-[#1B100A] m-0 flex items-center gap-2">
            <TagOutlined className="text-[#B3874B]" />
            <span>{isEdit ? 'Edit Perfume Flacon Formulation' : 'Create New Perfume Flacon'}</span>
          </h2>
          <p className="text-xs text-stone-500 m-0 mt-0.5">
            Set multiple prices based on bottle quantity/size, inventory allocation, and olfactory notes.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold bg-[#FAF7F2] text-[#8C6D1F] px-3 py-1 rounded-full border border-[#E2D6C0] shrink-0">
          MULTI-PRICE READY
        </span>
      </div>

      {/* 2. Fragrance Basics: Name & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-7">
          <Form.Item
            label={<span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Perfume Name *</span>}
            name="name"
            className="!mb-0"
            rules={[{ required: true, message: 'Please enter perfume name' }]}
          >
            <Input 
              placeholder="e.g. Royal Elegance Extrait de Parfum" 
              className="rounded-xl py-2 text-xs font-serif font-medium border-stone-300" 
            />
          </Form.Item>
        </div>

        <div className="sm:col-span-5">
          <Form.Item
            label={<span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Collection / Category *</span>}
            name="category_id"
            className="!mb-0"
            rules={[{ required: true, message: 'Select category' }]}
          >
            <Select className="w-full text-xs h-10">
              {categories.map((c) => (
                <Option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      </div>

      {/* 3. MULTIPLE PRICES BASED ON QUANTITY / SIZE */}
      <div className="p-4 sm:p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC9] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#140D07]">
                Pricing & Inventory by Quantity / Size
              </span>
              <span className="text-[10px] bg-[#FAF0D4] text-[#8C6D1F] font-bold px-2 py-0.5 rounded-full border border-[#E8DEC8]">
                {variants.length} Size{variants.length > 1 ? 's' : ''} Configured
              </span>
            </div>
            <p className="text-[11px] text-stone-500 m-0 mt-0.5">
              Enter individual selling price and MRP for each bottle quantity / ml format.
            </p>
          </div>

          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0 self-start sm:self-center">
            {totalFlaconStock} Total Flacons
          </span>
        </div>

        {/* Dynamic Variants Rows */}
        <div className="space-y-2.5">
          {variants.map((variant, index) => {
            const hasDiscount = variant.originalPrice && Number(variant.originalPrice) > Number(variant.price);
            const discountPct = hasDiscount ? Math.round(((Number(variant.originalPrice) - Number(variant.price)) / Number(variant.originalPrice)) * 100) : null;

            return (
              <div 
                key={variant.id || index}
                className="p-3 sm:p-3.5 bg-white rounded-xl border border-[#E8DFC9] shadow-2xs space-y-2 transition-all hover:border-[#B8860B]/60"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  
                  {/* Quantity / Size Name */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Bottle Quantity / Size *
                    </label>
                    <Input
                      value={variant.size}
                      onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)}
                      placeholder="e.g. 50ml or 100ml"
                      className="rounded-lg text-xs font-semibold border-stone-300"
                    />
                  </div>

                  {/* Offer Price (Selling Price) */}
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#140D07] block mb-1">
                      Offer Price (₹ Selling) *
                    </label>
                    <InputNumber
                      min={0}
                      step={50}
                      value={variant.price}
                      onChange={(val) => handleVariantChange(variant.id, 'price', val)}
                      formatter={value => value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      parser={value => value.replace(/₹\s?|(,*)/g, '')}
                      placeholder="4950"
                      className="w-full rounded-lg text-xs font-mono font-bold border-[#8C6D1F] bg-[#FCFBF8]"
                    />
                  </div>

                  {/* MRP (List Price) */}
                  <div className="sm:col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Main Price (MRP ₹)
                      </label>
                      {discountPct && (
                        <span className="text-[8.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {discountPct}% off
                        </span>
                      )}
                    </div>
                    <InputNumber
                      min={0}
                      step={50}
                      value={variant.originalPrice}
                      onChange={(val) => handleVariantChange(variant.id, 'originalPrice', val)}
                      formatter={value => value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      parser={value => value.replace(/₹\s?|(,*)/g, '')}
                      placeholder="5999"
                      className="w-full rounded-lg text-xs font-mono font-medium border-stone-300"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Stock (Units) *
                    </label>
                    <InputNumber
                      min={0}
                      value={variant.stock}
                      onChange={(val) => handleVariantChange(variant.id, 'stock', val)}
                      placeholder="20"
                      className="w-full rounded-lg text-xs font-mono font-bold border-stone-300"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="sm:col-span-1 flex justify-end sm:justify-center">
                    <Button
                      type="text"
                      danger
                      disabled={variants.length <= 1}
                      onClick={() => handleRemoveVariant(variant.id)}
                      icon={<DeleteOutlined />}
                      className="!h-8 !w-8 flex items-center justify-center !rounded-lg text-stone-400 hover:text-red-600 hover:!bg-red-50"
                      title="Remove variant"
                    />
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Add Variant Controls & Quick Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Quick Add:
            </span>
            {PRESET_SIZES.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddVariant(preset)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 border border-stone-300 hover:border-black font-medium transition-all cursor-pointer shadow-2xs"
              >
                + {preset}
              </button>
            ))}
          </div>

          <Button
            type="dashed"
            onClick={() => handleAddVariant('')}
            icon={<PlusOutlined />}
            className="!rounded-xl text-xs font-bold !border-[#B8860B]/70 !text-[#8C6D1F] hover:!border-black hover:!text-black"
          >
            Add Custom Quantity / Price
          </Button>
        </div>

        {/* 2ml Sample Guarantee Section */}
        <div className="p-3 bg-white rounded-xl border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#8C6D1F] flex items-center justify-center shrink-0">
              <SafetyCertificateOutlined className="text-sm" />
            </div>
            <div>
              <span className="font-bold text-[#140D07] block text-xs">
                2ml Discovery Trial Guarantee
              </span>
              <span className="text-[11px] text-stone-500 font-light block leading-tight">
                Customers who purchase the 2ml trial vial unlock 7-day returns on sealed flacons.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <div>
              <span className="text-[9.5px] uppercase font-bold text-stone-500 block mb-0.5">Vial Price</span>
              <Form.Item name="samplePrice" className="!mb-0">
                <InputNumber
                  min={0}
                  step={10}
                  formatter={value => value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  className="w-24 rounded-lg text-xs font-mono font-bold border-amber-300 bg-amber-50/40"
                />
              </Form.Item>
            </div>

            <div>
              <span className="text-[9.5px] uppercase font-bold text-stone-500 block mb-0.5">Vial Stock</span>
              <Form.Item name="sampleStock" className="!mb-0">
                <InputNumber
                  min={0}
                  className="w-20 rounded-lg text-xs font-mono font-bold border-stone-300"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Optional: Bulk Quantity Tier Pricing Toggle */}
        <div className="pt-2 border-t border-[#E8DFC9]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const nextState = !showTieredPricing;
                setShowTieredPricing(nextState);
                if (nextState && tieredPricing.length === 0) {
                  handleAddTier();
                }
              }}
              className="text-[11px] font-bold text-[#8C6D1F] hover:text-black flex items-center gap-1.5 cursor-pointer underline decoration-[#8C6D1F]/40"
            >
              <Sparkles className="text-xs" />
              <span>{showTieredPricing ? 'Hide Bulk Quantity Discount Tiers' : '+ Add Volume / Quantity Discount Tiers (Buy 2+, Buy 3+)'}</span>
            </button>
          </div>

          {showTieredPricing && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-stone-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-stone-600 block">
                Automatic Volume Discounts:
              </span>
              {tieredPricing.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="text-stone-600">Buy</span>
                  <InputNumber
                    min={2}
                    value={tier.minQty}
                    onChange={(val) => handleTierChange(idx, 'minQty', val)}
                    className="w-18 rounded-md font-mono"
                  />
                  <span className="text-stone-600">or more flacons → get</span>
                  <InputNumber
                    min={1}
                    max={80}
                    value={tier.discountPercent}
                    onChange={(val) => handleTierChange(idx, 'discountPercent', val)}
                    formatter={val => `${val}%`}
                    parser={val => val.replace('%', '')}
                    className="w-22 rounded-md font-mono font-bold text-emerald-700"
                  />
                  <span className="text-stone-600">discount off unit price</span>
                  <Button
                    type="text"
                    danger
                    onClick={() => handleRemoveTier(idx)}
                    icon={<DeleteOutlined />}
                    className="text-stone-400 hover:text-red-600"
                  />
                </div>
              ))}
              <Button
                type="dashed"
                size="small"
                onClick={handleAddTier}
                icon={<PlusOutlined />}
                className="mt-1 text-[11px]"
              >
                Add Tier
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Olfactory Description */}
      <div>
        <Form.Item
          label={<span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Olfactory Description & Notes</span>}
          name="description"
          className="!mb-0"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Describe top, heart, and base notes (e.g. Top: Bergamot, Pink Pepper | Heart: Damask Rose | Base: Cambodian Oud, Ambergris)..." 
            className="rounded-2xl p-3 text-xs border-stone-300 leading-relaxed" 
          />
        </Form.Item>
      </div>

      {/* 5. Flacon Imagery Section (Directly Inside Card) */}
      <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC9] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PictureOutlined className="text-[#B3874B]" />
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-stone-700">
              Flacon Imagery
            </span>
          </div>
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
                <div className="text-[10px] font-medium text-stone-600 mt-1">Add Image</div>
              </div>
            )}
          </Upload>
        </div>
        <p className="text-[10.5px] text-stone-400 m-0">
          Recommended: Studio flacon photography on neutral background (1000×1200px).
        </p>
      </div>

      {/* 6. Action Footer Inside Card */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EBE1]">
        {onCancel && (
          <Button
            onClick={onCancel}
            className="!rounded-xl !h-10 px-5 text-xs font-semibold !border-stone-300 text-stone-700 hover:!border-stone-400"
          >
            Cancel
          </Button>
        )}
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<SaveOutlined />}
          className="!bg-[#B3874B] hover:!bg-[#8C6D1F] !text-white !rounded-xl !h-10 px-7 text-xs font-bold uppercase tracking-wider !border-none shadow-sm cursor-pointer"
        >
          {isEdit ? 'Save Changes' : 'Publish Perfume Flacon'}
        </Button>
      </div>

    </div>
  );
}
