"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import ProductCard from '../product/ProductCard';
import productService from '../../services/productService';
import { DUMMY_PRODUCTS } from '../../data/dummyProducts';

const FeaturedProducts = () => {
  const [products, setProducts] = useState(DUMMY_PRODUCTS.slice(0, 4));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts();
        if (response.success && response.data?.products?.length > 0) {
          setProducts(response.data.products.slice(0, 4));
        } else if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          setProducts(response.data.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto border-t border-gray-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <p className="text-xs tracking-[0.25em] text-[#B86526] uppercase mb-3 font-semibold">
            Signature Flacons
          </p>
          <h2 className="text-4xl font-serif text-enva-text font-normal">
            Best Sellers & Iconic Scents
          </h2>
        </div>
        <Link 
          href="/shop" 
          className="text-xs font-semibold uppercase tracking-wider border-b border-black pb-1 mt-6 md:mt-0 inline-block hover:text-[#B86526] hover:border-[#B86526] transition-colors"
        >
          View All Fragrances
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-8">
        {products.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
