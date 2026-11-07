"use client";
import React from 'react';
import { Form, Input, Select, Upload, Button } from 'antd';
import { 
  TagOutlined, 
  PictureOutlined, 
  PlusOutlined, 
  SaveOutlined
} from '@ant-design/icons';
import ProductVariantsSection from './ProductVariantsSection';

const { Option } = Select;

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
            Configure multiple prices based on bottle quantity/size, inventory allocation, and olfactory notes.
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
      <ProductVariantsSection
        variants={variants}
        setVariants={setVariants}
        tieredPricing={tieredPricing}
        setTieredPricing={setTieredPricing}
      />

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
