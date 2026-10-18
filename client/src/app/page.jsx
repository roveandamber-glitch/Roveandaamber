"use client";
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import BrandValues from '@/components/home/BrandValues';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import LookbookSpotlight from '@/components/home/LookbookSpotlight';
import ShopTheLook from '@/components/home/ShopTheLook';
import Testimonials from '@/components/home/Testimonials';
import InstagramSection from '@/components/home/InstagramSection';
import Footer from '@/components/layout/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-enva-bg font-sans text-enva-text">
      <Navbar />
      <Hero />
      <BrandValues />
      <Categories />
      <FeaturedProducts />
      <LookbookSpotlight />
      <ShopTheLook />
      <Testimonials />
      <InstagramSection />
      <Footer />
    </div>
  );
};

export default Home;
