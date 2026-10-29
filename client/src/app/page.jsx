"use client";
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import BrandValues from '@/components/home/BrandValues';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import LookbookSpotlight from '@/components/home/LookbookSpotlight';
import ShopTheLook from '@/components/home/ShopTheLook';
import WhyChoose from '@/components/home/WhyChoose';
import Testimonials from '@/components/home/Testimonials';
import InstagramSection from '@/components/home/InstagramSection';
import NewsletterVIP from '@/components/home/NewsletterVIP';
import Footer from '@/components/layout/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-enva-bg font-sans text-enva-text overflow-x-hidden w-full">
      <Navbar />
      <Hero />
      <Categories />
      <BrandValues />
      <FeaturedProducts />
      <LookbookSpotlight />
      <ShopTheLook />
      <WhyChoose />
      <Testimonials />
      <InstagramSection />
      <NewsletterVIP />
      <Footer />
    </div>
  );
};

export default Home;
