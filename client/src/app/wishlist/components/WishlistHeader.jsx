"use client";
import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

export default function WishlistHeader({
  savedCount,
  loading,
  hasItems,
  onAddAll,
  isAddingAll,
  onClear,
  unavailableCount,
  onRemoveUnavailable
}) {
  return (
    <>
      {/* Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-gray-400 mb-6 sm:mb-8 uppercase tracking-widest">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-black font-semibold">Wishlist</span>
      </nav>

      {/* Luxury Header Banner */}
      <div className="border-b border-[#ECE7DE] pb-6 sm:pb-8 mb-8 sm:mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] text-[10px] font-bold uppercase tracking-widest">
                <Sparkles size={11} />
                Personal Atelier
              </span>
              <span className="text-xs text-gray-400">
                {!loading ? `${savedCount} ${savedCount === 1 ? 'saved item' : 'saved items'}` : 'Loading atelier...'}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-black tracking-tight">
              Your Wishlist
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-2xl font-light leading-relaxed">
              Curated selections from your private fragrance atelier. Review your preserved signature scents, move favorites directly to your shopping bag, or continue discovering new olfactory creations.
            </p>
          </div>

          {/* Top Quick Actions (only visible when wishlist has items) */}
          {hasItems && (
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-black bg-white border border-[#E0D8CA] hover:border-black transition-all shadow-2xs"
              >
                Continue Shopping
              </Link>

              <button
                type="button"
                onClick={onAddAll}
                disabled={isAddingAll}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-[#262626] transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag size={14} />
                {isAddingAll ? 'Adding...' : 'Add All to Bag'}
              </button>

              <button
                type="button"
                onClick={onClear}
                className="p-2.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 border border-[#E0D8CA] hover:border-red-200 transition-colors cursor-pointer"
                aria-label="Clear all wishlist items"
                title="Clear Wishlist"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unavailable Items Notice */}
      {unavailableCount > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-[#FFF9F5] border border-[#F5D5C6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8A4224]">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-[#C85A32] flex-shrink-0" />
            <span>
              <strong>Archive Notice:</strong> {unavailableCount} {unavailableCount === 1 ? 'fragrance' : 'fragrances'} previously saved to your wishlist is no longer available in the active collection.
            </span>
          </div>
          <button
            type="button"
            onClick={onRemoveUnavailable}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#E8C2B0] text-[11px] font-bold text-[#8A4224] hover:bg-[#8A4224] hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <Trash2 size={12} />
            Clean Up Unavailable Items
          </button>
        </div>
      )}
    </>
  );
}
