"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ShopTheLook = () => {
  return (
    <section className="py-8 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-10 lg:mb-12">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 sm:w-7 h-[1.5px] bg-[#B86526]" />
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#B86526] font-semibold">
              Curated Editions
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1A1A1A] font-normal tracking-tight">
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

      {/* Dual Luxury Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        
        {/* WOMEN Collection Card */}
        <Link
          href="/shop?category=Women's%20Fragrances"
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[300px] xs:min-h-[340px] sm:min-h-[400px] lg:min-h-[460px] bg-[#1E140F] border border-[#3A281E]/60 hover:border-[#E5B869]/70 shadow-xl hover:shadow-2xl hover:shadow-amber-950/20 transition-all duration-500 group flex items-center cursor-pointer"
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
          <div className="relative z-10 p-5 sm:p-10 lg:p-12 max-w-sm sm:max-w-md">
            {/* Eyebrow Badge */}
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E5B869] text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 sm:mb-3">
              Pour Femme • Floral & Amber
            </span>

            {/* Title */}
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-[0.2em] uppercase font-normal mb-2 sm:mb-3">
              WOMEN
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm lg:text-base text-gray-200 font-light leading-relaxed mb-3 sm:mb-4">
              Ethereal French florals, velvety musks, and warm golden amber crafted for timeless grace.
            </p>

            {/* Olfactory Notes Pill */}
            <p className="text-[9.5px] sm:text-[10.5px] tracking-widest text-[#ECC880] uppercase font-medium mb-5 sm:mb-7 flex items-center gap-1.5">
              <span>Damask Rose</span>
              <span className="w-1 h-1 rounded-full bg-[#ECC880]/60" />
              <span>White Musk</span>
              <span className="w-1 h-1 rounded-full bg-[#ECC880]/60" />
              <span>Golden Amber</span>
            </p>

            {/* CTA Button */}
            <span className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs sm:text-sm font-semibold tracking-wider shadow-lg group-hover:brightness-105 active:scale-95 transition-all">
              <span>Explore Collection</span>
              <span className="w-5 h-5 rounded-full bg-[#281608]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={11} strokeWidth={2.5} />
              </span>
            </span>
          </div>
        </Link>

        {/* MEN Collection Card */}
        <Link
          href="/shop?category=Men's%20Fragrances"
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[300px] xs:min-h-[340px] sm:min-h-[400px] lg:min-h-[460px] bg-[#141210] border border-[#2D2A26]/80 hover:border-[#E5B869]/70 shadow-xl hover:shadow-2xl hover:shadow-amber-950/20 transition-all duration-500 group flex items-center cursor-pointer"
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
          <div className="relative z-10 p-5 sm:p-10 lg:p-12 max-w-sm sm:max-w-md">
            {/* Eyebrow Badge */}
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E5B869] text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 sm:mb-3">
              Pour Homme • Woody & Oud
            </span>

            {/* Title */}
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-[0.2em] uppercase font-normal mb-2 sm:mb-3">
              MEN
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm lg:text-base text-gray-200 font-light leading-relaxed mb-3 sm:mb-4">
              Smoked agarwood, royal cardamom, and noble leather sculpted with commanding distinction.
            </p>

            {/* Olfactory Notes Pill */}
            <p className="text-[9.5px] sm:text-[10.5px] tracking-widest text-[#ECC880] uppercase font-medium mb-5 sm:mb-7 flex items-center gap-1.5">
              <span>Wild Agarwood</span>
              <span className="w-1 h-1 rounded-full bg-[#ECC880]/60" />
              <span>Black Pepper</span>
              <span className="w-1 h-1 rounded-full bg-[#ECC880]/60" />
              <span>Smoked Birch</span>
            </p>

            {/* CTA Button */}
            <span className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs sm:text-sm font-semibold tracking-wider shadow-lg group-hover:brightness-105 active:scale-95 transition-all">
              <span>Explore Collection</span>
              <span className="w-5 h-5 rounded-full bg-[#281608]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={11} strokeWidth={2.5} />
              </span>
            </span>
          </div>
        </Link>

      </div>
    </section>
  );
};

export default ShopTheLook;
