"use client";
import React from 'react';
import { Play } from 'lucide-react';

const INSTA_POSTS = [
  {
    id: 1,
    image: '/images/perfumes/insta_1.png',
    fallback: '/images/perfumes/mobile_hero_desert.jpg',
    alt: 'ROVE & AMBER signature flacon'
  },
  {
    id: 2,
    image: '/images/perfumes/insta_2.png',
    fallback: '/images/perfumes/noir_intense.jpg',
    alt: 'Oud Noir in golden desert'
  },
  {
    id: 3,
    image: '/images/perfumes/insta_3.png',
    fallback: '/images/perfumes/perfume_craft.jpg',
    alt: 'Aged wild agarwood video showcase',
    isVideo: true
  },
  {
    id: 4,
    image: '/images/perfumes/insta_4.png',
    fallback: '/images/perfumes/rose_eternelle.jpg',
    alt: 'Rose Elixir artisanal essence'
  }
];

const InstagramSection = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-3xl font-serif text-[#1A1A1A] font-normal tracking-tight">
          Follow Our Fragrance Journey
        </h2>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-[#7A6B5D] hover:text-[#1A1A1A] transition-colors font-medium"
        >
          @roveandamber
        </a>
      </div>

      {/* 4 Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {INSTA_POSTS.map((post) => (
          <div
            key={post.id}
            className="relative rounded-2xl overflow-hidden aspect-square bg-[#1E140E] group shadow-xs hover:shadow-md transition-shadow"
          >
            <img
              src={post.image}
              alt={post.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              onError={(e) => {
                e.target.src = post.fallback;
              }}
            />

            {/* Video Play Overlay */}
            {post.isVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white pl-0.5 shadow-md">
                  <Play size={16} fill="white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default InstagramSection;
