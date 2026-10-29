"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen w-full flex flex-col justify-between bg-[#120905] overflow-hidden">
      {/* Background High-Definition Fragrance Photography (Exact Match to Design Reference) */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source 
            media="(min-width: 768px)" 
            srcSet="/images/perfumes/hero_campaign_ultra_clear_master.jpg" 
          />
          <img 
            src="/images/perfumes/hero_mobile_sunset_arch_hd.jpg" 
            alt="ROVE & AMBER Signature Eau de Parfum" 
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.src = '/images/perfumes/hero_campaign_ultra_clear_master.jpg';
            }}
          />
        </picture>

        {/* Natural subtle readability gradient preserving pristine background scenery */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/35 md:hidden pointer-events-none" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 via-45% to-transparent w-full pointer-events-none" />
        <div className="hidden md:block absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/45 via-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Hero Text Content (Exact Typography & Proportions Matching Reference) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 w-full pt-32 sm:pt-40 lg:pt-44 pb-12 sm:pb-16 flex-1 flex flex-col justify-center">
        <div className="max-w-md sm:max-w-lg lg:max-w-xl text-left">
          {/* Eyebrow / Brand Descriptor */}
          <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3.5">
            <span className="w-6 sm:w-8 h-[1.5px] bg-[#E5B869]" />
            <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.28em] font-medium uppercase text-[#E5B869] drop-shadow-sm">
              Fine Fragrance & Artisanal Perfumery
            </p>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-[60px] font-serif leading-[1.08] mb-3 sm:mb-4 font-normal tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]">
            Discover Your <br />
            <span className="italic font-serif text-[#ECC880] font-normal">Signature Scent</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm md:text-base text-[#E8DDD0] font-light leading-relaxed mb-6 sm:mb-8 max-w-xs sm:max-w-md drop-shadow-sm">
            Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.
          </p>

          {/* Call to Action Buttons (Explore button positioned directly to the right of Shop Now) */}
          <div className="flex flex-row items-center gap-3.5 sm:gap-4 flex-nowrap">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#F6D389] via-[#DEB368] to-[#C09048] text-[#241306] text-xs sm:text-sm font-semibold tracking-wider shadow-xl shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all shrink-0 whitespace-nowrap group"
            >
              <span>Shop Now</span>
              <span className="w-5 h-5 rounded-full bg-[#241306]/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={12} strokeWidth={2.5} />
              </span>
            </Link>

            <Link
              href="/shop?category=Oud"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-black/25 hover:bg-black/40 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-medium tracking-wider shadow-sm hover:border-white/50 transition-all shrink-0 whitespace-nowrap"
            >
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Carousel Indicators (Exact Match to Reference - 3 Sleek Bars Resting on Silk) */}
      <div className="relative z-20 w-full flex items-center justify-center pb-6 sm:pb-8">
        <div className="flex items-center justify-center gap-2.5">
          <span className="w-10 sm:w-12 h-1 rounded-full bg-[#ECC880] shadow-[0_0_8px_rgba(236,200,128,0.6)]" />
          <span className="w-10 sm:w-12 h-1 rounded-full bg-white/35 backdrop-blur-xs" />
          <span className="w-10 sm:w-12 h-1 rounded-full bg-white/35 backdrop-blur-xs" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
