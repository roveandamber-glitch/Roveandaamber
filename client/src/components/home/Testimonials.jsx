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
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header with Title and Arrows */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] font-normal tracking-tight">
          Loved by Fragrance Enthusiasts
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            className="w-8 h-8 rounded-full border border-[#D5C9B8] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
            aria-label="Previous review"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={next}
            className="w-8 h-8 rounded-full border border-[#D5C9B8] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer"
            aria-label="Next review"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Testimonials Grid (Desktop 3 columns, mobile responsive slide) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {REVIEWS.map((review, idx) => {
          const isHighlighted = idx === scrollIndex;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                isHighlighted ? 'border-[#C49444] shadow-md' : 'border-[#ECE5D8] shadow-xs'
              }`}
            >
              <div>
                {/* 5 Gold Stars */}
                <div className="flex items-center gap-1 text-[#C49444] mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-[#C49444]" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-[#333] font-serif leading-relaxed mb-4">
                  "{review.quote}"
                </p>
              </div>

              {/* Author */}
              <p className="text-xs text-[#7A6B5D] font-medium">
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
