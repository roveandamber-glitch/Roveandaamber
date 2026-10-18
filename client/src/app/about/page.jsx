"use client";
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { 
  Sparkles, 
  ShieldCheck, 
  Droplets, 
  FlaskConical, 
  ArrowRight, 
  BookOpen, 
  Layers 
} from 'lucide-react';

const AboutPage = () => {
  const leadership = [
    {
      name: "Rahees R.",
      role: "Founder & Creative Nose",
      bio: "Shaping signature olfactory narratives inspired by golden hour desert sands, aged resins, and rare raw extractions.",
      image: "/images/perfumes/perfume_craft.jpg"
    },
    {
      name: "Jean-Marc Laurent",
      role: "Master Perfumer & Maceration Lead",
      bio: "Grasse-trained master nose calibrating slow cold-maceration and high-concentration extrait formulas.",
      image: "/images/perfumes/about_atelier.jpg"
    },
    {
      name: "Farah Al-Mansoor",
      role: "Botanical Sourcing & Heritage Resins",
      bio: "Curates ethically harvested wild Cambodian oud, Kashmiri red saffron, and Isparta Damascena rose absolu.",
      image: "/images/perfumes/amber_oud_perfume.jpg"
    }
  ];

  const milestones = [
    { year: "2021", title: "Olfactory Inception", desc: "Formulated initial artisanal amber oil accords in small glass demijohns." },
    { year: "2023", title: "Cold Maceration Method", desc: "Perfected our signature 180-day maturation process ensuring enduring 14+ hour sillage." },
    { year: "2025", title: "Flacon Architecture", desc: "Designed the circular amber resin R&A emblem and heavy crystalline perfume flacons." },
    { year: "2026", title: "Signature Collection", desc: "Shipping Pan-India with premier creations: Amber Oud, Golden Saffron, and Velvet Musk." }
  ];

  const materials = [
    {
      title: "Aged Golden Amber",
      desc: "Warm fossilized tree resins and botanical benzoin cured for rich balsamic sweetness, deep honey reflections, and radiant comfort.",
      image: "/images/perfumes/amber_oud_perfume.jpg",
      tag: "Signature Resin"
    },
    {
      title: "Royal Wild Oud",
      desc: "Slow-distilled from sustainable aged agarwood, delivering an intoxicating blend of smoky wood, dark leather, and majestic presence.",
      image: "/images/perfumes/oud_royale.jpg",
      tag: "Assam & Cambodia"
    },
    {
      title: "Kashmiri Saffron & Rose",
      desc: "Hand-picked autumn saffron stigmas and Turkish Damascena rose petals providing luminous floral spice and opulent sillage.",
      image: "/images/perfumes/golden_saffron.jpg",
      tag: "Pure Extrait"
    }
  ];

  const journalStories = [
    {
      tag: "The Craft",
      title: "The Art of Slow Maceration: Why 180 Days in Glass Transforms Sillage",
      desc: "How slow-aging fragrance oils in dark glass harmonizes volatile top notes and builds enduring base projection.",
      image: "/images/perfumes/liquid_gold_perfume.jpg",
      readTime: "4 min read"
    },
    {
      tag: "Behind The Notes",
      title: "Our Brand Story: Sunlit Dunes, Liquid Gold, and Signature Amber",
      desc: "Inside our artisanal laboratory as we balance pure saffron threads and Cambodian oud for our flagship release.",
      image: "/images/perfumes/hero_desert_fragrance.jpg",
      readTime: "5 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9F6F0] font-sans text-enva-text pt-24 sm:pt-28 flex flex-col justify-between">
      <Navbar />

      <main className="w-full flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 mb-3 bg-white/80 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/50 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#B86526] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#3B1D11]">
              The ROVE & AMBER Heritage
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-black font-normal max-w-3xl mx-auto leading-tight mb-6">
            Fine Fragrance & Artisanal Perfumery.
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed font-light mb-10">
            Founded on the belief that scent is the most intimate form of memory, ROVE & AMBER crafts signature Eau de Parfum sculpted from precious aged amber, royal wild oud, and noble botanicals.
          </p>

          {/* Hero Banner Image */}
          <div className="relative rounded-3xl overflow-hidden aspect-[16/8] sm:aspect-[21/9] bg-[#EFE8DC] border border-[#E8E2D6] shadow-md">
            <img 
              src="/images/perfumes/hero_desert_fragrance.jpg" 
              alt="ROVE & AMBER Atelier" 
              className="w-full h-full object-cover object-center"
              onError={(e) => { e.target.src = '/images/perfumes/liquid_gold_perfume.jpg'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 text-left text-white">
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] block font-bold mb-1">Our Brand Story</span>
              <h3 className="text-xl sm:text-3xl font-serif">Where Desert Gold Meets Pure Essentials</h3>
            </div>
          </div>
        </section>

        {/* Philosophy & Pillars */}
        <section className="bg-white py-16 sm:py-24 border-y border-[#E8E2D6]">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B86526] block">
                  Olfactory Philosophy
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif text-black leading-tight">
                  Crafting Signature Eau de Parfum to Leave an Impression.
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light pt-2">
                  Every ROVE & AMBER creation undergoes months of patient maceration in glass vessels. We reject synthetic mass fragrances in favour of deep, multidimensional accords that bloom uniquely on your skin.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6]">
                  <Droplets size={20} className="text-[#B86526] mb-3" />
                  <h4 className="text-sm font-serif font-bold text-black mb-1.5">High Concentration</h4>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    Formulated between 20% to 26% pure fragrance oils for remarkable projection, longevity, and sillage.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6]">
                  <FlaskConical size={20} className="text-[#B86526] mb-3" />
                  <h4 className="text-sm font-serif font-bold text-black mb-1.5">Artisanal Maceration</h4>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    Extended resting periods allow complex wood, floral, and amber notes to bond seamlessly before hand-bottling.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6]">
                  <ShieldCheck size={20} className="text-[#B86526] mb-3" />
                  <h4 className="text-sm font-serif font-bold text-black mb-1.5">Ethical Extractions</h4>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    Sustainably harvested agarwood, organic botanicals, and cruelty-free ambergris accords.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6]">
                  <Sparkles size={20} className="text-[#B86526] mb-3" />
                  <h4 className="text-sm font-serif font-bold text-black mb-1.5">Limited Batches</h4>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">
                    Numbered flacons released in curated editions to preserve the rarity and integrity of every blend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Raw Ingredients & Olfactory Science */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B86526] block mb-2">
              Noble Ingredients
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif text-black">Artisanal Raw Materials</h2>
            <p className="text-xs text-gray-500 max-w-lg mx-auto mt-2 font-light">
              We source precious resins, rare woods, and delicate petals directly from heritage distillers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {materials.map((mat, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-[#E8E2D6] shadow-2xs group">
                <div className="relative aspect-[4/3] bg-[#EFE8DC] overflow-hidden">
                  <img 
                    src={mat.image} 
                    alt={mat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.target.src = '/images/perfumes/amber_oud_perfume.jpg'; }}
                  />
                  <div className="absolute top-3 left-3 bg-[#3B1D11]/90 backdrop-blur-md text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
                    {mat.tag}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-black mb-2">{mat.title}</h4>
                  <p className="text-xs text-gray-600 font-light leading-relaxed">{mat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Milestone Timeline */}
        <section className="bg-white py-16 sm:py-24 border-y border-[#E8E2D6]">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
            <div className="text-center mb-12">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B86526] block mb-2">
                Our Journey
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif text-black">The Art of Perfumery</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {milestones.map((m, idx) => (
                <div key={idx} className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8E2D6] shadow-2xs">
                  <span className="font-mono text-xl font-bold text-[#B86526] block mb-2">{m.year}</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">{m.title}</h4>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The ROVE & AMBER Journal Section */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3 border-b border-[#E8E2D6] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B86526] block mb-1">
                Olfactory Journal
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif text-black">The ROVE & AMBER Journal</h2>
            </div>
            <Link 
              href="/shop" 
              className="text-xs font-bold uppercase tracking-wider text-black hover:text-[#B86526] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All Fragrances</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {journalStories.map((story, idx) => (
              <div 
                key={idx} 
                className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-[#1A1A1A] group border border-[#E8E2D6] shadow-sm cursor-pointer"
              >
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.target.src = '/images/perfumes/amber_oud_perfume.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[#D4AF37]">
                      {story.tag}
                    </span>
                    <span className="text-[10px] text-gray-300 font-light">• {story.readTime}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif leading-snug">{story.title}</h3>
                  <p className="text-xs text-gray-300 font-light line-clamp-2">{story.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Creative Noses & Artisans */}
        <section className="bg-white py-16 sm:py-24 border-t border-[#E8E2D6]">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
            <div className="text-center mb-12">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B86526] block mb-2">
                The Artisans
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif text-black">Meet Our Perfumers</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {leadership.map((member, idx) => (
                <div key={idx} className="bg-[#FAF8F5] rounded-3xl overflow-hidden border border-[#E8E2D6] group">
                  <div className="aspect-[3/4] bg-[#EFE8DC] overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = '/images/perfumes/about_atelier.jpg'; }}
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h4 className="text-base font-serif font-bold text-black mb-1">{member.name}</h4>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#B86526] block mb-2.5">
                      {member.role}
                    </span>
                    <p className="text-xs text-gray-600 font-light leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 sm:py-20 text-center max-w-4xl mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-serif text-black mb-4">Discover Your Signature Scent</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Hand-crafted Eau de Parfum flacons and discovery sets shipping Pan-India.
          </p>
          <Link href="/shop">
            <button className="bg-[#1A1A1A] hover:bg-[#3B1D11] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer inline-flex items-center gap-2">
              <span>Shop Fragrances</span>
              <ArrowRight size={14} />
            </button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
