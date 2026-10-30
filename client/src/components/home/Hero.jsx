"use client";
import React, { useState, useEffect, useCallback } from 'react';
import HeroMobile from './hero/HeroMobile';
import HeroDesktop from './hero/HeroDesktop';

// Shared Luxury Campaign Slide Data
const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    tagline: 'Fine Fragrance & Artisanal Perfumery',
    titlePart1: 'Discover Your',
    titlePart2: 'Signature Scent',
    description: 'Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.',
    primaryCta: {
      text: 'Shop Now',
      href: '/shop'
    },
    secondaryCta: {
      text: 'Explore Collection',
      href: '/shop?category=Oud'
    },
    mobileBg: '/images/perfumes/hero_campaign_ultra_clear_master.jpg',
    desktopBg: '/images/perfumes/hero_campaign_ultra_clear_master.jpg'
  },
  {
    id: 2,
    tagline: 'Rare Reserve Ouds & Extraits',
    titlePart1: 'Oud Royale',
    titlePart2: 'The Royal Edition',
    description: 'A transcendent formulation steeped in Cambodian agarwood, taif rose, and crystalline ambergris.',
    primaryCta: {
      text: 'Discover Oud',
      href: '/shop?category=Oud'
    },
    secondaryCta: {
      text: 'Atelier Story',
      href: '/about'
    },
    mobileBg: '/images/perfumes/hero_campaign_ultra_clear_master.jpg',
    desktopBg: '/images/perfumes/hero_campaign_ultra_clear_master.jpg'
  },
  {
    id: 3,
    tagline: 'Bespoke Flacon Discovery Coffrets',
    titlePart1: 'Curated',
    titlePart2: 'Gift Sets',
    description: 'Presented in hand-lacquered wooden coffrets, enveloped with custom satin ribbons and wax-sealed notes.',
    primaryCta: {
      text: 'View Gift Sets',
      href: '/gifts'
    },
    secondaryCta: {
      text: 'Personalize Gift',
      href: '/gifts'
    },
    mobileBg: '/images/perfumes/hero_campaign_ultra_clear_master.jpg',
    desktopBg: '/images/perfumes/hero_campaign_ultra_clear_master.jpg'
  }
];

/**
 * Master Hero Orchestrator Component
 * Holds all shared state, lifecycle logic, auto-advance timers, and callbacks,
 * and delegates UI rendering to:
 * - <HeroMobile /> for mobile screens (< 768px)
 * - <HeroDesktop /> for tablet/desktop screens (>= 768px)
 */
export default function Hero({
  slides = DEFAULT_HERO_SLIDES,
  autoPlay = true,
  autoPlayInterval = 8000,
  onShopNow,
  onExplore,
  ...props
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-play slide advancement
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, slides.length]);

  // Shared slide navigation handler
  const handleSlideChange = useCallback((index) => {
    setActiveSlide(index);
  }, []);

  const handleNextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Shared props object passed down to both view components
  const sharedProps = {
    slides,
    activeSlide,
    onSlideChange: handleSlideChange,
    onNextSlide: handleNextSlide,
    onPrevSlide: handlePrevSlide,
    onShopNow,
    onExplore,
    ...props
  };

  return (
    <>
      {/* 1. Dedicated Mobile Screen UI (Matches iPhone 1:1 luxury mockup) */}
      <div className="block md:hidden w-full">
        <HeroMobile {...sharedProps} />
      </div>

      {/* 2. Dedicated Desktop Screen UI (Widescreen luxury presentation) */}
      <div className="hidden md:block w-full">
        <HeroDesktop {...sharedProps} />
      </div>
    </>
  );
}

// Re-export both components so they can also be used individually if needed
export { HeroMobile, HeroDesktop };
