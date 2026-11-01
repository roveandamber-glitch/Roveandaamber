"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Upload, 
  Button, 
  Row, 
  Col, 
  message, 
  InputNumber, 
  Tooltip,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  PictureOutlined, 
  EyeOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { 
  Sparkles, 
  ShieldCheck, 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  Info, 
  Layers, 
  UploadCloud, 
  ArrowLeft,
  Check,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';

const { Option } = Select;
const { TextArea } = Input;

// Standard luxury perfume flacon presets
const STANDARD_SIZES = [
  { key: '50ml', label: '50ml', subtitle: 'Signature Flacon', defaultQty: 15 },
  { key: '100ml', label: '100ml', subtitle: 'Grand Flacon', defaultQty: 10 },
  { key: '30ml', label: '30ml', subtitle: 'Travel Flacon', defaultQty: 10 },
  { key: '2ml Sample', label: '2ml Sample', subtitle: '★ Guarantee Vial', defaultQty: 25, isSample: true },
  { key: 'Discovery Set', label: 'Discovery Set', subtitle: 'Artisan Coffret', defaultQty: 5 }
];

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
  
  // State
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Live form preview watch values
  const [liveName, setLiveName] = useState('');
  const [livePrice, setLivePrice] = useState(4950);
  const [liveCategory, setLiveCategory] = useState('');
  const [liveFamily, setLiveFamily] = useState('Amber & Woods');

  // Flacon sizes and stock allocations
  const [sizeStock, setSizeStock] = useState({
    '50ml': 15,
    '100ml': 10,
    '2ml Sample': 25
  });

  const [customSizeName, setCustomSizeName] = useState('');
  const [customSizeQty, setCustomSizeQty] = useState(10);
  const [showGuaranteeInfo, setShowGuaranteeInfo] = useState(false);

  // Total stock calculated dynamically from sizes
  const totalStock = useMemo(() => {
    return Object.values(sizeStock).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
  }, [sizeStock]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response?.success && response.data && response.data.length > 0) {
          setCategories(response.data);
          setLiveCategory(response.data[0]?.name || '');
        }
      } catch (error) {
        console.warn('Backend categories offline, using default luxury categories.');
      }
    };
    fetchCategories();
  }, []);

  // Toggle or add a standard preset size
  const togglePresetSize = (sizeKey, defaultQty = 10) => {
    setSizeStock(prev => {
      const copy = { ...prev };
      if (copy[sizeKey] !== undefined) {
        if (Object.keys(copy).length <= 1) {
          message.warning('At least one flacon size must remain in the catalog.');
          return prev;
        }
        delete copy[sizeKey];
        message.info(`Removed ${sizeKey}`);
      } else {
        copy[sizeKey] = defaultQty;
        message.success(`Added ${sizeKey} with ${defaultQty} units`);
      }
      return copy;
    });
  };

  // Adjust quantity for a size
  const handleStockChange = (size, newQty) => {
    const validQty = Math.max(0, parseInt(newQty, 10) || 0);
    setSizeStock(prev => ({
      ...prev,
      [size]: validQty
    }));
  };

  // Quick adjust +/- by amount
  const adjustStockStep = (size, delta) => {
    setSizeStock(prev => {
      const current = prev[size] || 0;
      return {
        ...prev,
        [size]: Math.max(0, current + delta)
      };
    });
  };

  // Add custom size
  const handleAddCustomSize = () => {
    const trimmed = customSizeName.trim();
    if (!trimmed) {
      message.warning('Please enter a size name (e.g. 200ml, 15ml, Coffret).');
      return;
    }
    if (sizeStock[trimmed] !== undefined) {
      message.info(`Variant "${trimmed}" already exists.`);
      return;
    }
    setSizeStock(prev => ({
      ...prev,
      [trimmed]: Math.max(0, parseInt(customSizeQty, 10) || 0)
    }));
    setCustomSizeName('');
    message.success(`Added custom variant "${trimmed}"`);
  };

  // Remove a size variant
  const handleRemoveSize = (sizeKey) => {
    if (Object.keys(sizeStock).length <= 1) {
      message.warning('A perfume product must have at least one flacon size variant.');
      return;
    }
    setSizeStock(prev => {
      const copy = { ...prev };
      delete copy[sizeKey];
      return copy;
    });
    message.info(`Removed ${sizeKey} variant`);
  };

  // Image validation
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(`${file.name} is not a valid image file.`);
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB.');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  // Form submission
  const onFinish = async (values) => {
    if (fileList.length === 0) {
      return message.error('Please upload at least one flacon image before publishing.');
    }

    if (totalStock <= 0) {
      return message.error('Total product stock across sizes must be greater than 0.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('price', values.price);
      if (values.originalPrice) formData.append('originalPrice', values.originalPrice);
      formData.append('stock', totalStock);
      formData.append('category_id', values.category_id || '');
      formData.append('categoryName', liveCategory || '');
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

      if (response?.success) {
        message.success(`Perfume "${values.name}" published successfully!`);
        form.resetFields();
        setFileList([]);
        router.push('/admin/products');
      } else {
        message.error(response?.message || 'Failed to publish perfume');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      message.error(error.response?.data?.message || 'Failed to publish perfume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.25 }}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{
          price: 4950,
          originalPrice: 5950,
          fragranceFamily: 'Amber & Woods',
          gender: 'unisex'
        }}
      >
        {/* Sticky Luxury Header Action Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="p-2 rounded-xl border border-[#E8DFC8] hover:bg-[#FAF7F2] text-gray-600 transition-colors cursor-pointer"
              title="Back to Catalog"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-serif font-bold text-[#18110D] tracking-tight m-0">
                  Add New Perfume Formulation
                </h1>
                <span className="text-[10px] font-sans font-bold bg-[#FAF7F2] text-[#B8860B] border border-[#E8DFC8] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Maison Catalog
                </span>
              </div>
              <p className="text-xs text-gray-500 m-0 mt-0.5">
                Configure formulation title, olfactory profile, bottle sizes, and inventory allocation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button 
              onClick={() => router.push('/admin/products')} 
              className="!rounded-xl !h-10 !px-5 !text-xs !font-semibold !border-[#E8DFC8] hover:!border-[#D4A64A]"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="!bg-gradient-to-r !from-[#D4A64A] !to-[#B38728] hover:!brightness-105 !text-[#18110D] !border-none !rounded-xl !h-10 !px-6 !text-xs !font-bold !shadow-sm flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>Publish Perfume</span>
            </Button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <Row gutter={[24, 24]}>
          
          {/* Left Column: Essential Details & Modern Size Inventory Matrix */}
          <Col xs={24} lg={15} className="space-y-6">

            {/* CARD 1: Perfume Essence & Details */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] text-[#B8860B] border border-[#E8DFC8] flex items-center justify-center">
                    <Sparkles size={14} />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#18110D] m-0">
                    Perfume Identity & Story
                  </h3>
                </div>
                <span className="text-[11px] text-gray-400">Step 1 of 3</span>
              </div>

              <Row gutter={16}>
                {/* Perfume Name */}
                <Col xs={24} sm={15}>
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Perfume Title *</span>}
                    name="name"
                    rules={[
                      { required: true, message: 'Perfume title is required' },
                      { min: 3, message: 'Must be at least 3 characters' }
                    ]}
                    className="mb-3.5"
                  >
                    <Input 
                      placeholder="e.g. Oud Royale — The Royal Edition" 
                      onChange={(e) => setLiveName(e.target.value)}
                      className="rounded-xl h-10 text-xs font-serif" 
                    />
                  </Form.Item>
                </Col>

                {/* Category / Collection */}
                <Col xs={24} sm={9}>
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Collection *</span>}
                    name="category_id"
                    rules={[{ required: true, message: 'Please select a collection' }]}
                    className="mb-3.5"
                  >
                    <Select 
                      placeholder="Select collection" 
                      className="h-10 text-xs"
                      onChange={(val, opt) => setLiveCategory(opt?.children || '')}
                    >
                      {categories.map((cat) => (
                        <Option key={cat.id || cat._id} value={cat.id || cat._id}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* Fragrance Family */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Olfactory Family</span>}
                    name="fragranceFamily"
                    className="mb-3.5"
                  >
                    <Select 
                      className="h-10 text-xs"
                      onChange={(val) => setLiveFamily(val)}
                    >
                      {FRAGRANCE_FAMILIES.map(f => (
                        <Option key={f} value={f}>{f}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                {/* Target Audience / Gender */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Gender / Scent Profile</span>}
                    name="gender"
                    className="mb-3.5"
                  >
                    <Select className="h-10 text-xs">
                      <Option value="unisex">Unisex / Shared</Option>
                      <Option value="her">For Her (Feminine)</Option>
                      <Option value="him">For Him (Masculine)</Option>
                    </Select>
                  </Form.Item>
                </Col>

                {/* Base Price & Compare Price */}
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Offering Price (₹) *</span>}
                    name="price"
                    rules={[
                      { required: true, message: 'Price is required' },
                      {
                        validator: (_, value) => {
                          if (!value || Number(value) > 0) return Promise.resolve();
                          return Promise.reject(new Error('Price must be greater than 0'));
                        }
                      }
                    ]}
                    className="mb-3.5"
                  >
                    <InputNumber 
                      min={1} 
                      max={1000000} 
                      placeholder="4950" 
                      onChange={(val) => setLivePrice(val || 0)}
                      className="w-full rounded-xl h-10 text-xs font-mono font-bold" 
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Compare Price (₹)</span>}
                    name="originalPrice"
                    className="mb-3.5"
                  >
                    <InputNumber 
                      min={0} 
                      max={1000000} 
                      placeholder="5950" 
                      className="w-full rounded-xl h-10 text-xs font-mono" 
                    />
                  </Form.Item>
                </Col>

                {/* Description */}
                <Col xs={24}>
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Artisanal Story & Formulation Description</span>}
                    name="description"
                    className="mb-0"
                  >
                    <TextArea 
                      rows={3}
                      placeholder="Describe the olfactory journey, rare woods, essential oils, and inspiration behind this bespoke perfume..."
                      className="rounded-xl text-xs py-2"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* CARD 2: User-Friendly Flacon Sizes & Inventory Allocation */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              
              {/* Card Header with Real-Time Total Stock Counter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] text-[#B8860B] border border-[#E8DFC8] flex items-center justify-center">
                    <Package size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#18110D] m-0 flex items-center gap-2">
                      <span>Flacon Sizes & Inventory Allocation</span>
                      <span className="text-[10px] font-sans font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.2 rounded-full">
                        Live Allocation
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 m-0 mt-0.5">
                      Select which bottle volumes are available and allocate inventory per variant.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto bg-[#FAF7F2] border border-[#E8DFC8] px-3.5 py-1.5 rounded-xl shrink-0">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    Total Stock:
                  </span>
                  <span className="font-mono font-bold text-sm text-[#18110D]">
                    {totalStock} Units
                  </span>
                </div>
              </div>

              {/* 1. Quick Standard Size Selectors (One-Click Toggle) */}
              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-2">
                  Standard Bottle Presets (Click to add / remove):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {STANDARD_SIZES.map((sizeObj) => {
                    const isAdded = sizeStock[sizeObj.key] !== undefined;
                    return (
                      <button
                        type="button"
                        key={sizeObj.key}
                        onClick={() => togglePresetSize(sizeObj.key, sizeObj.defaultQty)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between select-none relative ${
                          isAdded
                            ? 'bg-[#FAF7F2] border-[#D4A64A] shadow-xs ring-1 ring-[#D4A64A]/30'
                            : 'bg-white border-[#E8DFC8] hover:border-[#D4A64A]/60 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-mono font-bold text-xs text-[#18110D]">
                            {sizeObj.label}
                          </span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isAdded ? 'bg-[#D4A64A] text-white' : 'border border-gray-300 text-gray-300'
                          }`}>
                            {isAdded ? <Check size={10} strokeWidth={3} /> : <Plus size={10} />}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 truncate block">
                          {sizeObj.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Elegant 2ml Sample Guarantee Accordion Note */}
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-950 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1 text-[11px] leading-relaxed text-amber-900">
                  <span className="font-bold text-amber-950">2ml Companion Sample Guarantee: </span>
                  When the <strong>2ml Sample</strong> variant is offered, patrons can test the scent at home before opening their full flacon. Orders with a companion sample qualify for 7-day hassle-free returns.
                </div>
              </div>

              {/* 3. Active Formulations Stock Cards */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-gray-700">
                    Active Catalog Flacons ({Object.keys(sizeStock).length} active):
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Fine-tune inventory for each variant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(sizeStock).map(([sizeName, qty]) => {
                    const isSample = sizeName.toLowerCase().includes('sample') || sizeName.toLowerCase().includes('2ml');
                    const units = Number(qty) || 0;

                    return (
                      <div
                        key={sizeName}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                          isSample 
                            ? 'bg-amber-50/40 border-amber-300 shadow-2xs' 
                            : 'bg-white border-[#E8DFC8] shadow-2xs'
                        }`}
                      >
                        {/* Variant Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-mono font-bold text-xs text-[#18110D]">
                              {sizeName}
                            </span>
                            {isSample && (
                              <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded uppercase tracking-wider">
                                Sample
                              </span>
                            )}
                          </div>
                          
                          {Object.keys(sizeStock).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(sizeName)}
                              className="text-gray-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                              title={`Remove ${sizeName}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Inventory Controls with +/- Stepper */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DFC8]">
                            <button
                              type="button"
                              onClick={() => adjustStockStep(sizeName, -5)}
                              className="w-7 h-7 rounded-lg bg-white border border-[#E8DFC8] hover:bg-gray-50 text-gray-700 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95"
                              title="-5 Units"
                            >
                              -5
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustStockStep(sizeName, -1)}
                              className="w-7 h-7 rounded-lg bg-white border border-[#E8DFC8] hover:bg-gray-50 text-gray-700 flex items-center justify-center cursor-pointer active:scale-95"
                              title="-1 Unit"
                            >
                              <Minus size={12} />
                            </button>
                            
                            <input
                              type="number"
                              min={0}
                              max={9999}
                              value={units}
                              onChange={(e) => handleStockChange(sizeName, e.target.value)}
                              className="flex-1 text-center font-mono font-bold text-xs bg-transparent focus:outline-none w-12"
                            />

                            <button
                              type="button"
                              onClick={() => adjustStockStep(sizeName, 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-[#E8DFC8] hover:bg-gray-50 text-gray-700 flex items-center justify-center cursor-pointer active:scale-95"
                              title="+1 Unit"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustStockStep(sizeName, 5)}
                              className="w-7 h-7 rounded-lg bg-white border border-[#E8DFC8] hover:bg-gray-50 text-gray-700 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95"
                              title="+5 Units"
                            >
                              +5
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[10px]">
                            <span className={units > 0 ? 'text-emerald-700 font-medium' : 'text-rose-600 font-bold'}>
                              {units > 0 ? `✓ ${units} units ready` : '⚠ Out of stock'}
                            </span>
                            <span className="text-gray-400 font-mono">
                              Allocation
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Add Custom Bottle Volume Inline */}
              <div className="pt-3 border-t border-[#F0EAE1]">
                <span className="text-xs font-semibold text-gray-700 block mb-2">
                  Add Custom Volume or Gift Edition:
                </span>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <Input
                    placeholder="e.g. 200ml Flacon or 15ml Travel Spray"
                    value={customSizeName}
                    onChange={(e) => setCustomSizeName(e.target.value)}
                    onPressEnter={handleAddCustomSize}
                    className="rounded-xl text-xs py-2 flex-1 border-[#E8DFC8]"
                  />
                  <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#E8DFC8] px-3 py-1 rounded-xl shrink-0">
                    <span className="text-xs text-gray-600 font-semibold">Qty:</span>
                    <InputNumber
                      min={0}
                      max={9999}
                      value={customSizeQty}
                      onChange={(v) => setCustomSizeQty(v || 0)}
                      className="w-16 rounded-lg text-xs font-mono font-bold border-none bg-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="px-4 py-2 bg-[#18110D] hover:bg-[#2A2421] text-white rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>Add Variant</span>
                  </button>
                </div>
              </div>

            </div>
          </Col>

          {/* Right Column: Visual Media & Live Storefront Preview */}
          <Col xs={24} lg={9} className="space-y-6">

            {/* Visual Media Uploader Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] text-[#B8860B] border border-[#E8DFC8] flex items-center justify-center">
                    <UploadCloud size={14} />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#18110D] m-0">
                    Product Imagery
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400">Up to 4 images</span>
              </div>

              <div>
                <Form.Item
                  name="images"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  className="m-0"
                >
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onChange={({ fileList }) => setFileList(fileList)}
                    multiple={true}
                    maxCount={4}
                    className="compact-uploader"
                  >
                    {fileList.length < 4 && (
                      <div className="p-2 text-center">
                        <PlusOutlined className="text-base text-gray-400" />
                        <div className="mt-1 text-[11px] font-semibold text-gray-600">Upload Image</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>

                {fileList.length === 0 && (
                  <div className="mt-2 p-5 rounded-2xl bg-[#FAF9F7] border border-dashed border-[#E8DFC8] text-center">
                    <PictureOutlined className="text-2xl text-[#D4A64A] mb-1.5" />
                    <p className="text-xs font-semibold text-[#18110D] m-0">No flacon image uploaded yet</p>
                    <span className="text-[10px] text-gray-400 block mt-0.5">PNG, JPG, or WEBP under 5MB</span>
                  </div>
                )}
              </div>

              {/* Status Readiness Checklist */}
              <div className="pt-3 border-t border-[#F0EAE1] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Image Cover:</span>
                  <span className={fileList.length > 0 ? 'text-emerald-700 font-bold' : 'text-gray-400'}>
                    {fileList.length > 0 ? `✓ ${fileList.length} Image${fileList.length > 1 ? 's' : ''}` : 'Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Stock Active:</span>
                  <span className={totalStock > 0 ? 'text-emerald-700 font-bold' : 'text-gray-400'}>
                    {totalStock > 0 ? `✓ ${totalStock} Units` : 'Required'}
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE STOREFRONT CARD PREVIEW */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-1.5">
                  <EyeOutlined className="text-[#B8860B] text-xs" />
                  <span className="text-xs font-serif font-bold text-[#18110D]">
                    Storefront Live Preview
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-wider">
                  Patron View
                </span>
              </div>

              {/* Mock Perfume Card */}
              <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E8DFC8] space-y-3">
                <div className="w-full h-44 rounded-xl bg-white border border-[#E8DFC8] overflow-hidden flex items-center justify-center p-2 relative shadow-2xs">
                  {fileList.length > 0 && fileList[0]?.thumbUrl ? (
                    <img 
                      src={fileList[0].thumbUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-300">
                      <PictureOutlined className="text-3xl mb-1 text-gray-300" />
                      <span className="text-[11px] block text-gray-400">Flacon Image Preview</span>
                    </div>
                  )}

                  <span className="absolute top-2.5 left-2.5 text-[9px] font-bold bg-[#18110D] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {liveFamily || 'Haute Perfumerie'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#B8860B] font-bold uppercase tracking-widest block mb-0.5">
                    {liveCategory || 'Signature Collection'}
                  </span>
                  <h4 className="text-sm font-serif font-bold text-[#18110D] truncate m-0">
                    {liveName || 'Perfume Title Preview'}
                  </h4>

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold font-mono text-[#18110D]">
                        ₹{Number(livePrice || 4950).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {Object.keys(sizeStock).slice(0, 3).map(sz => (
                        <span key={sz} className="text-[9px] font-mono bg-white border border-[#E8DFC8] px-1.5 py-0.5 rounded text-gray-600">
                          {sz}
                        </span>
                      ))}
                      {Object.keys(sizeStock).length > 3 && (
                        <span className="text-[9px] font-mono text-gray-400">
                          +{Object.keys(sizeStock).length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </Col>
        </Row>
      </Form>
    </motion.div>
  );
}
