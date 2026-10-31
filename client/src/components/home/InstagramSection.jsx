"use client";
import React from 'react';
import { Play, Instagram } from 'lucide-react';

const INSTAGRAM_URL = "https://www.instagram.com/roveandamber?dlrf=NzhjOGd5aGprdG96";

const INSTA_POSTS = [
  {
    id: 1,
    image: '/images/perfumes/gemini_hero_desert.jpg',
    fallback: '/images/perfumes/insta_1.png',
    alt: 'ROVE & AMBER signature flacon'
  },
  {
    id: 2,
    image: '/images/perfumes/gemini_oud_noir.jpg',
    fallback: '/images/perfumes/insta_2.png',
    alt: 'Oud Noir in golden desert'
  },
  {
    id: 3,
    image: '/images/perfumes/gemini_cat_oud.jpg',
    fallback: '/images/perfumes/insta_3.png',
    alt: 'Aged wild agarwood video showcase',
    isVideo: true
  },
  {
    id: 4,
    image: '/images/perfumes/gemini_col_women.jpg',
    fallback: '/images/perfumes/insta_4.png',
    alt: 'Rose Elixir artisanal essence'
  }
];

const InstagramSection = () => {
  return (
    <section className="py-8 sm:py-16 lg:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-10 lg:mb-12">
        <div>
          <p className="hidden sm:block text-xs uppercase tracking-[0.25em] text-[#B86526] font-semibold mb-1">
            Visual Archive
          </p>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-[#1A1A1A] font-normal tracking-tight">
            Follow Our Fragrance Journey
          </h2>
        </div>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] sm:text-sm lg:text-base text-[#7A6B5D] hover:text-[#1A1A1A] transition-colors font-medium tracking-wide group cursor-pointer"
        >
          <Instagram size={15} className="text-[#B86526] group-hover:scale-110 transition-transform" />
          <span className="group-hover:underline">@roveandamber</span>
        </a>
      </div>

      {/* 4 Image Grid in one row across */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-6 lg:gap-8">
        {INSTA_POSTS.map((post) => (
          <a
            key={post.id}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${post.alt} on Instagram`}
            className="group relative block rounded-lg sm:rounded-2xl lg:rounded-3xl overflow-hidden aspect-square bg-[#1E140E] shadow-sm hover:shadow-xl transition-all cursor-pointer"
          >
            <img
              src={post.image}
              alt={post.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              onError={(e) => {
                e.target.src = post.fallback;
              }}
            />

            {/* Subtle Luxury Hover Overlay with Instagram Icon */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-300 flex items-center justify-center pointer-events-none">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-100 scale-75 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg">
                <Instagram size={14} className="sm:w-5 sm:h-5 text-white" />
              </div>
            </div>

            {/* Video Play Overlay */}
            {post.isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none group-hover:opacity-0 transition-opacity">
                <div className="w-6 h-6 sm:w-12 sm:h-12 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white pl-0.5 shadow-md">
                  <Play size={10} className="sm:w-5 sm:h-5" fill="white" />
                </div>
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramSection;
