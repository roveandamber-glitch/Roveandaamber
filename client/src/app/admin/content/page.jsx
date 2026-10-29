"use client";
import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Switch, 
  Tabs, 
  message, 
  Upload, 
  Card 
} from 'antd';
import { 
  FileEdit, 
  Sparkles, 
  Image as ImageIcon, 
  Layout, 
  Save, 
  Eye, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

const { TextArea } = Input;

export default function AdminContentPage() {
  const [heroForm] = Form.useForm();
  const [bannerForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSaveHero = async () => {
    setSaving(true);
    try {
      const values = await heroForm.validateFields();
      message.success('Homepage hero configuration saved successfully');
    } catch (err) {}
    setSaving(false);
  };

  const handleSaveBanners = async () => {
    setSaving(true);
    try {
      const values = await bannerForm.validateFields();
      message.success('Promotional campaign banner updated successfully');
    } catch (err) {}
    setSaving(false);
  };

  const items = [
    {
      key: 'hero',
      label: (
        <span className="flex items-center gap-2 text-xs font-semibold py-1">
          <Layout size={14} className="text-[#B8860B]" />
          <span>Homepage Hero Section</span>
        </span>
      ),
      children: (
        <div className="bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
          <div className="border-b border-[#EAE3D6] pb-3">
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
              Main Hero Showcase
            </h3>
            <p className="text-xs text-gray-500">
              Customize the headline, artisanal fragrance copy, and call-to-action buttons on the storefront hero banner.
            </p>
          </div>

          <Form 
            form={heroForm} 
            layout="vertical"
            initialValues={{
              badge: 'FINE FRAGRANCE & ARTISANAL PERFUMERY',
              title: 'Discover Your Signature Scent',
              description: 'Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.',
              primaryButtonText: 'Shop Now',
              primaryButtonLink: '/collections',
              secondaryButtonText: 'Explore Collection',
              secondaryButtonLink: '/collections'
            }}
          >
            <Form.Item
              name="badge"
              label={<span className="text-xs font-semibold text-gray-700">Sub-Badge Text</span>}
            >
              <Input className="rounded-xl py-1.5 text-xs font-mono" />
            </Form.Item>

            <Form.Item
              name="title"
              label={<span className="text-xs font-semibold text-gray-700">Hero Headline</span>}
              rules={[{ required: true }]}
            >
              <Input className="rounded-xl py-1.5 text-xs font-serif font-bold" />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="text-xs font-semibold text-gray-700">Storytelling Body Copy</span>}
              rules={[{ required: true }]}
            >
              <TextArea rows={3} className="rounded-xl text-xs leading-relaxed" />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="primaryButtonText"
                label={<span className="text-xs font-semibold text-gray-700">Primary Button Label</span>}
              >
                <Input className="rounded-xl py-1.5 text-xs" />
              </Form.Item>

              <Form.Item
                name="primaryButtonLink"
                label={<span className="text-xs font-semibold text-gray-700">Primary Destination URL</span>}
              >
                <Input className="rounded-xl py-1.5 text-xs font-mono" />
              </Form.Item>
            </div>

            <div className="pt-2">
              <Button
                type="primary"
                onClick={handleSaveHero}
                loading={saving}
                className="!bg-[#B8860B] hover:!bg-[#996515] !text-white !rounded-xl !h-10 !px-6 text-xs font-semibold !border-none"
              >
                Save Homepage Hero
              </Button>
            </div>
          </Form>
        </div>
      )
    },
    {
      key: 'banners',
      label: (
        <span className="flex items-center gap-2 text-xs font-semibold py-1">
          <ImageIcon size={14} className="text-[#B8860B]" />
          <span>Promotional Banners</span>
        </span>
      ),
      children: (
        <div className="bg-white rounded-2xl p-6 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
          <div className="border-b border-[#EAE3D6] pb-3">
            <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
              Top Notification Strip & Promotional Banners
            </h3>
            <p className="text-xs text-gray-500">
              Manage the top announcement bar message, festive discount banners, and seasonal offers.
            </p>
          </div>

          <Form
            form={bannerForm}
            layout="vertical"
            initialValues={{
              topBarText: 'Complimentary Pan-India Express Delivery & Deluxe Miniature with all orders above ₹4,000',
              enableTopBar: true,
              festiveBannerTitle: 'The Royal Autumn Fragrance Atelier',
              festiveBannerCode: 'ROYAL20'
            }}
          >
            <Form.Item
              name="topBarText"
              label={<span className="text-xs font-semibold text-gray-700">Top Announcement Bar Text</span>}
            >
              <Input className="rounded-xl py-1.5 text-xs" />
            </Form.Item>

            <Form.Item
              name="enableTopBar"
              label={<span className="text-xs font-semibold text-gray-700">Show Announcement Bar</span>}
              valuePropName="checked"
            >
              <Switch className="!bg-[#B8860B]" />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="festiveBannerTitle"
                label={<span className="text-xs font-semibold text-gray-700">Campaign Header</span>}
              >
                <Input className="rounded-xl py-1.5 text-xs font-serif" />
              </Form.Item>

              <Form.Item
                name="festiveBannerCode"
                label={<span className="text-xs font-semibold text-gray-700">Associated Promo Code</span>}
              >
                <Input className="rounded-xl py-1.5 text-xs font-mono uppercase" />
              </Form.Item>
            </div>

            <div className="pt-2">
              <Button
                type="primary"
                onClick={handleSaveBanners}
                loading={saving}
                className="!bg-[#B8860B] hover:!bg-[#996515] !text-white !rounded-xl !h-10 !px-6 text-xs font-semibold !border-none"
              >
                Save Promotional Banners
              </Button>
            </div>
          </Form>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE3D6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1A1A1A] tracking-tight">
              Homepage & Content Studio
            </h1>
            <span className="text-xs bg-[#EFE8DC] text-[#4A4238] px-2.5 py-0.5 rounded-full font-medium">
              Storefront Customizer
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Edit brand storytelling, hero headline banners, and seasonal fragrance marketing assets.
          </p>
        </div>
      </div>

      <Tabs items={items} className="luxury-admin-tabs" />
    </div>
  );
}

