"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col justify-between bg-[#120B06] overflow-hidden">
      {/* Background High-Definition Fragrance Photography */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/perfumes/gemini_hero_desert.jpg" 
          alt="ROVE & AMBER Signature Eau de Parfum" 
          className="w-full h-full object-cover object-[70%_center] sm:object-center"
          onError={(e) => {
            e.target.src = '/images/perfumes/hero_desert_fragrance.jpg';
          }}
        />
        {/* Soft atmospheric gradient for crisp typography readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/75 sm:hidden" />
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent w-full md:w-3/5" />
      </div>

      {/* Hero Text Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-12 w-full pt-28 sm:pt-36 pb-12 flex-1 flex flex-col justify-center">
        <div className="max-w-xl text-left">
          {/* Eyebrow / Brand Descriptor */}
          <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
            <span className="w-7 h-[1.5px] bg-[#E5B869]" />
            <p className="text-[10px] sm:text-xs tracking-[0.25em] font-medium uppercase text-[#E5B869]">
              Fine Fragrance & Artisanal Perfumery
            </p>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif leading-[1.08] mb-4 sm:mb-6 font-normal tracking-tight text-white">
            Discover Your <br />
            <span className="italic font-serif text-[#E5B869] font-normal">Signature Scent</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm text-gray-200 md:text-gray-300 font-light leading-relaxed mb-6 sm:mb-8 max-w-[290px] xs:max-w-sm sm:max-w-md">
            Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.
          </p>

          {/* Call to Action Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] text-xs sm:text-sm font-semibold tracking-wider shadow-lg shadow-amber-950/30 hover:brightness-105 active:scale-95 transition-all group"
            >
              <span>Shop Now</span>
              <span className="w-5 h-5 rounded-full bg-[#281608]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={12} strokeWidth={2.5} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Carousel Indicators & Curved Bottom Scoop */}
      <div className="relative z-20 w-full flex flex-col items-center">
        {/* Slider Indicator Dotted Pills */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-8 h-1 rounded-full bg-[#ECC880]" />
          <span className="w-8 h-1 rounded-full bg-white/35" />
        </div>

        {/* Curved Convex Scoop transitioning into categories */}
        <div className="w-full h-6 sm:h-8 bg-enva-bg rounded-t-[50%_100%] shadow-[0_-8px_16px_rgba(0,0,0,0.15)]" />
      </div>
    </section>
  );
};

export default Hero;
