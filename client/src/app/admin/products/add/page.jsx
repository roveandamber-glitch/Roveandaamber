"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Form, 
  Input, 
  Select, 
  Upload, 
  Button, 
  message, 
  InputNumber, 
  Tooltip 
} from 'antd';
import { 
  PlusOutlined, 
  PictureOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined, 
  CheckOutlined, 
  SaveOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import adminService from '@/services/adminService';
import { showLuxuryDeleteModal } from '@/components/common';

const { Option } = Select;

const FRAGRANCE_FAMILIES = [
  'Amber & Woods',
  'Oriental & Spices',
  'Floral & Rose Bloom',
  'Fresh Citrus & Bergamot',
  'Smoky Leather & Tobacco',
  'Gourmand & Vanilla'
];

export default function AddProduct() {
  const router = useRouter();
  const [form] = Form.useForm();
  
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Flacon sizes and stock allocations
  const [sizeStock, setSizeStock] = useState({
    '50ml': 15,
    '100ml': 10,
    '2ml Sample': 25
  });

  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customQtyInput, setCustomQtyInput] = useState(10);

  const watchedPrice = Form.useWatch('price', form);
  const watchedSamplePrice = Form.useWatch('samplePrice', form);
  const watchedName = Form.useWatch('name', form);

  const totalStock = Object.values(sizeStock).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
  const hasSampleVariant = Object.keys(sizeStock).some(
    s => s.toLowerCase().includes('2ml') || s.toLowerCase().includes('sample')
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response?.success && response.data && response.data.length > 0) {
          setCategories(response.data);
          form.setFieldsValue({
            category_id: response.data[0]?.id || response.data[0]?._id
          });
        }
      } catch (error) {
        console.warn('Backend categories offline, using default luxury categories.');
      }
    };
    fetchCategories();
  }, [form]);

  const handleSizeStockChange = (size, value) => {
    setSizeStock(prev => ({
      ...prev,
      [size]: Math.max(0, Number(value) || 0)
    }));
  };

  const handleAddCustomSize = (sizeName, initialQty = 10) => {
    const trimmed = (sizeName || '').trim();
    if (!trimmed) {
      message.warning('Please specify variant name (e.g. 30ml, 50ml, 100ml, 2ml Sample).');
      return;
    }
    if (sizeStock[trimmed] !== undefined) {
      message.info(`Size "${trimmed}" is already active.`);
      return;
    }
    setSizeStock(prev => ({
      ...prev,
      [trimmed]: Math.max(0, Number(initialQty) || 0)
    }));
    setCustomSizeInput('');
    message.success(`Added ${trimmed} variant`);
  };

  const handleRemoveSize = (sizeToRemove) => {
    if (Object.keys(sizeStock).length <= 1) {
      message.warning('A perfume flacon must have at least one active size.');
      return;
    }
    setSizeStock(prev => {
      const copy = { ...prev };
      delete copy[sizeToRemove];
      return copy;
    });
    message.info(`Removed ${sizeToRemove} variant`);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(`${file.name} is not an image file.`);
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      return message.error('Please upload at least one flacon photograph before publishing.');
    }
    if (totalStock <= 0) {
      return message.error('Total product stock across sizes must be greater than 0.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('price', values.price);
      formData.append('samplePrice', values.samplePrice !== undefined ? values.samplePrice : 199);
      if (values.originalPrice) formData.append('originalPrice', values.originalPrice);
      formData.append('stock', totalStock);
      formData.append('category_id', values.category_id || '');
      formData.append('description', values.description ? values.description.trim() : '');
      formData.append('fragranceFamily', values.fragranceFamily || 'Amber & Woods');
      formData.append('gender', values.gender || 'unisex');
      formData.append('sizes', JSON.stringify(sizeStock));
      formData.append('sizes_stock', JSON.stringify(sizeStock));

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      let response;
      try {
        response = await productService.createProduct(formData);
      } catch (err) {
        response = await adminService.createProduct(formData);
      }

      if (response?.success || response?.data) {
        message.success(`Perfume "${values.name}" published successfully!`);
        form.resetFields();
        setFileList([]);
        router.push('/admin/products');
      } else {
        message.error(response?.message || 'Failed to publish perfume.');
      }
    } catch (error) {
      console.error('Error publishing product:', error);
      message.error('An error occurred while publishing the product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 pb-4">
      {/* Top Header Bar with Instant Action Buttons - Fits Single Window Screen View */}
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
                {watchedName || 'Create New Perfume Flacon'}
              </h1>
              <span className="text-[10px] font-sans font-bold bg-[#FAF7F2] text-[#8C6D1F] px-2 py-0.5 rounded-full border border-[#E2D6C0]">
                Haute Parfumerie
              </span>
            </div>
            <p className="text-[11px] text-stone-500 m-0">
              Publish new artisanal formulation with bottle inventory allocation and 2ml guarantee vial pricing.
            </p>
          </div>
        </div>

        {/* Action Controls right at the top */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push('/admin/products')}
            className="!rounded-xl !h-9 px-4 text-xs font-semibold !border-stone-300 text-stone-700 hover:!border-stone-400"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
            icon={<SaveOutlined />}
            className="!bg-[#B3874B] hover:!bg-[#8C6D1F] !text-white !rounded-xl !h-9 px-5 text-xs font-bold !border-none shadow-xs uppercase tracking-wider"
          >
            Publish Perfume
          </Button>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          price: 4950,
          samplePrice: 199,
          fragranceFamily: 'Amber & Woods',
          gender: 'unisex'
        }}
        className="w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Left Column (7 cols): Formulation details, Pricing & Sizes */}
          <div className="lg:col-span-7 space-y-3">
            {/* Card 1: General Details & Dedicated Sample Pricing */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#1B100A] m-0 flex items-center gap-2">
                  <span>Fragrance Details & Pricing</span>
                </h3>
                <span className="text-[11px] text-stone-400 font-mono">STEP 1 OF 2</span>
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

              {/* Row 2: Base Bottle Price + Sample Vial Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Form.Item
                  label={
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between w-full">
                      <span>Base Bottle Price (₹)</span>
                      <span className="text-[10px] text-stone-400 font-normal">Full Flacon</span>
                    </span>
                  }
                  name="price"
                  className="!mb-0"
                  rules={[{ required: true, message: 'Please enter base price' }]}
                >
                  <InputNumber 
                    min={0} 
                    step={50}
                    placeholder="4950"
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/₹\s?|(,*)/g, '')}
                    className="w-full rounded-xl py-0.5 text-xs font-mono font-bold border-stone-300" 
                  />
                </Form.Item>

                {/* Dedicated Sample Product Price Adding Field */}
                <Form.Item
                  label={
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#B3874B] flex items-center justify-between w-full">
                      <span className="flex items-center gap-1">
                        <span>Sample Product Price (₹)</span>
                        <Tooltip title="Price charged to customers for the 2ml trial vial with guarantee return protection.">
                          <span className="cursor-help opacity-70">ⓘ</span>
                        </Tooltip>
                      </span>
                      <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                        ★ 2ml Sample
                      </span>
                    </span>
                  }
                  name="samplePrice"
                  className="!mb-0"
                  rules={[{ required: true, message: 'Please specify 2ml sample vial price' }]}
                >
                  <InputNumber 
                    min={0} 
                    step={10}
                    placeholder="199"
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/₹\s?|(,*)/g, '')}
                    className="w-full rounded-xl py-0.5 text-xs font-mono font-bold border-amber-300 bg-amber-50/30" 
                  />
                </Form.Item>
              </div>

              {/* Row 3: Fragrance Family & Olfactory Description */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-5">
                  <Form.Item
                    label={<span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Fragrance Family</span>}
                    name="fragranceFamily"
                    className="!mb-0"
                  >
                    <Select className="w-full text-xs">
                      {FRAGRANCE_FAMILIES.map((fam) => (
                        <Option key={fam} value={fam}>{fam}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div className="sm:col-span-7">
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
            </div>

            {/* Card 2: Flacon Sizes & Inventory Allocation (Compact & Single-Screen Ready) */}
            <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
                <div>
                  <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#1B100A] m-0 flex items-center gap-2">
                    <span>Flacon Sizes & Inventory Allocation</span>
                    <span className="text-[9px] font-sans font-bold bg-[#FAF7F2] text-[#8C6D1F] px-1.5 py-0.2 rounded border border-[#E2D6C0]">
                      Live
                    </span>
                  </h3>
                </div>
                <div className="bg-[#1B100A] text-[#FAF7F2] px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold">
                  {totalStock} Total Units
                </div>
              </div>

              {/* Ultra-Slim Guarantee Status Bar */}
              <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <SafetyCertificateOutlined className="text-amber-700 text-sm shrink-0" />
                  <span className="text-[11px] text-amber-950 truncate">
                    <strong className="font-bold text-amber-900">2ml Sample Guarantee:</strong> Customers ordering 2ml sample receive 7-day return & dispatch cancellation guarantee.
                  </span>
                </div>
                <div className="shrink-0 font-mono text-[11px] font-bold text-[#8C6D1F] bg-amber-200/60 px-2 py-0.5 rounded-md">
                  Vial Price: ₹{watchedSamplePrice || 199}
                </div>
              </div>

              {/* Active Variants in Formulation - Compact 3-col Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(sizeStock).map(([size, qty]) => {
                  const isSample = size.toLowerCase().includes('2ml') || size.toLowerCase().includes('sample');
                  return (
                    <div 
                      key={size} 
                      className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSample 
                          ? 'bg-amber-50/50 border-amber-400 ring-1 ring-amber-300/50' 
                          : 'bg-[#FAF7F2] border-[#E2D6C0]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-bold text-xs text-[#1B100A] font-mono">
                            {size}
                          </span>
                          {isSample && (
                            <span className="text-[8px] font-bold bg-amber-200 text-amber-950 px-1 py-0.2 rounded uppercase">
                              ★ Sample Vial
                            </span>
                          )}
                        </div>
                        {Object.keys(sizeStock).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              showLuxuryDeleteModal({
                                title: 'Remove Size Variant',
                                itemName: size,
                                itemType: 'flacon variant',
                                description: `Remove ${size} from this perfume formulation?`,
                                confirmText: 'Remove',
                                onConfirm: () => handleRemoveSize(size)
                              });
                            }}
                            className="text-stone-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                            title={`Remove ${size}`}
                          >
                            <DeleteOutlined className="text-xs" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-stone-600">
                          <span>Stock:</span>
                          <span className={`font-mono font-bold ${qty > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {qty > 0 ? `${qty} units` : 'Out of Stock'}
                          </span>
                        </div>
                        <InputNumber
                          min={0}
                          max={99999}
                          value={qty}
                          onChange={(val) => handleSizeStockChange(size, val)}
                          className="w-full text-center rounded-lg text-xs font-mono font-bold border-stone-300 !h-7"
                          placeholder="Qty"
                        />
                        {isSample && (
                          <div className="text-[9px] text-amber-800 font-semibold text-center pt-0.5">
                            Customer Price: ₹{watchedSamplePrice || 199}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inline Toolbar for Adding Variants & Quick Presets (Zero Vertical Waste) */}
              <div className="pt-2 border-t border-[#F0EBE1] flex flex-wrap items-center justify-between gap-2">
                {/* Presets Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mr-0.5">Quick Add:</span>
                  {['2ml Sample', '30ml', '50ml', '100ml', 'Discovery Set'].map((preset) => {
                    const isAdded = sizeStock[preset] !== undefined;
                    const isSamplePreset = preset === '2ml Sample';

                    if (isAdded) {
                      return (
                        <span
                          key={preset}
                          className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 select-none"
                        >
                          <CheckOutlined className="text-[9px]" /> {preset}
                        </span>
                      );
                    }

                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddCustomSize(preset, preset === '2ml Sample' ? 25 : 10)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                          isSamplePreset
                            ? 'bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-500 hover:text-white'
                            : 'bg-white text-stone-700 border-[#E2D6C0] hover:bg-[#B3874B] hover:text-white hover:border-[#B3874B]'
                        }`}
                      >
                        <span>+ {preset}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Inline Custom Size Field */}
                <div className="flex items-center gap-1.5">
                  <Input
                    placeholder="Custom ML size"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onPressEnter={() => handleAddCustomSize(customSizeInput, customQtyInput)}
                    className="rounded-lg text-xs py-0.5 w-28 border-stone-300"
                  />
                  <InputNumber
                    min={0}
                    max={9999}
                    value={customQtyInput}
                    onChange={(v) => setCustomQtyInput(v || 0)}
                    className="w-14 rounded-lg text-xs font-mono font-bold border-stone-300 !h-7"
                    title="Initial Units"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomSize(customSizeInput, customQtyInput)}
                    className="bg-[#B3874B] hover:bg-[#8C6D1F] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Imagery & Live Formulation Summary */}
          <div className="lg:col-span-5 space-y-3">
            {/* Card 3: Perfume Imagery (Compact Grid) */}
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
                Recommended: Studio flacon photography on pure neutral backdrop (1000×1200px).
              </p>
            </div>

            {/* Card 4: Formulation Live Snapshot & Primary Action */}
            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E2D6C0] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DFC8]">
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#1B100A]">
                  Formulation Snapshot
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  New Formulation
                </span>
              </div>

              {/* 2x2 Metric Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-[#EAE3D6]">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wide block">Base Bottle Price</span>
                  <span className="font-mono font-bold text-sm text-[#1B100A]">
                    ₹{Number(watchedPrice || 4950).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-amber-300 bg-amber-50/30">
                  <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wide block">
                    ★ 2ml Sample Price
                  </span>
                  <span className="font-mono font-bold text-sm text-[#B3874B]">
                    ₹{Number(watchedSamplePrice || 199).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#EAE3D6]">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wide block">Total Stock</span>
                  <span className="font-mono font-bold text-sm text-stone-900">
                    {totalStock} Flacons
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#EAE3D6]">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wide block">Sample Guarantee</span>
                  <span className={`text-[11px] font-bold ${hasSampleVariant ? 'text-emerald-700' : 'text-amber-800'}`}>
                    {hasSampleVariant ? '✓ 7-Day Return Active' : 'No 2ml Sample Added'}
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-1">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  className="!w-full !bg-[#B3874B] hover:!bg-[#8C6D1F] !text-white !rounded-xl !h-10 text-xs font-bold uppercase tracking-wider !border-none shadow-sm"
                >
                  Publish Perfume Flacon
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
