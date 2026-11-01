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
  const [currentSlides, setCurrentSlides] = useState(slides);

  // Dynamically fetch custom hero banners from the database
  useEffect(() => {
    let isMounted = true;
    async function fetchDynamicHero() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/banners?highlightType=hero`);
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          const dynamicSlides = json.data.map((b, idx) => {
            let part1 = b.titlePart1;
            let part2 = b.titlePart2;
            if (!part1 && !part2 && b.title) {
              const words = b.title.trim().split(' ');
              if (words.length > 2) {
                part1 = words.slice(0, words.length - 2).join(' ');
                part2 = words.slice(words.length - 2).join(' ');
              } else if (words.length === 2) {
                part1 = words[0];
                part2 = words[1];
              } else {
                part1 = b.title;
                part2 = '';
              }
            }
            return {
              id: b._id || b.id || `dynamic-${idx}`,
              tagline: b.badge || 'Fine Fragrance & Artisanal Perfumery',
              title: b.title,
              titlePart1: part1,
              titlePart2: part2,
              description: b.subtitle || 'Explore fine fragrances crafted to leave a lasting impression. Sculpted with aged amber, wild oud, and rare botanical essences.',
              primaryCta: {
                text: b.buttonText || 'Shop Now',
                href: b.linkUrl || '/shop'
              },
              secondaryCta: {
                text: b.secondaryButtonText || 'Explore Collection',
                href: b.secondaryButtonLink || '/shop?category=Oud'
              },
              desktopBg: b.image || '/images/perfumes/hero_campaign_ultra_clear_master.jpg',
              mobileBg: b.mobileImage || b.image || '/images/perfumes/hero_campaign_ultra_clear_master.jpg'
            };
          });

          if (isMounted && dynamicSlides.length > 0) {
            // Keep dynamic slide(s) first, then append other default slides so carousel stays rich
            const extraDefaults = DEFAULT_HERO_SLIDES.slice(dynamicSlides.length);
            setCurrentSlides([...dynamicSlides, ...extraDefaults]);
          }
        }
      } catch (err) {
        console.error('Error fetching dynamic hero slides:', err);
      }
    }
    fetchDynamicHero();
    return () => { isMounted = false; };
  }, []);

  // Auto-play slide advancement
  useEffect(() => {
    if (!autoPlay || currentSlides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % currentSlides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, currentSlides.length]);

  // Shared slide navigation handler
  const handleSlideChange = useCallback((index) => {
    setActiveSlide(index);
  }, []);

  const handleNextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % currentSlides.length);
  }, [currentSlides.length]);

  const handlePrevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + currentSlides.length) % currentSlides.length);
  }, [currentSlides.length]);

  // Shared props object passed down to both view components
  const sharedProps = {
    slides: currentSlides,
    activeSlide,
    onSlideChange: handleSlideChange,
    onNextSlide: handleNextSlide,
    onPrevSlide: handlePrevSlide,
    onShopNow,
    onExplore,
    ...props
  };

  return (
    <div className="relative w-full">
      {/* 1. Dedicated Mobile Screen UI (Matches iPhone 1:1 luxury mockup) */}
      <div className="block md:hidden w-full">
        <HeroMobile {...sharedProps} />
      </div>

      {/* 2. Dedicated Desktop Screen UI (Widescreen luxury presentation) */}
      <div className="hidden md:block w-full">
        <HeroDesktop {...sharedProps} />
      </div>

      {/* 3. Curved Convex Bottom Scoop (Exact same curve as Gifts Page) */}
      <div className="relative z-20 w-full overflow-hidden flex flex-col items-center -mt-6 sm:-mt-10 md:-mt-12 pointer-events-none select-none">
        <div className="w-full h-6 sm:h-10 md:h-12 bg-enva-bg rounded-t-[50%_100%] shadow-[0_-8px_16px_rgba(0,0,0,0.15)]" />
      </div>
    </div>
  );
}

export { HeroMobile, HeroDesktop };
