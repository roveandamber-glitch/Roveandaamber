"use client";
import React from 'react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { Truck, RotateCcw, Award, AlertCircle, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      subtitle="Atelier standards, domestic shipping policies, 2 ml sample bottle return & refund protocols, and conditions of service for ROVE & AMBER."
      lastUpdated="November 2026"
    >
      {/* Introduction */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <Award size={18} className="text-[#C49A45]" />
          <span>1. Introduction & Acceptance</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          Welcome to ROVE & AMBER. By accessing our platform, commissioning a custom flacon, or completing an order through roveandamber.com or our authorized concierge channels, you agree to comply with and be bound by the following terms, provisions, and operational guidelines.
        </p>
      </section>

      {/* Shipping & Delivery with anchor ID */}
      <section id="shipping-delivery" className="space-y-3 scroll-mt-36 p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
        <h2 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <Truck size={18} className="text-[#C49A45]" />
          <span>2. Shipping & Pan-India Delivery Policy</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          Each ROVE & AMBER perfume is encased in shock-absorbent luxury coffrets and wax-stamped protective sleeves to ensure flawless transit.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-white p-4 rounded-xl border border-[#ECE7DE]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C49A45] block mb-1">Dispatch Timelines</span>
            <p className="text-xs text-[#2D2824]">Orders are hand-inspected and dispatched within <strong>24 to 48 hours</strong> of verification.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#ECE7DE]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C49A45] block mb-1">Transit & Tracking</span>
            <p className="text-xs text-[#2D2824]">Priority domestic delivery takes <strong>2 to 4 business days</strong>. Live tracking links are emailed upon handover.</p>
          </div>
        </div>
      </section>

      {/* Returns & Refunds with anchor ID - Updated with 2ml Sample Rule */}
      <section id="returns-policy" className="space-y-4 scroll-mt-36 p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
            <RotateCcw size={18} className="text-[#C49A45]" />
            <span>3. Returns & Refunds Policy</span>
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#120905] text-[#ECC880]">
            2 ml Sample Rule
          </span>
        </div>

        {/* Core Eligibility Rule Callout */}
        <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#E8DFC9] space-y-2">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-[#C49A45] shrink-0 mt-0.5" />
            <div>
              <strong className="text-xs sm:text-sm text-[#1A1A1A] block">
                Mandatory Return & Refund Condition: 2 ml Companion Sample Bottle
              </strong>
              <p className="text-xs text-[#5C5248] leading-relaxed mt-1">
                Customers are eligible for a return and refund <strong>only if they purchase the perfume along with its companion 2 ml sample bottle</strong>. Customers who purchase a perfume without the 2 ml sample are strictly <strong>not eligible for a return or refund</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          <p>
            Due to the hygienic nature and proprietary maceration standards of haute perfumery, once a full-size flacon&apos;s cellophane or tamper-evident seal has been broken, it cannot be returned or resold. Our 2 ml sample policy allows you to experience the scent risk-free:
          </p>

          <ul className="space-y-2 pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#C49A45] shrink-0 mt-1" />
              <span>
                <strong>How the 2 ml Sample Protocol Works:</strong> When purchased with a 2 ml sample bottle, test the fragrance using only the 2 ml sample vial first. Keep the full-size perfume flacon unopened and factory-sealed in its original presentation coffret.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#C49A45] shrink-0 mt-1" />
              <span>
                <strong>7-Day Return Window:</strong> If the scent does not suit you after testing the 2 ml sample, you may submit a return request within <strong>7 days of delivery</strong> for a 100% refund of the full-size flacon, provided the main bottle remains untampered and sealed.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-[#B86526] shrink-0 mt-1" />
              <span>
                <strong>Purchases Without the 2 ml Sample:</strong> Perfumes purchased without the 2 ml sample bottle are considered final, bespoke sales and are <strong>strictly non-returnable and non-refundable</strong> under any circumstances.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#C49A45] shrink-0 mt-1" />
              <span>
                <strong>Damaged or Defective Flacons:</strong> In the rare event of transit damage or atomizer malfunction, notify our concierge within <strong>48 hours</strong> of delivery with photographic evidence for an immediate complimentary replacement, regardless of sample options.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-[#C49A45] shrink-0 mt-1" />
              <span>
                <strong>Refund Processing:</strong> Approved refunds for verified returns are remitted back to the original payment source within <strong>5–7 business days</strong> following atelier inspection.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Product Authenticity & Artisanal Variance */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <Sparkles size={18} className="text-[#C49A45]" />
          <span>4. Artisanal Formulations & Sillage</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          Our perfumes feature high concentrations of raw, unadulterated botanicals, wild agarwoods, and aged resin extracts. Subtle batch nuances in color or maturation depth are intrinsic hallmarks of natural haute perfumery.
        </p>
      </section>

      {/* Intellectual Property */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <AlertCircle size={18} className="text-[#C49A45]" />
          <span>5. Intellectual Property & Trademarks</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          The ROVE & AMBER crest, typography, flacon designs, brand imagery, and proprietary compounding formulations remain the exclusive intellectual property of ROVE & AMBER Fine Fragrance Atelier.
        </p>
      </section>
    </LegalPageLayout>
  );
}
