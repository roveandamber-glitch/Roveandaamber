"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import { getImageUrl } from '../../utils/imageHelper';
import { DUMMY_CATEGORIES } from '../../data/dummyProducts';

// Frontend presentation mapping for legacy backend category records
const mapCategoryToPerfume = (cat) => {
  if (!cat) return cat;
  const name = (cat.name || '').toLowerCase();
  
  if (name.includes('ethnic')) {
    return {
      ...cat,
      displayName: "Signature Scents",
      displayImage: "/images/perfumes/cat_signature.jpg",
      displayCount: cat.itemCount || 8
    };
  }
  if (name.includes('western')) {
    return {
      ...cat,
      displayName: "Eau de Parfum",
      displayImage: "/images/perfumes/amber_oud_perfume.jpg",
      displayCount: cat.itemCount || 10
    };
  }
  if (name.includes('casual')) {
    return {
      ...cat,
      displayName: "Men's Fragrances",
      displayImage: "/images/perfumes/cat_men.jpg",
      displayCount: cat.itemCount || 6
    };
  }
  if (name.includes('party')) {
    return {
      ...cat,
      displayName: "Women's Fragrances",
      displayImage: "/images/perfumes/cat_women.jpg",
      displayCount: cat.itemCount || 6
    };
  }

  return {
    ...cat,
    displayName: cat.name,
    displayImage: cat.image || "/images/perfumes/cat_signature.jpg",
    displayCount: cat.itemCount || 6
  };
};

const Categories = () => {
  const [categories, setCategories] = useState(
    DUMMY_CATEGORIES.slice(0, 4).map(c => ({
      ...c,
      displayName: c.name,
      displayImage: c.image,
      displayCount: c.itemCount
    }))
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        if (response.success && response.data?.length > 0) {
          setCategories(response.data.slice(0, 4).map(mapCategoryToPerfume));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-xs tracking-[0.25em] text-[#B86526] uppercase mb-3 font-semibold">
          Curated Olfactory Notes
        </p>
        <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] font-normal">
          Browse Fragrance Collections
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            href={`/shop?category=${encodeURIComponent(category.name || category.displayName)}`}
            key={category._id || category.id}
            className="group flex flex-col cursor-pointer"
          >
            <div className="relative overflow-hidden mb-3.5 bg-[#EFE8DC] aspect-[3/4] rounded-2xl flex items-center justify-center p-3 sm:p-5 transition-all duration-500 ease-out group-hover:bg-[#E7DFC0] group-hover:shadow-md border border-[#E8E2D6]/60">
              <img
                src={getImageUrl(category.displayImage || category.image)}
                alt={category.displayName || category.name}
                className="w-full h-full object-cover object-center rounded-xl transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/images/perfumes/cat_signature.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-serif font-medium text-black group-hover:text-[#B86526] transition-colors">
                {category.displayName || category.name}
              </h3>
              <p className="text-xs text-gray-500 font-light mt-0.5">
                {category.displayCount || 8} Fragrances
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
