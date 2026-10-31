"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Mobile-specific Hero Component
 * Uses the EXACT same high-definition imagery as desktop (/images/perfumes/hero_campaign_ultra_clear_master.jpg)
 * and positions the brand eyebrow, title, description, and action buttons on the LEFT side,
 * slightly set down towards the bottom of the screen.
 */
export default function HeroMobile({
  slides = [],
  activeSlide = 0,
  onSlideChange,
  onShopNow,
  onExplore
}) {
  const current = slides[activeSlide] || slides[0] || {};
  // Use the exact same window/desktop image as requested
  const bgImage = current.desktopBg || current.mobileBg || "/images/perfumes/hero_campaign_ultra_clear_master.jpg";

  return (
    <section className="relative min-h-[100dvh] w-full flex flex-col justify-between bg-[#120905] overflow-hidden select-none">
      {/* Background Photography: Exact same image as the desktop window screen */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt={current.titlePart1 || "ROVE & AMBER Signature Eau de Parfum"} 
          className="w-full h-full object-cover object-[62%_center]"
          onError={(e) => {
            e.target.src = '/images/perfumes/hero_campaign_clean_master_hd.jpg';
          }}
        />

        {/* Cinematic luxury contrast gradients: top vignette + left side text readability backing */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black/80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Hero Text Content (Left-aligned, slightly set towards bottom) */}
      <div className="relative z-20 w-full px-6 pt-24 pb-8 flex-1 flex flex-col justify-center items-start text-left">
        <div className="max-w-[310px] flex flex-col items-start text-left translate-y-3 sm:translate-y-5">
          
          {/* Eyebrow / Brand Descriptor (Left-aligned with luxury gold dash accent) */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-[1.5px] bg-[#E5B869]" />
            <p className="text-[10px] tracking-[0.24em] font-medium uppercase text-[#E5B869] drop-shadow-sm m-0">
              {current.tagline || 'Fine Fragrance & Artisanal Perfumery'}
            </p>
          </div>

          {/* Main Title (Left-aligned) */}
          <h1 className="text-[32px] sm:text-4xl font-serif leading-[1.12] mb-3 font-normal tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)] text-left">
            {current.titlePart1 || 'Discover Your'} <br />
            <span className="italic font-serif text-[#ECC880] font-normal">
              {current.titlePart2 || 'Signature Scent'}
            </span>
          </h1>

          {/* Subtitle / Description (Left-aligned) */}
          <p className="text-xs sm:text-[13px] text-[#E8DDD0] font-light leading-relaxed mb-6 max-w-[280px] text-left drop-shadow-md">
            {current.description || 'Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.'}
          </p>

          {/* Call to Action Buttons (Left-aligned and stacked) */}
          <div className="flex flex-col items-start gap-3 w-full max-w-[230px]">
            <Link
              href={current.primaryCta?.href || "/shop"}
              onClick={onShopNow}
              className="w-full inline-flex items-center justify-between px-6 py-3 rounded-full bg-gradient-to-r from-[#F6D389] via-[#DEB368] to-[#C09048] text-[#241306] text-xs font-semibold tracking-wider shadow-xl shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap group cursor-pointer"
            >
              <span>{current.primaryCta?.text || 'Shop Now'}</span>
              <span className="w-5 h-5 rounded-full bg-[#241306]/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={11} strokeWidth={2.6} className="text-[#241306]" />
              </span>
            </Link>

            <Link
              href={current.secondaryCta?.href || "/shop?category=Oud"}
              onClick={onExplore}
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-black/45 hover:bg-black/60 backdrop-blur-md border border-white/30 text-white text-xs font-medium tracking-wider shadow-sm hover:border-white/50 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
            >
              <span>{current.secondaryCta?.text || 'Explore Collection'}</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Hero Carousel Indicators (Resting at bottom center) */}
      <div className="relative z-20 w-full flex items-center justify-center pb-6">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, idx) => {
            const isActive = idx === activeSlide;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSlideChange && onSlideChange(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'w-9 bg-[#ECC880] shadow-[0_0_8px_rgba(236,200,128,0.7)]'
                    : 'w-6 bg-white/35 backdrop-blur-xs hover:bg-white/50'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
