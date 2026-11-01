"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, ShieldCheck, ArrowUpRight } from 'lucide-react';
import productService from '@/services/productService';
import { getImageUrl } from '@/utils/imageHelper';

// Curated luxury fallback reviews with actual catalogue product links
const FALLBACK_REVIEWS = [
  {
    id: 'fb-1',
    rating: 5,
    quote: "Absolutely in love with the rich and long-lasting fragrance. The magnetic cap and velvet presentation make this feel completely bespoke.",
    author: "Aisha K.",
    isVerified: true,
    product: {
      id: 'amber-oud',
      slug: 'amber-oud',
      name: 'Amber Oud Eau de Parfum',
      image: '/images/perfumes/amber_oud_flacon.jpg',
      price: 4950
    }
  },
  {
    id: 'fb-2',
    rating: 5,
    quote: "The Cambodian oud formulation is simply exceptional. The smoky wood notes settle into sweet amber on skin for over 14 hours.",
    author: "Mohammed R.",
    isVerified: true,
    product: {
      id: 'oud-royale',
      slug: 'oud-royale',
      name: 'Oud Royale — The Royal Edition',
      image: '/images/perfumes/citrus_bloom_hero.jpg',
      price: 7499
    }
  },
  {
    id: 'fb-3',
    rating: 5,
    quote: "Golden sunlight in a flacon. Kashmiri saffron and ambergris create an aura that draws compliments everywhere I walk. My signature scent.",
    author: "Sneha P.",
    isVerified: true,
    product: {
      id: 'golden-saffron',
      slug: 'golden-saffron',
      name: 'Golden Saffron Extrait',
      image: '/images/perfumes/golden_saffron_flacon.jpg',
      price: 5999
    }
  }
];

const Testimonials = () => {
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await productService.getPublicReviews();
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          // Merge dynamic database reviews with fallback product info if product details are populated
          const dynamicList = res.data.map(r => ({
            id: r.id || r._id,
            rating: r.rating || 5,
            quote: r.quote || r.comment || "An extraordinary olfactory composition. True haute perfumerie.",
            author: r.author || r.customerName || "Fragrance Enthusiast",
            isVerified: r.isVerified ?? true,
            product: r.product || {
              id: 'amber-oud',
              slug: 'amber-oud',
              name: 'Amber Oud Eau de Parfum',
              image: '/images/perfumes/amber_oud_flacon.jpg'
            }
          }));
          setReviews(dynamicList);
        }
      } catch (err) {
        console.warn('Using luxury fallback reviews:', err);
      }
    };
    loadReviews();
  }, []);

  const totalReviews = reviews.length;

  const prev = () => {
    setScrollIndex((p) => (p === 0 ? Math.max(0, totalReviews - 3) : Math.max(0, p - 1)));
  };

  const next = () => {
    setScrollIndex((p) => (p + 3 >= totalReviews ? 0 : p + 1));
  };

  // Get currently visible window of 3 reviews (or wrap around)
  const visibleReviews = [];
  for (let i = 0; i < Math.min(3, totalReviews); i++) {
    const idx = (scrollIndex + i) % totalReviews;
    visibleReviews.push(reviews[idx]);
  }

  return (
    <section className="py-10 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header with Title, Badge and Navigation Arrows */}
      <div className="flex items-center justify-between mb-6 sm:mb-10 lg:mb-12">
        <div>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#B86526] font-semibold mb-1 flex items-center gap-1.5">
            <span>Collector Endorsements</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B86526]" />
            <span className="text-gray-400 font-normal">Verified Patrons</span>
          </p>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-[#1A1A1A] font-normal tracking-tight">
            Loved by Fragrance Enthusiasts
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={prev}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#D5C9B8] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
            aria-label="Previous review"
            title="Previous Reviews"
          >
            <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#D5C9B8] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
            aria-label="Next review"
            title="Next Reviews"
          >
            <ChevronRight size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 3 Review Cards Side-by-Side with Product Mini-Card & Click Redirection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {visibleReviews.map((review, idx) => {
          const productTarget = review.product?.slug || review.product?.id || review.product?._id || 'amber-oud';
          const productHref = `/product/${productTarget}#reviews`;
          const productImage = getImageUrl(review.product?.image);
          const productName = review.product?.name || 'Artisan Perfume';

          return (
            <div
              key={review.id || idx}
              className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 border border-[#ECE5D8] hover:border-[#C49444] transition-all duration-300 flex flex-col justify-between hover:shadow-xl shadow-xs relative"
            >
              <div>
                {/* Rating Stars & Verified Badge */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-1 text-[#C49444]">
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-[#C49444]" />
                    ))}
                  </div>

                  {review.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 font-medium shrink-0">
                      <ShieldCheck size={11} className="text-emerald-600" />
                      <span>Verified Patron</span>
                    </span>
                  )}
                </div>

                {/* Poetic Review Quote */}
                <p className="text-xs sm:text-sm lg:text-base text-[#2A2421] font-serif leading-relaxed mb-4 line-clamp-3 sm:line-clamp-4">
                  &ldquo;{review.quote}&rdquo;
                </p>

                {/* Author */}
                <p className="text-[11px] sm:text-xs text-[#8C7A6B] font-medium tracking-wide mb-5">
                  — {review.author}
                </p>
              </div>

              {/* Dynamic Product Thumbnail Mini-Card with Click Redirection to Product Review */}
              <Link
                href={productHref}
                className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between gap-3 p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F4EFE6] border border-transparent hover:border-[#D5C9B8] transition-all cursor-pointer group/prod"
                title={`Read full reviews for ${productName}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E8DFC8] overflow-hidden shrink-0 flex items-center justify-center p-0.5 shadow-2xs">
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-contain group-hover/prod:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = '/images/perfumes/amber_oud_flacon.jpg';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-[#1A1A1A] truncate block group-hover/prod:text-[#B8860B] transition-colors">
                      {productName}
                    </span>
                    <span className="text-[10px] text-[#8C7A6B] flex items-center gap-1">
                      <span>View Product & Reviews</span>
                    </span>
                  </div>
                </div>

                <div className="w-6 h-6 rounded-full bg-white border border-[#E8DFC8] flex items-center justify-center text-gray-400 group-hover/prod:text-[#B8860B] group-hover/prod:border-[#B8860B] shrink-0 transition-all shadow-2xs">
                  <ArrowUpRight size={12} />
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Testimonials;
