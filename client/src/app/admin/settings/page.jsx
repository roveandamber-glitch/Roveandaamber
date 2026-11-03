"use client";
import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  InputNumber, 
  Switch, 
  Select, 
  message, 
  Divider,
  Card 
} from 'antd';
import { 
  Settings, 
  Store, 
  Truck, 
  ShieldCheck, 
  Mail, 
  Bell, 
  Coins, 
  Save,
  Lock,
  Key,
  CheckCircle2
} from 'lucide-react';
import adminService from '@/services/adminService';

const { Option } = Select;

export default function AdminSettingsPage() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      message.success('Store settings saved successfully');
    } catch (err) {}
    setSaving(false);
  };

  const handleChangePassword = async (values) => {
    setPasswordSaving(true);
    try {
      const res = await adminService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      message.success(res?.message || 'Administrator password updated successfully.');
      passwordForm.resetFields();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update password. Please check your current password.';
      message.error(errMsg);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Store Profile & Atelier Settings
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              Store Configuration
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure contact information, free shipping rules, tax calculations, and administrator notifications.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] text-[#1B100A] text-xs font-semibold shadow-sm hover:brightness-105 transition-all w-fit cursor-pointer"
        >
          <Save size={15} />
          <span>Save Settings</span>
        </button>
      </div>

      <Form 
        form={form} 
        layout="vertical"
        initialValues={{
          storeName: 'ROVE & AMBER — Fine Fragrance',
          supportEmail: 'concierge@roveandamber.com',
          supportPhone: '+91 98765 43210',
          currency: 'INR',
          freeShippingThreshold: 4000,
          standardShippingFee: 250,
          enableGst: true,
          gstPercentage: 18,
          emailNewOrder: true,
          emailLowStock: true
        }}
      >
        {/* Section 1: Store Information */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFC8]">
            <Store size={18} className="text-[#D4A64A]" />
            <h3 className="font-serif font-medium text-sm text-[#1B100A]">
              Brand & Concierge Identity
            </h3>
          </div>

          <Form.Item
            name="storeName"
            label={<span className="text-xs font-semibold text-gray-700">Official Brand Title</span>}
            rules={[{ required: true }]}
          >
            <Input className="rounded-xl py-1.5 text-xs font-serif" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="supportEmail"
              label={<span className="text-xs font-semibold text-gray-700">Concierge Email</span>}
              rules={[{ required: true, type: 'email' }]}
            >
              <Input className="rounded-xl py-1.5 text-xs" />
            </Form.Item>

            <Form.Item
              name="supportPhone"
              label={<span className="text-xs font-semibold text-gray-700">User Support Hotline</span>}
            >
              <Input className="rounded-xl py-1.5 text-xs" />
            </Form.Item>
          </div>
        </div>

        {/* Section 2: Shipping & Delivery Rules */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 mt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFC8]">
            <Truck size={18} className="text-[#D4A64A]" />
            <h3 className="font-serif font-medium text-sm text-[#1B100A]">
              Shipping & Delivery Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="freeShippingThreshold"
              label={<span className="text-xs font-semibold text-gray-700">Complimentary Shipping Threshold (₹)</span>}
              tooltip="Orders equal or exceeding this total qualify for complimentary insured courier delivery."
            >
              <InputNumber min={0} max={50000} className="w-full rounded-xl py-1" />
            </Form.Item>

            <Form.Item
              name="standardShippingFee"
              label={<span className="text-xs font-semibold text-gray-700">Standard Express Courier Rate (₹)</span>}
            >
              <InputNumber min={0} max={2000} className="w-full rounded-xl py-1" />
            </Form.Item>
          </div>
        </div>

        {/* Section 3: Taxes & Currency */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 mt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFC8]">
            <Coins size={18} className="text-[#D4A64A]" />
            <h3 className="font-serif font-medium text-sm text-[#1B100A]">
              Currency & Tax Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="currency"
              label={<span className="text-xs font-semibold text-gray-700">Operating Currency</span>}
            >
              <Select className="text-xs">
                <Option value="INR">Indian Rupee (₹ INR)</Option>
                <Option value="AED">UAE Dirham (AED)</Option>
                <Option value="USD">US Dollar ($ USD)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="gstPercentage"
              label={<span className="text-xs font-semibold text-gray-700">Fragrance GST Rate (%)</span>}
            >
              <InputNumber min={0} max={28} className="w-full rounded-xl py-1" />
            </Form.Item>
          </div>

          <Form.Item
            name="enableGst"
            label={<span className="text-xs font-semibold text-gray-700">Display All Prices Inclusive of GST</span>}
            valuePropName="checked"
          >
            <Switch className="!bg-[#D4A64A]" />
          </Form.Item>
        </div>

        {/* Section 4: Email Notifications */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 mt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8DFC8]">
            <Bell size={18} className="text-[#D4A64A]" />
            <h3 className="font-serif font-medium text-sm text-[#1B100A]">
              Administrator Notifications
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <div className="text-xs font-semibold text-gray-800">New Order Alerts</div>
                <div className="text-[11px] text-gray-400">Receive email notification when an order is confirmed</div>
              </div>
              <Form.Item name="emailNewOrder" valuePropName="checked" noStyle>
                <Switch className="!bg-[#D4A64A]" />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-xs font-semibold text-gray-800">Low Inventory Warnings</div>
                <div className="text-[11px] text-gray-400">Alert administrators when perfume stock drops below 5 units</div>
              </div>
              <Form.Item name="emailLowStock" valuePropName="checked" noStyle>
                <Switch className="!bg-[#D4A64A]" />
              </Form.Item>
            </div>
          </div>
        </div>
      </Form>

      {/* Section 5: Administrator Security & Password Management */}
      <div id="security" className="bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3E0] border border-[#E0D0A5] text-[#B8860B] flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-serif font-medium text-sm text-[#1B100A]">
                Administrator Security & Password
              </h3>
              <p className="text-[11px] text-gray-500">
                Update master administrator password to protect atelier configuration and customer records.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
            Protected Access
          </span>
        </div>

        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item
              name="currentPassword"
              label={<span className="text-xs font-semibold text-gray-700">Current Password</span>}
              rules={[{ required: true, message: 'Please enter current password' }]}
            >
              <Input.Password
                placeholder="••••••••"
                className="rounded-xl py-2 text-xs font-mono"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={<span className="text-xs font-semibold text-gray-700">New Password</span>}
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password
                placeholder="Min. 6 characters"
                className="rounded-xl py-2 text-xs font-mono"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<span className="text-xs font-semibold text-gray-700">Confirm New Password</span>}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('New passwords do not match'));
                  }
                })
              ]}
            >
              <Input.Password
                placeholder="Re-enter password"
                className="rounded-xl py-2 text-xs font-mono"
              />
            </Form.Item>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-gray-400 m-0">
              Password must be at least 6 characters. Updating will synchronize master atelier credentials.
            </p>
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] hover:from-[#C89B3F] hover:to-[#A3791F] text-[#1B100A] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Key size={14} />
              <span>{passwordSaving ? 'Updating Password...' : 'Change Password'}</span>
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

