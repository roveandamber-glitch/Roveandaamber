"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Award, ShieldCheck, Droplets } from 'lucide-react';

const LookbookSpotlight = () => {
  return (
    <section className="py-24 bg-[#18181A] text-white overflow-hidden relative">
      {/* Background Accent glow */}
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-[#B86526]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Imagery Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl bg-[#222] border border-white/10">
              <img
                src="/images/perfumes/amber_oud_perfume.jpg"
                alt="ROVE & AMBER Fine Fragrance Craftsmanship"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
                <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold mb-1">
                  Artisanal Flacon & Archive
                </p>
                <p className="text-sm font-serif italic text-white/90">
                  "Every fragrance is slow-macerated in glass demijohns to ensure an olfactory experience that feels intimate, powerful, and unforgettably radiant."
                </p>
              </div>
            </div>

            {/* Overlapping small preview card featuring the R&A Logo Disc */}
            <div className="hidden sm:block absolute -bottom-8 -right-8 z-20 w-48 rounded-2xl overflow-hidden border-4 border-[#18181A] shadow-2xl bg-[#2C1810]">
              <img
                src="/images/perfumes/rove_amber_logo.jpg"
                alt="R&A Circular Emblem"
                className="w-full h-48 object-cover"
              />
              <div className="p-3 bg-[#FAF8F5] text-black text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#3B1D11]">Pure Essentials</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Copy */}
          <div className="lg:col-span-6 lg:pl-6">
            <div className="inline-flex items-center gap-2 text-xs tracking-[0.25em] text-[#D4AF37] uppercase mb-4 font-bold">
              <Sparkles size={12} />
              Fine Fragrance & Artisanal Perfumery
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal leading-[1.12] mb-6 text-white">
              Crafting Signature <br />
              Eau de Parfum.
            </h2>

            <p className="text-sm sm:text-base text-white/75 leading-relaxed font-light mb-8">
              ROVE & AMBER redefines modern niche perfumery. We reject mass synthetic blends in favour of slow, small-batch maceration sculpted from aged amber resins, noble oud, Kashmiri saffron, and Damascena rose—scents created to leave an everlasting impression.
            </p>

            {/* 3 Value Points */}
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#D4AF37] flex-shrink-0 mt-1">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-wider uppercase text-white mb-1">
                    Noble Aged Resins & Pure Oils
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    Sourced from heritage botanical extractions, natural benzoin, wild ambergris, and sustainable agarwood trees.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#D4AF37] flex-shrink-0 mt-1">
                  <Droplets size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-wider uppercase text-white mb-1">
                    High Perfume Oil Concentration
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    Blended between 20% to 26% Extrait and Eau de Parfum strength for exceptional longevity and lingering sillage.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-[#D4AF37] flex-shrink-0 mt-1">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-wider uppercase text-white mb-1">
                    Artisanal Hand-Poured Flacons
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    Each heavy glass flacon is crowned with a solid metallic cap and packaged in our signature embossed luxury box.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="bg-[#D4AF37] hover:bg-[#C49A27] text-[#1A1A1A] px-8 py-4 rounded-full text-xs font-bold tracking-[0.15em] uppercase shadow-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Shop Fragrances</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/about"
                className="border border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full text-xs font-semibold tracking-[0.15em] uppercase transition-all cursor-pointer"
              >
                Our Brand Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LookbookSpotlight;
