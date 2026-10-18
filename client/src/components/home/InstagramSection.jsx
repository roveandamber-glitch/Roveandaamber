"use client";
import React from 'react';
import { Instagram, Heart, ArrowUpRight, Sparkles } from 'lucide-react';
import { INSTAGRAM_POSTS } from '../../data/dummyProducts';

const InstagramSection = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-[#E8E4DC]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs tracking-[0.25em] text-[#B86526] uppercase mb-3 font-bold">
            <Instagram size={14} className="text-[#B86526]" />
            Official Instagram Feed
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] font-normal tracking-tight">
            Follow @roveandamber
          </h2>
          <p className="text-xs text-gray-500 font-light mt-1">
            Fine Fragrance & Artisanal Perfumery • Shipping Pan-India
          </p>
        </div>
        <a
          href="https://www.instagram.com/roveandamber"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-black border-b-2 border-black pb-1 hover:text-[#B86526] hover:border-[#B86526] transition-colors"
        >
          <span>Explore @roveandamber</span>
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Grid of 6 Instagram Moments directly referencing brand imagery */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {INSTAGRAM_POSTS.map((post) => (
          <a
            key={post.id}
            href="https://www.instagram.com/roveandamber"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-[#EFE8DC] block shadow-sm border border-[#E8E2D6]"
          >
            <img
              src={post.image}
              alt="ROVE & AMBER Instagram"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {/* Amber gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
              <div className="flex justify-end">
                <Instagram size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-semibold mb-1">
                  <Heart size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
                  <span>{post.likes}</span>
                </div>
                <p className="text-[11px] font-medium text-white/90 line-clamp-1">{post.tag}</p>
                <p className="text-[10px] text-white/60">{post.handle}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramSection;
