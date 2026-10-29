"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col justify-between bg-[#120B06] overflow-hidden">
      {/* Background High-Definition Fragrance Photography (Mobile 9:16 + Laptop 16:9 HD) */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source 
            media="(min-width: 768px)" 
            srcSet="/images/perfumes/hero_user_reference_hd.jpg" 
          />
          <img 
            src="/images/perfumes/gemini_hero_desert.jpg" 
            alt="ROVE & AMBER Signature Eau de Parfum" 
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.src = '/images/perfumes/hero_desert_fragrance.jpg';
            }}
          />
        </picture>
        {/* Soft atmospheric gradient on mobile for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/75 md:hidden pointer-events-none" />
      </div>

      {/* Mobile Text Content (visible only on mobile/tablet) */}
      <div className="md:hidden relative z-20 max-w-7xl mx-auto px-6 sm:px-10 w-full pt-28 sm:pt-36 pb-12 flex-1 flex flex-col justify-center">
        <div className="max-w-md text-left">
          {/* Eyebrow / Brand Descriptor */}
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-6 h-[1.5px] bg-[#E5B869]" />
            <p className="text-[10px] sm:text-xs tracking-[0.28em] font-medium uppercase text-[#E5B869]">
              Fine Fragrance & Artisanal Perfumery
            </p>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl font-serif leading-[1.08] mb-3 font-normal tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
            Discover Your <br />
            <span className="italic font-serif text-[#E5B869] font-normal">Signature Scent</span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm text-[#E3D7C8] font-light leading-relaxed mb-6 max-w-xs drop-shadow-sm">
            Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] text-xs font-semibold tracking-wider shadow-lg shadow-amber-950/40 hover:brightness-105 active:scale-95 transition-all group"
            >
              <span>Shop Now</span>
              <span className="w-5 h-5 rounded-full bg-[#281608]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={12} strokeWidth={2.5} />
              </span>
            </Link>

            <Link
              href="/shop?category=Oud"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-medium tracking-wider shadow-sm transition-all"
            >
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Clickable Hotspots overlay matching the visual buttons */}
      <div className="hidden md:flex relative z-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 w-full pt-28 sm:pt-36 lg:pt-40 pb-12 flex-1 flex-col justify-center pointer-events-none">
        <div className="max-w-md sm:max-w-lg lg:max-w-xl text-left pointer-events-auto">
          {/* Spacer aligning with button vertical position in 16:9 visual */}
          <div className="h-48 sm:h-56 lg:h-64" />
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="w-36 lg:w-44 h-11 lg:h-13 rounded-full cursor-pointer hover:ring-2 hover:ring-[#E5B869]/80 transition-all bg-white/0 hover:bg-white/10"
              aria-label="Shop Now"
            />
            <Link
              href="/shop?category=Oud"
              className="w-40 lg:w-48 h-11 lg:h-13 rounded-full cursor-pointer hover:ring-2 hover:ring-white/60 transition-all bg-white/0 hover:bg-white/10"
              aria-label="Explore Collection"
            />
          </div>
        </div>
      </div>

      {/* Hero Carousel Indicators & Curved Bottom Scoop */}
      <div className="relative z-20 w-full flex flex-col items-center">
        {/* Slider Indicator Dotted Pills (mobile only, desktop is in image) */}
        <div className="flex md:hidden items-center justify-center gap-2 mb-6 sm:mb-8">
          <span className="w-8 sm:w-10 h-1 sm:h-1.5 rounded-full bg-[#ECC880]" />
          <span className="w-8 sm:w-10 h-1 sm:h-1.5 rounded-full bg-white/35" />
        </div>

        {/* Curved Convex Scoop transitioning into categories */}
        <div className="w-full h-6 sm:h-10 md:h-12 bg-enva-bg rounded-t-[50%_100%] shadow-[0_-8px_16px_rgba(0,0,0,0.15)]" />
      </div>
    </section>
  );
};

export default Hero;
