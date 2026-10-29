"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col justify-between bg-[#120905] overflow-hidden">
      {/* Background High-Definition Fragrance Photography (100% Clean Image, Zero Embedded Text) */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source 
            media="(min-width: 768px)" 
            srcSet="/images/perfumes/hero_campaign_clean_master_hd.jpg" 
          />
          <img 
            src="/images/perfumes/hero_mobile_sunset_arch_hd.jpg" 
            alt="ROVE & AMBER Signature Eau de Parfum" 
            className="w-full h-full object-cover object-[center_top] md:object-[78%_center] lg:object-[82%_center]"
            onError={(e) => {
              e.target.src = '/images/perfumes/hero_campaign_clean_master_hd.jpg';
            }}
          />
        </picture>

        {/* Smooth, subtle dark-brown gradient from left to right (No backdrop-blur, completely seamless) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/45 md:hidden pointer-events-none" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#120905]/90 via-[#120905]/40 via-45% to-transparent w-full pointer-events-none" />
        <div className="hidden md:block absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/45 via-black/15 to-transparent pointer-events-none" />
      </div>

      {/* Hero Text Content (Separately Rendered Vector Typography) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 w-full pt-36 sm:pt-44 lg:pt-48 pb-10 sm:pb-12 flex-1 flex flex-col justify-start md:justify-center">
        <div className="max-w-md sm:max-w-lg lg:max-w-xl text-left">
          {/* Eyebrow / Brand Descriptor */}
          <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
            <span className="w-6 sm:w-8 h-[1.5px] bg-[#E5B869]" />
            <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.28em] font-medium uppercase text-[#E5B869] drop-shadow-sm">
              Fine Fragrance & Artisanal Perfumery
            </p>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-[62px] font-serif leading-[1.08] mb-3 sm:mb-5 font-normal tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
            Discover Your <br />
            <span className="italic font-serif text-[#E5B869] font-normal">Signature Scent</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#E8DDD0] font-light leading-relaxed mb-6 sm:mb-9 max-w-xs sm:max-w-md drop-shadow-sm">
            Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 px-7 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] text-xs sm:text-sm font-semibold tracking-wider shadow-xl shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all group"
            >
              <span>Shop Now</span>
              <span className="w-5 h-5 rounded-full bg-[#281608]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={12} strokeWidth={2.5} />
              </span>
            </Link>

            <Link
              href="/shop?category=Oud"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-medium tracking-wider shadow-sm hover:border-white/50 transition-all"
            >
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Carousel Indicators & Curved Bottom Scoop */}
      <div className="relative z-20 w-full flex flex-col items-center">
        {/* Slider Indicator Dotted Pills */}
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-8">
          <span className="w-6 sm:w-8 h-1 sm:h-1.5 rounded-full bg-[#ECC880]" />
          <span className="w-2.5 sm:w-8 h-1 sm:h-1.5 rounded-full bg-white/40" />
          <span className="w-2.5 sm:w-8 h-1 sm:h-1.5 rounded-full bg-white/40" />
        </div>

        {/* Curved Convex Scoop transitioning into categories */}
        <div className="w-full h-5 sm:h-10 md:h-12 bg-enva-bg rounded-t-[50%_100%] shadow-[0_-8px_16px_rgba(0,0,0,0.15)]" />
      </div>
    </section>
  );
};

export default Hero;
