"use client";
import React from 'react';
import Link from 'next/link';

const CATEGORIES_DATA = [
  {
    id: 'perfumes',
    name: 'Perfumes',
    slug: 'perfumes',
    image: '/images/perfumes/gemini_cat_perfumes.jpg',
    fallback: '/images/perfumes/cat_perfume_round.png'
  },
  {
    id: 'oud',
    name: 'Oud',
    slug: 'oud',
    image: '/images/perfumes/gemini_cat_oud.jpg',
    fallback: '/images/perfumes/cat_oud_round.png'
  },
  {
    id: 'gifts',
    name: 'Gifts',
    slug: 'gifts',
    image: '/images/perfumes/gemini_cat_gifts.jpg',
    fallback: '/images/perfumes/cat_gifts_round.png'
  },
  {
    id: 'bakhoor',
    name: 'Bakhoor',
    slug: 'bakhoor',
    image: '/images/perfumes/gemini_cat_bakhoor.jpg',
    fallback: '/images/perfumes/cat_bakhoor_round.png'
  }
];

const Categories = () => {
  return (
    <section className="pt-2 pb-10 sm:py-14 lg:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Subtle Luxury Eyebrow */}
      <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8 select-none">
        <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#C5A880]/70" />
        <span className="text-[10px] sm:text-xs font-serif tracking-[0.28em] uppercase text-[#8C6D1F] font-medium">
          Curated Fragrance Categories
        </span>
        <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#C5A880]/70" />
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-8 md:gap-12 lg:gap-16">
        {CATEGORIES_DATA.map((item) => (
          <Link
            key={item.id}
            href={item.slug === 'gifts' ? '/gifts' : `/shop?category=${encodeURIComponent(item.name)}`}
            className="group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
          >
            {/* Circular Thumbnail with Polished Gold Border */}
            <div className="relative w-16 h-16 xs:w-20 xs:h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden p-0.5 sm:p-1 bg-gradient-to-b from-[#E5B869] to-[#C49444] shadow-md group-hover:shadow-2xl group-hover:shadow-amber-900/25 transition-all duration-300">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#241710]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.target.src = item.fallback;
                  }}
                />
              </div>
            </div>

            {/* Label */}
            <span className="mt-2.5 sm:mt-4 text-xs sm:text-base md:text-lg font-serif font-medium text-[#1A1A1A] group-hover:text-[#B86526] transition-colors tracking-wide text-center">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
