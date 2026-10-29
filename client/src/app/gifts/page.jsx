"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gift, 
  Sparkles, 
  ArrowRight, 
  Heart, 
  ShoppingBag, 
  Star, 
  Package, 
  Truck, 
  Check, 
  X,
  Cake,
  CalendarHeart,
  Crown,
  Sparkle
} from 'lucide-react';
import { message, Modal } from 'antd';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { cartService } from '@/services/cartService';

const GIFT_CATEGORIES = [
  { id: 'birthday', name: 'Birthday Gifts', icon: Cake, filter: 'Birthday' },
  { id: 'anniversary', name: 'Anniversary Gifts', icon: CalendarHeart, filter: 'Anniversary' },
  { id: 'for-her', name: 'For Her', icon: Heart, filter: 'Women' },
  { id: 'for-him', name: 'For Him', icon: Crown, filter: 'Men' },
  { id: 'wedding', name: 'Wedding Gifts', icon: Sparkles, filter: 'Wedding' },
  { id: 'special', name: 'Special Occasions', icon: Star, filter: 'Special' }
];

const FEATURED_GIFT_SETS = [
  {
    id: 'gift-royal-elegance',
    _id: 'gift-royal-elegance',
    name: 'Royal Elegance Gift Set',
    slug: 'royal-elegance-gift-set',
    price: 5850,
    originalPrice: 7200,
    rating: 5.0,
    reviewsCount: 38,
    isBestSeller: false,
    image: '/images/perfumes/gift_set_royal_elegance.jpg',
    fallback: '/images/perfumes/signature_collection.jpg',
    description: 'Amber Royal Eau de Parfum (100ml) paired with artisanal amber candle and gold velvet coffret.',
    notes: 'Aged Amber • Bulgarian Rose • Sandalwood'
  },
  {
    id: 'gift-oud-luxury',
    _id: 'gift-oud-luxury',
    name: 'Oud Luxury Set',
    slug: 'oud-luxury-set',
    price: 6250,
    originalPrice: 7800,
    rating: 5.0,
    reviewsCount: 64,
    isBestSeller: true,
    image: '/images/perfumes/gift_set_oud_luxury.jpg',
    fallback: '/images/perfumes/noir_intense.jpg',
    description: 'Oud Noir Extrait (100ml) accompanied by Cambodian Oud travel flacon (20ml) in obsidian silk box.',
    notes: 'Cambodian Oud • Smoked Birch • Tonka'
  },
  {
    id: 'gift-velvet-romance',
    _id: 'gift-velvet-romance',
    name: 'Velvet Romance Set',
    slug: 'velvet-romance-set',
    price: 4950,
    originalPrice: 6100,
    rating: 4.9,
    reviewsCount: 42,
    isBestSeller: false,
    image: '/images/perfumes/gift_set_velvet_romance.jpg',
    fallback: '/images/perfumes/gemini_rose_elixir.jpg',
    description: 'Rose Elixir (100ml) with nourishing perfumed body silk and embossed greeting card in blush coffret.',
    notes: 'Damask Rose • Pink Pepper • Ambergris'
  },
  {
    id: 'gift-signature-collection',
    _id: 'gift-signature-collection',
    name: 'Signature Collection',
    slug: 'signature-collection',
    price: 7450,
    originalPrice: 9200,
    rating: 5.0,
    reviewsCount: 89,
    isBestSeller: false,
    image: '/images/perfumes/gift_set_signature_coffret.jpg',
    fallback: '/images/perfumes/amber_oud_perfume.jpg',
    description: 'Duo grand flacons: Amber Royal & Oud Noir (100ml each) presented in heavy embossed gold foil chest.',
    notes: 'Aged Amber • Cambodian Oud • Royal Woods'
  }
];

const OCCASIONS_DATA = [
  {
    id: 'birthdays',
    title: 'Birthdays',
    image: '/images/perfumes/gift_occ_birthdays.jpg',
    href: '/shop?category=Gifts'
  },
  {
    id: 'anniversaries',
    title: 'Anniversaries',
    image: '/images/perfumes/gift_occ_anniversaries.jpg',
    href: '/shop?category=Gifts'
  },
  {
    id: 'weddings',
    title: 'Weddings',
    image: '/images/perfumes/gift_occ_weddings.jpg',
    href: '/shop?category=Gifts'
  },
  {
    id: 'festive',
    title: 'Festive Gifting',
    image: '/images/perfumes/gift_occ_festive.jpg',
    href: '/shop?category=Gifts'
  }
];

const CUSTOMER_REVIEWS = [
  {
    id: 1,
    name: 'Arjun M.',
    rating: 5,
    text: 'The gift packaging was absolutely beautiful and the fragrance is incredible. My wife loved it!'
  },
  {
    id: 2,
    name: 'Priya S.',
    rating: 5,
    text: 'Perfect for an anniversary gift. The personalized note made it even more special.'
  },
  {
    id: 3,
    name: 'Karan T.',
    rating: 5,
    text: 'Elegant packaging, premium fragrance, and timely delivery. Highly recommended!'
  }
];

export default function GiftsPage() {
  const [wishlist, setWishlist] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [customNote, setCustomNote] = useState({
    to: '',
    from: '',
    occasion: 'Anniversary',
    message: ''
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rove_amber_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let updated = [];
      if (wishlist.includes(id)) {
        updated = wishlist.filter(item => item !== id);
        message.info('Removed from Wishlist');
      } else {
        updated = [...wishlist, id];
        message.success('Added to Wishlist');
      }
      setWishlist(updated);
      localStorage.setItem('rove_amber_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlistChange'));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(product.id);
    try {
      cartService.addToCart({
        ...product,
        size: 'Gift Set Coffret'
      }, 1, 'Gift Set Coffret');
      message.success(`${product.name} added to your shopping bag`);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setAddingId(null), 400);
    }
  };

  const handleSavePersonalization = (e) => {
    e.preventDefault();
    if (!customNote.message.trim()) {
      message.warning('Please enter a short personal message.');
      return;
    }
    localStorage.setItem('rove_amber_gift_note', JSON.stringify(customNote));
    message.success('Complimentary gift message saved to your order!');
    setIsPersonalizeOpen(false);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      message.error('Please enter a valid email address.');
      return;
    }
    setNewsletterSubscribed(true);
    message.success('Welcome to the ROVE & AMBER Circle! Exclusive gifting privilege unlocked.');
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C120C] font-sans overflow-x-hidden w-full selection:bg-[#B8860B] selection:text-white">
      <Navbar />

      {/* 1. HERO SECTION: "The Art of Gifting" */}
      <section className="relative min-h-[85vh] sm:min-h-screen w-full flex flex-col justify-between bg-[#140D08] overflow-hidden">
        {/* Background Visual */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/perfumes/gift_hero_unforgettable.jpg"
            alt="ROVE & AMBER Luxury Perfume Gifting"
            className="w-full h-full object-cover object-[75%_center] md:object-right"
          />
          {/* Atmospheric gradient overlay for readable typography */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/75 md:hidden pointer-events-none" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#120B06]/90 via-[#120B06]/45 via-45% to-transparent w-full pointer-events-none" />
          <div className="hidden md:block absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/55 via-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 w-full pt-36 sm:pt-44 lg:pt-48 pb-12 flex-1 flex flex-col justify-center">
          <div className="max-w-md sm:max-w-lg lg:max-w-xl text-left">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <span className="w-6 sm:w-8 h-[1.5px] bg-[#E5B869]" />
              <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.28em] font-medium uppercase text-[#E5B869] drop-shadow-sm">
                The Art of Gifting
              </p>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-[58px] font-serif leading-[1.08] mb-3 sm:mb-5 font-normal tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
              Fragrances <br />
              Make Moments <br />
              <span className="italic font-serif text-[#E5B869] font-normal">Unforgettable</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#E8DDD0] font-light leading-relaxed mb-7 sm:mb-9 max-w-xs sm:max-w-md drop-shadow-sm">
              A thoughtfully chosen fragrance is more than a gift, it's a lasting memory. Discover our curated gifting collection for every special moment.
            </p>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <a
                href="#featured-gift-sets"
                className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] text-xs sm:text-sm font-semibold tracking-wider shadow-xl shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all group"
              >
                <span>Explore Gift Collection</span>
                <span className="w-5 h-5 rounded-full bg-[#281608]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight size={12} strokeWidth={2.5} />
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Curved Convex Bottom Scoop */}
        <div className="relative z-20 w-full flex flex-col items-center">
          <div className="w-full h-6 sm:h-10 md:h-12 bg-[#FBF9F5] rounded-t-[50%_100%] shadow-[0_-8px_16px_rgba(0,0,0,0.15)]" />
        </div>
      </section>

      {/* 2. GIFTING CATEGORY SHORTCUTS (6 Round Icons) */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-6">
          {GIFT_CATEGORIES.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.id}
                href="#featured-gift-sets"
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-full bg-[#F3ECE2] border border-[#E5DACB] group-hover:border-[#DEB368] group-hover:bg-[#EAE0D2] group-hover:scale-105 flex items-center justify-center transition-all duration-300 shadow-xs mb-2">
                  <IconComponent size={22} className="text-[#8C6D1F] sm:w-6 sm:h-6 group-hover:text-[#281608] transition-colors" />
                </div>
                <span className="text-[11px] sm:text-xs font-serif font-medium text-[#281608] group-hover:text-[#B86526] transition-colors">
                  {item.name}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* 3. DUALITY BANNERS: GIFTS FOR HER & GIFTS FOR HIM */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Card: Gifts For Her */}
          <Link
            href="/shop?category=Women's%20Fragrances"
            className="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[320px] bg-[#2A1618] border border-[#542B30]/60 hover:border-[#DEB368]/70 shadow-lg hover:shadow-2xl transition-all duration-500 group flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="/images/perfumes/gift_for_her_luxury.jpg"
                alt="Gifts For Her"
                className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent w-full sm:w-3/4" />
            </div>
            <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-xs sm:max-w-sm">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white tracking-wide font-normal mb-1 sm:mb-2">
                Gifts <br />
                <span className="italic font-serif text-[#ECC880]">For Her</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 font-light mb-4 sm:mb-6">
                Elegant. Graceful. Timeless.
              </p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs font-semibold tracking-wider shadow-md group-hover:brightness-105 transition-all">
                <span>Explore</span>
                <ArrowRight size={11} strokeWidth={2.5} />
              </span>
            </div>
          </Link>

          {/* Card: Gifts For Him */}
          <Link
            href="/shop?category=Men's%20Fragrances"
            className="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[320px] bg-[#16120E] border border-[#352B22]/60 hover:border-[#DEB368]/70 shadow-lg hover:shadow-2xl transition-all duration-500 group flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <img
                src="/images/perfumes/gift_for_him_luxury.jpg"
                alt="Gifts For Him"
                className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent w-full sm:w-3/4" />
            </div>
            <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-xs sm:max-w-sm">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white tracking-wide font-normal mb-1 sm:mb-2">
                Gifts <br />
                <span className="italic font-serif text-[#ECC880]">For Him</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 font-light mb-4 sm:mb-6">
                Bold. Refined. Distinguished.
              </p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs font-semibold tracking-wider shadow-md group-hover:brightness-105 transition-all">
                <span>Explore</span>
                <ArrowRight size={11} strokeWidth={2.5} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. FEATURED GIFT SETS (Product Grid) */}
      <section id="featured-gift-sets" className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-10 border-b border-[#ECE5D8]/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 sm:w-6 h-[1.5px] bg-[#B86526]" />
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#B86526] font-semibold">
                Curated Coffrets
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1C120C] font-normal tracking-tight">
              Featured Gift Sets
            </h2>
            <p className="text-xs sm:text-sm text-[#7D6E63] font-light mt-0.5">
              Beautifully curated sets for every special occasion.
            </p>
          </div>
          <Link
            href="/shop?category=Gifts"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#1A1A1A] hover:text-[#B86526] transition-colors group self-start sm:self-auto"
          >
            <span>View All Gifts</span>
            <ArrowRight size={13} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
          {FEATURED_GIFT_SETS.map((item) => {
            const isFavorited = wishlist.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#EDE7DD] hover:border-[#D4AF37]/50 p-2.5 sm:p-5 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(42,24,14,0.1)] hover:-translate-y-1.5 transition-all duration-300 group relative"
              >
                {/* Image Box */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#F1ECE3] flex items-center justify-center p-2 sm:p-4 mb-3 border border-[#F0EAE1]">
                  {item.isBestSeller && (
                    <span className="absolute top-2 left-2 z-10 text-[8px] sm:text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#1C120C] text-[#ECC880] border border-[#DEB368]/40 shadow-xs">
                      Best Seller
                    </span>
                  )}

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(e, item.id)}
                    className={`absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-md shadow-xs border border-white/60 transition-all hover:scale-110 active:scale-95 ${
                      isFavorited ? 'text-rose-600 bg-rose-50' : 'text-gray-400 hover:text-[#1A1A1A]'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart size={13} fill={isFavorited ? 'currentColor' : 'none'} strokeWidth={isFavorited ? 0 : 2} />
                  </button>

                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-md"
                    onError={(e) => {
                      e.target.src = item.fallback;
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between mb-3 text-center sm:text-left">
                  <h3 className="text-xs sm:text-base font-serif font-medium text-[#1A1A1A] group-hover:text-[#B86526] transition-colors leading-snug truncate">
                    {item.name}
                  </h3>
                  <p className="hidden sm:block text-[11px] text-[#7A695A] font-light line-clamp-1 mt-0.5">
                    {item.notes}
                  </p>
                  <p className="text-xs sm:text-base font-bold text-[#1C120C] font-sans mt-1">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={(e) => handleAddToCart(e, item)}
                  disabled={addingId === item.id}
                  className="w-full py-2 sm:py-2.5 px-3 rounded-xl bg-[#1E120A] hover:bg-[#DEB368] text-white hover:text-[#1E120A] text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 shadow-sm cursor-pointer"
                >
                  <ShoppingBag size={13} strokeWidth={2} />
                  <span>{addingId === item.id ? 'Adding...' : 'Add to Cart'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. PERSONALIZE YOUR GIFT (Editorial Banner) */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[340px] bg-[#221610] border border-[#3E291C]/70 shadow-xl flex items-center">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/perfumes/gift_personalize_box.jpg"
              alt="Personalize Your Gift"
              className="w-full h-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent w-full sm:w-3/4" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-sm sm:max-w-md text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#E5B869]" />
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#E5B869] font-semibold">
                Bespoke Atelier
              </p>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-4xl font-serif text-white tracking-tight font-normal mb-2 sm:mb-3">
              Personalize <br />
              <span className="italic font-serif text-[#ECC880]">Your Gift</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 font-light leading-relaxed mb-5 sm:mb-7">
              Add a personal touch with custom messages and elegant gift wrapping.
            </p>
            <button
              type="button"
              onClick={() => setIsPersonalizeOpen(true)}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs sm:text-sm font-semibold tracking-wider shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Learn More</span>
              <ArrowRight size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE OUR GIFTS (4 Trust Pillars) */}
      <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1C120C] font-normal tracking-tight mb-8 sm:mb-12">
          Why Choose Our Gifts
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#F3ECE2] border border-[#E5DACB] flex items-center justify-center mb-3">
              <Sparkles size={20} className="text-[#8C6D1F]" />
            </div>
            <h3 className="text-sm sm:text-base font-serif font-medium text-[#1C120C] mb-1">
              Premium Fragrances
            </h3>
            <p className="text-[11px] sm:text-xs text-[#7A695A] font-light max-w-[190px]">
              Finest ingredients and artisanal blends.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#F3ECE2] border border-[#E5DACB] flex items-center justify-center mb-3">
              <Package size={20} className="text-[#8C6D1F]" />
            </div>
            <h3 className="text-sm sm:text-base font-serif font-medium text-[#1C120C] mb-1">
              Elegant Packaging
            </h3>
            <p className="text-[11px] sm:text-xs text-[#7A695A] font-light max-w-[190px]">
              Beautifully crafted gift boxes.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#F3ECE2] border border-[#E5DACB] flex items-center justify-center mb-3">
              <Heart size={20} className="text-[#8C6D1F]" />
            </div>
            <h3 className="text-sm sm:text-base font-serif font-medium text-[#1C120C] mb-1">
              Personalized Messages
            </h3>
            <p className="text-[11px] sm:text-xs text-[#7A695A] font-light max-w-[190px]">
              Add a heartfelt note to your gift.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#F3ECE2] border border-[#E5DACB] flex items-center justify-center mb-3">
              <Truck size={20} className="text-[#8C6D1F]" />
            </div>
            <h3 className="text-sm sm:text-base font-serif font-medium text-[#1C120C] mb-1">
              Secure Delivery
            </h3>
            <p className="text-[11px] sm:text-xs text-[#7A695A] font-light max-w-[190px]">
              Safe and reliable delivery across India.
            </p>
          </div>
        </div>
      </section>

      {/* 7. GIFTS FOR EVERY OCCASION (Occasions Cards) */}
      <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-2xl sm:rounded-3xl bg-[#160E09] border border-[#2E1E14] p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-8 justify-between shadow-xl">
          {/* Left Title & Button */}
          <div className="max-w-md text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-[1.5px] bg-[#E5B869]" />
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#E5B869] font-semibold">
                Celebrations
              </p>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight font-normal mb-2 sm:mb-3">
              Gifts for <br />
              <span className="italic font-serif text-[#ECC880]">Every Occasion</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed mb-6">
              From birthdays to anniversaries, celebrate life's special moments with the perfect fragrance.
            </p>
            <Link
              href="/shop?category=Gifts"
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs sm:text-sm font-semibold tracking-wider shadow-md hover:brightness-105 active:scale-95 transition-all"
            >
              <span>Shop by Occasion</span>
              <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Right: 4 Occasion Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full lg:w-auto">
            {OCCASIONS_DATA.map((occ) => (
              <Link
                key={occ.id}
                href={occ.href}
                className="relative rounded-xl overflow-hidden aspect-[3/4] w-full sm:w-32 lg:w-36 bg-[#251A14] border border-[#3E2B20] hover:border-[#DEB368] transition-all duration-300 group flex flex-col justify-end p-2.5 shadow-md"
              >
                <img
                  src={occ.image}
                  alt={occ.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="relative z-10 flex items-center justify-between text-white">
                  <span className="text-[11px] sm:text-xs font-serif font-medium leading-tight">
                    {occ.title}
                  </span>
                  <span className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-[#DEB368] group-hover:text-[#160E09] transition-colors">
                    <ArrowRight size={10} strokeWidth={2.5} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8. LOVED BY OUR CUSTOMERS (Reviews) */}
      <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-serif text-[#1C120C] font-normal tracking-tight">
              Loved by Our Customers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {CUSTOMER_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-[#EDE7DD] p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-left flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-[#DEB368] text-sm mb-3">
                  {'★★★★★'.split('').map((s, idx) => (
                    <span key={idx}>{s}</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#4A3B2C] font-light leading-relaxed italic mb-4">
                  "{rev.text}"
                </p>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#1C120C] font-sans">
                — {rev.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. VIP NEWSLETTER */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-2xl sm:rounded-3xl bg-[#1C120C] border border-[#35251A] p-6 sm:p-10 lg:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight mb-2">
              Join the <span className="italic font-serif text-[#ECC880]">ROVE & AMBER</span> Circle
            </h2>
            <p className="text-xs sm:text-sm text-[#D5C9B8] font-light leading-relaxed mb-6 sm:mb-8">
              Be the first to know about new arrivals, exclusive gifts, and fragrance stories.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-5 py-3 rounded-full bg-white text-[#1A1A1A] text-xs sm:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DEB368]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs sm:text-sm font-semibold tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
              >
                <span>Subscribe</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* PERSONALIZATION MODAL */}
      <Modal
        open={isPersonalizeOpen}
        onCancel={() => setIsPersonalizeOpen(false)}
        footer={null}
        centered
        className="luxury-gift-modal"
      >
        <div className="p-4 sm:p-6 text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-[1.5px] bg-[#B86526]" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#B86526] font-semibold">
              Complimentary Atelier Service
            </p>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif text-[#1C120C] font-normal mb-1">
            Personalize Your Gift
          </h3>
          <p className="text-xs text-[#7A695A] font-light mb-5">
            Every ROVE & AMBER gift order includes complimentary rigid ivory presentation boxes and hand-inscribed calligraphy greeting cards.
          </p>

          <form onSubmit={handleSavePersonalization} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A3B2C] mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={customNote.to}
                onChange={(e) => setCustomNote({ ...customNote, to: e.target.value })}
                placeholder="e.g., Dearest Sophia"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#B86526]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A3B2C] mb-1">
                Your Name / Sender
              </label>
              <input
                type="text"
                value={customNote.from}
                onChange={(e) => setCustomNote({ ...customNote, from: e.target.value })}
                placeholder="e.g., Alexander"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#B86526]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A3B2C] mb-1">
                Occasion
              </label>
              <select
                value={customNote.occasion}
                onChange={(e) => setCustomNote({ ...customNote, occasion: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#B86526]"
              >
                <option value="Anniversary">Happy Anniversary</option>
                <option value="Birthday">Happy Birthday</option>
                <option value="Wedding">Wedding Celebration</option>
                <option value="Gratitude">Token of Gratitude</option>
                <option value="Love">With Love & Devotion</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A3B2C] mb-1">
                Handwritten Message
              </label>
              <textarea
                rows={3}
                value={customNote.message}
                onChange={(e) => setCustomNote({ ...customNote, message: e.target.value })}
                placeholder="Write your heartfelt note here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C9B8] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#B86526] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs sm:text-sm font-semibold tracking-wider hover:brightness-105 active:scale-95 transition-all shadow-md cursor-pointer mt-2"
            >
              Save Note to Order
            </button>
          </form>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
