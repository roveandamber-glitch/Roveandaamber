"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[100dvh] md:min-h-screen w-full flex flex-col justify-between bg-[#120905] overflow-hidden">
      {/* Background High-Definition Fragrance Photography */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source 
            media="(min-width: 768px)" 
            srcSet="/images/perfumes/hero_campaign_ultra_clear_master.jpg" 
          />
          <img 
            src="/images/perfumes/hero_mobile_sunset_arch_hd.jpg" 
            alt="ROVE & AMBER Signature Eau de Parfum" 
            className="w-full h-full object-cover object-[center_top] md:object-center"
            onError={(e) => {
              e.target.src = '/images/perfumes/hero_campaign_ultra_clear_master.jpg';
            }}
          />
        </picture>

        {/* Natural subtle readability gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 via-40% to-transparent md:hidden pointer-events-none" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 via-45% to-transparent w-full pointer-events-none" />
        <div className="hidden md:block absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/45 via-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Hero Text Content (Upper portion on mobile, centered on desktop) */}
      <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 w-full pt-20 sm:pt-28 md:pt-36 lg:pt-40 pb-6 sm:pb-12 flex-1 flex flex-col justify-start md:justify-center">
        <div className="max-w-[310px] sm:max-w-lg lg:max-w-xl text-left">
          {/* Eyebrow / Brand Descriptor */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="w-5 sm:w-8 h-[1.5px] bg-[#E5B869]" />
            <p className="text-[9.5px] sm:text-xs md:text-sm tracking-[0.25em] sm:tracking-[0.28em] font-medium uppercase text-[#E5B869] drop-shadow-sm">
              Fine Fragrance & Artisanal Perfumery
            </p>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-serif leading-[1.1] sm:leading-[1.08] mb-2.5 sm:mb-4 font-normal tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]">
            Discover Your <br />
            <span className="italic font-serif text-[#ECC880] font-normal">Signature Scent</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm md:text-base text-[#E8DDD0] font-light leading-relaxed mb-4 sm:mb-7 max-w-[280px] sm:max-w-md drop-shadow-sm">
            Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.
          </p>

          {/* Call to Action Buttons (Stacked on mobile, side-by-side on desktop) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-[#F6D389] via-[#DEB368] to-[#C09048] text-[#241306] text-xs sm:text-sm font-semibold tracking-wider shadow-xl shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all shrink-0 whitespace-nowrap group"
            >
              <span>Shop Now</span>
              <span className="w-5 h-5 rounded-full bg-[#241306]/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={12} strokeWidth={2.5} />
              </span>
            </Link>

            <Link
              href="/shop?category=Oud"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-black/30 hover:bg-black/45 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-medium tracking-wider shadow-sm hover:border-white/50 transition-all shrink-0 whitespace-nowrap"
            >
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Carousel Indicators (Resting cleanly at bottom) */}
      <div className="relative z-20 w-full flex items-center justify-center pb-5 sm:pb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-2.5">
          <span className="w-8 sm:w-12 h-1 rounded-full bg-[#ECC880] shadow-[0_0_8px_rgba(236,200,128,0.6)]" />
          <span className="w-8 sm:w-12 h-1 rounded-full bg-white/35 backdrop-blur-xs" />
          <span className="w-8 sm:w-12 h-1 rounded-full bg-white/35 backdrop-blur-xs" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
