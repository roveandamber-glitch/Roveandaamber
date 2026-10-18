"use client";
import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { DUMMY_TESTIMONIALS, PRESS_ACCOLADES } from '../../data/dummyProducts';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? DUMMY_TESTIMONIALS.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % DUMMY_TESTIMONIALS.length);
  };

  const activeReview = DUMMY_TESTIMONIALS[currentIndex] || DUMMY_TESTIMONIALS[0];

  return (
    <section className="py-24 bg-[#FAF8F5] border-t border-[#E8E4DC]">
      {/* Press Accolades Grid */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#B86526]">
            As Featured In
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center">
          {PRESS_ACCOLADES.map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-[#E8E2D8] shadow-sm flex flex-col items-center justify-center">
              <span className="text-2xl md:text-3xl font-serif font-bold tracking-widest text-[#1A1A1A] mb-2">
                {item.outlet}
              </span>
              <p className="text-xs text-gray-500 font-serif italic line-clamp-2">
                "{item.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Collector Testimonials */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.25em] text-[#B86526] uppercase mb-3 font-bold">
            <Sparkles size={12} className="text-[#D4AF37]" />
            Private Connoisseur Reflections
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] font-normal tracking-tight">
            Praised by Fragrance Collectors
          </h2>
        </div>

        {activeReview && (
          <div className="relative bg-white rounded-3xl p-8 sm:p-14 border border-[#E8E2D8] shadow-md">
            <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  {[...Array(activeReview.rating || 5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#D4AF37]" />
                  ))}
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-medium text-black">
                  "{activeReview.title}"
                </h3>

                <p className="text-sm sm:text-base text-gray-700 font-light leading-relaxed">
                  {activeReview.text}
                </p>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-black flex items-center gap-1.5">
                      <span>{activeReview.name}</span>
                      <CheckCircle2 size={13} className="text-[#B86526]" />
                    </h4>
                    <p className="text-xs text-gray-400 font-light">
                      {activeReview.city} • Verified Patron
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-[#B86526] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E2D8]">
                    {activeReview.scent}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex md:flex-col gap-3 self-end md:self-center">
                <button
                  type="button"
                  onClick={prevReview}
                  className="w-11 h-11 rounded-full border border-[#D5CEBF] flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous review"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextReview}
                  className="w-11 h-11 rounded-full border border-[#D5CEBF] flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
                  aria-label="Next review"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
