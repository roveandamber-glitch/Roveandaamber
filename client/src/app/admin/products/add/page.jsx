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

  const watchedPrice = Form.useWatch('price', form);
  const watchedOriginalPrice = Form.useWatch('originalPrice', form);
  const watchedSamplePrice = Form.useWatch('samplePrice', form);
  const watchedName = Form.useWatch('name', form);
  const watchedStock = Form.useWatch('stock', form);
  const watchedFlaconSize = Form.useWatch('flaconSize', form);

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
      formData.append('price', values.price);
      if (values.originalPrice !== undefined && values.originalPrice !== '' && values.originalPrice !== null) {
        formData.append('originalPrice', values.originalPrice);
      }
      formData.append('samplePrice', values.samplePrice !== undefined ? values.samplePrice : 199);
      formData.append('category_id', values.category_id);
      
      const flaconStock = Number(values.stock) || 0;
      formData.append('stock', flaconStock);

      const flaconSize = (values.flaconSize || '50ml').trim();
      const sampleStock = Number(values.sampleStock) || 25;
      const cleanSizesMap = {
        [flaconSize]: flaconStock,
        '2ml Sample': sampleStock
      };

      formData.append('sizes', JSON.stringify(cleanSizesMap));
      formData.append('sizes_stock', JSON.stringify(cleanSizesMap));
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
        initialValues={{ samplePrice: 199, stock: 25, flaconSize: '50ml', sampleStock: 25 }}
        className="w-full"
      >
        <ProductUnifiedForm
          form={form}
          categories={categories}
          fileList={fileList}
          beforeUpload={beforeUpload}
          handleUploadChange={handleUploadChange}
          loading={loading}
          isEdit={false}
          watchedOriginalPrice={watchedOriginalPrice}
          watchedPrice={watchedPrice}
          watchedSamplePrice={watchedSamplePrice}
          watchedStock={watchedStock}
          watchedFlaconSize={watchedFlaconSize}
          onCancel={() => router.push('/admin/products')}
        />
      </Form>
    </div>
  );
}
