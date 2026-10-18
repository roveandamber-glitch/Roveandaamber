"use client";
import React, { useState } from 'react';
import { Mail, Check, Sparkles, ArrowRight, Shield } from 'lucide-react';

const NewsletterVIP = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <section className="py-24 px-6 bg-[#18181A] text-white relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B86526]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold tracking-[0.25em] uppercase mb-6">
          <Sparkles size={12} />
          Private Reserve Access
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal leading-tight mb-6">
          Join the ROVE & AMBER Inner Circle
        </h2>

        <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed font-light mb-10">
          Subscribe to receive private reserve announcements, bespoke fragrance blending previews, and <span className="text-[#D4AF37] font-medium">15% off your first flacon</span>.
        </p>

        {isSubmitted ? (
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-[#B86526] text-white mx-auto flex items-center justify-center mb-3">
              <Check size={20} />
            </div>
            <h4 className="text-lg font-serif font-medium mb-1">Welcome to ROVE & AMBER</h4>
            <p className="text-xs text-white/70">
              Your exclusive 15% privilege code <span className="text-[#D4AF37] font-mono font-bold">AMBERVIP15</span> has been sent to your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 px-5 py-2 flex-1">
                <Mail size={16} className="text-white/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your personal email address..."
                  required
                  className="w-full bg-transparent text-sm text-white placeholder-white/50 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-[#D4AF37] hover:bg-[#C49A27] text-black px-8 py-3.5 rounded-full text-xs font-bold tracking-[0.15em] uppercase shadow-lg transition-all flex items-center justify-center gap-2 group flex-shrink-0 cursor-pointer"
              >
                <span>Request Entry</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-center gap-4 text-[11px] text-white/40 uppercase tracking-widest font-light">
          <span className="flex items-center gap-1.5">
            <Shield size={12} />
            Strict Privacy Protected
          </span>
          <span>•</span>
          <span>No Spam, Only Curated Perfumery</span>
          <span>•</span>
          <span>Unsubscribe Anytime</span>
        </div>
      </div>
    </section>
  );
};

export default NewsletterVIP;
