"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ShopTheLook = () => {
  return (
    <section className="py-6 sm:py-10 lg:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 sm:w-6 h-[1.5px] bg-[#B86526]" />
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#B86526] font-semibold">
              Curated Editions
            </p>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#1A1A1A] font-normal tracking-tight">
            Our Collections
          </h2>
        </div>
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#1A1A1A] hover:text-[#B86526] transition-colors group"
        >
          <span>View All Collections</span>
          <ArrowRight size={13} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Dual Luxury Cards Grid - Compact and Proportional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 lg:gap-6">
        
        {/* WOMEN Collection Card */}
        <Link
          href="/shop?category=Women's%20Fragrances"
          className="relative rounded-2xl overflow-hidden min-h-[220px] xs:min-h-[250px] sm:min-h-[280px] lg:min-h-[320px] bg-[#1E140F] border border-[#3A281E]/60 hover:border-[#E5B869]/70 shadow-lg hover:shadow-xl hover:shadow-amber-950/20 transition-all duration-400 group flex items-center cursor-pointer"
        >
          {/* Background Visual */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/perfumes/gemini_col_women_luxury.jpg"
              alt="Women's Fine Fragrance Collection"
              className="w-full h-full object-cover object-[70%_center] sm:object-right group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.src = '/images/perfumes/gemini_col_women.jpg';
              }}
            />
            {/* Atmospheric Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent w-full sm:w-3/4" />
            <div className="absolute inset-0 bg-black/20 sm:hidden" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-4 sm:p-7 lg:p-8 max-w-xs sm:max-w-sm">
            {/* Eyebrow Badge */}
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E5B869] text-[8.5px] sm:text-[9.5px] font-semibold uppercase tracking-[0.18em] mb-1.5 sm:mb-2">
              Pour Femme • Floral & Amber
            </span>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl lg:text-3xl font-serif text-white tracking-[0.18em] uppercase font-normal mb-1 sm:mb-1.5">
              WOMEN
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-[13px] text-gray-200 font-light leading-relaxed mb-2 sm:mb-2.5 line-clamp-2">
              Ethereal French florals, velvety musks, and warm golden amber crafted for timeless grace.
            </p>

            {/* Olfactory Notes */}
            <p className="text-[9px] sm:text-[10px] tracking-wider text-[#ECC880] uppercase font-medium mb-3 sm:mb-4 flex items-center gap-1.5">
              <span>Damask Rose</span>
              <span className="w-1 h-1 rounded-full bg-[#ECC880]/60" />
              <span>White Musk</span>
              <span className="w-1 h-1 rounded-full bg-[#ECC880]/60" />
              <span>Golden Amber</span>
            </p>

            {/* CTA Button */}
            <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs font-semibold tracking-wider shadow-md group-hover:brightness-105 active:scale-95 transition-all">
              <span>Explore Collection</span>
              <span className="w-4 h-4 rounded-full bg-[#281608]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={10} strokeWidth={2.5} />
              </span>
            </span>
          </div>
        </Link>

        {/* MEN Collection Card */}
        <Link
          href="/shop?category=Men's%20Fragrances"
          className="relative rounded-2xl overflow-hidden min-h-[220px] xs:min-h-[250px] sm:min-h-[280px] lg:min-h-[320px] bg-[#141210] border border-[#2D2A26]/80 hover:border-[#E5B869]/70 shadow-lg hover:shadow-xl hover:shadow-amber-950/20 transition-all duration-400 group flex items-center cursor-pointer"
        >
          {/* Background Visual */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/perfumes/gemini_col_men_luxury.jpg"
              alt="Men's Fine Fragrance Collection"
              className="w-full h-full object-cover object-[70%_center] sm:object-right group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.target.src = '/images/perfumes/gemini_col_men.jpg';
              }}
            />
            {/* Atmospheric Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent w-full sm:w-3/4" />
            <div className="absolute inset-0 bg-black/20 sm:hidden" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-4 sm:p-7 lg:p-8 max-w-xs sm:max-w-sm">
            {/* Eyebrow Badge */}
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E5B869] text-[8.5px] sm:text-[9.5px] font-semibold uppercase tracking-[0.18em] mb-1.5 sm:mb-2">
              Pour Homme • Woody & Oud
            </span>

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl lg:text-3xl font-serif text-white tracking-[0.18em] uppercase font-normal mb-1 sm:mb-1.5">
              MEN
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-[13px] text-gray-200 font-light leading-relaxed mb-2 sm:mb-2.5 line-clamp-2">
              Smoked agarwood, royal cardamom, and noble leather sculpted with commanding distinction.
            </p>

            {/* Olfactory Notes */}
            <p className="text-[9px] sm:text-[10px] tracking-wider text-[#ECC880] uppercase font-medium mb-3 sm:mb-4 flex items-center gap-1.5">
              <span>Wild Agarwood</span>
              <span className="w-1 h-1 rounded-full bg-[#ECC880]/60" />
              <span>Black Pepper</span>
              <span className="w-1 h-1 rounded-full bg-[#ECC880]/60" />
              <span>Smoked Birch</span>
            </p>

            {/* CTA Button */}
            <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs font-semibold tracking-wider shadow-md group-hover:brightness-105 active:scale-95 transition-all">
              <span>Explore Collection</span>
              <span className="w-4 h-4 rounded-full bg-[#281608]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={10} strokeWidth={2.5} />
              </span>
            </span>
          </div>
        </Link>

      </div>
    </section>
  );
};

export default ShopTheLook;
