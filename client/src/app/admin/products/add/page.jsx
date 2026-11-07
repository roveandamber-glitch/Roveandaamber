"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Form, Upload, message } from 'antd';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import adminService from '@/services/adminService';
import AddProductHeader from '../components/AddProductHeader';
import ProductUnifiedForm from '../components/ProductUnifiedForm';

export default function AddProduct() {
  const router = useRouter();
  const [form] = Form.useForm();
  
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Multi-price by quantity / size variants state
  const [variants, setVariants] = useState([
    { id: '1', size: '50ml', price: 4950, originalPrice: 5999, stock: 25 },
    { id: '2', size: '100ml', price: 7950, originalPrice: 9499, stock: 15 }
  ]);
  const [tieredPricing, setTieredPricing] = useState([]);

  const watchedName = Form.useWatch('name', form);

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
        console.warn('Backend categories offline, using luxury default.');
      }
    };
    fetchCategories();
  }, [form]);

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

      // Primary selling price and MRP derived from the primary variant
      const primaryVariant = variants[0] || { size: '50ml', price: 4950, originalPrice: '', stock: 25 };
      formData.append('price', primaryVariant.price || 4950);
      if (primaryVariant.originalPrice) {
        formData.append('originalPrice', primaryVariant.originalPrice);
      }
      formData.append('samplePrice', values.samplePrice !== undefined ? values.samplePrice : 199);
      formData.append('category_id', values.category_id);
      
      // Stock allocation across all variants
      const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      formData.append('stock', totalStock);

      // Multi-price maps based on quantity / size
      const sizesStockMap = {};
      const sizePricesMap = {};
      const sizeOriginalPricesMap = {};

      variants.forEach((v) => {
        const sName = (v.size || '50ml').trim();
        sizesStockMap[sName] = Number(v.stock) || 0;
        sizePricesMap[sName] = Number(v.price) || (primaryVariant.price || 4950);
        if (v.originalPrice) {
          sizeOriginalPricesMap[sName] = Number(v.originalPrice);
        }
      });

      // 2ml discovery trial sample
      const sampleStock = Number(values.sampleStock) || 25;
      sizesStockMap['2ml Sample'] = sampleStock;
      sizePricesMap['2ml Sample'] = Number(values.samplePrice) || 199;

      formData.append('sizes', JSON.stringify(sizesStockMap));
      formData.append('sizes_stock', JSON.stringify(sizesStockMap));
      formData.append('size_prices', JSON.stringify(sizePricesMap));
      formData.append('size_original_prices', JSON.stringify(sizeOriginalPricesMap));

      if (tieredPricing.length > 0) {
        formData.append('tiered_pricing', JSON.stringify(tieredPricing));
      }

      if (values.description) formData.append('description', values.description);

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      let response = await adminService.createProduct(formData);
      if (!response?.success) {
        response = await productService.createProduct(formData).catch(() => null);
      }

      if (response?.success || response?.data) {
        message.success('New perfume added to boutique catalog successfully.');
        router.push('/admin/products');
      } else {
        message.error(response?.message || 'Failed to create perfume.');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      message.error('An error occurred while creating the product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-8">
      <AddProductHeader
        name={watchedName}
        loading={loading}
        onCancel={() => router.push('/admin/products')}
        onSave={() => form.submit()}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ samplePrice: 199, sampleStock: 25 }}
        className="w-full"
      >
        <ProductUnifiedForm
          form={form}
          categories={categories}
          fileList={fileList}
          beforeUpload={beforeUpload}
          handleUploadChange={handleUploadChange}
          variants={variants}
          setVariants={setVariants}
          tieredPricing={tieredPricing}
          setTieredPricing={setTieredPricing}
          loading={loading}
          isEdit={false}
          onCancel={() => router.push('/admin/products')}
        />
      </Form>
    </div>
  );
}
