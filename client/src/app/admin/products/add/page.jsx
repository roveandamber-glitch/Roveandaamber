"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Upload, Button, Row, Col, message, InputNumber, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, PictureOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import adminService from '@/services/adminService';
import { MOCK_CATEGORIES } from '@/data/adminMockData';

const { Option } = Select;
const DEFAULT_SIZES = ['50ml', '100ml', 'Discovery Set', '30ml'];

const AddProduct = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [sizeStock, setSizeStock] = useState({
    '50ml': 15,
    '100ml': 10,
    'Discovery Set': 5
  });
  const router = useRouter();

  // Total stock calculated dynamically from size inventory
  const totalStock = Object.values(sizeStock).reduce((sum, qty) => sum + (Number(qty) || 0), 0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response?.success && response.data && response.data.length > 0) {
          setCategories(response.data);
        }
      } catch (error) {
        console.warn('Backend categories offline, using default luxury categories.');
      }
    };
    fetchCategories();
  }, []);

  const handleSizeStockChange = (size, value) => {
    setSizeStock(prev => ({
      ...prev,
      [size]: Math.max(0, Number(value) || 0)
    }));
  };

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

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      return message.error('Please upload at least one product image before publishing.');
    }

    if (totalStock <= 0) {
      return message.error('Total product stock must be greater than 0 across sizes.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('price', values.price);
      formData.append('stock', totalStock);
      formData.append('category_id', values.category_id || '');
      formData.append('sizes', JSON.stringify(sizeStock));

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
        message.success('Perfume created successfully!');
        form.resetFields();
        setFileList([]);
        router.push('/admin/products');
      } else {
        message.error(response?.message || 'Failed to create perfume');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      message.error(error.response?.data?.message || 'Failed to create perfume');
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        {/* Compact Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif m-0">Add New Perfume</h1>
            <p className="text-xs text-gray-500 m-0 mt-0.5">Configure perfume details, size inventory, and visual assets in one screen.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button 
              onClick={() => router.push('/admin/products')} 
              className="rounded-full px-5 h-9 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="!bg-[#B8860B] hover:!bg-[#996515] !border-none !rounded-full px-6 h-9 font-bold text-xs uppercase tracking-wider"
            >
              Publish Perfume
            </Button>
          </div>
        </div>

        {/* 2-Column Split: All in One Screen */}
        <Row gutter={20} className="items-stretch">
          
          {/* Left Column: Essential Details & Size Inventory */}
          <Col xs={24} lg={14} className="flex flex-col">
            <Card className="border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-2xl p-5 bg-white flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-3">Perfume Formulation</span>
                
                <Row gutter={16}>
                  {/* Product Name */}
                  <Col xs={24} sm={14}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-gray-700">Perfume Title</span>}
                      name="name"
                      rules={[
                        { required: true, message: 'Product title is required' },
                        { min: 3, message: 'Title must be at least 3 characters' }
                      ]}
                      className="mb-3.5"
                    >
                      <Input placeholder="e.g. Amber Oud Eau de Parfum" className="rounded-xl h-10 text-sm font-serif" />
                    </Form.Item>
                  </Col>

                  {/* Category */}
                  <Col xs={24} sm={10}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-gray-700">Collection</span>}
                      name="category_id"
                      rules={[{ required: true, message: 'Please select a category' }]}
                      className="mb-3.5"
                    >
                      <Select placeholder="Select category" className="h-10 rounded-xl">
                        {categories.map((cat) => (
                          <Option key={cat.id || cat._id} value={cat.id || cat._id}>
                            {cat.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  {/* Price */}
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-gray-700">Price (₹)</span>}
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
                      <Input type="number" min={1} placeholder="4950" className="rounded-xl h-10 text-sm" />
                    </Form.Item>
                  </Col>

                  {/* Total Live Stock Calculated */}
                  <Col xs={24} sm={12}>
                    <div className="mb-3.5">
                      <span className="text-xs font-semibold text-gray-700 block mb-2">Total Calculated Stock</span>
                      <div className="flex items-center justify-between bg-[#F8F7F4] px-3.5 h-10 rounded-xl border border-gray-200">
                        <span className="font-mono font-bold text-sm text-black">{totalStock} Units</span>
                        <span className="text-[10px] text-gray-500 font-medium">Auto-calculated</span>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Size-Wise Stock Inventory Box */}
                <div className="mt-1 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xs font-bold text-black uppercase tracking-wider m-0">Flacon Sizes & Inventory</h4>
                      <p className="text-[11px] text-gray-500 m-0">Define available units per size variant.</p>
                    </div>
                    <Tag color="gold" className="rounded-full px-2.5 py-0.5 font-mono text-[10px] m-0 !text-[#996515] !bg-[#FAF3E0] !border-[#F0DCB1]">
                      {totalStock} in stock
                    </Tag>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {DEFAULT_SIZES.map(size => (
                      <div key={size} className="bg-white p-2 rounded-xl border border-gray-200 text-center shadow-2xs">
                        <span className="font-bold text-xs text-black block mb-1 font-mono">{size}</span>
                        <InputNumber
                          min={0}
                          max={9999}
                          value={sizeStock[size] ?? 0}
                          onChange={val => handleSizeStockChange(size, val)}
                          className="w-full text-center rounded-md text-xs"
                          size="small"
                        />
                        <span className="text-[9px] text-gray-400 block mt-1">
                          {(sizeStock[size] || 0) > 0 ? `${sizeStock[size]} qty` : 'Out'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Column: Product Image Upload with Live Card */}
          <Col xs={24} lg={10} className="flex flex-col mt-4 lg:mt-0">
            <Card className="border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-2xl p-5 bg-white flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Visual Media</span>
                  <span className="text-[10px] text-gray-400">Up to 4 images (1st is cover)</span>
                </div>

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
                        <div className="mt-1 text-[11px] font-semibold text-gray-600">Add Image</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>

                {fileList.length === 0 && (
                  <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
                    <PictureOutlined className="text-2xl text-gray-300 mb-1" />
                    <p className="text-xs text-gray-500 m-0">No images selected</p>
                    <span className="text-[10px] text-gray-400">PNG, JPG, or WEBP under 5MB</span>
                  </div>
                )}
              </div>

              {/* Ready Checklist */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1.5 bg-[#FAF8F5] p-3 rounded-xl">
                <div className="flex items-center justify-between">
                  <span>Image Uploaded:</span>
                  <span className={fileList.length > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                    {fileList.length > 0 ? `✓ ${fileList.length} Image${fileList.length > 1 ? 's' : ''}` : 'Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stock Active:</span>
                  <span className={totalStock > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                    {totalStock > 0 ? `✓ ${totalStock} Units` : 'Required'}
                  </span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </motion.div>
  );
};

export default AddProduct;
