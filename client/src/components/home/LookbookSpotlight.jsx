"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const LookbookSpotlight = () => {
  return (
    <section className="py-4 sm:py-8 px-3 sm:px-6 max-w-7xl mx-auto">
      <div className="relative rounded-xl sm:rounded-3xl overflow-hidden bg-[#1A120B] border border-[#3A281A] shadow-xl min-h-[170px] xs:min-h-[190px] sm:min-h-[260px] flex items-center">
        {/* Background Raw Agarwood Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/perfumes/gemini_cat_oud.jpg"
            alt="Rare Oud Collection"
            className="w-full h-full object-cover object-right"
            onError={(e) => {
              e.target.src = '/images/perfumes/mockup_banner_oud.png';
            }}
          />
          {/* Dark gradient to ensure text readability on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#140D07] via-[#140D07]/90 to-transparent w-full sm:w-3/5" />
          <div className="absolute inset-0 bg-black/20 sm:hidden" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-10 max-w-lg">
          {/* Eyebrow */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2.5">
            <span className="w-4 sm:w-5 h-[1.5px] bg-[#E5B869]" />
            <p className="text-[8.5px] xs:text-[9.5px] sm:text-xs tracking-[0.25em] font-medium uppercase text-[#E5B869]">
              The Essence of Luxury
            </p>
          </div>

          {/* Heading */}
          <h2 className="text-lg xs:text-xl sm:text-4xl font-serif text-white font-normal leading-tight mb-1.5 sm:mb-2.5">
            Rare Oud Collection
          </h2>

          {/* Description */}
          <p className="text-[9.5px] xs:text-[10.5px] sm:text-sm text-gray-300 font-light leading-relaxed mb-3 sm:mb-5 max-w-sm">
            Deep. Distinct. Unforgettable. <br className="hidden xs:inline" />
            Experience the richness of authentic oud.
          </p>

          {/* Action Button */}
          <Link
            href="/shop?category=Oud"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-[9.5px] xs:text-[10.5px] sm:text-xs font-semibold tracking-wider shadow-md hover:brightness-105 active:scale-95 transition-all group"
          >
            <span>Explore Collection</span>
            <ArrowRight size={11} className="sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LookbookSpotlight;
