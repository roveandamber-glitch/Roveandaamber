"use client";
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Modal, 
  Form, 
  InputNumber, 
  Switch, 
  message, 
  Tooltip 
} from 'antd';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Calendar, 
  Percent, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  Search,
  Copy,
  Filter
} from 'lucide-react';
import adminService from '@/services/adminService';
import { CustomDatePicker, showLuxuryDeleteModal } from '@/components/common';

const { Option } = Select;

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCoupons();
      if (res?.data && Array.isArray(res.data)) {
        setCoupons(res.data);
      } else if (Array.isArray(res)) {
        setCoupons(res);
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
      message.error(err?.response?.data?.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    form.resetFields();
    // Default expiry 30 days from today
    const defaultExp = new Date();
    defaultExp.setDate(defaultExp.getDate() + 30);
    const defaultExpStr = defaultExp.toISOString().split('T')[0];

    form.setFieldsValue({
      discountType: 'percentage',
      discountValue: 20,
      isActive: true,
      usageLimit: 500,
      minOrderAmount: 3000,
      expiryDate: defaultExpStr
    });
    setModalOpen(true);
  };

  const handleCreateCoupon = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const cleanCode = values.code.trim().toUpperCase();

      // Client pre-validation: check duplicate code
      const isDuplicate = coupons.some(
        c => c.code && c.code.toUpperCase() === cleanCode
      );
      if (isDuplicate) {
        message.error(`Coupon code "${cleanCode}" already exists. Please choose a unique code.`);
        setSubmitting(false);
        return;
      }

      // Client pre-validation: check expiry date not in past
      if (values.expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(values.expiryDate);
        selected.setHours(0, 0, 0, 0);
        if (selected < today) {
          message.error('Coupon expiry date cannot be in the past.');
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        code: cleanCode,
        description: values.description?.trim() || '',
        discountType: values.discountType || 'percentage',
        discountValue: Number(values.discountValue),
        minOrderAmount: Number(values.minOrderAmount) || 0,
        usageLimit: Number(values.usageLimit) || 100,
        expiryDate: values.expiryDate || '',
        isActive: values.isActive ?? true
      };

      const res = await adminService.createCoupon(payload);
      message.success(`Privilege coupon "${cleanCode}" created successfully.`);
      form.resetFields();
      setModalOpen(false);

      // Refresh real list from server
      await fetchCoupons();
    } catch (err) {
      console.error('Coupon creation error:', err);
      if (err?.errorFields) {
        return; // AntD Form already displays inline field errors
      }
      message.error(err?.response?.data?.message || err?.message || 'Failed to create promotional coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, checked) => {
    try {
      await adminService.updateCoupon(id, { isActive: checked });
      setCoupons(prev => prev.map(c => 
        (c.id === id || c._id === id) ? { ...c, isActive: checked } : c
      ));
      message.success('Coupon status updated');
    } catch (err) {
      console.error('Failed to update status:', err);
      message.error(err?.response?.data?.message || 'Failed to update coupon status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id && c._id !== id));
      message.success('Coupon removed successfully');
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      message.error(err?.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    message.success(`Code ${code} copied to clipboard!`);
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesDate = !filterDate || c.expiryDate === filterDate;
    return matchesSearch && matchesDate;
  });

  const columns = [
    {
      title: 'Privilege Code',
      dataIndex: 'code',
      key: 'code',
      width: 170,
      render: (code) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-[#1B100A] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E8DFC8] tracking-wider">
            {code}
          </span>
          <Tooltip title="Copy code">
            <button 
              type="button"
              onClick={() => handleCopyCode(code)}
              className="p-1 text-gray-400 hover:text-[#D4A64A] transition-colors cursor-pointer"
            >
              <Copy size={13} />
            </button>
          </Tooltip>
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <span className="text-xs text-gray-700 truncate max-w-[200px] inline-block font-medium">
          {text || 'Privilege discount voucher'}
        </span>
      )
    },
    {
      title: 'Privilege Benefit',
      key: 'benefit',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#B8860B]">
          {record.discountType === 'percentage' ? (
            <>
              <Percent size={13} className="text-[#D4A64A]" />
              <span>{record.discountValue}% OFF</span>
            </>
          ) : (
            <>
              <Coins size={13} className="text-[#D4A64A]" />
              <span>₹{Number(record.discountValue || 0).toLocaleString('en-IN')} OFF</span>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Min. Spend',
      dataIndex: 'minOrderAmount',
      key: 'minOrderAmount',
      width: 120,
      render: (val) => (
        <span className="text-xs font-semibold text-gray-600">
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'Redemptions',
      key: 'redemptions',
      width: 130,
      render: (_, record) => {
        const used = record.usedCount || 0;
        const total = record.usageLimit || 100;
        const pct = Math.min(100, Math.round((used / total) * 100));
        return (
          <div className="w-full max-w-[100px]">
            <div className="flex justify-between text-[11px] mb-1 font-mono">
              <span className="font-semibold text-gray-700">{used}</span>
              <span className="text-gray-400">/ {total}</span>
            </div>
            <div className="w-full bg-[#FAF7F2] border border-[#E8DFC8] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#D4A64A] to-[#B38728] h-full rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 140,
      render: (val) => (
        <span className="text-xs font-mono font-medium text-gray-600 flex items-center gap-1.5 whitespace-nowrap">
          <Calendar size={13} className="text-[#D4A64A]" />
          {val || 'No Expiry'}
        </span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (active, record) => (
        <Switch 
          checked={active}
          onChange={(checked) => handleToggleStatus(record.id || record._id, checked)}
          className="!bg-[#B8860B]"
          size="small"
        />
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      align: 'right',
      render: (_, record) => (
        <button
          type="button"
          onClick={() => {
            showLuxuryDeleteModal({
              title: 'Remove Privilege Coupon',
              itemName: record.code,
              itemType: 'privilege coupon code',
              description: `Are you sure you want to delete privilege code "${record.code}"? Customers will no longer be able to apply this discount at checkout.`,
              confirmText: 'Remove Coupon',
              onConfirm: () => handleDelete(record.id || record._id)
            });
          }}
          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          title="Remove Coupon"
        >
          <Trash2 size={15} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Discounts & Promotional Codes
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              {coupons.length} Active Vouchers
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Create promotional privilege codes, seasonal fragrance campaigns, and VIP redemption vouchers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] text-[#1B100A] text-xs font-semibold shadow-sm hover:brightness-105 transition-all w-fit cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Search and Custom Date Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl focus:outline-none focus:border-[#D4A64A] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="w-full md:w-56">
            <CustomDatePicker 
              value={filterDate}
              onChange={setFilterDate}
              placeholder="Filter by Expiry Date"
              showPresets={true}
            />
          </div>
          {filterDate && (
            <button
              type="button"
              onClick={() => setFilterDate('')}
              className="text-xs text-rose-600 hover:text-rose-800 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 font-medium whitespace-nowrap cursor-pointer transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <Table 
          columns={columns}
          dataSource={filteredCoupons.map((c, idx) => ({ ...c, key: c.id || c._id || idx }))}
          loading={loading}
          scroll={{ x: 920 }}
          pagination={{ 
            pageSize: 7, 
            showSizeChanger: false,
            className: "!px-4 !mb-4 text-xs"
          }}
          className="admin-luxury-table"
        />
      </div>

      {/* Create Coupon Modal with Custom Date Picker */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-serif text-base text-[#1A1A1A] pb-2 border-b border-[#EAE3D6]">
            <Tag size={18} className="text-[#B8860B]" />
            <span>Create Promotional Coupon</span>
          </div>
        }
        open={modalOpen}
        onOk={handleCreateCoupon}
        onCancel={() => !submitting && setModalOpen(false)}
        okText={submitting ? "Generating..." : "Generate Coupon"}
        confirmLoading={submitting}
        okButtonProps={{ 
          className: "!bg-[#B8860B] hover:!bg-[#996515] !text-white !border-none !rounded-xl !h-9 !px-4",
          disabled: submitting
        }}
        cancelButtonProps={{
          className: "!rounded-xl !h-9 !px-4",
          disabled: submitting
        }}
        centered
      >
        <Form 
          form={form} 
          layout="vertical" 
          className="pt-4" 
          initialValues={{ 
            discountType: 'percentage', 
            discountValue: 20,
            isActive: true, 
            usageLimit: 500, 
            minOrderAmount: 3000
          }}
        >
          <Form.Item
            name="code"
            label={<span className="text-xs font-semibold text-gray-700">Coupon Code</span>}
            rules={[
              { required: true, message: 'Please enter coupon code' },
              {
                pattern: /^[A-Za-z0-9_-]+$/,
                message: 'Coupon code can only contain letters, numbers, hyphens, and underscores'
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const normalized = value.trim().toUpperCase();
                  const exists = coupons.some(
                    c => c.code && c.code.toUpperCase() === normalized
                  );
                  if (exists) {
                    return Promise.reject(
                      new Error(`Coupon code "${normalized}" already exists. Please choose a unique code.`)
                    );
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              placeholder="e.g. ROVE20 or NOIR10" 
              className="rounded-xl py-1.5 uppercase font-mono font-bold text-xs" 
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-xs font-semibold text-gray-700">Privilege Description</span>}
            rules={[{ required: true, message: 'Please enter privilege description' }]}
          >
            <Input 
              placeholder="e.g. 20% privilege on Royal Oud Flacons" 
              className="rounded-xl py-1.5 text-xs" 
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="discountType"
              label={<span className="text-xs font-semibold text-gray-700">Discount Type</span>}
            >
              <Select className="text-xs">
                <Option value="percentage">Percentage (%)</Option>
                <Option value="fixed">Fixed Amount (₹)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="discountValue"
              label={<span className="text-xs font-semibold text-gray-700">Discount Value</span>}
              rules={[
                { required: true, message: 'Enter discount value' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value === undefined || value === null) return Promise.resolve();
                    const type = getFieldValue('discountType');
                    if (type === 'percentage' && (value <= 0 || value > 100)) {
                      return Promise.reject(new Error('Percentage discount must be between 1% and 100%'));
                    }
                    if (type === 'fixed' && value <= 0) {
                      return Promise.reject(new Error('Fixed discount must be greater than ₹0'));
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <InputNumber min={1} max={100000} className="w-full rounded-xl py-1" placeholder="e.g. 20" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="minOrderAmount"
              label={<span className="text-xs font-semibold text-gray-700">Min. Spend (₹)</span>}
            >
              <InputNumber min={0} max={1000000} className="w-full rounded-xl py-1" placeholder="0" />
            </Form.Item>

            <Form.Item
              name="usageLimit"
              label={<span className="text-xs font-semibold text-gray-700">Total Usage Limit</span>}
            >
              <InputNumber min={1} max={100000} className="w-full rounded-xl py-1" placeholder="500" />
            </Form.Item>
          </div>

          {/* Custom Date Picker Calendar with past-date prevention */}
          <Form.Item
            name="expiryDate"
            label={<span className="text-xs font-semibold text-gray-700">Expiry Date (YYYY-MM-DD)</span>}
            rules={[
              { required: true, message: 'Please select coupon expiry date' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const selected = new Date(value);
                  selected.setHours(0, 0, 0, 0);
                  if (selected < today) {
                    return Promise.reject(new Error('Coupon expiry date cannot be in the past'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <CustomDatePicker 
              placeholder="Select expiry date" 
              disablePast={true} 
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label={<span className="text-xs font-semibold text-gray-700">Active Immediately</span>}
            valuePropName="checked"
          >
            <Switch className="!bg-[#B8860B]" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
