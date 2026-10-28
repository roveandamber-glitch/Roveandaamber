"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ShopTheLook = () => {
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] font-normal tracking-tight">
          Our Collections
        </h2>
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#1A1A1A] hover:text-[#B86526] transition-colors"
        >
          <span>View All</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Dual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* WOMEN Collection Card */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[16/8] bg-[#1E140F] border border-[#3A281E] shadow-md group cursor-pointer">
          <img
            src="/images/perfumes/col_women.png"
            alt="Women's Fragrance Collection"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.src = '/images/perfumes/cat_women.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-serif text-white tracking-widest uppercase mb-3">
              WOMEN
            </h3>
            <div>
              <Link
                href="/shop?category=Women's%20Fragrances"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs font-semibold tracking-wider shadow-sm hover:brightness-105 transition-all"
              >
                <span>Explore</span>
                <ArrowRight size={12} strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </div>

        {/* MEN Collection Card */}
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[16/8] bg-[#141210] border border-[#2D2A26] shadow-md group cursor-pointer">
          <img
            src="/images/perfumes/col_men.png"
            alt="Men's Fragrance Collection"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.src = '/images/perfumes/cat_men.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-serif text-white tracking-widest uppercase mb-3">
              MEN
            </h3>
            <div>
              <Link
                href="/shop?category=Men's%20Fragrances"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs font-semibold tracking-wider shadow-sm hover:brightness-105 transition-all"
              >
                <span>Explore</span>
                <ArrowRight size={12} strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopTheLook;
