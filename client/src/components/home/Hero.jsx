"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[92vh] md:min-h-screen w-full flex items-center bg-[#F4F1EA] overflow-hidden">
      {/* High-Definition Fragrance Editorial Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/perfumes/hero_desert_fragrance.jpg" 
          alt="ROVE & AMBER Signature Eau de Parfum" 
          className="w-full h-full object-cover object-right md:object-center"
          onError={(e) => {
            e.target.src = '/images/perfumes/liquid_gold_perfume.jpg';
          }}
        />
        {/* Soft diffused warm gradient to ensure typography readability on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F1EA]/95 via-[#F4F1EA]/65 to-transparent md:w-3/5" />
        <div className="absolute inset-0 bg-black/10 md:hidden" />
      </div>

      {/* Hero Text Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 w-full pt-24 pb-16">
        <div className="max-w-xl text-[#1A1A1A]">
          {/* Brand Descriptor / Badge */}
          <div className="inline-flex items-center gap-2 mb-4 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#D4AF37]/40 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#B86526] animate-pulse" />
            <p className="text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase text-[#3B1D11]">
              Fine Fragrance & Artisanal Perfumery
            </p>
          </div>

          {/* Editorial Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif leading-[1.08] mb-6 font-normal tracking-tight text-[#1A1A1A]">
            Discover Your <br />
            Signature Scent
          </h1>

          {/* Subtitle / Description */}
          <p className="text-xs sm:text-sm text-gray-700 font-light leading-relaxed mb-8 max-w-md">
            Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-[#1A1A1A] hover:bg-[#3B1D11] text-white px-7 sm:px-9 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-xl rounded-none transform hover:-translate-y-0.5 cursor-pointer group"
            >
              <span>Shop Fragrances</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-black border border-[#1A1A1A]/20 px-6 sm:px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 backdrop-blur-sm cursor-pointer shadow-sm hover:border-black"
            >
              <span>Explore Our Collection</span>
            </Link>
          </div>

          {/* Scent Tagline Note */}
          <div className="mt-10 flex items-center gap-3 text-[11px] text-gray-600 font-light">
            <span className="w-6 h-[1px] bg-[#B86526]" />
            <span className="italic font-serif">"Crafting Signature Eau de Parfum"</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
