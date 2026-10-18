"use client";
import Link from 'next/link';
import React from 'react';
import { getImageUrl } from '../../utils/imageHelper';

// Frontend presentation mapping in case backend returns legacy clothing products
const mapProductPresentation = (product) => {
  if (!product) return product;
  const name = (product.name || '').toLowerCase();

  if (name.includes('coat') || name.includes('trench')) {
    return {
      ...product,
      displayName: "Amber Oud",
      displayCategory: "Eau de Parfum",
      fallbackPerfumeImage: "/images/perfumes/amber_oud_perfume.jpg"
    };
  }
  if (name.includes('dress') || name.includes('western')) {
    return {
      ...product,
      displayName: "Golden Saffron",
      displayCategory: "Women's Fragrances",
      fallbackPerfumeImage: "/images/perfumes/golden_saffron.jpg"
    };
  }
  if (name.includes('kurti') || name.includes('ethnic')) {
    return {
      ...product,
      displayName: "Velvet Musk",
      displayCategory: "Unisex Fragrances",
      fallbackPerfumeImage: "/images/perfumes/white_musk.jpg"
    };
  }
  if (name.includes('shirt') || name.includes('linen') || name.includes('casual')) {
    return {
      ...product,
      displayName: "Midnight Amber",
      displayCategory: "Men's Fragrances",
      fallbackPerfumeImage: "/images/perfumes/midnight_noir.jpg"
    };
  }
  if (name.includes('gown') || name.includes('party')) {
    return {
      ...product,
      displayName: "Rose Essence",
      displayCategory: "Women's Fragrances",
      fallbackPerfumeImage: "/images/perfumes/rose_eternelle.jpg"
    };
  }
  if (name.includes('top') || name.includes('silk')) {
    return {
      ...product,
      displayName: "Citrus Bloom",
      displayCategory: "Unisex Fragrances",
      fallbackPerfumeImage: "/images/perfumes/azure_mist.jpg"
    };
  }

  return {
    ...product,
    displayName: product.name,
    displayCategory: product.category || 'Eau de Parfum',
    fallbackPerfumeImage: "/images/perfumes/amber_oud_perfume.jpg"
  };
};

const ProductCard = ({ product }) => {
  const mapped = mapProductPresentation(product);

  const images = mapped.images && mapped.images.length > 0 
    ? mapped.images.map(img => getImageUrl(img))
    : [getImageUrl(mapped.image || mapped.fallbackPerfumeImage)];

  const imageUrl = images[0] || mapped.fallbackPerfumeImage;

  return (
    <Link href={`/product/${product._id || product.id}`} className="group flex flex-col cursor-pointer">
      {/* Product Image Container with Warm Golden Off-White Studio Backdrop */}
      <div className="relative overflow-hidden mb-2.5 sm:mb-3.5 bg-[#EFE8DC] aspect-[3/4] rounded-2xl flex items-center justify-center p-3 sm:p-5 transition-all duration-500 ease-out group-hover:bg-[#E7DFC0] group-hover:shadow-md border border-[#E8E2D6]/60">
        <img 
          src={imageUrl} 
          alt={mapped.displayName} 
          className="w-full h-full object-cover object-center rounded-xl transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            e.target.src = mapped.fallbackPerfumeImage || '/images/perfumes/amber_oud_perfume.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        
        {/* Subtle Eau de Parfum Badge */}
        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-semibold text-[#3B1D11] border border-[#D4AF37]/30 shadow-2xs">
          {mapped.displayCategory}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col space-y-0.5 sm:space-y-1 px-1">
        <h3 className="text-xs sm:text-sm font-serif font-medium text-enva-text group-hover:text-[#B86526] transition-colors line-clamp-1">
          {mapped.displayName}
        </h3>
        <p className="text-xs sm:text-sm font-sans font-bold text-[#1A1A1A]">
          ₹{(product.price || 0).toLocaleString('en-IN')}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
