"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  message, 
  Popconfirm, 
  Switch, 
  Tooltip 
} from 'antd';
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Sparkles, 
  Package, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';

const { TextArea } = Input;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCategories();
      if (res?.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    form.setFieldsValue({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      status: cat.status === 'Active'
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const statusStr = values.status ? 'Active' : 'Inactive';
      if (editingCategory) {
        setCategories(prev => prev.map(c => 
          c.id === editingCategory.id ? { ...c, ...values, status: statusStr } : c
        ));
        message.success('Category updated successfully');
      } else {
        const newCat = {
          id: `cat-${Date.now()}`,
          name: values.name,
          slug: values.slug || values.name.toLowerCase().replace(/\s+/g, '-'),
          description: values.description,
          image: '/images/perfumes/gemini_col_men_luxury.jpg',
          itemCount: 0,
          status: statusStr
        };
        setCategories(prev => [newCat, ...prev]);
        message.success('New category created successfully');
      }
      setModalVisible(false);
    } catch (err) {
      // Form validation error
    }
  };

  const handleDelete = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    message.success('Category removed');
  };

  const handleToggleStatus = (id, checked) => {
    setCategories(prev => prev.map(c => 
      c.id === id ? { ...c, status: checked ? 'Active' : 'Inactive' } : c
    ));
    message.success('Category status updated');
  };

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE3D6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1A1A1A] tracking-tight">
              Fragrance Categories
            </h1>
            <span className="text-xs bg-[#EFE8DC] text-[#4A4238] px-2.5 py-0.5 rounded-full font-medium">
              {categories.length} Collections
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Organize perfumes into Men, Women, Unisex, Oud, Amber, and Gift Set collections.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#996515] text-white text-xs font-semibold shadow-sm hover:brightness-105 transition-all w-fit cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl focus:outline-none focus:border-[#B8860B] transition-colors"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => (
          <div 
            key={cat.id}
            className="bg-white rounded-2xl border border-[#EAE3D6] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-44 w-full bg-[#1A120B] overflow-hidden">
                <img 
                  src={getImageUrl(cat.image)} 
                  alt={cat.name}
                  className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = '/hero_perfume.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#DEB368] font-bold">
                      Fragrance Family
                    </span>
                    <h3 className="text-white font-serif font-bold text-lg leading-tight">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="text-xs bg-black/60 backdrop-blur-md text-white/90 px-2.5 py-1 rounded-full font-mono border border-white/20">
                    {cat.itemCount || 0} Flacons
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-[#555] line-clamp-2 leading-relaxed">
                  {cat.description || 'Artisanal perfume formulation crafted with noble natural essences.'}
                </p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2ECE3]">
                  <span className="text-gray-400 font-mono text-[11px]">/{cat.slug || 'category'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500">Status:</span>
                    <Switch 
                      size="small" 
                      checked={cat.status === 'Active'}
                      onChange={(checked) => handleToggleStatus(cat.id, checked)}
                      className={cat.status === 'Active' ? '!bg-[#B8860B]' : ''}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0 flex items-center justify-between gap-2">
              <Link
                href={`/admin/products?category=${encodeURIComponent(cat.name)}`}
                className="text-xs text-[#4A4238] hover:text-[#B8860B] font-medium flex items-center gap-1.5 transition-colors"
              >
                <Package size={14} />
                <span>View Products</span>
              </Link>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-gray-500 hover:text-[#B8860B] hover:bg-[#FAF6F0] rounded-lg border border-transparent hover:border-[#EAE3D6] transition-colors"
                >
                  <Edit3 size={15} />
                </button>
                <Popconfirm
                  title="Delete Category"
                  description="Are you sure? Products in this category will become uncategorized."
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => handleDelete(cat.id)}
                >
                  <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </Popconfirm>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-serif text-base text-[#1A1A1A] pb-2 border-b border-[#EAE3D6]">
            <FolderTree size={18} className="text-[#B8860B]" />
            <span>{editingCategory ? 'Edit Category' : 'Create New Category'}</span>
          </div>
        }
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText={editingCategory ? 'Update Category' : 'Create Category'}
        okButtonProps={{ className: "!bg-[#B8860B] hover:!bg-[#996515] !text-white !border-none" }}
        centered
      >
        <Form form={form} layout="vertical" className="pt-4" initialValues={{ status: true }}>
          <Form.Item
            name="name"
            label={<span className="text-xs font-semibold text-gray-700">Category Name</span>}
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="e.g. Amber Collection" className="rounded-xl py-1.5 text-xs" />
          </Form.Item>

          <Form.Item
            name="slug"
            label={<span className="text-xs font-semibold text-gray-700">URL Slug</span>}
          >
            <Input placeholder="e.g. amber-collection" className="rounded-xl py-1.5 text-xs" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-xs font-semibold text-gray-700">Description</span>}
            rules={[{ required: true, message: 'Please enter category description' }]}
          >
            <TextArea rows={3} placeholder="Describe the fragrance notes and olfactory character..." className="rounded-xl text-xs" />
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-xs font-semibold text-gray-700">Active Status</span>}
            valuePropName="checked"
          >
            <Switch className="!bg-[#B8860B]" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

