"use client";
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Upload, Button, Row, Col, message, InputNumber, Tag, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, PictureOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import adminService from '@/services/adminService';

import { getImageUrl } from '@/utils/imageHelper';

const { Option } = Select;

const EditProduct = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sizeStock, setSizeStock] = useState({
    '50ml': 12,
    '100ml': 8,
    'Discovery Set': 5
  });
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customQtyInput, setCustomQtyInput] = useState(10);
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const totalStock = Object.values(sizeStock).reduce((sum, qty) => sum + (Number(qty) || 0), 0);

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      let product = null;
      try {
        const [productRes, categoryRes] = await Promise.all([
          productService.getProductById(id).catch(() => null),
          categoryService.getAllCategories().catch(() => null)
        ]);
        
        if (categoryRes?.success && categoryRes.data) {
          setCategories(categoryRes.data);
        }

        if (productRes?.success && productRes.data) {
          product = productRes.data;
        }
      } catch (e) {
        console.warn('API error, using mock product lookup.');
      }

      if (!product) {
        message.error('Product not found in database.');
        return;
      }

      if (product) {
        form.setFieldsValue({
          name: product.name,
          price: product.price,
          category_id: product.category_id || product.category || 'Woody Oriental',
          description: product.description || 'Artisanal perfume formulation crafted with noble natural essences.',
          fragrance_family: product.category || 'Woody Oriental',
          sku: product.sku || 'RM-001'
        });

        if (product.sizes_stock && typeof product.sizes_stock === 'object') {
          setSizeStock(product.sizes_stock);
        } else if (product.sizes) {
          try {
            const parsed = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              setSizeStock(parsed);
            } else if (Array.isArray(parsed)) {
              const map = {};
              parsed.forEach(s => { map[s] = 10; });
              setSizeStock(map);
            }
          } catch (e) {}
        }

        const existingImg = product.image || (product.images && product.images[0]) || '/images/no-image.jpg';
        setFileList([{
          uid: '-1',
          name: 'perfume-flacon.jpg',
          status: 'done',
          url: getImageUrl(existingImg)
        }]);
      }
    };

    if (id) {
      fetchProductAndCategories();
    }
  }, [id, form]);

  const handleSizeStockChange = (size, value) => {
    setSizeStock(prev => ({
      ...prev,
      [size]: Math.max(0, Number(value) || 0)
    }));
  };

  const handleAddCustomSize = (sizeName, initialQty = 10) => {
    const trimmed = (sizeName || '').trim();
    if (!trimmed) {
      message.warning('Please enter a size name (e.g. 30ml, 50ml, 100ml, 200ml).');
      return;
    }
    if (sizeStock[trimmed] !== undefined) {
      message.info(`Size "${trimmed}" already exists.`);
      return;
    }
    setSizeStock(prev => ({
      ...prev,
      [trimmed]: Math.max(0, Number(initialQty) || 0)
    }));
    setCustomSizeInput('');
    message.success(`Added ${trimmed} flacon size option`);
  };

  const handleRemoveSize = (sizeToRemove) => {
    if (Object.keys(sizeStock).length <= 1) {
      message.warning('A perfume product must have at least one flacon size option.');
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
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('price', values.price);
      formData.append('category_id', values.category_id);
      formData.append('stock', totalStock);
      formData.append('sizes', JSON.stringify(sizeStock));
      formData.append('sizes_stock', JSON.stringify(sizeStock));
      if (values.description) formData.append('description', values.description);

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      const response = await adminService.updateProduct(id, formData);
      if (response.success) {
        message.success('Perfume updated successfully');
        router.push('/admin/products');
      } else {
        message.error(response.message || 'Failed to update perfume');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      message.error('An error occurred while updating the product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Edit Perfume Flacon</h1>
          <p className="text-xs text-gray-500 mt-1">Modify fragrance notes, bottle sizes, stock allocation, and pricing.</p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
              <h3 className="font-serif font-bold text-sm text-[#1A1A1A] pb-2 border-b border-[#EAE3D6]">
                General Fragrance Details
              </h3>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-700">Perfume Name</span>}
                name="name"
                rules={[{ required: true, message: 'Please enter perfume name' }]}
              >
                <Input placeholder="e.g. Royal Elegance Eau de Parfum" className="rounded-xl py-1.5 text-xs font-serif" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Base Price (₹)</span>}
                  name="price"
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <InputNumber min={0} className="w-full rounded-xl py-1" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Category</span>}
                  name="category_id"
                  rules={[{ required: true, message: 'Select fragrance collection' }]}
                >
                  <Select className="text-xs">
                    {categories.map((c) => (
                      <Option key={c.id || c._id} value={c.id || c._id}>
                        {c.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-700">Olfactory Description</span>}
                name="description"
              >
                <Input.TextArea rows={4} placeholder="Top notes, heart notes, dry down..." className="rounded-xl text-xs" />
              </Form.Item>
            </div>

            {/* Custom Flacon Sizes & Inventory Allocation */}
            {/* Custom Flacon Sizes & Inventory Allocation Box */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#E2D6C0] shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DFC8]">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#1B100A] uppercase tracking-wider m-0 flex items-center gap-2">
                    <span>Flacon Sizes & Inventory Allocation</span>
                    <span className="text-[10px] font-sans font-semibold bg-[#B3874B]/15 text-[#6B4B18] px-2 py-0.5 rounded-md border border-[#B3874B]/30">
                      Live Catalog
                    </span>
                  </h3>
                  <p className="text-xs text-stone-600 m-0 mt-0.5">
                    Customize available ML bottle sizes and specify inventory quantity per variant.
                  </p>
                </div>
                <div className="bg-[#1B100A] text-[#FAF7F2] px-3.5 py-1 rounded-full font-mono text-xs font-bold shadow-xs">
                  {totalStock} Total Flacons
                </div>
              </div>

              {/* 2ml Sample Guarantee Guidance Banner */}
              <div className="bg-amber-50/90 border-2 border-amber-300/80 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
                <span className="text-base leading-none mt-0.5">🛡️</span>
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-950 m-0">
                    2ml Companion Sample & Return/Cancellation Guarantee
                  </p>
                  <p className="text-[11px] text-amber-900 leading-relaxed m-0">
                    Adding a <strong>2ml Sample</strong> variant allows patrons to test the formulation at home. Under boutique policy, patrons who buy the 2ml sample are eligible to <strong>cancel their order</strong> before dispatch or <strong>return the sealed flacon</strong> within 7 days for a 100% full refund. Orders without the 2ml sample are final sales.
                  </p>
                </div>
              </div>

              {/* Active Sizes Grid */}
              <div>
                <span className="text-xs font-bold text-[#1B100A] block mb-2 uppercase tracking-wide">
                  Active Variants in Formulation ({Object.keys(sizeStock).length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(sizeStock).map(([size, qty]) => {
                    const isSample = size.toLowerCase().includes('2ml') || size.toLowerCase().includes('sample');
                    return (
                      <div 
                        key={size} 
                        className={`p-3.5 rounded-xl border-2 transition-all shadow-xs flex flex-col justify-between ${
                          isSample 
                            ? 'bg-amber-50/60 border-amber-400 ring-1 ring-amber-300' 
                            : 'bg-[#FAF7F2] border-[#D8C7A5]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-[#1B100A] font-mono">
                              {size}
                            </span>
                            {isSample && (
                              <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                ★ Sample Vial
                              </span>
                            )}
                          </div>
                          {Object.keys(sizeStock).length > 1 && (
                            <Popconfirm
                              title={`Remove ${size} variant?`}
                              onConfirm={() => handleRemoveSize(size)}
                              okText="Remove"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true, size: 'small' }}
                              cancelButtonProps={{ size: 'small' }}
                            >
                              <button
                                type="button"
                                className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer"
                                title={`Remove ${size}`}
                              >
                                <DeleteOutlined className="text-xs" />
                              </button>
                            </Popconfirm>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-stone-600">
                            <span>Units in Stock:</span>
                            <span className="font-mono font-bold text-[#1B100A]">{qty || 0}</span>
                          </div>
                          <InputNumber
                            min={0}
                            max={99999}
                            value={qty}
                            onChange={(val) => handleSizeStockChange(size, val)}
                            className="w-full text-center rounded-lg text-xs font-mono font-bold border-stone-300"
                            placeholder="Quantity"
                          />
                          <span className={`text-[10px] block font-medium ${
                            (qty || 0) > 0 ? 'text-emerald-700' : 'text-rose-600 font-bold'
                          }`}>
                            {(qty || 0) > 0 ? `✓ ${qty} in inventory` : '⚠ Out of stock'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom ML Size Option */}
              <div className="pt-3 border-t-2 border-[#E8DFC8] space-y-2.5">
                <span className="text-xs font-bold text-[#1B100A] block uppercase tracking-wide">
                  Add Custom Flacon Size Variant:
                </span>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <Input
                    placeholder="e.g. 2ml Sample, 30ml, 50ml, 100ml, 200ml, Discovery Set"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onPressEnter={() => handleAddCustomSize(customSizeInput, customQtyInput)}
                    className="rounded-xl text-xs py-2 flex-1 border-2 border-stone-300 font-medium"
                  />
                  <div className="flex items-center gap-1.5 shrink-0 bg-white px-2.5 py-1 rounded-xl border-2 border-stone-300">
                    <span className="text-xs text-stone-600 font-bold">Qty:</span>
                    <InputNumber
                      min={0}
                      max={9999}
                      value={customQtyInput}
                      onChange={(v) => setCustomQtyInput(v || 0)}
                      className="w-16 rounded-lg text-xs font-mono font-bold border-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddCustomSize(customSizeInput, customQtyInput)}
                    className="bg-[#B3874B] hover:bg-[#8C6D1F] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <PlusOutlined />
                    <span>Add Size</span>
                  </button>
                </div>

                {/* Quick Presets (High Visibility) */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#1B100A] block mb-2">
                    Quick Add Presets (Click to add to formulation):
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {['2ml Sample', '30ml', '50ml', '100ml', '200ml', 'Discovery Set'].map((preset) => {
                      const isAdded = sizeStock[preset] !== undefined;
                      const isSamplePreset = preset === '2ml Sample';

                      if (isAdded) {
                        return (
                          <div
                            key={preset}
                            className="bg-emerald-50 text-emerald-900 border-2 border-emerald-500 font-bold text-xs px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 select-none"
                          >
                            <span className="text-emerald-700 font-extrabold text-sm">✓</span>
                            <span>{preset} Added</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleAddCustomSize(preset, preset === '2ml Sample' ? 50 : 10)}
                          className={`text-xs px-3.5 py-1.5 rounded-xl border-2 font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 ${
                            isSamplePreset
                              ? 'bg-amber-100/80 text-amber-950 border-amber-500 hover:bg-amber-500 hover:text-white'
                              : 'bg-white text-[#3B2914] border-[#B3874B] hover:bg-[#B3874B] hover:text-white'
                          }`}
                        >
                          <span className="font-extrabold">+</span>
                          <span>{preset}</span>
                          {isSamplePreset && <span className="text-[10px] ml-1 opacity-90">✨ Guarantee</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Images */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
              <h3 className="font-serif font-bold text-sm text-[#1A1A1A] pb-2 border-b border-[#EAE3D6]">
                Perfume Imagery
              </h3>

              <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={handleUploadChange}
                maxCount={4}
              >
                {fileList.length < 4 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }} className="text-xs">Add Image</div>
                  </div>
                )}
              </Upload>
              <p className="text-[11px] text-gray-400">
                Recommended: 1000x1200px portrait ratio with studio lighting.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="!bg-[#B8860B] hover:!bg-[#996515] !text-white !rounded-xl !h-11 flex-1 text-xs font-semibold !border-none"
              >
                Update Perfume
              </Button>
              <Button
                onClick={() => router.push('/admin/products')}
                className="!rounded-xl !h-11 px-5 text-xs font-semibold border-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default EditProduct;
