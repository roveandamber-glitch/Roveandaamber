"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { message } from 'antd';
import { cartService } from '../../services/cartService';
import productService from '../../services/productService';
import { getImageUrl } from '../../utils/imageHelper';

const BADGE_STYLES = {
  signature: 'bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] border border-[#B8860B]/20',
  bestseller: 'bg-[#1C120C] text-[#ECC880] border border-[#DEB368]/40',
  accord: 'bg-[#F2ECE1] text-[#4A3B2C] border border-[#D5C9B8]',
  limited: 'bg-[#5B232D] text-[#FBEBEF] border border-[#8B3A48]'
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rove_amber_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }

    const loadFeatured = async () => {
      try {
        const res = await productService.getAllProducts();
        let list = [];
        if (res?.success && Array.isArray(res.data?.products)) {
          list = res.data.products;
        } else if (res?.success && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setProducts(list.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured products from database:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
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
    const prodId = product._id || product.id;
    setAddingId(prodId);
    try {
      const defaultSize = (product.sizes && product.sizes[0]) || '50ml';
      cartService.addToCart({
        ...product,
        id: prodId,
        _id: prodId,
        size: defaultSize
      }, 1, defaultSize);
      message.success(`${product.name} added to your shopping bag`);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setAddingId(null), 400);
    }
  };

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header with Editorial Atmosphere */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10 lg:mb-12 border-b border-[#ECE5D8]/80 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-[1.5px] bg-[#C99042]" />
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#C99042] font-semibold">
              Curated Editions • Live Atelier
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1C120C] font-normal tracking-tight">
            New Arrivals
          </h2>
          <p className="text-xs sm:text-sm text-[#7D6E63] font-light mt-1 max-w-lg">
            Sculpted in small limited batches using rare aged resins, precious wild oud, and pure botanical extracts.
          </p>
        </div>

        <Link 
          href="/shop" 
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#D5C9B8] bg-white hover:bg-[#1E120A] hover:text-white hover:border-[#1E120A] text-xs sm:text-sm font-medium text-[#1E120A] transition-all duration-300 self-start sm:self-auto group shadow-xs"
        >
          <span>Explore All Fragrances</span>
          <ArrowRight size={13} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Product Cards Grid: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7">
        {products.map((product) => {
          const prodId = product._id || product.id;
          const isFavorited = wishlist.includes(prodId);
          const originalPrice = product.originalPrice || (product.price ? Math.round(product.price * 1.2) : 0);
          const discountPct = originalPrice > product.price
            ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
            : 0;
          const badge = product.isFeatured ? 'Signature' : (product.isBestSeller ? 'Best Seller' : 'Atelier Release');
          const badgeType = product.isFeatured ? 'signature' : (product.isBestSeller ? 'bestseller' : 'accord');
          const family = product.fragranceFamily || product.categoryName || product.category || 'Eau de Parfum';
          const volume = (product.sizes && product.sizes[0]) || '50ML';
          const rating = Number(product.rating || 5.0).toFixed(1);
          const reviewsCount = product.reviewsCount || 28;
          const imageSrc = getImageUrl(product.image || product.images?.[0]?.url || product.images?.[0]);

          return (
            <div 
              key={prodId}
              className="bg-white rounded-2xl border border-[#EDE7DD] hover:border-[#D4AF37]/50 p-2.5 sm:p-5 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(42,24,14,0.1)] hover:-translate-y-1.5 transition-all duration-300 group relative"
            >
              {/* Card Image Stage */}
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-b from-[#FAF7F2] to-[#F1ECE3] flex items-center justify-center p-2.5 sm:p-5 mb-3 sm:mb-4 border border-[#F0EAE1]">
                {/* Badge Top-Left */}
                <span className={`absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 text-[8px] sm:text-[9.5px] font-semibold tracking-wider uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs ${BADGE_STYLES[badgeType]}`}>
                  {badge}
                </span>

                {/* Wishlist Button Top-Right */}
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(e, prodId)}
                  className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-md shadow-xs border border-white/60 transition-all hover:scale-110 active:scale-95 ${
                    isFavorited ? 'text-rose-600 bg-rose-50' : 'text-gray-400 hover:text-[#1A1A1A]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={13} fill={isFavorited ? 'currentColor' : 'none'} strokeWidth={isFavorited ? 0 : 2} />
                </button>

                {/* Concentration & Volume Pill */}
                <span className="absolute bottom-2 inset-x-2 z-10 text-center text-[7.5px] sm:text-[9px] tracking-[0.18em] uppercase font-semibold text-[#7D6B5A] bg-white/85 backdrop-blur-sm py-0.5 rounded-md border border-white/40">
                  Eau de Parfum • {volume}
                </span>

                {/* Perfume Bottle Image with Smooth Hover Zoom */}
                <Link href={`/product/${prodId}`} className="w-full h-full flex items-center justify-center">
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-700 ease-out drop-shadow-md"
                    onError={(e) => {
                      e.target.src = '/images/perfumes/signature_collection.jpg';
                    }}
                  />
                </Link>
              </div>

              {/* Fragrance Details & Notes */}
              <div className="flex-1 flex flex-col justify-between mb-3 text-left">
                {/* Scent Accord Family & Rating */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] sm:text-xs font-serif italic text-[#9B7347] truncate max-w-[120px]">
                    {family}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#8C7662]">
                    <span className="text-[#DEB368] text-xs">★</span>
                    <span className="font-semibold text-[#1A1A1A]">{rating}</span>
                    <span className="text-gray-400 text-[9.5px]">({reviewsCount})</span>
                  </div>
                </div>

                {/* Product Name */}
                <Link href={`/product/${prodId}`}>
                  <h3 className="text-sm sm:text-base lg:text-lg font-serif font-medium text-[#1A1A1A] group-hover:text-[#B86526] transition-colors leading-snug truncate">
                    {product.name}
                  </h3>
                </Link>

                {/* Price, Original Price & Discount */}
                <div className="flex items-baseline gap-1.5 sm:gap-2 mt-2">
                  <span className="text-sm sm:text-base lg:text-lg font-bold text-[#1C120C] font-sans">
                    ₹{Number(product.price || 0).toLocaleString('en-IN')}
                  </span>
                  {originalPrice > product.price && (
                    <span className="text-[10px] sm:text-xs text-gray-400 line-through font-sans">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-[#2E7D32] bg-emerald-50 px-1.5 py-0.2 rounded">
                      Save {discountPct}%
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, product)}
                disabled={addingId === prodId}
                className="w-full py-2.5 sm:py-3 px-3 rounded-xl bg-[#1E120A] hover:bg-[#DEB368] text-white hover:text-[#1E120A] text-xs sm:text-sm font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md cursor-pointer group/btn"
              >
                <ShoppingBag size={14} strokeWidth={2} className="group-hover/btn:scale-110 transition-transform" />
                <span>{addingId === prodId ? 'Adding to Bag...' : 'Add to Bag'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedProducts;
