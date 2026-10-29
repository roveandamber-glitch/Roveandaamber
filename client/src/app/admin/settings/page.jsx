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
  Save 
} from 'lucide-react';

const { Option } = Select;

export default function AdminSettingsPage() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      message.success('Store settings saved successfully');
    } catch (err) {}
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE3D6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1A1A1A] tracking-tight">
              Store Profile & Atelier Settings
            </h1>
            <span className="text-xs bg-[#EFE8DC] text-[#4A4238] px-2.5 py-0.5 rounded-full font-medium">
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#996515] text-white text-xs font-semibold shadow-sm hover:brightness-105 transition-all w-fit cursor-pointer"
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
        <div className="bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EAE3D6]">
            <Store size={18} className="text-[#B8860B]" />
            <h3 className="font-serif font-bold text-sm text-[#1A1A1A]">
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
              label={<span className="text-xs font-semibold text-gray-700">Client Support Hotline</span>}
            >
              <Input className="rounded-xl py-1.5 text-xs" />
            </Form.Item>
          </div>
        </div>

        {/* Section 2: Shipping & Delivery Rules */}
        <div className="bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 mt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EAE3D6]">
            <Truck size={18} className="text-[#B8860B]" />
            <h3 className="font-serif font-bold text-sm text-[#1A1A1A]">
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
        <div className="bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 mt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EAE3D6]">
            <Coins size={18} className="text-[#B8860B]" />
            <h3 className="font-serif font-bold text-sm text-[#1A1A1A]">
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
            <Switch className="!bg-[#B8860B]" />
          </Form.Item>
        </div>

        {/* Section 4: Email Notifications */}
        <div className="bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 mt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EAE3D6]">
            <Bell size={18} className="text-[#B8860B]" />
            <h3 className="font-serif font-bold text-sm text-[#1A1A1A]">
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
                <Switch className="!bg-[#B8860B]" />
              </Form.Item>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-xs font-semibold text-gray-800">Low Inventory Warnings</div>
                <div className="text-[11px] text-gray-400">Alert administrators when perfume stock drops below 5 units</div>
              </div>
              <Form.Item name="emailLowStock" valuePropName="checked" noStyle>
                <Switch className="!bg-[#B8860B]" />
              </Form.Item>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}

