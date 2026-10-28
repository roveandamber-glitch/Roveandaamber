"use client";
import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { message } from 'antd';

const NewsletterVIP = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      message.error('Please enter a valid email address');
      return;
    }
    setIsSubmitted(true);
    message.success('Welcome to the ROVE & AMBER Circle');
  };

  return (
    <section className="relative py-14 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12 overflow-hidden bg-[#120B06]">
      {/* Background Desert Warmth */}
      <div className="absolute inset-0 z-0 opacity-40">
        <picture>
          <source media="(min-width: 768px)" srcSet="/images/perfumes/hero_desert_fragrance.jpg" />
          <img
            src="/images/perfumes/gemini_hero_desert.jpg"
            alt="Desert background"
            className="w-full h-full object-cover object-bottom"
            onError={(e) => {
              e.target.src = '/images/perfumes/hero_desert_fragrance.jpg';
            }}
          />
        </picture>
        <div className="absolute inset-0 bg-[#140D07]/85" />
      </div>

      {/* Curved Convex Container */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-10 lg:gap-14">
        {/* Left Copy */}
        <div className="text-center md:text-left max-w-lg lg:max-w-2xl">
          <p className="hidden sm:block text-xs uppercase tracking-[0.25em] text-[#E5B869] font-semibold mb-2">
            Private Reserve Access
          </p>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-white font-normal leading-snug">
            <span className="text-[#E5B869]">Join the</span> ROVE & AMBER Circle
          </h2>
          <p className="text-xs sm:text-base lg:text-lg text-gray-300 font-light mt-2 leading-relaxed">
            Be the first to know about new arrivals, exclusive offers, and fragrance stories.
          </p>
        </div>

        {/* Right Input Form */}
        <div className="w-full max-w-md lg:max-w-lg">
          {isSubmitted ? (
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-[#E5B869]/40 text-white rounded-full px-6 py-4">
              <Check size={18} className="text-[#E5B869]" />
              <span className="text-xs sm:text-sm text-white font-medium">Thank you for joining our private circle.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center bg-white rounded-full p-1.5 sm:p-2 shadow-2xl w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none rounded-full bg-transparent"
              />
              <button
                type="submit"
                className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] flex items-center justify-center flex-shrink-0 hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                aria-label="Subscribe"
              >
                <ArrowRight size={15} strokeWidth={2.2} className="sm:w-5 sm:h-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterVIP;
