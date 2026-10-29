"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  App,
  Modal, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Spin
} from 'antd';
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Package, 
  RefreshCw,
  ImageOff
} from 'lucide-react';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';
import { CommonImageUpload, CommonDelete } from '@/components/common';

const { TextArea } = Input;

function CategoriesContent() {
  const { message } = App.useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Add / Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Common Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const resetImageState = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setSlugManuallyEdited(false);
    resetImageState();
    form.resetFields();
    form.setFieldsValue({ status: true });
    setModalVisible(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setSlugManuallyEdited(true);
    resetImageState();

    form.setFieldsValue({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      status: cat.status === 'Active'
    });

    if (cat.image) {
      setPreviewUrl(cat.image);
    }

    setModalVisible(true);
  };

  // Auto slug generation from Name
  const handleNameChange = (e) => {
    const newName = e.target.value;
    if (!slugManuallyEdited && !editingCategory) {
      const generatedSlug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      form.setFieldsValue({ slug: generatedSlug });
    }
  };

  const handleImageChange = (file, objectUrl) => {
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const statusStr = values.status ? 'Active' : 'Inactive';
      const catId = editingCategory?.id || editingCategory?._id;

      let finalImagePath = '';

      // If user selected a new local image file, upload it to the server
      if (selectedFile) {
        try {
          const uploadRes = await adminService.uploadCategoryImage(selectedFile);
          if (uploadRes?.imageUrl || uploadRes?.url) {
            finalImagePath = uploadRes.imageUrl || uploadRes.url;
          }
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          message.error('Failed to upload image file. Please try again.');
          setSaving(false);
          return;
        }
      } else if (editingCategory && previewUrl) {
        finalImagePath = previewUrl;
      } else {
        finalImagePath = '';
      }

      const payload = {
        name: values.name.trim(),
        slug: values.slug ? values.slug.trim().toLowerCase() : values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: values.description ? values.description.trim() : '',
        image: finalImagePath,
        status: statusStr
      };

      if (editingCategory) {
        const updateRes = await adminService.updateCategory(catId, payload);
        if (updateRes?.success || updateRes?.data) {
          message.success('Category updated successfully');
        } else {
          message.success('Category updated');
        }
      } else {
        const createRes = await adminService.createCategory(payload);
        if (createRes?.success || createRes?.data) {
          message.success('Category created successfully');
        } else {
          message.success('New category created');
        }
      }

      await fetchCategories();
      setModalVisible(false);
    } catch (err) {
      if (err?.errorFields) {
        return;
      }
      console.error('Save category error:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save category';
      message.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // Open common delete modal
  const handleOpenDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  // Execute delete through common confirmation modal
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    const catId = categoryToDelete.id || categoryToDelete._id;
    const catName = categoryToDelete.name;
    setDeleting(true);

    try {
      await adminService.deleteCategory(catId);
      message.success(`Category "${catName}" deleted successfully.`);
      setCategories(prev => prev.filter(c => (c.id !== catId && c._id !== catId)));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Delete category error:', err);
      message.error(err?.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (id, checked) => {
    const newStatus = checked ? 'Active' : 'Inactive';
    setCategories(prev => prev.map(c => 
      (c.id === id || c._id === id) ? { ...c, status: newStatus } : c
    ));
    try {
      await adminService.toggleCategoryStatus(id, newStatus);
      message.success(`Category ${newStatus.toLowerCase()} successfully`);
    } catch (err) {
      console.error('Toggle status error:', err);
      message.error('Failed to update category status');
      fetchCategories();
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchText.toLowerCase()) ||
    c.slug?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6 text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Fragrance Categories
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              {categories.length} Collections
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Organize perfumes into Men, Women, Unisex, Oud, Amber, and Gift Set collections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] text-[#1B100A] text-xs font-semibold shadow-sm hover:brightness-105 transition-all w-fit cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Category</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories by name or notes..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl focus:outline-none focus:border-[#D4A64A] transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={fetchCategories}
          title="Refresh list"
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#D4A64A] px-3 py-1.5 rounded-xl border border-[#E8DFC8] hover:border-[#D4A64A] transition-colors bg-[#FAF7F2] cursor-pointer ml-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <p className="text-xs text-gray-500 font-serif">Loading fragrance categories from database...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DFC8] p-8">
          <FolderTree size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-serif text-base text-[#1B100A] font-medium">No fragrance categories found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchText ? `No categories match "${searchText}". Try a different keyword.` : 'Start organizing your luxury perfumes by creating your first category.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] text-[#1B100A] text-xs font-semibold shadow-sm hover:brightness-105 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Create New Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => {
            const catId = cat.id || cat._id;
            const hasImage = Boolean(cat.image && cat.image.trim() !== '');

            return (
              <div 
                key={catId}
                className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image banner with professional No Image fallback */}
                  <div className="relative h-44 w-full bg-[#1B100A] overflow-hidden">
                    <img 
                      src={getImageUrl(cat.image, '/images/no-image.jpg')} 
                      alt={cat.name}
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/images/no-image.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between pointer-events-none">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#D4A64A] font-bold">
                          Fragrance Family
                        </span>
                        <h3 className="text-white font-serif font-medium text-lg leading-tight">
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
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E8DFC8]/60">
                      <span className="text-gray-400 font-mono text-[11px]">/{cat.slug || 'category'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500">Status:</span>
                        <Switch 
                          size="small" 
                          checked={cat.status === 'Active'}
                          onChange={(checked) => handleToggleStatus(catId, checked)}
                          className={cat.status === 'Active' ? '!bg-[#D4A64A]' : ''}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/products?category=${encodeURIComponent(cat.name)}`}
                    className="text-xs text-[#1B100A] hover:text-[#D4A64A] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Package size={14} />
                    <span>View Products</span>
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      title="Edit Category"
                      className="p-1.5 text-gray-500 hover:text-[#D4A64A] hover:bg-[#FAF7F2] rounded-lg border border-transparent hover:border-[#E8DFC8] transition-colors cursor-pointer"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleOpenDelete(cat)}
                      title="Delete Category"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-serif text-base text-[#1B100A] pb-2 border-b border-[#E8DFC8]">
            <FolderTree size={18} className="text-[#D4A64A]" />
            <span>{editingCategory ? 'Edit Category' : 'Create New Category'}</span>
          </div>
        }
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText={editingCategory ? (saving ? 'Updating...' : 'Update Category') : (saving ? 'Creating...' : 'Create Category')}
        confirmLoading={saving}
        okButtonProps={{ 
          className: "!bg-[#D4A64A] hover:!bg-[#B38728] !text-[#1B100A] !font-semibold !border-none !shadow-sm",
          disabled: saving
        }}
        centered
        width={520}
      >
        <Form form={form} layout="vertical" className="pt-3" initialValues={{ status: true }}>
          {/* Category Name */}
          <Form.Item
            name="name"
            label={<span className="text-xs font-semibold text-gray-700">Category Name *</span>}
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input 
              placeholder="e.g. Amber Collection" 
              onChange={handleNameChange}
              className="rounded-xl py-2 text-xs" 
            />
          </Form.Item>

          {/* URL Slug */}
          <Form.Item
            name="slug"
            label={
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-gray-700">URL Slug</span>
                <span className="text-[10px] text-gray-400 font-normal">Auto-generated from name</span>
              </div>
            }
          >
            <Input 
              placeholder="e.g. amber-collection" 
              onChange={() => setSlugManuallyEdited(true)}
              className="rounded-xl py-2 text-xs font-mono" 
            />
          </Form.Item>

          {/* Common Luxury Image Upload Component */}
          <div className="mb-4">
            <CommonImageUpload
              value={previewUrl}
              file={selectedFile}
              onChange={handleImageChange}
              onRemove={handleRemoveImage}
              label="Category Image"
              required={false}
              placeholderText="Click to upload category image or drag & drop here"
              subText="PNG, JPG, or WEBP up to 10MB"
            />
          </div>

          {/* Description */}
          <Form.Item
            name="description"
            label={<span className="text-xs font-semibold text-gray-700">Description *</span>}
            rules={[{ required: true, message: 'Please enter category description' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Describe the fragrance notes, olfactory family, and artisanal character..." 
              className="rounded-xl text-xs py-2" 
            />
          </Form.Item>

          {/* Active Status */}
          <Form.Item
            name="status"
            label={<span className="text-xs font-semibold text-gray-700">Active Status</span>}
            valuePropName="checked"
          >
            <Switch className="!bg-[#B8860B]" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Common Professional Delete Confirmation Modal */}
      <CommonDelete
        open={deleteModalOpen}
        onCancel={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Fragrance Category"
        itemName={categoryToDelete?.name}
        itemType="fragrance category"
        description="Are you sure you want to delete this category? Any perfumes associated with this category will become uncategorized. This action cannot be undone."
        confirmText="Delete Category"
        loading={deleting}
      />
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <App>
      <CategoriesContent />
    </App>
  );
}
