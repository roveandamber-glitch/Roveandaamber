"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ArrowRight, Compass, Sparkles, Home, ShoppingBag, Mail } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#120905] text-white font-sans flex flex-col justify-between selection:bg-[#B8860B] selection:text-white relative overflow-hidden">
      <Navbar />

      {/* Atmospheric Background Aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft Amber Radiant Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-gradient-to-br from-[#E5B869]/15 via-[#7C481A]/10 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute -bottom-20 right-10 w-96 h-96 bg-[#B8860B]/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-[#120905]/60 to-[#120905]" />
      </div>

      {/* Main 404 Content Container */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16 max-w-3xl mx-auto">
        
        {/* Luxury Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#E5B869]/30 backdrop-blur-md mb-6 shadow-sm">
          <Sparkles size={13} className="text-[#ECC880]" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-[#ECC880]">
            404 • Lost in the Atelier
          </span>
        </div>

        {/* Big Stylized 404 Number */}
        <div className="relative mb-4">
          <span className="font-serif text-8xl sm:text-9xl md:text-[140px] font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#F6D389] via-[#DEB368] to-[#6E4E20] select-none drop-shadow-[0_4px_24px_rgba(222,179,104,0.3)]">
            404
          </span>
        </div>

        {/* Editorial Heading */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-white mb-4 leading-tight">
          An Elusive Scent Has Dissipated
        </h1>

        {/* Narrative Description */}
        <p className="text-xs sm:text-sm md:text-base text-[#D4C7B8] font-light leading-relaxed max-w-lg mb-8 sm:mb-10">
          The page or formulation you are looking for has evaporated into the ether. It may have been relocated, archived, or is temporarily resting in our compounding atelier.
        </p>

        {/* Primary & Secondary Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mb-12">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#F6D389] via-[#DEB368] to-[#C09048] text-[#241306] text-xs font-semibold tracking-wider uppercase shadow-xl shadow-amber-950/40 hover:brightness-110 active:scale-95 transition-all group cursor-pointer"
          >
            <Home size={14} />
            <span>Return to Boutique</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-medium tracking-wider uppercase border border-white/20 hover:border-[#ECC880]/50 backdrop-blur-md active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag size={14} className="text-[#ECC880]" />
            <span>Explore Collections</span>
          </Link>
        </div>

        {/* Quick Sanctuary Links */}
        <div className="w-full pt-8 border-t border-white/10 max-w-md">
          <p className="text-[10px] uppercase font-bold tracking-[0.22em] text-[#8C7A6B] mb-3">
            Atelier Directory
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#E5DFD5]">
            <Link href="/shop?category=Oud" className="hover:text-[#ECC880] transition-colors">
              Rare Reserve Ouds
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/gifts" className="hover:text-[#ECC880] transition-colors">
              Discovery Coffrets
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/about" className="hover:text-[#ECC880] transition-colors">
              The Atelier Story
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/contact" className="hover:text-[#ECC880] transition-colors">
              User Concierge
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

