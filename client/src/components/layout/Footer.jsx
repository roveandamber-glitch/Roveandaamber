"use client";
import Link from 'next/link';
import React from 'react';
import { Instagram, Facebook, Mail, Compass } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0E0A07] text-white border-t border-white/10 pt-12 pb-24 md:pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-white/10">
          {/* Brand Monogram & Logo Column with Iconic Insignia */}
          <div className="col-span-2 flex flex-col justify-start">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <img 
                src="/images/ra_monogram.png" 
                alt="ROVE & AMBER Emblem" 
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.target.src = '/favicon.png'; }}
              />
              <div className="flex flex-col">
                <span className="font-serif text-sm sm:text-base tracking-[0.22em] text-[#E5B869] uppercase font-medium">
                  ROVE & AMBER
                </span>
                <span className="text-[7.5px] sm:text-[8px] tracking-[0.3em] text-white/60 uppercase font-sans">
                  FINE FRAGRANCE
                </span>
              </div>
            </Link>
            <p className="text-xs text-white/60 font-light leading-relaxed max-w-sm">
              Artisanal perfumery crafted with aged amber, noble Cambodian oud, and rare botanical essences.
            </p>
          </div>

          {/* Shop Column */}
          <div className="col-span-1">
            <h4 className="text-xs font-serif font-medium text-white tracking-wider mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5 text-xs text-white/65 font-light">
              <li>
                <Link href="/shop?category=Perfumes" className="hover:text-[#E5B869] transition-colors">
                  Perfumes
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Oud" className="hover:text-[#E5B869] transition-colors">
                  Oud
                </Link>
              </li>
              <li>
                <Link href="/gifts" className="hover:text-[#E5B869] transition-colors">
                  Gifts
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Bakhoor" className="hover:text-[#E5B869] transition-colors">
                  Bakhoor
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="col-span-1">
            <h4 className="text-xs font-serif font-medium text-white tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs text-white/65 font-light">
              <li>
                <Link href="/orders" className="hover:text-[#E5B869] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/about#shipping" className="hover:text-[#E5B869] transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/about#returns" className="hover:text-[#E5B869] transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E5B869] transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div className="col-span-1">
            <h4 className="text-xs font-serif font-medium text-white tracking-wider mb-4">
              About
            </h4>
            <ul className="space-y-2.5 text-xs text-white/65 font-light">
              <li>
                <Link href="/about" className="hover:text-[#E5B869] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/about#ingredients" className="hover:text-[#E5B869] transition-colors">
                  Ingredients
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#E5B869] transition-colors">
                  Journal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E5B869] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div className="col-span-1">
            <h4 className="text-xs font-serif font-medium text-white tracking-wider mb-4">
              Follow Us:
            </h4>
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/75 hover:text-[#E5B869] hover:bg-white/20 transition-all"
                aria-label="Instagram"
              >
                <Instagram size={14} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/75 hover:text-[#E5B869] hover:bg-white/20 transition-all"
                aria-label="Facebook"
              >
                <Facebook size={14} />
              </a>
              <a
                href="mailto:contact@roveandamber.com"
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/75 hover:text-[#E5B869] hover:bg-white/20 transition-all"
                aria-label="Email"
              >
                <Mail size={14} />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/75 hover:text-[#E5B869] hover:bg-white/20 transition-all"
                aria-label="Pinterest"
              >
                <Compass size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/50 font-light gap-3">
          <p>© 2026 ROVE & AMBER. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/about" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
