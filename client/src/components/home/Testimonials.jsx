"use client";
import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const REVIEWS = [
  {
    rating: 5,
    quote: "Absolutely in love with the rich and long-lasting fragrance. Truly premium!",
    author: "Aisha K."
  },
  {
    rating: 5,
    quote: "The Oud collection is simply exceptional. Worth every penny.",
    author: "Mohammed R."
  },
  {
    rating: 5,
    quote: "Beautiful packaging and incredible scent. Highly recommended!",
    author: "Sneha P."
  }
];

const Testimonials = () => {
  const [scrollIndex, setScrollIndex] = useState(0);

  const prev = () => {
    setScrollIndex((p) => (p === 0 ? REVIEWS.length - 1 : p - 1));
  };

  const next = () => {
    setScrollIndex((p) => (p + 1) % REVIEWS.length);
  };

  return (
    <section className="py-8 sm:py-14 px-3 sm:px-6 max-w-7xl mx-auto">
      {/* Header with Title and Arrows */}
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-serif text-[#1A1A1A] font-normal tracking-tight">
          Loved by Fragrance Enthusiasts
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={prev}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[#D5C9B8] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
            aria-label="Previous review"
          >
            <ChevronLeft size={13} className="sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[#D5C9B8] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
            aria-label="Next review"
          >
            <ChevronRight size={13} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* 3 Cards side-by-side on all screens */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        {REVIEWS.map((review, idx) => {
          const isHighlighted = idx === scrollIndex;
          return (
            <div
              key={idx}
              className={`bg-white rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-6 border transition-all duration-300 flex flex-col justify-between ${
                isHighlighted ? 'border-[#C49444] shadow-md' : 'border-[#ECE5D8] shadow-xs'
              }`}
            >
              <div>
                {/* 5 Gold Stars */}
                <div className="flex items-center gap-0.5 sm:gap-1 text-[#C49444] mb-1.5 sm:mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={10} className="sm:w-3.5 sm:h-3.5 fill-[#C49444]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[8.5px] xs:text-[9.5px] sm:text-sm text-[#333] font-serif leading-relaxed mb-2 sm:mb-4">
                  "{review.quote}"
                </p>
              </div>

              {/* Author */}
              <p className="text-[8px] xs:text-[9px] sm:text-xs text-[#7A6B5D] font-medium">
                — {review.author}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Testimonials;
