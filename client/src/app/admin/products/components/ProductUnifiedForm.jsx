"use client";
import React, { useMemo } from 'react';
import { Form, Input, Select, InputNumber, Upload, Button, Tooltip } from 'antd';
import { 
  TagOutlined, 
  SafetyCertificateOutlined, 
  PictureOutlined, 
  PlusOutlined, 
  SaveOutlined 
} from '@ant-design/icons';

const { Option } = Select;
export const PRESET_SIZES = ['50ml', '100ml', '30ml', 'Discovery Coffret (3x30ml)', 'Discovery Set'];

export default function ProductUnifiedForm({
  form,
  categories = [],
  fileList = [],
  beforeUpload,
  handleUploadChange,
  loading = false,
  isEdit = false,
  watchedOriginalPrice,
  watchedPrice,
  watchedSamplePrice,
  watchedStock,
  watchedFlaconSize,
  onCancel
}) {
  const discountPercent = useMemo(() => {
    const orig = Number(watchedOriginalPrice);
    const curr = Number(watchedPrice);
    if (orig && curr && orig > curr) {
      return Math.round(((orig - curr) / orig) * 100);
    }
    return null;
  }, [watchedOriginalPrice, watchedPrice]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D6] shadow-xs space-y-6 max-w-5xl mx-auto">
      
      {/* 1. Header Bar Inside Card */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE1]">
        <div>
          <h2 className="font-serif font-bold text-base sm:text-lg text-[#1B100A] m-0 flex items-center gap-2">
            <TagOutlined className="text-[#B3874B]" />
            <span>{isEdit ? 'Edit Perfume Flacon Formulation' : 'Create New Perfume Flacon'}</span>
          </h2>
          <p className="text-xs text-stone-500 m-0 mt-0.5">
            Fill in pricing, bottle inventory, and imagery in this unified form.
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold bg-[#FAF7F2] text-[#8C6D1F] px-3 py-1 rounded-full border border-[#E2D6C0] shrink-0">
          SINGLE FORM
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

      {/* 3. Pricing Section (MRP, Offer Price, 2ml Sample Price) */}
      <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC9] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C6D1F]">
            Pricing Structure
          </span>
          {discountPercent && (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Save {discountPercent}% Off MRP
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Main Price (MRP) */}
          <Form.Item
            label={
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-stone-600 flex items-center justify-between w-full">
                <span>Main Price (MRP ₹)</span>
                <Tooltip title="Original list price before discount. Displayed crossed out on storefront.">
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
              className="w-full rounded-xl py-1 text-xs font-mono font-medium border-stone-300 bg-white" 
            />
          </Form.Item>

          {/* Offer Price (Selling Price) */}
          <Form.Item
            label={
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#140D07] flex items-center justify-between w-full">
                <span className="font-extrabold text-[#140D07]">Offer Price (₹) *</span>
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
              className="w-full rounded-xl py-1 text-xs font-mono font-bold border-[#8C6D1F] bg-white ring-1 ring-[#8C6D1F]/20" 
            />
          </Form.Item>

          {/* 2ml Sample Price */}
          <Form.Item
            label={
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#B3874B] flex items-center justify-between w-full">
                <span>Sample Price (₹) *</span>
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
              className="w-full rounded-xl py-1 text-xs font-mono font-bold border-amber-300 bg-amber-50/40" 
            />
          </Form.Item>
        </div>
      </div>

      {/* 4. Flacon Size & Stock Inventory Section */}
      <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC9] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#1B100A]">
            Flacon Size & Inventory Allocation
          </span>
          <span className={`text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
            Number(watchedStock || 0) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {Number(watchedStock || 0) > 0 ? `${watchedStock} Units Available` : 'Out of Stock'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          {/* Main Flacon Stock */}
          <div className="sm:col-span-4">
            <Form.Item
              label={<span className="text-[10.5px] font-bold uppercase tracking-wider text-stone-700">Flacon Stock (Units) *</span>}
              name="stock"
              className="!mb-0"
              rules={[{ required: true, message: 'Enter total flacon stock' }]}
            >
              <InputNumber 
                min={0} 
                placeholder="25" 
                className="w-full rounded-xl py-1 text-xs font-mono font-bold border-stone-300 bg-white" 
              />
            </Form.Item>
          </div>

          {/* Flacon Size Format with Quick Presets */}
          <div className="sm:col-span-5">
            <Form.Item
              label={<span className="text-[10.5px] font-bold uppercase tracking-wider text-stone-700">Flacon Size / Format *</span>}
              name="flaconSize"
              className="!mb-0"
              rules={[{ required: true, message: 'Enter flacon size' }]}
            >
              <Input 
                placeholder="e.g. 50ml or Discovery Coffret (3x30ml)" 
                className="rounded-xl py-1 text-xs border-stone-300 font-medium bg-white" 
              />
            </Form.Item>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {PRESET_SIZES.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => form.setFieldsValue({ flaconSize: preset })}
                  className={`text-[9.5px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    watchedFlaconSize === preset 
                      ? 'bg-[#140D07] text-white border-black font-bold' 
                      : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-300'
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
                className="w-full rounded-xl py-1 text-xs font-mono font-bold border-amber-300 bg-amber-50/40" 
              />
            </Form.Item>
          </div>
        </div>

        <div className="bg-white border border-amber-200/90 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <SafetyCertificateOutlined className="text-amber-700 text-sm shrink-0" />
            <span className="text-stone-700 truncate">
              <strong className="text-stone-900 font-semibold">7-Day Home Trial Guarantee:</strong> 2ml discovery vial enables customer returns on sealed flacons.
            </span>
          </div>
          <span className="font-mono font-bold text-[#8C6D1F] shrink-0">
            ₹{watchedSamplePrice || 199}/vial
          </span>
        </div>
      </div>

      {/* 5. Olfactory Description */}
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

      {/* 6. Flacon Imagery Section (Directly Inside Card) */}
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

      {/* 7. Action Footer Inside Card */}
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

