"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShieldCheck, FileText, ArrowLeft, Mail, Clock, RotateCcw } from 'lucide-react';

export default function LegalPageLayout({
  title,
  subtitle,
  lastUpdated = "November 2026",
  children
}) {
  const pathname = usePathname();

  const navTabs = [
    { name: 'Privacy Policy', href: '/privacy-policy', icon: ShieldCheck },
    { name: 'Terms & Conditions', href: '/terms-and-conditions', icon: FileText },
    { name: 'Return & Refund Policy', href: '/return-policy', icon: RotateCcw }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-sans text-[#1A1A1A] flex flex-col justify-between selection:bg-[#B8860B] selection:text-white">
      <Navbar />

      <main className="w-full flex-1 pt-28 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C827A] hover:text-[#B8860B] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Boutique</span>
          </Link>
        </div>

        {/* Header Section */}
        <header className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-[1px] bg-[#C49A45]" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-[#C49A45]">
              Legal & Atelier Governance
            </span>
            <span className="w-6 h-[1px] bg-[#C49A45]" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#120905] font-normal tracking-tight mb-4">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xs sm:text-sm text-[#665E55] font-light leading-relaxed mb-4">
              {subtitle}
            </p>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EFEA] border border-[#E5DFD5] text-[11px] text-[#7A7067]">
            <Clock size={12} className="text-[#C49A45]" />
            <span>Effective & Last Updated: {lastUpdated}</span>
          </div>
        </header>

        {/* Navigation Switcher Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-10 border-b border-[#ECE7DE] pb-4">
          {navTabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#120905] text-[#ECC880] shadow-md'
                    : 'bg-white text-[#665E55] hover:text-black border border-[#E5DFD5] hover:border-[#C49A45]/50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#ECC880]' : 'text-[#8C827A]'} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Main Document Body */}
        <article className="bg-white rounded-2xl sm:rounded-3xl border border-[#ECE7DE] shadow-sm p-6 sm:p-10 md:p-12 text-[#2D2824] leading-relaxed space-y-8">
          {children}
        </article>

        {/* Atelier Concierge Help Box */}
        <section className="mt-10 bg-gradient-to-r from-[#170E08] via-[#241710] to-[#170E08] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#ECC880]/30 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="font-serif text-lg text-[#ECC880]">Have Inquiries or Need Guidance?</h3>
            <p className="text-xs text-white/70 max-w-md font-light">
              Our client concierge is devoted to assisting you with order tracking, 2 ml sample protocols, or return authorization requests.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F6D389] via-[#DEB368] to-[#C09048] text-[#241306] text-xs font-semibold tracking-wider hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Mail size={13} />
            <span>Contact Concierge</span>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
