"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Switch, 
  Tabs, 
  message, 
  Spin
} from 'antd';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Layout, 
  Save, 
  Eye, 
  CheckCircle2, 
  UploadCloud,
  Trash2,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Info
} from 'lucide-react';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';

const { TextArea } = Input;

// Character limits for hero content fields
const LIMITS = {
  badge: 40,
  title: 70,
  description: 260,
  primaryButtonText: 25,
  primaryButtonLink: 120,
  secondaryButtonText: 25,
  secondaryButtonLink: 120
};

export default function AdminContentPage() {
  const [heroForm] = Form.useForm();
  const [bannerForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dynamic Hero state
  const [heroBannerId, setHeroBannerId] = useState(null);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState('/images/perfumes/hero_campaign_ultra_clear_master.jpg');
  const [heroImageOriginal, setHeroImageOriginal] = useState('/images/perfumes/hero_campaign_ultra_clear_master.jpg');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Live preview & character count tracking
  const [formValues, setFormValues] = useState({
    badge: 'FINE FRAGRANCE & ARTISANAL PERFUMERY',
    title: 'Discover Your Signature Scent',
    description: 'Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.',
    primaryButtonText: 'Shop Now',
    primaryButtonLink: '/collections',
    secondaryButtonText: 'Explore Collection',
    secondaryButtonLink: '/shop?category=Oud'
  });

  // Fetch current hero configuration from backend on mount
  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    setLoading(true);
    try {
      const res = await adminService.getBanners('hero');
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const heroBanner = list.find(b => b.highlightType === 'hero') || list[0];

      if (heroBanner) {
        setHeroBannerId(heroBanner._id || heroBanner.id);
        const img = heroBanner.image || '/images/perfumes/hero_campaign_ultra_clear_master.jpg';
        setHeroImageOriginal(img);
        setHeroImagePreview(getImageUrl(img));

        const initialData = {
          badge: heroBanner.badge || 'FINE FRAGRANCE & ARTISANAL PERFUMERY',
          title: heroBanner.title || 'Discover Your Signature Scent',
          description: heroBanner.subtitle || 'Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.',
          primaryButtonText: heroBanner.buttonText || 'Shop Now',
          primaryButtonLink: heroBanner.linkUrl || '/collections',
          secondaryButtonText: heroBanner.secondaryButtonText || 'Explore Collection',
          secondaryButtonLink: heroBanner.secondaryButtonLink || '/shop?category=Oud'
        };

        heroForm.setFieldsValue(initialData);
        setFormValues(initialData);
      } else {
        // Use luxury defaults
        heroForm.setFieldsValue(formValues);
      }
    } catch (err) {
      console.error('Failed to load hero banner:', err);
      message.error('Failed to load current hero configuration');
    } finally {
      setLoading(false);
    }
  };

  // Handle field change for character counter and live preview
  const handleValuesChange = (_, allValues) => {
    setFormValues(prev => ({
      ...prev,
      ...allValues
    }));
  };

  // Image file selection & validation
  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/i)) {
      message.error('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error('Image size exceeds 10MB limit. Please upload a smaller flacon image.');
      return;
    }

    setHeroImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setHeroImagePreview(objectUrl);
    message.success(`Artwork "${file.name}" selected for hero banner`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleResetImage = () => {
    setHeroImageFile(null);
    setHeroImagePreview(getImageUrl(heroImageOriginal));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    message.info('Reverted to existing published hero artwork');
  };

  // Save Hero section handler
  const handleSaveHero = async () => {
    try {
      const values = await heroForm.validateFields();
      setSaving(true);

      const formData = new FormData();
      formData.append('title', values.title.trim());
      formData.append('subtitle', values.description.trim());
      formData.append('badge', (values.badge || '').trim());
      formData.append('buttonText', (values.primaryButtonText || 'Shop Now').trim());
      formData.append('linkUrl', (values.primaryButtonLink || '/collections').trim());
      formData.append('secondaryButtonText', (values.secondaryButtonText || 'Explore Collection').trim());
      formData.append('secondaryButtonLink', (values.secondaryButtonLink || '/shop?category=Oud').trim());
      formData.append('highlightType', 'hero');
      formData.append('isActive', 'true');

      if (heroImageFile) {
        formData.append('image', heroImageFile);
      } else {
        formData.append('image', heroImageOriginal);
      }

      if (heroBannerId) {
        await adminService.updateBanner(heroBannerId, formData);
        message.success('Homepage hero showcase updated and published live!');
      } else {
        const created = await adminService.createBanner(formData);
        if (created?.data?._id || created?.data?.id) {
          setHeroBannerId(created.data._id || created.data.id);
        }
        message.success('New homepage hero showcase created and published live!');
      }

      setHeroImageFile(null);
      await fetchHeroContent();
    } catch (err) {
      console.error('Failed to save hero banner:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save hero configuration';
      message.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBanners = async () => {
    setSaving(true);
    try {
      await bannerForm.validateFields();
      message.success('Promotional campaign settings updated successfully');
    } catch (err) {}
    setSaving(false);
  };

  // Character counter helper badge
  const renderCounter = (currentLength = 0, maxLimit = 100) => {
    const isNearLimit = currentLength >= maxLimit * 0.9;
    const isAtLimit = currentLength >= maxLimit;

    return (
      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md transition-colors ${
        isAtLimit 
          ? 'bg-rose-100 text-rose-700 font-bold border border-rose-200' 
          : isNearLimit 
            ? 'bg-amber-100 text-amber-800 font-semibold border border-amber-200' 
            : 'bg-[#FAF7F2] text-gray-500 border border-[#E8DFC8]'
      }`}>
        {currentLength} / {maxLimit}
      </span>
    );
  };

  const items = [
    {
      key: 'hero',
      label: (
        <span className="flex items-center gap-2 text-xs font-semibold py-1">
          <Layout size={14} className="text-[#D4A64A]" />
          <span>Homepage Hero Section</span>
        </span>
      ),
      children: (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-[#E8DFC8] flex flex-col items-center justify-center gap-3">
              <Spin size="large" />
              <p className="text-xs text-gray-500 font-serif">Loading boutique hero configuration...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Controls Column (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
                <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
                  <div>
                    <h3 className="font-serif font-medium text-base text-[#1B100A]">
                      Main Hero Showcase
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Configure live brand storytelling, headline copy, artwork photography, and call-to-action buttons.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchHeroContent}
                    className="p-1.5 text-gray-400 hover:text-[#B8860B] hover:bg-[#FAF7F2] rounded-lg transition-colors border border-[#E8DFC8] cursor-pointer"
                    title="Reload from database"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <Form 
                  form={heroForm} 
                  layout="vertical"
                  onValuesChange={handleValuesChange}
                >
                  {/* 1. Sub-Badge Text with Counter */}
                  <Form.Item
                    name="badge"
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-gray-700">Sub-Badge Eyebrow Text</span>
                        {renderCounter((formValues.badge || '').length, LIMITS.badge)}
                      </div>
                    }
                  >
                    <Input 
                      maxLength={LIMITS.badge}
                      placeholder="e.g. FINE FRAGRANCE & ARTISANAL PERFUMERY"
                      className="rounded-xl py-1.5 text-xs font-mono uppercase tracking-wider bg-[#FAF7F2] border-[#E8DFC8] focus:border-[#D4A64A]" 
                    />
                  </Form.Item>

                  {/* 2. Hero Headline with Counter */}
                  <Form.Item
                    name="title"
                    rules={[{ required: true, message: 'Hero Headline is required' }]}
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-gray-700">
                          Hero Headline <span className="text-rose-500">*</span>
                        </span>
                        {renderCounter((formValues.title || '').length, LIMITS.title)}
                      </div>
                    }
                  >
                    <Input 
                      maxLength={LIMITS.title}
                      placeholder="e.g. Discover Your Signature Scent"
                      className="rounded-xl py-2 text-sm font-serif font-bold text-[#1B100A] bg-[#FAF7F2] border-[#E8DFC8] focus:border-[#D4A64A]" 
                    />
                  </Form.Item>

                  {/* 3. Storytelling Body Copy with Counter */}
                  <Form.Item
                    name="description"
                    rules={[{ required: true, message: 'Storytelling Body Copy is required' }]}
                    label={
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-gray-700">
                          Storytelling Body Copy <span className="text-rose-500">*</span>
                        </span>
                        {renderCounter((formValues.description || '').length, LIMITS.description)}
                      </div>
                    }
                  >
                    <TextArea 
                      rows={3} 
                      maxLength={LIMITS.description}
                      placeholder="e.g. Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences."
                      className="rounded-xl text-xs leading-relaxed bg-[#FAF7F2] border-[#E8DFC8] focus:border-[#D4A64A]" 
                    />
                  </Form.Item>

                  {/* 4. Hero Section Artwork Upload Zone */}
                  <div className="pt-2 pb-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-[#D4A64A]" />
                        <span className="text-xs font-semibold text-gray-700">Hero Section Background Artwork</span>
                        <span className="text-rose-500 text-xs">*</span>
                      </div>
                      {heroImageFile && (
                        <button
                          type="button"
                          onClick={handleResetImage}
                          className="text-[11px] text-amber-700 hover:text-amber-900 underline cursor-pointer"
                        >
                          Revert to published
                        </button>
                      )}
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden" 
                    />

                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                        isDragging 
                          ? 'border-[#B8860B] bg-amber-50/60 scale-[0.99]' 
                          : 'border-[#E8DFC8] bg-[#FAF7F2] hover:border-[#D4A64A] hover:bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white border border-[#E8DFC8] shadow-sm flex items-center justify-center text-[#B8860B]">
                        <UploadCloud size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#1B100A]">
                          <span className="text-[#B8860B] font-semibold underline">Click to upload</span> or drag and drop artwork
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          High-resolution widescreen JPEG, PNG, or WEBP (Max 10MB). Recommended: 1920x1080px.
                        </p>
                      </div>

                      {heroImageFile && (
                        <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-medium">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>Ready to upload: {heroImageFile.name} ({(heroImageFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 5. Primary Action Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                    <Form.Item
                      name="primaryButtonText"
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-semibold text-gray-700">Primary Button Label</span>
                          {renderCounter((formValues.primaryButtonText || '').length, LIMITS.primaryButtonText)}
                        </div>
                      }
                    >
                      <Input 
                        maxLength={LIMITS.primaryButtonText}
                        placeholder="e.g. Shop Now"
                        className="rounded-xl py-1.5 text-xs bg-[#FAF7F2] border-[#E8DFC8] focus:border-[#D4A64A]" 
                      />
                    </Form.Item>

                    <Form.Item
                      name="primaryButtonLink"
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-semibold text-gray-700">Primary Destination URL</span>
                          {renderCounter((formValues.primaryButtonLink || '').length, LIMITS.primaryButtonLink)}
                        </div>
                      }
                    >
                      <Input 
                        maxLength={LIMITS.primaryButtonLink}
                        placeholder="e.g. /collections or /shop"
                        className="rounded-xl py-1.5 text-xs font-mono bg-[#FAF7F2] border-[#E8DFC8] focus:border-[#D4A64A]" 
                      />
                    </Form.Item>
                  </div>

                  {/* 6. Secondary Action Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                      name="secondaryButtonText"
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-semibold text-gray-700">Secondary Button Label</span>
                          {renderCounter((formValues.secondaryButtonText || '').length, LIMITS.secondaryButtonText)}
                        </div>
                      }
                    >
                      <Input 
                        maxLength={LIMITS.secondaryButtonText}
                        placeholder="e.g. Explore Collection"
                        className="rounded-xl py-1.5 text-xs bg-[#FAF7F2] border-[#E8DFC8] focus:border-[#D4A64A]" 
                      />
                    </Form.Item>

                    <Form.Item
                      name="secondaryButtonLink"
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-semibold text-gray-700">Secondary Destination URL</span>
                          {renderCounter((formValues.secondaryButtonLink || '').length, LIMITS.secondaryButtonLink)}
                        </div>
                      }
                    >
                      <Input 
                        maxLength={LIMITS.secondaryButtonLink}
                        placeholder="e.g. /shop?category=Oud"
                        className="rounded-xl py-1.5 text-xs font-mono bg-[#FAF7F2] border-[#E8DFC8] focus:border-[#D4A64A]" 
                      />
                    </Form.Item>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 border-t border-[#E8DFC8] flex items-center justify-between">
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                      <Info size={13} className="text-[#D4A64A]" />
                      <span>Changes are synchronized dynamically across desktop & mobile storefronts.</span>
                    </div>

                    <Button
                      type="primary"
                      onClick={handleSaveHero}
                      loading={saving}
                      icon={<Save size={14} />}
                      className="!bg-[#B8860B] hover:!bg-[#996515] !text-white !rounded-xl !h-10 !px-6 text-xs font-semibold !border-none cursor-pointer shadow-md shadow-amber-900/10 flex items-center gap-2"
                    >
                      Save Homepage Hero
                    </Button>
                  </div>
                </Form>
              </div>

              {/* Live Preview Column (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
                    <div className="flex items-center gap-2">
                      <Eye size={15} className="text-[#D4A64A]" />
                      <h4 className="font-serif font-medium text-xs text-[#1B100A]">
                        Live Storefront Hero Preview
                      </h4>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                      Realtime Simulation
                    </span>
                  </div>

                  {/* Miniature Storefront Hero Mockup */}
                  <div className="mt-4 relative w-full aspect-[16/10] rounded-xl overflow-hidden shadow-lg border border-[#3A2215] bg-[#120905] flex flex-col justify-end p-5 select-none">
                    {/* Background Hero Picture */}
                    <img 
                      src={heroImagePreview}
                      alt="Hero background preview"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.src = '/images/perfumes/hero_campaign_ultra_clear_master.jpg';
                      }}
                    />

                    {/* Cinematic Contrast Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Mockup Brand Elements */}
                    <div className="relative z-10 max-w-[90%] text-left">
                      {/* Eyebrow */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-4 h-[1.5px] bg-[#E5B869]" />
                        <span className="text-[9px] tracking-[0.2em] uppercase font-semibold text-[#E5B869] drop-shadow-sm truncate">
                          {formValues.badge || 'FINE FRAGRANCE'}
                        </span>
                      </div>

                      {/* Headline */}
                      <h2 className="text-sm sm:text-base font-serif font-normal text-white leading-tight mb-2 drop-shadow-md line-clamp-2">
                        {formValues.title || 'Discover Your Signature Scent'}
                      </h2>

                      {/* Storytelling Copy */}
                      <p className="text-[10px] text-[#E8DDD0] font-light leading-relaxed line-clamp-2 mb-3 max-w-[260px] drop-shadow-sm">
                        {formValues.description || 'Explore fine fragrances crafted to leave a lasting impression.'}
                      </p>

                      {/* Action Button Mockups */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#F6D389] via-[#DEB368] to-[#C09048] text-[#241306] text-[10px] font-bold tracking-wider shadow-sm">
                          <span>{formValues.primaryButtonText || 'Shop Now'}</span>
                          <ArrowRight size={9} strokeWidth={2.8} />
                        </span>

                        {formValues.secondaryButtonText && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/40 border border-white/30 text-white text-[9px] font-medium backdrop-blur-sm">
                            {formValues.secondaryButtonText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Hero Image Asset Details Card */}
                  <div className="mt-4 p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Published Image:</span>
                      <span className="font-mono text-[11px] text-[#1B100A] truncate max-w-[170px]" title={heroImageOriginal}>
                        {heroImageOriginal.split('/').pop() || 'hero_campaign.jpg'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Stage Status:</span>
                      <span className={`text-[11px] font-semibold ${heroImageFile ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {heroImageFile ? '● Local Artwork Pending Save' : '✓ Synchronized with Storefront'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                className="!bg-[#B8860B] hover:!bg-[#996515] !text-white !rounded-xl !h-10 !px-6 text-xs font-semibold !border-none cursor-pointer"
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
    <div className="space-y-6 text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Homepage & Content Studio
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
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
