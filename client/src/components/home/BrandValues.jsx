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
    <section className="border-y border-[#ECE5D8] bg-[#F7F3EC]/80 py-6 sm:py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {values.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-3 sm:gap-3.5 justify-start sm:justify-center p-2">
              <div className="text-[#C49444] flex-shrink-0">
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[11px] sm:text-xs font-serif font-semibold text-[#1A1A1A] leading-tight">
                  {item.title}
                </h4>
                <p className="text-[9.5px] sm:text-[11px] text-[#6E6359] font-light leading-tight mt-0.5">
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
