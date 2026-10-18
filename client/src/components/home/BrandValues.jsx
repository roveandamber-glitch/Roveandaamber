"use client";
import React from 'react';
import { Sparkles, Droplets, FlaskConical, Gift } from 'lucide-react';

const BrandValues = () => {
  const values = [
    {
      icon: Droplets,
      title: "Pure Raw Extractions",
      description: "Precious aged amber resins, royal wild oud, Damascena rose, and noble botanical extractions."
    },
    {
      icon: FlaskConical,
      title: "Artisanal Perfumery",
      description: "Slow-macerated in artisanal small batches with high 20–26% Eau de Parfum oil concentration."
    },
    {
      icon: Sparkles,
      title: "Signature Sillage",
      description: "Engineered olfactory pyramids with distinct Top, Heart, and Base notes that linger for 12+ hours."
    },
    {
      icon: Gift,
      title: "Pan-India Secure Shipping",
      description: "Protected express delivery housed in signature ROVE & AMBER embossed flacon packaging."
    }
  ];

  return (
    <section className="border-y border-[#E8E4DC] bg-[#F4F1EA] py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {values.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-start gap-4 group">
              <div className="p-3 rounded-2xl bg-white shadow-sm border border-[#E5E0D6] text-[#B86526] group-hover:bg-[#3B1D11] group-hover:text-white transition-colors duration-300 flex-shrink-0">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-light">
                  {item.description}
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
