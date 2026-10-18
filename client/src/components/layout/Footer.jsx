"use client";
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#F9F6F0] border-t border-[#E8E2D6]">
      {/* Newsletter Section */}
      <div className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#B86526] mb-3">
            Private Reserve Access
          </p>
          <h2 className="text-3xl md:text-4xl font-serif mb-4 text-[#1A1A1A] font-normal">
            Join the ROVE & AMBER Circle
          </h2>
          <p className="text-gray-600 mb-8 text-xs md:text-sm font-light">
            Subscribe to receive exclusive access to private reserve launches, olfactory notes, and bespoke Eau de Parfum editions.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-3">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-5 py-3.5 border border-[#E0D8C8] rounded-xl focus:outline-none focus:border-black bg-[#EFE8DC]/60 text-xs text-black placeholder-gray-500"
              required
            />
            <button 
              type="submit" 
              className="bg-[#1A1A1A] text-white px-7 py-3.5 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-black transition-colors shadow-sm cursor-pointer"
            >
              Subscribe
            </button>
          </form>
          <p className="text-[10px] text-gray-400 tracking-wider uppercase">
            By subscribing you agree to our privacy policy
          </p>
        </div>
      </div>

      {/* Footer Links Section */}
      <div className="bg-[#F2ECE4] py-14 px-6 border-t border-[#E8E2D6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-[#D4AF37]/60 flex-shrink-0 bg-[#3B1D11]">
                <img 
                  src="/images/perfumes/rove_amber_logo.jpg" 
                  alt="ROVE & AMBER" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-serif tracking-[0.2em] font-bold text-black leading-tight">
                  ROVE & AMBER
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#8C827A] font-medium">
                  Fine Fragrance
                </span>
              </div>
            </Link>
            <p className="text-xs text-gray-600 leading-relaxed font-light mb-3">
              Fine Fragrance & Artisanal Perfumery. Crafting signature Eau de Parfum with precious aged amber, rare oud, and noble botanicals.
            </p>
            <p className="text-[11px] text-[#B86526] font-medium">
              Shipping Pan-India • DM or WhatsApp to Order
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold tracking-widest uppercase mb-4 text-black">Fragrances</h4>
            <ul className="space-y-3 text-xs text-gray-600 font-light">
              <li><Link href="/shop?category=Eau%20de%20Parfum" className="hover:text-black transition-colors">Eau de Parfum</Link></li>
              <li><Link href="/shop?category=Men%27s%20Fragrances" className="hover:text-black transition-colors">Men's Fragrances</Link></li>
              <li><Link href="/shop?category=Women%27s%20Fragrances" className="hover:text-black transition-colors">Women's Fragrances</Link></li>
              <li><Link href="/shop?category=Unisex%20Fragrances" className="hover:text-black transition-colors">Unisex Fragrances</Link></li>
              <li><Link href="/shop?category=Signature%20Scents" className="hover:text-black transition-colors">Signature Scents</Link></li>
              <li><Link href="/shop?category=Fragrance%20Gift%20Sets" className="hover:text-black transition-colors">Fragrance Gift Sets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold tracking-widest uppercase mb-4 text-black">Support</h4>
            <ul className="space-y-3 text-xs text-gray-600 font-light">
              <li><Link href="/contact" className="hover:text-black transition-colors">Contact Concierge</Link></li>
              <li><Link href="/about" className="hover:text-black transition-colors">Fragrance Care & Storage</Link></li>
              <li><Link href="/contact" className="hover:text-black transition-colors">Pan-India Shipping</Link></li>
              <li><Link href="/about" className="hover:text-black transition-colors">Olfactory Notes Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold tracking-widest uppercase mb-4 text-black">Artisanal House</h4>
            <ul className="space-y-3 text-xs text-gray-600 font-light">
              <li><Link href="/about" className="hover:text-black transition-colors">Our Brand Story</Link></li>
              <li><Link href="/about" className="hover:text-black transition-colors">Artisanal Maceration</Link></li>
              <li><Link href="/contact" className="hover:text-black transition-colors">DM or WhatsApp to Order</Link></li>
              <li><a href="https://www.roveandamber.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">www.roveandamber.com</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#E8E2D6] flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest text-gray-400 uppercase gap-2">
          <p>© 2026 ROVE & AMBER. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6">
            <span>NEW DELHI</span>
            <span>DUBAI</span>
            <span>PARIS</span>
            <span>GRASSE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
