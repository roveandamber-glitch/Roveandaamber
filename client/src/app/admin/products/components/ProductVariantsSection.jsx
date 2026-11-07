"use client";
import React, { useState } from 'react';
import { Form, Input, InputNumber, Button } from 'antd';
import { 
  SafetyCertificateOutlined, 
  PlusOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { Sparkles } from 'lucide-react';

export const PRESET_OPTIONS = [
  { label: '50ml (1 Flacon)', size: '50ml' },
  { label: '100ml (1 Flacon)', size: '100ml' },
  { label: '2 Flacons (Duo)', size: '2 Flacons (Duo Pack)' },
  { label: '3 Flacons (Trio)', size: '3 Flacons (Trio Pack)' },
  { label: '30ml Travel', size: '30ml' },
  { label: 'Discovery Coffret', size: 'Discovery Coffret (3x30ml)' }
];

export default function ProductVariantsSection({
  variants = [],
  setVariants,
  tieredPricing = [],
  setTieredPricing
}) {
  const [showTieredPricing, setShowTieredPricing] = useState(tieredPricing.length > 0);

  // Add new quantity / size variant
  const handleAddVariant = (presetSize = '') => {
    const nextId = String(Date.now());
    const count = variants.length + 1;
    const defaultLabel = presetSize || (count === 1 ? '50ml (1 Flacon)' : count === 2 ? '2 Flacons (Duo Pack)' : `${count} Flacons Bundle`);
    
    // Suggest price based on first variant or default
    const basePrice = variants.length > 0 ? (Number(variants[0].price) || 4950) : 4950;
    const baseMRP = variants.length > 0 ? (Number(variants[0].originalPrice) || 5999) : 5999;
    const multiplier = count === 2 ? 1.85 : count === 3 ? 2.65 : 1;

    const newVariant = {
      id: nextId,
      size: defaultLabel,
      price: presetSize ? basePrice : Math.round(basePrice * multiplier),
      originalPrice: presetSize ? baseMRP : Math.round(baseMRP * multiplier),
      stock: 20
    };
    if (setVariants) setVariants([...variants, newVariant]);
  };

  // Update variant field
  const handleVariantChange = (id, field, value) => {
    if (setVariants) {
      setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
    }
  };

  // Remove variant (keeps at least 1)
  const handleRemoveVariant = (id) => {
    if (variants.length <= 1) return;
    if (setVariants) setVariants(variants.filter(v => v.id !== id));
  };

  // Add quantity bulk discount tier
  const handleAddTier = () => {
    const nextMin = tieredPricing.length > 0 ? (tieredPricing[tieredPricing.length - 1].minQty || 1) + 1 : 2;
    if (setTieredPricing) {
      setTieredPricing([
        ...tieredPricing,
        { minQty: nextMin, discountPercent: 10 }
      ]);
    }
  };

  const handleRemoveTier = (index) => {
    if (setTieredPricing) setTieredPricing(tieredPricing.filter((_, i) => i !== index));
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tieredPricing];
    updated[index] = { ...updated[index], [field]: value };
    if (setTieredPricing) setTieredPricing(updated);
  };

  const totalFlaconStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <div className="p-4 sm:p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC9] space-y-4">
      
      {/* Header with Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#140D07]">
              Quantity & Pricing Tiers
            </span>
            <span className="text-[10px] bg-[#FAF0D4] text-[#8C6D1F] font-bold px-2 py-0.5 rounded-full border border-[#E8DEC8]">
              {variants.length} Tier{variants.length > 1 ? 's' : ''} Configured
            </span>
          </div>
          <p className="text-[11px] text-stone-500 m-0 mt-0.5">
            Configure different quantities (e.g. 1 Flacon, 2 Flacons, 3 Flacons, 50ml, 100ml) with their individual selling prices & MRPs.
          </p>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0 self-start sm:self-center">
          {totalFlaconStock} Total Units Stock
        </span>
      </div>

      {/* Dynamic Quantity & Price Rows */}
      <div className="space-y-2.5">
        {variants.map((variant, index) => {
          const hasDiscount = variant.originalPrice && Number(variant.originalPrice) > Number(variant.price);
          const discountPct = hasDiscount 
            ? Math.round(((Number(variant.originalPrice) - Number(variant.price)) / Number(variant.originalPrice)) * 100) 
            : null;

          return (
            <div 
              key={variant.id || index}
              className="p-3 sm:p-3.5 bg-white rounded-xl border border-[#E8DFC9] shadow-2xs space-y-2 transition-all hover:border-[#B8860B]/60"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                
                {/* Quantity / Size Name */}
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Quantity / Size *
                  </label>
                  <Input
                    value={variant.size}
                    onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)}
                    placeholder="e.g. 1 Flacon (50ml) or 2 Flacons"
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

      {/* Add Controls & Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Quick Add:
          </span>
          {PRESET_OPTIONS.map(preset => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleAddVariant(preset.size)}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 border border-stone-300 hover:border-black font-medium transition-all cursor-pointer shadow-2xs"
            >
              + {preset.label}
            </button>
          ))}
        </div>

        <Button
          type="dashed"
          onClick={() => handleAddVariant('')}
          icon={<PlusOutlined />}
          className="!rounded-xl text-xs font-bold !border-[#B8860B]/70 !text-[#8C6D1F] hover:!border-black hover:!text-black"
        >
          + Add Quantity & Price Tier
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
            <Sparkles size={13} className="text-[#8C6D1F]" />
            <span>{showTieredPricing ? 'Hide Automatic Volume Discounts' : '+ Add Automatic Volume Discounts (Buy 2+, Buy 3+)'}</span>
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
  );
}
