"use client";
import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

export default function WishlistEmptyState() {
  return (
    <div className="py-16 sm:py-24 text-center max-w-xl mx-auto flex flex-col items-center">
      {/* Elegant Ring Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FAF3E0] border border-[#E0D0A5] flex items-center justify-center text-[#B8860B] shadow-sm">
          <Heart size={36} strokeWidth={1.4} className="fill-[#FAF3E0]" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-[#E8DFC9] flex items-center justify-center text-[#B8860B] shadow-2xs">
          <Sparkles size={15} />
        </div>
      </div>

      <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6D1F] mb-2">
        Atelier Collection
      </span>
      <h2 className="font-serif text-2xl sm:text-3xl text-black font-normal tracking-tight mb-3">
        Your wishlist is waiting.
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 max-w-md font-light leading-relaxed mb-8">
        You haven&apos;t saved any signature fragrances to your atelier wishlist yet. Explore our handcrafted olfactory creations and tap the heart icon on any bottle to curate your personal wardrobe.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Link
          href="/shop"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-black text-white text-xs uppercase font-bold tracking-widest hover:bg-[#262626] transition-all shadow-md cursor-pointer group"
        >
          <span>Explore Fragrances</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/shop?category=Eau%20de%20Parfum"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white text-black border border-[#E0D8CA] text-xs uppercase font-semibold tracking-wider hover:border-black transition-all shadow-2xs"
        >
          Signature Scents
        </Link>
      </div>

      {/* Luxury Guarantee Highlights */}
      <div className="grid grid-cols-3 gap-4 pt-12 mt-12 border-t border-[#ECE7DE] w-full text-center">
        <div>
          <h4 className="font-serif text-sm font-semibold text-black">Artisanal Sillage</h4>
          <p className="text-[10px] text-gray-400 mt-0.5">High Extrait Concentration</p>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold text-black">Complimentary Samples</h4>
          <p className="text-[10px] text-gray-400 mt-0.5">Included with every order</p>
        </div>
        <div>
          <h4 className="font-serif text-sm font-semibold text-black">Bespoke Gifting</h4>
          <p className="text-[10px] text-gray-400 mt-0.5">Signature Gold Foil Box</p>
        </div>
      </div>
    </div>
  );
}
