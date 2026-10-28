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
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white rounded-3xl p-6 sm:p-10 border border-[#ECE5D8] shadow-xs">
        {/* Left: Visual Photography */}
        <div className="lg:col-span-5 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] bg-[#1E140E] shadow-sm">
          <img
            src="/images/perfumes/why_choose_hands.png"
            alt="ROVE & AMBER Perfumery Craft"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/perfumes/about_atelier.jpg';
            }}
          />
        </div>

        {/* Right: Content & 4 Pillars */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <h2 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A] font-normal tracking-tight mb-8 text-center lg:text-left">
            Why Choose ROVE & AMBER
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center p-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8DFD1] text-[#C49444] flex items-center justify-center mb-3 shadow-xs">
                    <Icon size={20} strokeWidth={1.6} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-serif font-medium text-[#1A1A1A] leading-snug">
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
