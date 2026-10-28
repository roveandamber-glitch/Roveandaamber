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
    <section className="relative py-12 sm:py-16 px-4 sm:px-6 overflow-hidden bg-[#120B06]">
      {/* Background Desert Warmth */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src="/images/perfumes/gemini_hero_desert.jpg"
          alt="Desert background"
          className="w-full h-full object-cover object-bottom"
          onError={(e) => {
            e.target.src = '/images/perfumes/hero_desert_fragrance.jpg';
          }}
        />
        <div className="absolute inset-0 bg-[#140D07]/85" />
      </div>

      {/* Curved Convex Container */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left Copy */}
        <div className="text-center md:text-left max-w-lg">
          <h2 className="text-xl sm:text-3xl font-serif text-white font-normal leading-snug">
            <span className="text-[#E5B869]">Join the</span> ROVE & AMBER Circle
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-light mt-1.5 leading-relaxed">
            Be the first to know about new arrivals, exclusive offers, and fragrance stories.
          </p>
        </div>

        {/* Right Input Form */}
        <div className="w-full max-w-md">
          {isSubmitted ? (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-[#E5B869]/40 text-white rounded-full px-5 py-3">
              <Check size={16} className="text-[#E5B869]" />
              <span className="text-xs text-white">Thank you for joining our private circle.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center bg-white rounded-full p-1.5 shadow-xl w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-2 text-xs sm:text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none rounded-full bg-transparent"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] flex items-center justify-center flex-shrink-0 hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-xs"
                aria-label="Subscribe"
              >
                <ArrowRight size={14} strokeWidth={2.2} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterVIP;
