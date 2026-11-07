"use client";
import { useRouter, useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Form, Upload, message } from 'antd';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';
import EditProductHeader from '../../components/EditProductHeader';
import ProductUnifiedForm from '../../components/ProductUnifiedForm';

export default function EditProduct() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Multi-price by quantity / size variants state
  const [variants, setVariants] = useState([]);
  const [tieredPricing, setTieredPricing] = useState([]);

  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const watchedName = Form.useWatch('name', form);

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

      // Parse multi-price variants from database
      const rawSizes = product.sizes_stock || product.sizes;
      const rawPrices = product.size_prices;
      const rawOriginalPrices = product.size_original_prices;

      let parsedSizes = {};
      let parsedPrices = {};
      let parsedOriginalPrices = {};

      try {
        if (rawSizes) {
          parsedSizes = typeof rawSizes === 'string' ? JSON.parse(rawSizes) : rawSizes;
        }
        if (rawPrices) {
          parsedPrices = typeof rawPrices === 'string' ? JSON.parse(rawPrices) : rawPrices;
        }
        if (rawOriginalPrices) {
          parsedOriginalPrices = typeof rawOriginalPrices === 'string' ? JSON.parse(rawOriginalPrices) : rawOriginalPrices;
        }
      } catch (e) {
        console.warn('Error parsing size data:', e);
      }

      let derivedSampleStock = 25;
      const loadedVariants = [];

      if (parsedSizes && typeof parsedSizes === 'object' && !Array.isArray(parsedSizes)) {
        Object.entries(parsedSizes).forEach(([sizeKey, stockVal], idx) => {
          if (sizeKey.toLowerCase().includes('sample') || sizeKey.toLowerCase().includes('2ml')) {
            derivedSampleStock = Number(stockVal) || 25;
          } else {
            loadedVariants.push({
              id: String(idx + 1),
              size: sizeKey,
              price: parsedPrices[sizeKey] !== undefined ? Number(parsedPrices[sizeKey]) : (product.price ?? 4950),
              originalPrice: parsedOriginalPrices[sizeKey] !== undefined ? parsedOriginalPrices[sizeKey] : (product.originalPrice ?? ''),
              stock: Number(stockVal) || 0
            });
          }
        });
      }

      if (loadedVariants.length === 0) {
        loadedVariants.push({
          id: '1',
          size: '50ml',
          price: product.price ?? 4950,
          originalPrice: product.originalPrice ?? '',
          stock: product.stock ?? 25
        });
      }

      setVariants(loadedVariants);

      if (product.tiered_pricing) {
        try {
          const parsedTiers = typeof product.tiered_pricing === 'string' 
            ? JSON.parse(product.tiered_pricing) 
            : product.tiered_pricing;
          if (Array.isArray(parsedTiers)) {
            setTieredPricing(parsedTiers);
          }
        } catch (e) {
          console.warn('Error parsing tiered pricing:', e);
        }
      }

      form.setFieldsValue({
        name: product.name || '',
        samplePrice: product.samplePrice ?? 199,
        sampleStock: derivedSampleStock,
        category_id: product.category_id || product.category || (categories[0]?.id || 'Woody Oriental'),
        description: product.description || ''
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

      const primaryVariant = variants[0] || { size: '50ml', price: 4950, originalPrice: '', stock: 25 };
      formData.append('price', primaryVariant.price || 4950);
      if (primaryVariant.originalPrice) {
        formData.append('originalPrice', primaryVariant.originalPrice);
      }
      formData.append('samplePrice', values.samplePrice !== undefined ? values.samplePrice : 199);
      formData.append('category_id', values.category_id);
      
      const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      formData.append('stock', totalStock);

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
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-8">
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
          isEdit={true}
          onCancel={() => router.push('/admin/products')}
        />
      </Form>
    </div>
  );
}
