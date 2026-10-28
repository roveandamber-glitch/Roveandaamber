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
    <section className="py-8 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header with Title and Arrows */}
      <div className="flex items-center justify-between mb-4 sm:mb-10 lg:mb-12">
        <div>
          <p className="hidden sm:block text-xs uppercase tracking-[0.25em] text-[#B86526] font-semibold mb-1">
            Collector Endorsements
          </p>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-[#1A1A1A] font-normal tracking-tight">
            Loved by Fragrance Enthusiasts
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={prev}
            className="w-6 h-6 sm:w-10 sm:h-10 rounded-full border border-[#D5C9B8] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all cursor-pointer shadow-xs"
            aria-label="Previous review"
          >
            <ChevronLeft size={14} className="sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="w-6 h-6 sm:w-10 sm:h-10 rounded-full border border-[#D5C9B8] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-all cursor-pointer shadow-xs"
            aria-label="Next review"
          >
            <ChevronRight size={14} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 3 Cards side-by-side on all screens */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 lg:gap-8">
        {REVIEWS.map((review, idx) => {
          const isHighlighted = idx === scrollIndex;
          return (
            <div
              key={idx}
              className={`bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-2.5 xs:p-3 sm:p-7 lg:p-8 border transition-all duration-300 flex flex-col justify-between hover:shadow-lg ${
                isHighlighted ? 'border-[#C49444] shadow-md' : 'border-[#ECE5D8] shadow-xs'
              }`}
            >
              <div>
                {/* 5 Gold Stars */}
                <div className="flex items-center gap-0.5 sm:gap-1 text-[#C49444] mb-1.5 sm:mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={11} className="sm:w-4 sm:h-4 fill-[#C49444]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[8.5px] xs:text-[9.5px] sm:text-base lg:text-lg text-[#333] font-serif leading-relaxed mb-2 sm:mb-5">
                  "{review.quote}"
                </p>
              </div>

              {/* Author */}
              <p className="text-[8px] xs:text-[9px] sm:text-xs lg:text-sm text-[#8C7A6B] font-medium tracking-wide">
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
