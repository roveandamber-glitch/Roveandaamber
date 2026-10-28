"use client";
import React from 'react';
import { Leaf, Hourglass, Gem, Heart } from 'lucide-react';

const PILLARS = [
  {
    icon: Leaf,
    title: 'Exquisite Ingredients'
  },
  {
    icon: Hourglass,
    title: 'Long-Lasting Fragrance'
  },
  {
    icon: Gem,
    title: 'Elegant Packaging'
  },
  {
    icon: Heart,
    title: 'Crafted for Every Moment'
  }
];

const WhyChoose = () => {
  return (
    <section className="py-8 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 lg:gap-14 items-center bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 lg:p-12 border border-[#ECE5D8] shadow-sm">
        {/* Left: Hands Holding Bottle */}
        <div className="md:col-span-5 rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[4/3] bg-[#1E140E] shadow-sm">
          <img
            src="/images/perfumes/gemini_why_hands.jpg"
            alt="Why Choose ROVE & AMBER"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/perfumes/why_choose_hands.png';
            }}
          />
        </div>

        {/* Right: Title & 4 Pillars in a row */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="mb-4 sm:mb-8 text-center md:text-left">
            <p className="hidden sm:block text-xs uppercase tracking-[0.25em] text-[#B86526] font-semibold mb-1">
              Atelier Philosophy
            </p>
            <h2 className="text-lg xs:text-xl sm:text-3xl lg:text-4xl font-serif text-[#1A1A1A] font-normal tracking-tight">
              Why Choose ROVE & AMBER
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-6 text-center">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="flex flex-col items-center p-1 sm:p-3 group">
                  <div className="w-8 h-8 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-[#FAF7F2] border border-[#E8DFD1] text-[#C49444] group-hover:bg-[#C49444] group-hover:text-white transition-all duration-300 flex items-center justify-center mb-1.5 sm:mb-3 shadow-xs">
                    <Icon size={16} strokeWidth={1.5} className="sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="text-[8.5px] xs:text-[9.5px] sm:text-sm lg:text-base font-serif font-medium text-[#1A1A1A] leading-tight">
                    {pillar.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
