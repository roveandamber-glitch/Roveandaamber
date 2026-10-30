"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { Gift, Sparkles, Heart, Check, X, BookmarkCheck } from 'lucide-react';

const { Option } = Select;

const PACKAGING_OPTIONS = [
  {
    id: 'imperial_gold',
    name: 'Imperial Gold Foil Coffret',
    tagline: 'Signature gold-embossed presentation box with black obsidian wax seal',
    badge: 'Most Popular',
    fee: 'COMPLIMENTARY'
  },
  {
    id: 'royal_velvet',
    name: 'Royal Velvet & Amber Coffret',
    tagline: 'Handcrafted rich amber box lined with velvet and woven silk ribbon',
    badge: 'Luxury Atelier',
    fee: 'COMPLIMENTARY'
  },
  {
    id: 'atelier_noir',
    name: 'Signature Atelier Noir Presentation',
    tagline: 'Deep noir presentation with gold hot-stamped ROVE & AMBER monogram',
    badge: 'Minimalist Luxe',
    fee: 'COMPLIMENTARY'
  }
];

const OCCASIONS = [
  'Birthday Celebration',
  'Anniversary',
  'Milestone Celebration',
  'Wedding & Reception',
  'Festive & Holidays',
  'Expression of Love',
  'Heartfelt Gratitude',
  'Just Because'
];

const MESSAGE_TEMPLATES = [
  {
    label: 'Birthday',
    text: 'May this noble fragrance bring radiant joy and elegance to your special day. Happy Birthday!'
  },
  {
    label: 'Anniversary',
    text: 'To timeless elegance and unforgettable memories. Happy Anniversary, with all my love.'
  },
  {
    label: 'Celebration',
    text: 'Celebrating your extraordinary milestone. May every spray remind you of this triumph!'
  },
  {
    label: 'Affection',
    text: 'A signature scent crafted with noble essences, chosen especially for you. With all my affection.'
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
        setShipDirect(!!initialData.recipientAddress);
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
      message.warning('Please provide the recipient name for the gift presentation.');
      return;
    }

    const pkg = PACKAGING_OPTIONS.find(p => p.id === selectedPackaging) || PACKAGING_OPTIONS[0];

    const giftData = {
      isGift: true,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      recipientAddress: shipDirect ? recipientAddress.trim() : '',
      occasion: occasion,
      packagingId: pkg.id,
      packagingName: pkg.name,
      messageText: messageText.trim(),
      giftMessage: messageText.trim(),
      giftWrap: true
    };

    try {
      localStorage.setItem('rove_amber_gift_options', JSON.stringify(giftData));
    } catch (e) {
      console.warn('Could not save gift options to localStorage', e);
    }

    if (onSave) {
      onSave(giftData);
    }
    message.success('Gift personalization saved! Complimentary packaging applied.');
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={640}
      className="font-sans gift-studio-modal"
      styles={{
        content: {
          borderRadius: 20,
          padding: 0,
          overflow: 'hidden',
          border: '1px solid #E8DFC9'
        }
      }}
    >
      <div className="bg-[#FAF8F5] text-black">
        {/* Luxury Header Banner */}
        <div className="bg-gradient-to-r from-[#1B100A] via-[#2A1A10] to-[#1B100A] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4A64A]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-full bg-[#D4A64A]/20 border border-[#D4A64A]/40 text-[#ECC880] flex items-center justify-center text-xs">
              <Gift size={13} />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#ECC880]">
              ROVE & AMBER GIFT STUDIO
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-white m-0">
            Personalize Your Fragrance Gift
          </h2>
          <p className="text-xs text-stone-300 font-light mt-1.5 max-w-lg leading-relaxed">
            Every gifted flacon is hand-finished with luxury gold-foil presentation coffrets, embossed satin ribbons, and a personalized wax-sealed calligraphic parchment card.
          </p>
        </div>

        {/* Modal Body Form */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          
          {/* 1. Recipient Details */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              1. Recipient Information
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-stone-500 block mb-1">Recipient Full Name *</span>
                <input
                  type="text"
                  placeholder="e.g. Lady Genevieve / Dr. Aryan Sharma"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-[#B8860B] transition-colors"
                />
              </div>

              <div>
                <span className="text-[11px] text-stone-500 block mb-1">Recipient Phone (Optional for Courier Updates)</span>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-[#B8860B] transition-colors"
                />
              </div>
            </div>

            {/* Direct Ship Toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shipDirect}
                  onChange={(e) => setShipDirect(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#B8860B] cursor-pointer"
                />
                <span className="text-xs text-stone-700 font-medium">
                  Ship directly to recipient&apos;s address
                </span>
              </label>

              {shipDirect && (
                <div className="mt-2.5">
                  <span className="text-[11px] text-stone-500 block mb-1">Recipient Delivery Address</span>
                  <textarea
                    rows={2}
                    placeholder="Enter recipient's complete street address, city, state, and pin code..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-[#B8860B] transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Occasion Selection */}
          <div className="space-y-2 pt-2 border-t border-[#ECE7DE]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                2. Select Occasion Motif
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
                      ? 'bg-[#1B100A] text-white border-[#1B100A] shadow-xs'
                      : 'bg-white text-stone-700 border-[#E0D8CA] hover:border-[#B8860B]'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Luxury Packaging Style */}
          <div className="space-y-3 pt-2 border-t border-[#ECE7DE]">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              3. Select Luxury Presentation Box
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {PACKAGING_OPTIONS.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackaging(pkg.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedPackaging === pkg.id
                      ? 'bg-white border-[#B8860B] ring-1 ring-[#B8860B] shadow-xs'
                      : 'bg-white/70 hover:bg-white border-[#E0D8CA]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      selectedPackaging === pkg.id
                        ? 'border-[#B8860B] bg-[#B8860B] text-white'
                        : 'border-stone-300 bg-white'
                    }`}>
                      {selectedPackaging === pkg.id && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs text-[#1B100A]">{pkg.name}</span>
                        <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5]">
                          {pkg.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-light mt-0.5">
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

          {/* 4. Wax-Sealed Inscription Card Note */}
          <div className="space-y-3 pt-2 border-t border-[#ECE7DE]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                4. Personalized Calligraphic Inscription Note
              </label>
              <span className="text-[10px] text-stone-400 font-mono">
                {messageText.length}/250 chars
              </span>
            </div>

            {/* Quick Templates */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-stone-400">Quick Inspiration:</span>
              {MESSAGE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => setMessageText(tmpl.text)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-white hover:bg-[#FAF3E0] text-stone-600 hover:text-[#8C6D1F] border border-[#E0D8CA] hover:border-[#E0D0A5] transition-all cursor-pointer"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              maxLength={250}
              placeholder="Write your bespoke sentiments here. Our calligrapher will hand-inscribe this note onto textured cream cardstock and seal it with black molten wax..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-[#B8860B] transition-colors leading-relaxed font-serif"
            />

            {/* Live Parchment Card Preview */}
            {messageText.trim() && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6ED] to-[#F5ECE0] border border-[#E2D5BE] shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#8C6D1F]">
                    Inscription Card Preview
                  </span>
                  <span className="text-[10px] font-serif italic text-stone-400">
                    Wax-Sealed Flacon Inscription
                  </span>
                </div>
                <p className="font-serif italic text-stone-800 text-xs sm:text-sm leading-relaxed text-center py-2 px-4 border-y border-[#E8DFC8]/60 my-1">
                  &ldquo;{messageText}&rdquo;
                </p>
                <div className="text-right text-[11px] font-serif text-stone-600 font-medium pt-1">
                  — With Compliments for {recipientName || 'Gift Recipient'}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#ECE7DE] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-stone-600 hover:text-black transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-105 active:scale-[0.99] font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <BookmarkCheck size={14} />
            <span>Apply Gift Presentation</span>
          </button>
        </div>

      </div>
    </Modal>
  );
}

