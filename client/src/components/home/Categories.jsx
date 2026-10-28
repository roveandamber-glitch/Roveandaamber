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
    <section className="py-8 sm:py-12 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-4 gap-3 sm:gap-8">
        {CATEGORIES_DATA.map((item) => (
          <Link
            key={item.id}
            href={item.slug === 'gifts' ? '/gifts' : `/shop?category=${encodeURIComponent(item.name)}`}
            className="group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
          >
            {/* Circular Thumbnail with Gold Border */}
            <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden p-0.5 bg-gradient-to-b from-[#E5B869] to-[#C49444] shadow-md group-hover:shadow-xl group-hover:shadow-amber-900/20 transition-all duration-300">
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
            <span className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-serif font-medium text-[#1A1A1A] group-hover:text-[#B86526] transition-colors tracking-wide">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
