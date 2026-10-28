"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  Gift, 
  Sparkles, 
  ArrowRight, 
  Check, 
  ChevronRight, 
  Search, 
  Package, 
  X, 
  RefreshCw,
  AlertCircle,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { message, Modal } from 'antd';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/common/QuickViewModal';
import productService from '@/services/productService';
import { DUMMY_PRODUCTS } from '@/data/dummyProducts';

// Available Gift Packaging Options
const PACKAGING_OPTIONS = [
  {
    id: 'gold_foil',
    name: 'Atelier Signature Gold Foil Box',
    tag: 'Complimentary',
    price: 0,
    description: 'Embossed heavy ivory rigid box with gold foil lettering, interior velvet cushion, and hand-tied grosgrain ribbon.',
    badge: 'Signature Standard',
    color: '#D4AF37'
  },
  {
    id: 'velvet_coffret',
    name: 'Midnight Velvet Presentation Coffret',
    tag: 'Exclusive Atelier',
    price: 0,
    description: 'Rich obsidian velvet jewelry coffret sealed with an authentic gold wax stamp and silk tassel.',
    badge: 'Haute Parfumerie',
    color: '#1A1A1A'
  },
  {
    id: 'silk_sachet',
    name: 'Imperial Raw Silk Keepsake Sachet',
    tag: 'Artisanal',
    price: 0,
    description: 'Handmade champagne raw silk protective travel pouch embroidered with the ROVE & AMBER motif.',
    badge: 'Artisanal Keepsake',
    color: '#8C6D1F'
  }
];

const OCCASIONS = [
  'Happy Birthday',
  'Happy Anniversary',
  'With Love & Devotion',
  'Warmest Congratulations',
  'A Token of Gratitude',
  'Just Because'
];

export default function GiftsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Active Collection Tab
  const [activeCollectionTab, setActiveCollectionTab] = useState('all');

  // Filter & Search states within Gift Catalogue
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Gift Packaging & Message Concierge Modal
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftOptions, setGiftOptions] = useState({
    isGift: true,
    recipientName: '',
    senderName: '',
    occasion: 'Happy Birthday',
    packagingId: 'gold_foil',
    messageText: '',
    deliveryDirect: false,
    recipientPhone: '',
    recipientAddress: ''
  });

  // Set document title
  useEffect(() => {
    document.title = 'The Art of Gifting | Luxury Fragrance Gifts | ROVE & AMBER';
  }, []);

  // Load existing gift options from localStorage if any
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rove_amber_gift_options');
      if (stored) {
        setGiftOptions(prev => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch (e) {
      console.warn('Could not read gift options', e);
    }
  }, []);

  // Fetch products from API with fallback to dummy catalogue
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getAllProducts();
      let list = [];
      if (res?.success && Array.isArray(res.data?.products) && res.data.products.length > 0) {
        list = res.data.products;
      } else if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        list = res.data;
      } else if (Array.isArray(res) && res.length > 0) {
        list = res;
      } else {
        list = DUMMY_PRODUCTS;
        setIsUsingFallback(true);
      }

      setProducts(list);
      setIsUsingFallback(false);
    } catch (err) {
      console.warn('Live API unavailable for gifts page, displaying local showcase catalogue:', err);
      setProducts(DUMMY_PRODUCTS);
      setIsUsingFallback(true);
      setError('Live atelier catalog is offline. Displaying curated gift collections from the showcase archive.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Curated collections based strictly on real product schema
  const collections = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        forHim: [],
        forHer: [],
        luxury: [],
        birthday: [],
        anniversary: []
      };
    }

    // 1. Gifts For Him: category containing Men's Fragrances or masculine woody/leather accords (excluding Women's)
    const forHim = products.filter(p => {
      const cat = (p.category_name || p.category || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      const isWomen = cat.includes('women');
      const isMenCategory = !isWomen && (cat.includes("men's") || cat.includes('men'));
      return isMenCategory || (!isWomen && (name.includes('oud reserve') || name.includes('midnight amber')));
    });

    // 2. Gifts For Her: category containing Women's Fragrances or luminous floral/amber accords
    const forHer = products.filter(p => {
      const cat = (p.category_name || p.category || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      const isWomenCategory = cat.includes('women');
      return isWomenCategory || name.includes('rose') || name.includes('golden saffron');
    });

    // 3. Luxury Gift Selections: highest tier Extraits de Parfum, Gift Sets, or price >= 4000
    const luxury = products.filter(p => {
      const price = Number(p.price) || 0;
      const cat = (p.category_name || p.category || '').toLowerCase();
      const sub = (p.subcategory || '').toLowerCase();
      return price >= 4000 || cat.includes('gift') || sub.includes('gift') || cat.includes('signature');
    });

    // 4. Birthday Gifts: Curated celebration bestsellers with vibrant opening notes
    const birthday = products.filter(p => {
      return p.isBestSeller || p.rating >= 4.9 || (p.reviewsCount && p.reviewsCount > 35);
    });

    // 5. Anniversary Gifts: Romantic and deep extraits for enduring moments
    const anniversary = products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const price = Number(p.price) || 0;
      return name.includes('amber') || name.includes('rose') || name.includes('reserve') || price >= 3800;
    });

    return {
      forHim: forHim.length > 0 ? forHim : products.slice(0, 4),
      forHer: forHer.length > 0 ? forHer : products.slice(0, 4),
      luxury: luxury.length > 0 ? luxury : products.slice(0, 4),
      birthday: birthday.length > 0 ? birthday : products.slice(0, 4),
      anniversary: anniversary.length > 0 ? anniversary : products.slice(0, 4)
    };
  }, [products]);

  // Filtered products for "Browse All Gifts" catalogue
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Active Collection Tab
    if (activeCollectionTab === 'for_him') {
      result = collections.forHim;
    } else if (activeCollectionTab === 'for_her') {
      result = collections.forHer;
    } else if (activeCollectionTab === 'luxury') {
      result = collections.luxury;
    } else if (activeCollectionTab === 'birthday') {
      result = collections.birthday;
    } else if (activeCollectionTab === 'anniversary') {
      result = collections.anniversary;
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const name = (p.name || '').toLowerCase();
        const cat = (p.category_name || p.category || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return name.includes(q) || cat.includes(q) || desc.includes(q);
      });
    }

    // Filter by Price range
    if (priceFilter === 'under_3500') {
      result = result.filter(p => Number(p.price) < 3500);
    } else if (priceFilter === '3500_4500') {
      result = result.filter(p => Number(p.price) >= 3500 && Number(p.price) <= 4500);
    } else if (priceFilter === 'above_4500') {
      result = result.filter(p => Number(p.price) > 4500);
    }

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }

    return result;
  }, [products, collections, activeCollectionTab, searchQuery, priceFilter, sortBy]);

  // Handle saving gift options
  const handleSaveGiftOptions = () => {
    if (giftOptions.messageText.length > 200) {
      message.error('Gift message must not exceed 200 characters.');
      return;
    }

    try {
      localStorage.setItem('rove_amber_gift_options', JSON.stringify(giftOptions));
      message.success('Gift packaging and message saved for your order.');
      setIsGiftModalOpen(false);
    } catch (e) {
      console.error('Error saving gift options:', e);
      message.error('Could not save gift options.');
    }
  };

  const selectedPackaging = PACKAGING_OPTIONS.find(p => p.id === giftOptions.packagingId) || PACKAGING_OPTIONS[0];

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col justify-between selection:bg-[#B8860B] selection:text-white">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 md:pt-32 pb-24 md:pb-20">
        
        {/* HERO SECTION: The Art of Gifting */}
        <section className="relative overflow-hidden bg-[#141414] text-white py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-12 mb-12 sm:mb-16">
          {/* Subtle Golden Ambient Backdrop Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8860B]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#D4AF37]/40 text-[#E0D0A5] text-[10px] sm:text-xs uppercase font-bold tracking-[0.25em]">
                <Sparkles size={12} className="text-[#D4AF37]" />
                Atelier Haute Gifting
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.15]">
                The Art of <span className="italic font-light text-[#E0D0A5]">Gifting</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-gray-300 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                Fragrance is the most intimate tribute. Immortalize birthdays, milestones, and personal moments with handcrafted extraits de parfum, complimentary gold-foiled rigid coffrets, and bespoke wax-sealed notes.
              </p>

              {/* Hero Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <a
                  href="#gift-collections"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#B8860B] hover:bg-[#9A7007] text-white text-xs uppercase font-bold tracking-widest transition-all shadow-md cursor-pointer group"
                >
                  <span>Explore Gift Curations</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsGiftModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs uppercase font-semibold tracking-wider transition-all cursor-pointer"
                >
                  <Gift size={14} className="text-[#E0D0A5]" />
                  <span>Personalize Gift Packaging</span>
                </button>
              </div>

              {/* Complimentary Gifting Pillars */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-white/10 text-left">
                <div>
                  <span className="text-[10px] sm:text-xs font-serif font-bold text-[#E0D0A5] block">
                    Gold-Foil Box
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 block mt-0.5">
                    Complimentary with every order
                  </span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs font-serif font-bold text-[#E0D0A5] block">
                    Bespoke Card
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 block mt-0.5">
                    Personal handwritten message
                  </span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs font-serif font-bold text-[#E0D0A5] block">
                    Discovery Samples
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 block mt-0.5">
                    Two 2ml miniatures included
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative max-w-md w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 aspect-[4/5] bg-[#1F1D1A]">
                  <img
                    src="/images/perfumes/signature_collection.jpg"
                    alt="ROVE & AMBER Signature Gift Presentation"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#E0D0A5] mb-1">
                      Signature Coffret
                    </span>
                    <h3 className="text-lg font-serif text-white font-normal">
                      Embossed Gold Presentation
                    </h3>
                    <p className="text-xs text-gray-300 font-light mt-1">
                      Hand-tied with double-faced emerald ribbon and finished with gold hot-stamping.
                    </p>
                  </div>
                </div>

                {/* Floating Floating Accent Badge */}
                <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-white text-black p-3.5 sm:p-4 rounded-xl shadow-xl border border-[#E8DFC9] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF3E0] border border-[#E0D0A5] flex items-center justify-center text-[#B8860B]">
                    <Gift size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C6D1F] block">
                      Gift Concierge
                    </span>
                    <span className="text-xs font-semibold text-black block">
                      100% Complimentary Packaging
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CONTAINER FOR CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-gray-400 mb-6 sm:mb-8 uppercase tracking-widest">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-gray-300" />
            <Link href="/shop" className="hover:text-black transition-colors">
              Collections
            </Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-black font-semibold">Gift Shopping</span>
          </nav>

          {/* Atelier Offline / Showcase Notice if API is down */}
          {(isUsingFallback || error) && (
            <div className="mb-8 p-4 rounded-xl bg-[#FAF6ED] border border-[#E8DFC9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#6B5738]">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={16} className="text-[#B8860B] flex-shrink-0" />
                <span>
                  <strong>Atelier Showcase Mode:</strong> {error || 'Displaying curated gift selections from our local showcase archive while the live store server is offline.'}
                </span>
              </div>
              <button
                type="button"
                onClick={fetchProducts}
                className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#B8860B] hover:text-black transition-colors cursor-pointer self-end sm:self-auto"
              >
                <RefreshCw size={12} />
                Retry Live Store
              </button>
            </div>
          )}

          {/* GIFT PACKAGING STUDIO BANNER / CARD */}
          <div className="mb-12 sm:mb-16 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#FAF6ED] via-[#FFFDF9] to-[#FAF6ED] border border-[#E8DFC9] shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] text-[10px] font-bold uppercase tracking-wider">
                    Complimentary Service
                  </span>
                  {giftOptions.recipientName && (
                    <span className="text-xs text-[#B8860B] font-medium">
                      Personalized for: {giftOptions.recipientName}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-black font-normal">
                  Personalize Packaging & Calligraphic Note
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                  Every flacon ordered as a gift is enveloped in our signature gold-embossed presentation box. Customize your packaging style and pen a personal message card below.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsGiftModalOpen(true)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black hover:bg-[#262626] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-xs cursor-pointer"
                >
                  <Gift size={15} />
                  <span>{giftOptions.recipientName ? 'Edit Gift Message & Box' : 'Configure Gift Packaging'}</span>
                </button>
              </div>
            </div>

            {/* Selected Packaging Preview summary if active */}
            {giftOptions.recipientName && (
              <div className="mt-5 pt-5 border-t border-[#E8DFC9] flex flex-wrap items-center gap-4 text-xs text-gray-700">
                <span className="font-semibold text-black">Active Configuration:</span>
                <span className="px-3 py-1 rounded-full bg-white border border-[#E0D8CA] text-gray-800">
                  Box: {selectedPackaging.name}
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-[#E0D8CA] text-gray-800">
                  Occasion: {giftOptions.occasion}
                </span>
                {giftOptions.messageText && (
                  <span className="text-gray-500 italic max-w-md truncate">
                    &ldquo;{giftOptions.messageText}&rdquo;
                  </span>
                )}
              </div>
            )}
          </div>

          {/* SECTION: CURATED GIFT COLLECTIONS */}
          <section id="gift-collections" className="mb-14 sm:mb-20">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6D1F] mb-2 block">
                Olfactory Curation
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-black font-normal tracking-tight">
                Curated Gift Collections
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-light mt-2">
                Discover bespoke fragrance pairings curated by our master perfumers for distinguished recipients and celebrated milestones.
              </p>
            </div>

            {/* Collection Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap mb-8">
              {[
                { id: 'all', label: 'All Gift Selections' },
                { id: 'for_him', label: 'Gifts for Him' },
                { id: 'for_her', label: 'Gifts for Her' },
                { id: 'luxury', label: 'Luxury Gift Sets' },
                { id: 'birthday', label: 'Birthday Gifts' },
                { id: 'anniversary', label: 'Anniversary Gifts' },
              ].map((tab) => {
                const isActive = activeCollectionTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCollectionTab(tab.id)}
                    className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-black text-white shadow-xs' 
                        : 'bg-white text-gray-600 hover:text-black hover:bg-[#F2ECE1] border border-[#E0D8CA]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* COLLECTION BANNER NOTICE */}
            <div className="mb-6 flex items-center justify-between text-xs text-gray-500 uppercase tracking-widest pb-3 border-b border-[#ECE7DE]">
              <span>
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Curated Gift' : 'Curated Gifts'}
              </span>
              <span>
                {activeCollectionTab === 'for_him' && 'Dedicated accords for distinguished men'}
                {activeCollectionTab === 'for_her' && 'Radiant florals and amber silks for her'}
                {activeCollectionTab === 'luxury' && 'Premier Extrait concentrations and coffrets'}
                {activeCollectionTab === 'birthday' && 'Milestone celebration recommendations'}
                {activeCollectionTab === 'anniversary' && 'Enduring romantic olfactory compositions'}
                {activeCollectionTab === 'all' && 'The full ROVE & AMBER gift collection'}
              </span>
            </div>

            {/* PRODUCT GRID */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border border-[#F0EBE1] p-4 rounded-sm animate-pulse flex flex-col items-center space-y-4">
                    <div className="w-full aspect-[4/5] bg-[#F3EDE2] rounded-xs" />
                    <div className="w-16 h-3 bg-[#E8DFC9] rounded" />
                    <div className="w-32 h-4 bg-[#E8DFC9] rounded" />
                    <div className="w-20 h-4 bg-[#E8DFC9] rounded" />
                    <div className="w-full h-9 bg-[#F3EDE2] rounded mt-2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center max-w-md mx-auto">
                <Package size={36} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg text-black">No gift fragrances match your selection</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">Try clearing filters or selecting another gift collection.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCollectionTab('all');
                    setPriceFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2 rounded-full bg-black text-white text-xs uppercase font-bold tracking-wider"
                >
                  Reset Gift Filters
                </button>
              </div>
            )}
          </section>

          {/* SECTION: BROWSE ALL GIFTS FILTER BAR */}
          <section className="mb-14 sm:mb-20 pt-10 border-t border-[#ECE7DE]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-black">
                  Refine Gift Catalogue
                </h3>
                <p className="text-xs text-gray-500 font-light mt-0.5">
                  Filter by price brackets or search by notes (oud, rose, amber, saffron).
                </p>
              </div>

              {/* Search and Price Filter Controls */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Search in gifts */}
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search fragrance..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-44 sm:w-56 rounded-full py-2 pl-9 pr-4 text-xs bg-white border border-[#E0D8CA] focus:border-black focus:outline-none text-black placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Price Bracket Dropdown / Selector */}
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="rounded-full py-2 px-3 text-xs bg-white border border-[#E0D8CA] text-gray-700 focus:border-black focus:outline-none cursor-pointer"
                >
                  <option value="all">All Gift Budgets</option>
                  <option value="under_3500">Under ₹3,500</option>
                  <option value="3500_4500">₹3,500 – ₹4,500</option>
                  <option value="above_4500">Above ₹4,500 (Prestige)</option>
                </select>

                {/* Sort Option */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full py-2 px-3 text-xs bg-white border border-[#E0D8CA] text-gray-700 focus:border-black focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured Gifts</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION: ATELIER GIFTING GUARANTEE */}
          <section className="mb-14 sm:mb-20 p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-[#F5EFE6] via-[#FAF7F2] to-[#F5EFE6] border border-[#E8DFC9] text-center">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6D1F] mb-2 block">
              The ROVE & AMBER Promise
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-black font-normal mb-4">
              Every Gift, Prepared with Reverence
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto font-light leading-relaxed mb-8">
              From our heavy French glass flacons to hand-tied emerald ribbons and wax-sealed parchment messages, we ensure your recipient feels celebrated before they even inhale the first drop.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
              <div className="p-5 bg-white rounded-xl border border-[#E8DFC9] shadow-2xs">
                <div className="w-9 h-9 rounded-full bg-[#FAF3E0] flex items-center justify-center text-[#B8860B] mb-3">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="font-serif text-sm font-semibold text-black">Artisanal Integrity</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  High extrait concentration crafted with wild agarwood, Kashmiri saffron, and Grasse roses.
                </p>
              </div>

              <div className="p-5 bg-white rounded-xl border border-[#E8DFC9] shadow-2xs">
                <div className="w-9 h-9 rounded-full bg-[#FAF3E0] flex items-center justify-center text-[#B8860B] mb-3">
                  <Gift size={18} />
                </div>
                <h4 className="font-serif text-sm font-semibold text-black">Bespoke Inscription</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Personal notes are printed on 300gsm textured linen cardstock and placed inside the presentation box.
                </p>
              </div>

              <div className="p-5 bg-white rounded-xl border border-[#E8DFC9] shadow-2xs">
                <div className="w-9 h-9 rounded-full bg-[#FAF3E0] flex items-center justify-center text-[#B8860B] mb-3">
                  <Truck size={18} />
                </div>
                <h4 className="font-serif text-sm font-semibold text-black">Secure Direct Delivery</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Discreet outer packaging with insured, tracked express transit directly to your recipient.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* INTERACTIVE GIFT PACKAGING & MESSAGE CONCIERGE MODAL */}
      <Modal
        open={isGiftModalOpen}
        onCancel={() => setIsGiftModalOpen(false)}
        footer={null}
        centered
        width={680}
        className="font-sans"
      >
        <div className="p-2 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] text-[10px] font-bold uppercase tracking-widest">
              Complimentary Studio
            </span>
          </div>

          <h3 className="font-serif text-2xl text-black font-normal">
            Personalize Gift Presentation & Note
          </h3>
          <p className="text-xs text-gray-500 font-light mt-1 mb-6">
            Configure your complimentary gift box style and compose a personalized calligraphic card for your recipient.
          </p>

          <div className="space-y-6">
            {/* 1. Packaging Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-3">
                1. Select Presentation Box Style
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PACKAGING_OPTIONS.map((opt) => {
                  const isSelected = giftOptions.packagingId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setGiftOptions(prev => ({ ...prev, packagingId: opt.id }))}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-[#FAF8F5] border-black shadow-xs ring-1 ring-black' 
                          : 'bg-white border-[#E0D8CA] hover:border-black'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-black text-white flex items-center justify-center">
                          <Check size={10} />
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#B8860B] block mb-1">
                          {opt.tag}
                        </span>
                        <h5 className="font-serif text-xs font-bold text-black leading-snug">
                          {opt.name}
                        </h5>
                        <p className="text-[10px] text-gray-500 font-light mt-1.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 mt-2 block">
                        Included Free
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Recipient & Occasion Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alisha Kapur"
                  value={giftOptions.recipientName}
                  onChange={(e) => setGiftOptions(prev => ({ ...prev, recipientName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#E0D8CA] focus:border-black focus:outline-none text-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Occasion Motif
                </label>
                <select
                  value={giftOptions.occasion}
                  onChange={(e) => setGiftOptions(prev => ({ ...prev, occasion: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF8F5] border border-[#E0D8CA] focus:border-black focus:outline-none text-black cursor-pointer"
                >
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Personalized Message */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Calligraphic Card Inscription
                </label>
                <span className={`text-[10px] ${giftOptions.messageText.length > 200 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                  {giftOptions.messageText.length} / 200 characters
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={220}
                placeholder="Write your personal wishes here. Our atelier concierges will inscribe this verbatim onto a textured gold-stamped card..."
                value={giftOptions.messageText}
                onChange={(e) => setGiftOptions(prev => ({ ...prev, messageText: e.target.value }))}
                className="w-full p-3 rounded-xl text-xs bg-[#FAF8F5] border border-[#E0D8CA] focus:border-black focus:outline-none text-black placeholder-gray-400 leading-relaxed"
              />
            </div>

            {/* LIVE CARD PREVIEW */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#FFFDF9] to-[#F5EFE6] border border-[#E0D0A5] shadow-xs relative">
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#8C6D1F] block mb-2">
                Card Envelope Preview
              </span>
              <div className="font-serif space-y-2 text-center py-2">
                <span className="text-xs uppercase tracking-widest text-[#B8860B] block">
                  {giftOptions.occasion || 'Happy Birthday'}
                </span>
                <p className="text-sm sm:text-base font-normal text-black italic max-w-md mx-auto leading-relaxed font-serif">
                  &ldquo;{giftOptions.messageText.trim() || 'Wishing you an unforgettable day filled with joy, warmth, and enduring beauty.'}&rdquo;
                </p>
                <span className="text-xs font-semibold text-gray-700 block pt-1">
                  Presented to {giftOptions.recipientName.trim() || 'Your Recipient'}
                </span>
              </div>
            </div>

            {/* Transparency Note regarding backend order persistence */}
            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 flex items-start gap-2">
              <ShieldCheck size={14} className="text-black flex-shrink-0 mt-0.5" />
              <span>
                <strong>Studio Note:</strong> Complimentary gift packaging and ribboning are automatically applied to your selected gift flacons. Your personalized card inscription is saved to your session and will be hand-inspected by our team prior to dispatch.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsGiftModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGiftOptions}
                className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-[#262626] transition-colors shadow-xs cursor-pointer"
              >
                Save Gift Options
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
