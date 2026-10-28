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
    <section className="py-8 sm:py-14 px-3 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8 items-center bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 border border-[#ECE5D8] shadow-xs">
        {/* Left: Hands Holding Bottle */}
        <div className="md:col-span-5 rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/10] bg-[#1E140E] shadow-xs">
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
          <h2 className="text-lg xs:text-xl sm:text-3xl font-serif text-[#1A1A1A] font-normal tracking-tight mb-4 sm:mb-6 text-center md:text-left">
            Why Choose ROVE & AMBER
          </h2>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-4 text-center">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="flex flex-col items-center p-1 sm:p-2">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#FAF7F2] border border-[#E8DFD1] text-[#C49444] flex items-center justify-center mb-1.5 sm:mb-2.5 shadow-xs">
                    <Icon size={15} strokeWidth={1.5} className="sm:w-5 sm:h-5" />
                  </div>
                  <h4 className="text-[8.5px] xs:text-[9.5px] sm:text-xs font-serif font-medium text-[#1A1A1A] leading-tight">
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
