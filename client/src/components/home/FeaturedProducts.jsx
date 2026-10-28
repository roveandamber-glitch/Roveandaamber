"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { message } from 'antd';
import { cartService } from '../../services/cartService';

const NEW_ARRIVALS = [
  {
    id: 'prod-amber-royal',
    _id: 'prod-amber-royal',
    name: 'Amber Royal',
    slug: 'amber-royal',
    price: 4250,
    image: '/images/perfumes/gemini_amber_royal.jpg',
    fallback: '/images/perfumes/prod_amber_royal.png',
    category: 'Eau de Parfum',
    isBestSeller: false
  },
  {
    id: 'prod-oud-noir',
    _id: 'prod-oud-noir',
    name: 'Oud Noir',
    slug: 'oud-noir',
    price: 3850,
    image: '/images/perfumes/gemini_oud_noir.jpg',
    fallback: '/images/perfumes/prod_oud_noir.png',
    category: 'Eau de Parfum',
    isBestSeller: true
  },
  {
    id: 'prod-velvet-musk',
    _id: 'prod-velvet-musk',
    name: 'Velvet Musk',
    slug: 'velvet-musk',
    price: 3200,
    image: '/images/perfumes/gemini_velvet_musk.jpg',
    fallback: '/images/perfumes/prod_velvet_musk.png',
    category: 'Eau de Parfum',
    isBestSeller: false
  },
  {
    id: 'prod-rose-elixir',
    _id: 'prod-rose-elixir',
    name: 'Rose Elixir',
    slug: 'rose-elixir',
    price: 3600,
    image: '/images/perfumes/gemini_rose_elixir.jpg',
    fallback: '/images/perfumes/prod_rose_elixir.png',
    category: 'Eau de Parfum',
    isBestSeller: false
  }
];

const FeaturedProducts = () => {
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
        size: '50ml'
      }, 1, '50ml');
      message.success(`Added ${product.name} to cart`);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setAddingId(null), 400);
    }
  };

  return (
    <section className="py-8 sm:py-14 px-3 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-serif text-[#1A1A1A] font-normal tracking-tight">
          New Arrivals
        </h2>
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-1 text-[11px] sm:text-sm font-medium text-[#1A1A1A] hover:text-[#B86526] transition-colors"
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Product Cards Grid: Exactly 4 across matching reference mockup */}
      <div className="grid grid-cols-4 gap-2 sm:gap-6">
        {NEW_ARRIVALS.map((product) => {
          const isFavorited = wishlist.includes(product.id);
          return (
            <div 
              key={product.id}
              className="bg-white rounded-xl sm:rounded-2xl border border-[#ECE5D8] p-1.5 xs:p-2 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group"
            >
              {/* Card Image Area with Badges */}
              <div className="relative aspect-square sm:aspect-[4/5] rounded-lg sm:rounded-xl overflow-hidden bg-[#FAF7F2] flex items-center justify-center p-1 sm:p-3 mb-1.5 sm:mb-3">
                {product.isBestSeller && (
                  <span className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 bg-[#2A180E] text-white text-[6.5px] xs:text-[7.5px] sm:text-[9.5px] font-medium px-1.5 py-0.5 rounded-full tracking-wide shadow-xs">
                    Best Seller
                  </span>
                )}

                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(e, product.id)}
                  className={`absolute top-1 right-1 sm:top-2 sm:right-2 z-10 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-white/95 backdrop-blur-xs shadow-xs border border-gray-100 transition-transform active:scale-90 ${
                    isFavorited ? 'text-rose-600' : 'text-gray-400 hover:text-black'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={11} className="sm:w-3.5 sm:h-3.5" fill={isFavorited ? 'currentColor' : 'none'} />
                </button>

                <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      e.target.src = product.fallback;
                    }}
                  />
                </Link>
              </div>

              {/* Title & Price */}
              <div className="text-center mb-1.5 sm:mb-3">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="text-[10px] xs:text-[11px] sm:text-sm font-serif font-medium text-[#1A1A1A] hover:text-[#B86526] transition-colors truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-[10px] xs:text-[11px] sm:text-sm font-semibold text-[#1A1A1A] font-sans mt-0.5">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, product)}
                disabled={addingId === product.id}
                className="w-full py-1 sm:py-2 px-1 sm:px-3 rounded-md sm:rounded-lg border border-[#D5C9B8] bg-[#FAF8F5] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] text-[#1A1A1A] text-[8px] xs:text-[9.5px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 cursor-pointer"
              >
                <ShoppingBag size={11} strokeWidth={1.8} className="sm:w-3.5 sm:h-3.5 hidden xs:inline" />
                <span className="truncate">{addingId === product.id ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedProducts;
