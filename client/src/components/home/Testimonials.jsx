"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, ShieldCheck, ArrowUpRight } from 'lucide-react';
import productService from '@/services/productService';
import { getImageUrl } from '@/utils/imageHelper';

// Verified luxury common fallback flacon image (guaranteed in client public assets)
const COMMON_PRODUCT_IMAGE = '/images/perfumes/gemini_amber_royal.jpg';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await productService.getPublicReviews();
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const dynamicList = res.data.map((r) => ({
            id: r.id || r._id,
            rating: r.rating || 5,
            quote: r.quote || r.comment || r.title || 'An extraordinary olfactory composition. True haute perfumerie.',
            author: r.author || r.customerName || 'Fragrance Connoisseur',
            isVerified: r.isVerified ?? true,
            product: r.product || {
              id: 'amber-oud',
              slug: 'amber-oud',
              name: 'Amber Oud Eau de Parfum',
              image: COMMON_PRODUCT_IMAGE
            }
          }));
          setReviews(dynamicList);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.warn('Failed to load database reviews:', err);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadReviews();
  }, []);

  const totalReviews = reviews.length;

  // Do not render section if there are no verified reviews in database
  if (!isLoading && totalReviews === 0) {
    return null;
  }

  const prev = () => {
    setScrollIndex((p) => (p === 0 ? Math.max(0, totalReviews - 3) : Math.max(0, p - 1)));
  };

  const next = () => {
    setScrollIndex((p) => (p + 3 >= totalReviews ? 0 : p + 1));
  };

  // Determine reviews to show
  const visibleReviews = totalReviews <= 3 
    ? reviews 
    : (() => {
        const list = [];
        for (let i = 0; i < 3; i++) {
          list.push(reviews[(scrollIndex + i) % totalReviews]);
        }
        return list;
      })();

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

        {totalReviews > 3 && (
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
        )}
      </div>

      {/* Review Cards with Dynamic Product Mini-Card & Click Redirection */}
      <div className={`grid grid-cols-1 ${totalReviews === 1 ? 'max-w-md mx-auto' : totalReviews === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-4 sm:gap-6 lg:gap-8`}>
        {visibleReviews.map((review, idx) => {
          const productTarget = review.product?.slug || review.product?.id || review.product?._id || 'amber-oud';
          const productHref = `/product/${productTarget}#reviews`;
          const rawImg = review.product?.image;
          const productImage = rawImg ? getImageUrl(rawImg, COMMON_PRODUCT_IMAGE) : COMMON_PRODUCT_IMAGE;
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

                {/* Review Quote */}
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
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = COMMON_PRODUCT_IMAGE;
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
