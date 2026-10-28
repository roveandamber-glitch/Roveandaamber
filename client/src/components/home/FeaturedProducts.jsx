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
    image: '/images/perfumes/prod_amber_royal.png',
    fallback: '/images/perfumes/amber_oud_perfume.jpg',
    category: 'Eau de Parfum',
    isBestSeller: false
  },
  {
    id: 'prod-oud-noir',
    _id: 'prod-oud-noir',
    name: 'Oud Noir',
    slug: 'oud-noir',
    price: 3850,
    image: '/images/perfumes/prod_oud_noir.png',
    fallback: '/images/perfumes/noir_intense.jpg',
    category: 'Eau de Parfum',
    isBestSeller: true
  },
  {
    id: 'prod-velvet-musk',
    _id: 'prod-velvet-musk',
    name: 'Velvet Musk',
    slug: 'velvet-musk',
    price: 3200,
    image: '/images/perfumes/prod_velvet_musk.png',
    fallback: '/images/perfumes/liquid_gold_perfume.jpg',
    category: 'Eau de Parfum',
    isBestSeller: false
  },
  {
    id: 'prod-rose-elixir',
    _id: 'prod-rose-elixir',
    name: 'Rose Elixir',
    slug: 'rose-elixir',
    price: 3600,
    image: '/images/perfumes/prod_rose_elixir.png',
    fallback: '/images/perfumes/rose_eternelle.jpg',
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
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] font-normal tracking-tight">
          New Arrivals
        </h2>
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#1A1A1A] hover:text-[#B86526] transition-colors"
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
        {NEW_ARRIVALS.map((product) => {
          const isFavorited = wishlist.includes(product.id);
          return (
            <div 
              key={product.id}
              className="bg-white rounded-2xl border border-[#ECE5D8] p-3 sm:p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group"
            >
              {/* Card Image Area with Badges */}
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#FBF9F5] flex items-center justify-center p-3 sm:p-4 mb-3">
                {product.isBestSeller && (
                  <span className="absolute top-2 left-2 z-10 bg-[#2A180E] text-white text-[8.5px] sm:text-[9.5px] font-medium px-2 py-0.5 rounded-full tracking-wide">
                    Best Seller
                  </span>
                )}

                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(e, product.id)}
                  className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-xs shadow-xs border border-gray-100 transition-transform active:scale-90 ${
                    isFavorited ? 'text-rose-600' : 'text-gray-400 hover:text-black'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={14} fill={isFavorited ? 'currentColor' : 'none'} />
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
              <div className="text-center mb-3">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="text-xs sm:text-sm font-serif font-medium text-[#1A1A1A] hover:text-[#B86526] transition-colors truncate">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs sm:text-sm font-semibold text-[#1A1A1A] font-sans mt-0.5">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={(e) => handleAddToCart(e, product)}
                disabled={addingId === product.id}
                className="w-full py-2 px-3 rounded-lg border border-[#D5C9B8] bg-[#FAF8F5] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] text-[#1A1A1A] text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
              >
                <ShoppingBag size={13} strokeWidth={1.8} />
                <span>{addingId === product.id ? 'Adding...' : 'Add to Cart'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedProducts;
