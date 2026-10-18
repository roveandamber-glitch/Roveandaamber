"use client";
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Upload, Button, Row, Col, message, InputNumber, Tag } from 'antd';
import { PlusOutlined, PictureOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import { getImageUrl } from '@/utils/imageHelper';

const { Option } = Select;
const DEFAULT_SIZES = ['50ml', '100ml', 'Discovery Set', '30ml'];

const EditProduct = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sizeStock, setSizeStock] = useState({
    S: 5,
    M: 10,
    L: 8,
    XL: 4,
    XXL: 2
  });
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const totalStock = Object.values(sizeStock).reduce((sum, qty) => sum + (Number(qty) || 0), 0);

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          productService.getProductById(id),
          categoryService.getAllCategories()
        ]);
        
        if (categoryRes?.success && categoryRes.data) {
          setCategories(categoryRes.data);
        }

        if (productRes?.success && productRes.data) {
          const product = productRes.data;
          
          form.setFieldsValue({
            name: product.name,
            price: product.price,
            category_id: product.category_id || product.category,
          });

          if (product.sizes_stock) {
            setSizeStock(product.sizes_stock);
          } else {
            const defQty = Math.max(1, Math.floor((product.stock || 12) / 4));
            setSizeStock({ S: defQty, M: defQty + 2, L: defQty, XL: defQty, XXL: 1 });
          }

          let existingImages = [];
          if (product.images && product.images.length > 0) {
            existingImages = product.images.map((img, idx) => ({
              uid: `-${idx}`,
              name: `image-${idx + 1}.jpg`,
              status: 'done',
              url: getImageUrl(img.url || img)
            }));
          } else if (product.image) {
            existingImages = [{
              uid: '-1',
              name: 'image-1.jpg',
              status: 'done',
              url: getImageUrl(product.image)
            }];
          }
          setFileList(existingImages);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        message.error('Failed to load product details');
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
      return message.error('Product must have at least one image.');
    }

    if (totalStock <= 0) {
      return message.error('Total product stock must be greater than 0.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('price', values.price);
      formData.append('stock', totalStock);
      formData.append('category_id', values.category_id || '');
      formData.append('sizes', JSON.stringify(sizeStock));

      const existingUrls = [];
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        } else if (file.url) {
          existingUrls.push(file.url);
        }
      });

      if (existingUrls.length > 0) {
        formData.append('existingImages', JSON.stringify(existingUrls));
      }

      const response = await productService.updateProduct(id, formData);
      
      if (response?.success) {
        message.success('Product and size inventory updated successfully!');
        router.push('/admin/products');
      } else {
        message.error(response?.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      message.error(error.response?.data?.message || 'Error updating product');
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif m-0">Edit Product</h1>
            <p className="text-xs text-gray-500 m-0 mt-0.5">Modify specifications, size inventory, and product images.</p>
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
              className="bg-black hover:bg-gray-800 border-0 rounded-full px-6 h-9 font-bold text-xs uppercase tracking-wider"
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* 2-Column Split: All in One Screen */}
        <Row gutter={20} className="items-stretch">
          
          {/* Left Column: Essential Details & Size Inventory */}
          <Col xs={24} lg={14} className="flex flex-col">
            <Card className="border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-2xl p-5 bg-white flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-3">Product Specification</span>
                
                <Row gutter={16}>
                  {/* Product Name */}
                  <Col xs={24} sm={14}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-gray-700">Product Title</span>}
                      name="name"
                      rules={[
                        { required: true, message: 'Product title is required' },
                        { min: 3, message: 'Title must be at least 3 characters' }
                      ]}
                      className="mb-3.5"
                    >
                      <Input placeholder="e.g. Amber Oud Eau de Parfum" className="rounded-xl h-10 text-sm" />
                    </Form.Item>
                  </Col>

                  {/* Category */}
                  <Col xs={24} sm={10}>
                    <Form.Item
                      label={<span className="text-xs font-semibold text-gray-700">Category</span>}
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
                      <Input type="number" min={1} placeholder="2999" className="rounded-xl h-10 text-sm" />
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
                      <h4 className="text-xs font-bold text-black uppercase tracking-wider m-0">Size-Wise Stock Inventory</h4>
                      <p className="text-[11px] text-gray-500 m-0">Manage real-time inventory quantity per size.</p>
                    </div>
                    <Tag color="black" className="rounded-full px-2.5 py-0.5 font-mono text-[10px] m-0">
                      {totalStock} in stock
                    </Tag>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
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
                  <span className="text-[10px] text-gray-400">Up to 6 images (1st is cover)</span>
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
                    maxCount={6}
                    className="compact-uploader"
                  >
                    {fileList.length < 6 && (
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
                    <p className="text-xs text-gray-500 m-0">No images uploaded</p>
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

export default EditProduct;
