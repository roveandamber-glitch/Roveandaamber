"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import categoryService from '../../services/categoryService';
import { getImageUrl } from '../../utils/imageHelper';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getAllCategories();
        let list = [];
        if (res?.success && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setCategories(list);
      } catch (err) {
        console.error('Failed to load categories from database:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section className="pt-2 pb-10 sm:py-14 lg:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Subtle Luxury Eyebrow */}
      <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8 select-none">
        <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#C5A880]/70" />
        <span className="text-[10px] sm:text-xs font-serif tracking-[0.28em] uppercase text-[#8C6D1F] font-medium">
          Curated Fragrance Families
        </span>
        <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#C5A880]/70" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 lg:gap-6">
        {categories.map((item) => {
          const catId = item._id || item.id || item.name;
          const img = getImageUrl(item.image);
          return (
            <Link
              key={catId}
              href={`/shop?category=${encodeURIComponent(item.name)}`}
              className="group flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1.5"
            >
              {/* Circular Thumbnail with Polished Gold Border */}
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden p-0.5 sm:p-1 bg-gradient-to-b from-[#E5B869] to-[#C49444] shadow-md group-hover:shadow-2xl group-hover:shadow-amber-900/25 transition-all duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#241710]">
                  <img
                    src={img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      e.target.src = '/images/perfumes/signature_collection.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Label */}
              <span className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-serif font-medium text-[#1A1A1A] group-hover:text-[#B86526] transition-colors tracking-wide text-center line-clamp-1">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;
