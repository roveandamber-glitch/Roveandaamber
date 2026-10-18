"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import QuickViewModal from '../common/QuickViewModal';
import { DUMMY_PRODUCTS } from '../../data/dummyProducts';

const LOOK_HOTSPOTS = [
  {
    id: 'spot-1',
    top: '32%',
    left: '48%',
    productIndex: 0, // Amber Oud
    title: 'Amber Oud • Eau de Parfum',
    price: 4499
  },
  {
    id: 'spot-2',
    top: '55%',
    left: '28%',
    productIndex: 1, // Golden Saffron
    title: 'Golden Saffron • Eau de Parfum',
    price: 3999
  },
  {
    id: 'spot-3',
    top: '62%',
    left: '70%',
    productIndex: 2, // Velvet Musk
    title: 'Velvet Musk • Eau de Parfum',
    price: 3499
  }
];

const ShopTheLook = () => {
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleOpenQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-[#E8E4DC]">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-xs tracking-[0.25em] text-[#B86526] uppercase mb-3 font-bold">
          <Sparkles size={12} className="text-[#D4AF37]" />
          Olfactory Layering Suite
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1A1A1A] font-normal tracking-tight mb-4">
          The Fragrance Flight
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
          Tap the interactive notes on our artisanal flight to explore complementary flacons and assemble your bespoke olfactory signature.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F4F1EA] rounded-3xl p-6 sm:p-10 border border-[#E8E2D8]">
        {/* Left Column: Interactive Editorial Photo */}
        <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-[4/5] bg-black shadow-xl">
          <img
            src="/images/perfumes/signature_collection.jpg"
            alt="ROVE & AMBER Signature Fragrance Flight"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.src = '/images/perfumes/hero_desert_fragrance.jpg';
            }}
          />
          <div className="absolute inset-0 bg-black/20" />

          {/* Interactive Hotspot Pins */}
          {LOOK_HOTSPOTS.map((spot) => {
            const product = DUMMY_PRODUCTS[spot.productIndex] || DUMMY_PRODUCTS[0];
            const isActive = activeHotspot === spot.id;

            return (
              <div
                key={spot.id}
                className="absolute z-20"
                style={{ top: spot.top, left: spot.left }}
              >
                {/* Pin Button */}
                <button
                  type="button"
                  onClick={() => setActiveHotspot(isActive ? null : spot.id)}
                  className="relative group focus:outline-none"
                  aria-label={`View ${spot.title}`}
                >
                  <span className="absolute -inset-2 rounded-full bg-[#D4AF37]/50 animate-ping" />
                  <span className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${
                    isActive ? 'bg-[#B86526] text-white scale-125' : 'bg-white text-black hover:scale-110'
                  }`}>
                    <Plus size={16} strokeWidth={2.5} className={isActive ? 'rotate-45 transition-transform' : 'transition-transform'} />
                  </span>
                </button>

                {/* Hotspot Floating Tooltip */}
                {isActive && (
                  <div className="absolute left-10 -top-6 w-56 sm:w-64 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-[#E8E2D8] z-30 animate-fadeIn">
                    <div className="flex gap-3 items-center mb-3">
                      <img
                        src={product.images?.[0]?.url || '/images/perfumes/amber_oud_perfume.jpg'}
                        alt={product.name}
                        className="w-12 h-14 object-cover rounded-lg border border-gray-100"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-serif font-bold text-black truncate">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          {product.category || 'Eau de Parfum'}
                        </p>
                        <p className="text-xs font-bold text-[#B86526] mt-0.5">
                          ₹{(product.price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickView(product)}
                      className="w-full py-2 bg-[#1A1A1A] hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Quick View Flacon</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Narrative & Product Links */}
        <div className="lg:col-span-5 lg:pl-6 space-y-6">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold uppercase text-[#B86526]">
            Curated Discovery Capsule
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif text-black leading-snug">
            Scent Harmonization & Layering Notes
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
            Each ROVE & AMBER creation is formulated with molecular harmony, allowing you to layer warm Amber Oud over luminous Golden Saffron for an intoxicating day-to-night transformation.
          </p>

          <div className="space-y-3 pt-2">
            {LOOK_HOTSPOTS.map((spot) => {
              const product = DUMMY_PRODUCTS[spot.productIndex] || DUMMY_PRODUCTS[0];
              return (
                <div
                  key={spot.id}
                  onClick={() => handleOpenQuickView(product)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#E8E2D8] hover:border-black transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0]?.url || '/images/perfumes/amber_oud_perfume.jpg'}
                      alt={product.name}
                      className="w-10 h-12 object-cover rounded-lg border border-gray-100"
                    />
                    <div>
                      <h4 className="text-xs font-serif font-bold text-black group-hover:text-[#B86526] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-light">
                        {product.category || 'Eau de Parfum'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-black block">
                      ₹{(product.price || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400 group-hover:text-black transition-colors flex items-center gap-1 justify-end">
                      Inspect <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 hover:text-[#B86526] hover:border-[#B86526] transition-colors cursor-pointer"
            >
              <span>Explore All Fragrance Flights</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </section>
  );
};

export default ShopTheLook;
