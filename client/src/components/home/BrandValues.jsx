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
    <section className="border-y border-[#ECE5D8] bg-[#F7F3EC]/90 py-4 sm:py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-1.5 sm:gap-4 items-center">
        {values.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-center justify-center text-center sm:text-left gap-1 sm:gap-2.5 p-1">
              <div className="text-[#C49444] flex-shrink-0">
                <Icon size={18} strokeWidth={1.5} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[9px] xs:text-[10px] sm:text-xs font-serif font-semibold text-[#1A1A1A] leading-tight truncate sm:whitespace-normal">
                  {item.title}
                </h4>
                <p className="text-[7.5px] xs:text-[8.5px] sm:text-[10.5px] text-[#7A6B5D] font-light leading-tight mt-0.5 truncate sm:whitespace-normal">
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
