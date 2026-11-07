"use client";
import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { Gift, Check, BookmarkCheck, X, Sparkles } from 'lucide-react';
import cartService from '@/services/cartService';

const PACKAGING_OPTIONS = [
  {
    id: 'imperial_gold',
    name: 'Signature Gold Box',
    tagline: 'Classic gold gift box with an elegant hand-tied satin ribbon',
    badge: 'Popular',
    fee: 'FREE'
  },
  {
    id: 'royal_velvet',
    name: 'Royal Velvet Box',
    tagline: 'Warm amber presentation box lined with soft velveteen',
    badge: 'Luxury',
    fee: 'FREE'
  },
  {
    id: 'atelier_noir',
    name: 'Classic Black Box',
    tagline: 'Matte black gift box with embossed gold atelier crest',
    badge: 'Minimalist',
    fee: 'FREE'
  }
];

const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Wedding',
  'Celebration',
  'Festive & Holidays',
  'With Love',
  'Thank You',
  'Just Because'
];

const MESSAGE_TEMPLATES = [
  {
    label: 'Birthday',
    text: 'Wishing you a wonderful birthday filled with joy, luxury, and happiness!'
  },
  {
    label: 'Anniversary',
    text: 'Happy Anniversary! Wishing you many more years of love, warmth, and laughter.'
  },
  {
    label: 'Celebration',
    text: 'Warmest congratulations on your milestone! Wishing you continued success.'
  },
  {
    label: 'With Love',
    text: 'A signature fine fragrance chosen especially for you. With all my love.'
  }
];

export default function GiftPersonalizeModal({
  open,
  onClose,
  initialData = null,
  onSave
}) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [selectedPackaging, setSelectedPackaging] = useState(PACKAGING_OPTIONS[0].id);
  const [messageText, setMessageText] = useState('');
  const [shipDirect, setShipDirect] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setRecipientName(initialData.recipientName || '');
        setRecipientPhone(initialData.recipientPhone || '');
        setRecipientAddress(initialData.recipientAddress || '');
        setOccasion(initialData.occasion || OCCASIONS[0]);
        setSelectedPackaging(initialData.packagingId || PACKAGING_OPTIONS[0].id);
        setMessageText(initialData.messageText || initialData.giftMessage || '');
        setShipDirect(Boolean(initialData.recipientAddress));
      } else {
        setRecipientName('');
        setRecipientPhone('');
        setRecipientAddress('');
        setOccasion(OCCASIONS[0]);
        setSelectedPackaging(PACKAGING_OPTIONS[0].id);
        setMessageText('');
        setShipDirect(false);
      }
    }
  }, [open, initialData]);

  const handleApply = () => {
    if (!recipientName.trim()) {
      message.warning('Please enter the recipient’s name.');
      return;
    }

    const pkg = PACKAGING_OPTIONS.find(p => p.id === selectedPackaging) || PACKAGING_OPTIONS[0];

    const giftData = {
      isGift: true,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      recipientAddress: shipDirect ? recipientAddress.trim() : '',
      occasion,
      packagingId: pkg.id,
      packagingName: pkg.name,
      messageText: messageText.trim(),
      giftMessage: messageText.trim(),
      giftWrap: true
    };

    cartService.updateGiftOptions(giftData);

    if (onSave) {
      onSave(giftData);
    }
    message.success('Gift details saved! Free gift packaging applied.');
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={580}
      closable={false}
      className="font-sans"
      styles={{
        content: {
          borderRadius: 20,
          padding: 0,
          overflow: 'hidden',
          border: '1px solid #E8DFC9'
        }
      }}
    >
      <div className="bg-[#FAF8F5] text-black flex flex-col max-h-[85vh]">
        {/* Refined Header */}
        <div className="bg-[#18110B] text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#D4A64A]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-2.5 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.22em] text-[#ECC880]">
              <Sparkles size={11} className="text-[#ECC880]" />
              Complimentary Gift Service
            </span>

            {/* Single clean close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-stone-200 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-normal text-white m-0">
            Send as an Artisanal Gift
          </h2>
          <p className="text-xs text-stone-300 font-light mt-1 max-w-md leading-relaxed">
            Every gift order receives our complimentary presentation box, satin ribbon, and a hand-scribed note card.
          </p>
        </div>

        {/* Form Body with Smooth Custom Scrollbar */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Step 1: Recipient Information */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-800 block">
              1. Recipient Details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="text-[11px] text-stone-500 block mb-1">Recipient Name *</span>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-[#B8860B] transition-colors"
                />
              </div>

              <div>
                <span className="text-[11px] text-stone-500 block mb-1">Recipient Phone (Optional)</span>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-[#B8860B] transition-colors"
                />
              </div>
            </div>

            {/* Direct Ship Toggle */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shipDirect}
                  onChange={(e) => setShipDirect(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#B8860B] cursor-pointer"
                />
                <span className="text-xs text-stone-700 font-medium">
                  Deliver directly to the recipient&apos;s address
                </span>
              </label>

              {shipDirect && (
                <div className="mt-2">
                  <span className="text-[11px] text-stone-500 block mb-1">Recipient Delivery Address</span>
                  <textarea
                    rows={2}
                    placeholder="Enter recipient's address, city, state, and pin code..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-[#B8860B] transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Occasion */}
          <div className="space-y-2 pt-2 border-t border-[#ECE7DE]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                2. Choose Occasion
              </label>
              <span className="text-[11px] text-[#8C6D1F] font-semibold">{occasion}</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setOccasion(occ)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    occasion === occ
                      ? 'bg-[#1C120C] text-white border-[#1C120C] shadow-2xs'
                      : 'bg-white text-stone-700 border-[#E0D8CA] hover:border-[#B8860B]'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Signature Box (Free) */}
          <div className="space-y-2 pt-2 border-t border-[#ECE7DE]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-800 block">
              3. Choose Signature Box (Complimentary)
            </label>

            <div className="grid grid-cols-1 gap-2">
              {PACKAGING_OPTIONS.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackaging(pkg.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedPackaging === pkg.id
                      ? 'bg-white border-[#B8860B] ring-1 ring-[#B8860B]/50 shadow-2xs'
                      : 'bg-white/70 hover:bg-white border-[#E0D8CA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      selectedPackaging === pkg.id
                        ? 'border-[#B8860B] bg-[#B8860B] text-white'
                        : 'border-stone-300 bg-white'
                    }`}>
                      {selectedPackaging === pkg.id && <Check size={11} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs text-[#1C120C]">{pkg.name}</span>
                        <span className="text-[8.5px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5]">
                          {pkg.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-light mt-0.5 leading-tight">
                        {pkg.tagline}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 tracking-wider shrink-0">
                    {pkg.fee}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Handwritten Note Card */}
          <div className="space-y-2.5 pt-2 border-t border-[#ECE7DE]">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-800">
                4. Personalized Note Card
              </label>
              <span className="text-[10px] text-stone-400 font-mono">
                {messageText.length}/250 chars
              </span>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10.5px] text-stone-400">Inspiration:</span>
              {MESSAGE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => setMessageText(tmpl.text)}
                  className="text-[10px] px-2.5 py-0.5 rounded-full bg-white hover:bg-[#FAF3E0] text-stone-600 hover:text-[#8C6D1F] border border-[#E0D8CA] hover:border-[#E0D0A5] transition-all cursor-pointer"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              maxLength={250}
              placeholder="Write your personal gift message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-[#B8860B] transition-colors leading-relaxed font-serif"
            />

            {/* Live Stationery Preview */}
            {messageText.trim() && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6ED] to-[#F5ECE0] border border-[#E2D5BE] shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C6D1F]">
                    Stationery Note Card Preview
                  </span>
                  <span className="text-[10px] font-serif italic text-stone-400">
                    {occasion}
                  </span>
                </div>
                <p className="font-serif italic text-stone-800 text-xs sm:text-[13px] leading-relaxed text-center py-2 px-3 border-y border-[#E8DFC8]/60 my-1">
                  &ldquo;{messageText}&rdquo;
                </p>
                <div className="text-right text-[11px] font-serif text-stone-600 font-medium pt-0.5">
                  — For {recipientName || 'Gift Recipient'}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Clean, Non-duplicate Footer */}
        <div className="p-4 bg-white border-t border-[#ECE7DE] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 hover:text-black bg-stone-100 hover:bg-stone-200 active:scale-95 transition-all cursor-pointer border border-stone-200"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-105 active:scale-[0.99] font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <BookmarkCheck size={14} />
            <span>Save Gift Details</span>
          </button>
        </div>

      </div>
    </Modal>
  );
}
