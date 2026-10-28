"use client";
import React from 'react';
import { Leaf, Gem, Flower2, Truck } from 'lucide-react';

const BrandValues = () => {
  const values = [
    {
      icon: Leaf,
      title: "Premium Ingredients",
      subtitle: "Sourced Globally"
    },
    {
      icon: Gem,
      title: "Long Lasting",
      subtitle: "Signature Scents"
    },
    {
      icon: Flower2,
      title: "Artisanal Craftsmanship",
      subtitle: "Blended with Care"
    },
    {
      icon: Truck,
      title: "Secure Delivery",
      subtitle: "Pan India"
    }
  ];

  return (
    <section className="border-y border-[#ECE5D8] bg-[#F7F3EC]/90 py-4 sm:py-7 lg:py-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-1.5 sm:gap-6 items-center">
        {values.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-1 sm:gap-3.5 p-1 sm:px-4 md:border-r md:border-[#E6DEC7]/80 last:border-r-0"
            >
              <div className="text-[#C49444] flex-shrink-0">
                <Icon size={18} strokeWidth={1.5} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[9px] xs:text-[10px] sm:text-sm lg:text-base font-serif font-semibold text-[#1A1A1A] leading-tight">
                  {item.title}
                </h4>
                <p className="text-[7.5px] xs:text-[8.5px] sm:text-xs text-[#7A6B5D] font-light leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BrandValues;
