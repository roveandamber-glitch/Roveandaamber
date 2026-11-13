"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthGateModal } from '@/components/common';

export default function WishlistAuthGate({
  isOpen,
  onOpenModal
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-sans flex flex-col justify-between pt-20">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <span className="w-16 h-16 rounded-full bg-[#1C120C]/5 border border-[#DEB368]/30 flex items-center justify-center text-[#B8860B] mb-6 shadow-sm">
          <Heart size={28} strokeWidth={1.5} />
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 mb-2">
          Private Atelier Wishlist
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-light max-w-md mx-auto leading-relaxed mb-6">
          Access to your saved fragrances, curated olfactory selections, and private atelier wishlist is reserved for registered patrons. Please sign in to view and curate your personal wishlist.
        </p>
        <button
          type="button"
          onClick={onOpenModal}
          className="inline-flex items-center gap-2 bg-[#1C120C] text-[#ECC880] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer shadow-sm"
        >
          <span>Sign In to Access Wishlist</span>
          <ArrowRight size={14} />
        </button>
      </main>
      <Footer />

      {/* Strict Authentication Gate Modal */}
      <AuthGateModal
        open={isOpen}
        onClose={() => router.replace('/')}
        onCancelAction={() => router.replace('/')}
        redirectPath="/wishlist"
        title="Sign In to Access Your Wishlist"
        subtitle="Atelier Customer Privilege"
        description="Your saved fragrances and curated olfactory wishlist are private to your customer account. Please sign in or register to access your wishlist."
        confirmText="Sign In / Register"
        cancelText="Return to Boutique"
      />
    </div>
  );
}
