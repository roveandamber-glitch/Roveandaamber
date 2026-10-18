"use client";
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Upload, Button, Row, Col, Popconfirm, message, Modal } from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import categoryService from '@/services/categoryService';
import { getImageUrl } from '@/utils/imageHelper';

const AddCategory = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Edit state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm] = Form.useForm();
  const [editFileList, setEditFileList] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  const fetchCategories = async () => {
    setFetching(true);
    try {
      const response = await categoryService.getAllCategories();
      if (response?.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Failed to load categories');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      return message.error('Please upload a category image');
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('image', fileList[0].originFileObj || fileList[0]);

      const response = await categoryService.createCategory(formData);
      if (response?.success) {
        message.success('Category added successfully!');
        form.resetFields();
        setFileList([]);
        fetchCategories();
      } else {
        message.error(response?.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      message.error(error.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const handleDelete = async (id) => {
    try {
      const response = await categoryService.deleteCategory(id);
      if (response?.success) {
        message.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const showEditModal = (cat) => {
    setEditingCategory(cat);
    
    const currentImage = [{
      uid: '-1',
      name: 'category-image.jpg',
      status: 'done',
      url: getImageUrl(cat.image)
    }];
    
    editForm.setFieldsValue({ 
      name: cat.name,
      image: currentImage
    });
    setEditFileList(currentImage);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingCategory(null);
    editForm.resetFields();
    setEditFileList([]);
  };

  const onEditFinish = async (values) => {
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      
      if (editFileList[0] && editFileList[0].originFileObj) {
        formData.append('image', editFileList[0].originFileObj);
      }

      const targetId = editingCategory?.id || editingCategory?._id;
      const response = await categoryService.updateCategory(targetId, formData);
      if (response?.success) {
        message.success('Category updated successfully!');
        handleEditCancel();
        fetchCategories();
      } else {
        message.error(response?.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      message.error(error.response?.data?.message || 'Failed to update category');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-black mb-1">Category Management</h1>
        <p className="text-gray-500 text-sm">Create and manage store categories with name and image.</p>
      </div>

      <Row gutter={32}>
        {/* Left: Add Form */}
        <Col xs={24} lg={8}>
          <Card title={<span className="font-serif">Add New Category</span>} className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl mb-8">
            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Form.Item
                label={<span className="text-xs uppercase tracking-widest font-bold text-gray-500">Category Name</span>}
                name="name"
                rules={[{ required: true, message: 'Please enter category name' }]}
              >
                <Input size="large" placeholder="e.g. Eau de Parfum" className="rounded-xl h-11" />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs uppercase tracking-widest font-bold text-gray-500">Category Image</span>}
                name="image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true, message: 'Please upload a category image' }]}
              >
                <Upload 
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  {fileList.length >= 1 ? null : (
                    <div>
                      <PlusOutlined className="text-gray-400" />
                      <div className="mt-2 text-xs text-gray-400">Upload Image</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                size="large" 
                block 
                className="rounded-full bg-black text-white hover:bg-gray-800 border-0 mt-4 h-11 font-bold text-xs uppercase tracking-wider"
              >
                Add Category
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Right: Existing Categories */}
        <Col xs={24} lg={16}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {fetching ? (
              <div className="col-span-full text-center py-10 text-gray-400">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-400">No categories found. Create one!</div>
            ) : (
              categories.map(cat => (
                <div key={cat.id || cat._id} className="group relative rounded-2xl overflow-hidden bg-[#EFE8DC] aspect-[4/3] p-4 flex flex-col justify-end">
                  <img 
                    src={getImageUrl(cat.image)} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" 
                    onError={(e) => { e.target.src = '/images/perfumes/cat_signature.jpg'; }}
                  />
                  <div className="relative z-10 bg-black/60 backdrop-blur-sm rounded-xl p-3 flex justify-between items-center text-white">
                    <div>
                      <h3 className="font-serif text-sm font-bold text-white">{cat.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="text" 
                        shape="circle" 
                        icon={<EditOutlined />} 
                        className="bg-white/90 hover:bg-white text-black"
                        onClick={() => showEditModal(cat)}
                      />
                      <Popconfirm
                        title="Delete category"
                        description={`Are you sure you want to delete ${cat.name}?`}
                        onConfirm={() => handleDelete(cat.id || cat._id)}
                        okButtonProps={{ className: 'bg-black text-white border-0' }}
                      >
                        <Button type="text" shape="circle" danger icon={<DeleteOutlined />} className="bg-white/90 hover:bg-white" />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Col>
      </Row>

      {/* Edit Category Modal */}
      <Modal
        title={<span className="font-serif text-lg">Edit Category</span>}
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={onEditFinish} requiredMark={false} className="mt-4">
          <Form.Item
            label={<span className="text-xs uppercase tracking-widest font-bold text-gray-500">Category Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input size="large" className="rounded-xl h-11" />
          </Form.Item>

          <Form.Item
            label={<span className="text-xs uppercase tracking-widest font-bold text-gray-500">Category Image</span>}
            name="image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload 
              listType="picture-card"
              fileList={editFileList}
              onChange={({ fileList }) => setEditFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
            >
              {editFileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined className="text-gray-400" />
                  <div className="mt-2 text-xs text-gray-400">Upload New</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={editLoading} 
            size="large" 
            block 
            className="rounded-full bg-black text-white hover:bg-gray-800 border-0 mt-4 h-11 font-bold text-xs uppercase tracking-wider"
          >
            Update Category
          </Button>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default AddCategory;
