"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const LookbookSpotlight = () => {
  return (
    <section className="py-6 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#1A120B] border border-[#3A281A] shadow-xl min-h-[220px] sm:min-h-[280px] flex items-center">
        {/* Background Raw Agarwood Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/perfumes/mockup_banner_oud.png"
            alt="Rare Oud Collection"
            className="w-full h-full object-cover object-right"
            onError={(e) => {
              e.target.src = '/images/perfumes/perfume_craft.jpg';
            }}
          />
          {/* Dark gradient to ensure text readability on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#140D07] via-[#140D07]/90 to-transparent w-full sm:w-3/5" />
          <div className="absolute inset-0 bg-black/20 sm:hidden" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-12 max-w-lg">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="w-5 h-[1.5px] bg-[#E5B869]" />
            <p className="text-[9.5px] sm:text-xs tracking-[0.25em] font-medium uppercase text-[#E5B869]">
              The Essence of Luxury
            </p>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-4xl font-serif text-white font-normal leading-tight mb-2 sm:mb-3">
            Rare Oud Collection
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed mb-5 max-w-sm">
            Deep. Distinct. Unforgettable. <br className="hidden xs:inline" />
            Experience the richness of authentic oud.
          </p>

          {/* Action Button */}
          <Link
            href="/shop?category=Oud"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] text-xs font-semibold tracking-wider shadow-md hover:brightness-105 active:scale-95 transition-all group"
          >
            <span>Explore Collection</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LookbookSpotlight;
