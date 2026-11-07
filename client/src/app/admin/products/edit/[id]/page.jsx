"use client";
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Form, Upload, message } from 'antd';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';
import EditProductHeader from '../../components/EditProductHeader';
import ProductFormDetails from '../../components/ProductFormDetails';
import ProductFormSidebar from '../../components/ProductFormSidebar';

const EditProduct = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const watchedPrice = Form.useWatch('price', form);
  const watchedOriginalPrice = Form.useWatch('originalPrice', form);
  const watchedSamplePrice = Form.useWatch('samplePrice', form);
  const watchedName = Form.useWatch('name', form);
  const watchedStock = Form.useWatch('stock', form);
  const watchedFlaconSize = Form.useWatch('flaconSize', form);

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
        console.warn('API lookup fallback.');
      }

      if (!product) {
        message.error('Product not found in database.');
        return;
      }

      // Deduplicate sizes and extract single main flacon size
      let derivedSize = '50ml';
      let derivedStock = product.stock !== undefined ? Number(product.stock) : 22;
      let derivedSampleStock = 25;

      const rawSizes = product.sizes_stock || product.sizes;
      if (rawSizes) {
        try {
          const parsed = typeof rawSizes === 'string' ? JSON.parse(rawSizes) : rawSizes;
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const entries = Object.entries(parsed);
            const flaconEntry = entries.find(([k]) => !k.toLowerCase().includes('sample') && !k.toLowerCase().includes('2ml'));
            if (flaconEntry) {
              derivedSize = flaconEntry[0];
              if (flaconEntry[1] > 0 || product.stock === undefined) {
                derivedStock = Number(flaconEntry[1]) || 0;
              }
            }
            const sampleEntry = entries.find(([k]) => k.toLowerCase().includes('sample') || k.toLowerCase().includes('2ml'));
            if (sampleEntry) {
              derivedSampleStock = Number(sampleEntry[1]) || 25;
            }
          }
        } catch (e) {
          console.warn('Error parsing sizes:', e);
        }
      }

      form.setFieldsValue({
        name: product.name || '',
        originalPrice: product.originalPrice ?? '',
        price: product.price ?? 4950,
        samplePrice: product.samplePrice ?? 199,
        stock: derivedStock,
        flaconSize: derivedSize,
        sampleStock: derivedSampleStock,
        category_id: product.category_id || product.category || (categories[0]?.id || 'Woody Oriental'),
        description: product.description || '',
        sku: product.sku || 'RM-001'
      });

      const existingImages = product.images && product.images.length > 0
        ? product.images
        : (product.image ? [{ url: product.image }] : []);

      if (existingImages.length > 0) {
        setFileList(existingImages.map((img, idx) => ({
          uid: `-${idx + 1}`,
          name: `flacon-${idx + 1}.jpg`,
          status: 'done',
          url: getImageUrl(typeof img === 'string' ? img : img.url)
        })));
      } else {
        setFileList([{
          uid: '-1',
          name: 'perfume-flacon.jpg',
          status: 'done',
          url: getImageUrl('/images/no-image.jpg')
        }]);
      }
    };

    if (id) {
      fetchProductAndCategories();
    }
  }, [id, form]);

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

      // Clean unified size map with zero duplicate variants
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
        } else if (file.url && !file.url.includes('no-image.jpg')) {
          formData.append('existingImages', file.url);
        }
      });

      let response = await adminService.updateProduct(id, formData);
      if (!response?.success) {
        response = await productService.updateProduct(id, formData).catch(() => null);
      }

      if (response?.success || response?.data) {
        message.success('Perfume formulation & pricing updated successfully.');
        router.push('/admin/products');
      } else {
        message.error(response?.message || 'Failed to update perfume.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      message.error('An error occurred while updating the product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3 pb-4">
      <EditProductHeader
        id={id}
        name={watchedName}
        loading={loading}
        onCancel={() => router.push('/admin/products')}
        onSave={() => form.submit()}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ samplePrice: 199, stock: 22, flaconSize: '50ml', sampleStock: 25 }}
        className="w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          <div className="lg:col-span-7 space-y-3">
            <ProductFormDetails
              form={form}
              categories={categories}
              watchedOriginalPrice={watchedOriginalPrice}
              watchedPrice={watchedPrice}
              watchedFlaconSize={watchedFlaconSize}
              watchedStock={watchedStock}
              watchedSamplePrice={watchedSamplePrice}
            />
          </div>

          <div className="lg:col-span-5 space-y-3">
            <ProductFormSidebar
              fileList={fileList}
              beforeUpload={beforeUpload}
              handleUploadChange={handleUploadChange}
              watchedOriginalPrice={watchedOriginalPrice}
              watchedPrice={watchedPrice}
              watchedSamplePrice={watchedSamplePrice}
              watchedStock={watchedStock}
              loading={loading}
            />
          </div>
        </div>
      </Form>
    </div>
  );
};

export default EditProduct;
