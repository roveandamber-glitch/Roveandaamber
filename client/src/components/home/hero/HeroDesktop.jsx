"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Desktop-specific Hero Component (matches widescreen luxury campaign layout)
 * Receives all shared state, props, slides, and functions from the parent Hero.
 */
export default function HeroDesktop({
  slides = [],
  activeSlide = 0,
  onSlideChange,
  onShopNow,
  onExplore
}) {
  const current = slides[activeSlide] || slides[0] || {};

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between bg-[#120905] overflow-hidden select-none">
      {/* Background High-Definition Fragrance Photography */}
      <div className="absolute inset-0 z-0">
        <img 
          src={current.desktopBg || "/images/perfumes/hero_campaign_ultra_clear_master.jpg"} 
          alt={current.titlePart1 || "ROVE & AMBER Signature Eau de Parfum"} 
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            e.target.src = '/images/perfumes/hero_campaign_clean_master_hd.jpg';
          }}
        />

        {/* Widescreen luxury reading gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 via-45% to-transparent w-full pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/50 via-black/15 to-transparent pointer-events-none" />
      </div>

      {/* Hero Text Content (Centered vertically in luxury left-aligned container) */}
      <div className="relative z-20 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 w-full pt-36 lg:pt-40 pb-12 flex-1 flex flex-col justify-center">
        <div className="max-w-xl text-left">
          {/* Eyebrow / Brand Descriptor */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[1.5px] bg-[#E5B869]" />
            <p className="text-xs md:text-sm tracking-[0.28em] font-medium uppercase text-[#E5B869] drop-shadow-sm">
              {current.tagline || 'Fine Fragrance & Artisanal Perfumery'}
            </p>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-[62px] font-serif leading-[1.08] mb-4 font-normal tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]">
            {current.titlePart1 || 'Discover Your'} <br />
            <span className="italic font-serif text-[#ECC880] font-normal">
              {current.titlePart2 || 'Signature Scent'}
            </span>
          </h1>

          {/* Subtitle / Description */}
          <p className="text-sm md:text-base text-[#E8DDD0] font-light leading-relaxed mb-7 max-w-md drop-shadow-sm">
            {current.description || 'Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.'}
          </p>

          {/* Call to Action Buttons: Side-by-side on desktop */}
          <div className="flex items-center gap-4">
            <Link
              href={current.primaryCta?.href || "/shop"}
              onClick={onShopNow}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#F6D389] via-[#DEB368] to-[#C09048] text-[#241306] text-sm font-semibold tracking-wider shadow-xl shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all shrink-0 whitespace-nowrap group"
            >
              <span>{current.primaryCta?.text || 'Shop Now'}</span>
              <span className="w-5 h-5 rounded-full bg-[#241306]/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={12} strokeWidth={2.5} />
              </span>
            </Link>

            <Link
              href={current.secondaryCta?.href || "/shop?category=Oud"}
              onClick={onExplore}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-black/30 hover:bg-black/45 backdrop-blur-md border border-white/30 text-white text-sm font-medium tracking-wider shadow-sm hover:border-white/50 transition-all shrink-0 whitespace-nowrap active:scale-95"
            >
              <span>{current.secondaryCta?.text || 'Explore Collection'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Carousel Indicators (Centered at bottom) */}
      <div className="relative z-20 w-full flex items-center justify-center pb-8">
        <div className="flex items-center justify-center gap-2.5">
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
                    ? 'w-12 bg-[#ECC880] shadow-[0_0_8px_rgba(236,200,128,0.7)]'
                    : 'w-8 bg-white/35 backdrop-blur-xs hover:bg-white/50'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

