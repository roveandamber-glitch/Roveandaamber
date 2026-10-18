"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Select, Space, Popconfirm, Tag, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

import productService from '@/services/productService';
import { getImageUrl } from '@/utils/imageHelper';

const { Option } = Select;

const ProductsList = () => {
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAllProducts();
      if (response.success) {
        setProducts(response.data.products || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        message.success('Product deleted successfully');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-14 rounded-xl bg-[#EFE8DC] p-1 overflow-hidden flex-shrink-0 flex items-center justify-center">
            <img 
              src={getImageUrl(record.image || (record.images && record.images[0]))} 
              alt={record.name} 
              className="w-full h-full object-contain" 
              onError={(e) => { e.target.src = '/images/perfumes/amber_oud_perfume.jpg'; }}
            />
          </div>
          <span className="font-semibold text-black text-sm">{record.name}</span>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text, record) => (
        <span className="uppercase text-xs font-semibold tracking-wider text-gray-600">
          {text || record.category_name || 'General'}
        </span>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => <span className="font-bold text-black">₹{(text || 0).toLocaleString('en-IN')}</span>
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => <span className="font-mono font-medium">{stock}</span>
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status, record) => {
        const inStock = (record.stock > 0);
        return (
          <Tag color={inStock ? 'green' : 'red'} className="rounded-full px-3 py-1 border-0">
            {inStock ? 'In Stock' : 'Out of Stock'}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Link href={`/admin/products/edit/${record._id || record.id}`}>
            <Button type="text" icon={<EditOutlined />} className="text-gray-600 hover:text-black" />
          </Link>
          <Popconfirm
            title="Delete the product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record._id || record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ className: 'bg-black text-white hover:bg-gray-800 border-0' }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1 font-serif">Products Management</h1>
          <p className="text-gray-500 text-sm">View, edit, and manage your products catalog.</p>
        </div>
        <Link href="/admin/products/add">
          <Button type="primary" size="large" icon={<PlusOutlined />} className="bg-black text-white hover:bg-gray-800 border-0 rounded-full px-6 h-11 font-bold text-xs uppercase tracking-wider">
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl" bodyStyle={{ padding: '24px' }}>
        <div className="flex justify-between items-center mb-6">
          <Input 
            placeholder="Search products by name or category..." 
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-80 rounded-full bg-gray-50 border-transparent hover:border-gray-200 focus:border-black py-2.5"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={products.filter(p => 
            p.name?.toLowerCase().includes(searchText.toLowerCase()) || 
            (p.category && p.category.toLowerCase().includes(searchText.toLowerCase())) ||
            (p.category_name && p.category_name.toLowerCase().includes(searchText.toLowerCase()))
          )} 
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="_id"
          className="border-t border-gray-50"
        />
      </Card>
    </motion.div>
  );
};

export default ProductsList;
