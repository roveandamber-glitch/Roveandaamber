"use client";
import React from 'react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Package, 
  CreditCard,
  Droplets
} from 'lucide-react';
import Link from 'next/link';

export default function ReturnPolicyPage() {
  return (
    <LegalPageLayout
      title="Return & Refund Policy"
      subtitle="Experience haute perfumery risk-free with the ROVE & AMBER signature 2 ml Sample Bottle Guarantee."
      lastUpdated="November 2026"
    >
      {/* Policy Golden Rule Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border-2 border-[#ECC880]/60 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C49A45] animate-pulse" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#C49A45]">
            Maison Return & Refund Rule
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-serif text-[#120905] font-semibold leading-snug">
          The 2 ml Companion Sample Bottle Requirement
        </h2>
        <p className="text-xs sm:text-sm text-[#4A4036] leading-relaxed">
          Customers are eligible for a return and refund <strong>only if they purchase the perfume along with its companion 2 ml sample bottle</strong>. Customers who purchase a perfume without the 2 ml sample bottle are <strong>not eligible for a return or refund</strong>.
        </p>
      </div>

      {/* Section 1: Philosophy behind the rule */}
      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <Droplets size={18} className="text-[#C49A45]" />
          <span>1. The &quot;Try Before You Unseal&quot; Protocol</span>
        </h3>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          Fine fragrance compounding is an intimate art. Once a handcrafted flacon&apos;s wax seal or protective cellophane wrap has been opened, the delicate natural oils cannot be hygienically repackaged or resold.
        </p>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          To provide complete peace of mind, ROVE & AMBER pairs each creation with an optional companion <strong>2 ml sample bottle</strong>. This allows you to experience the top, heart, and base notes on your skin for several days before deciding whether to unseal your master presentation flacon.
        </p>
      </section>

      {/* Section 2: Step-by-Step Return Process */}
      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <Package size={18} className="text-[#C49A45]" />
          <span>2. How the 4-Step Sample Experience Works</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C49A45]">
              <span className="w-5 h-5 rounded-full bg-[#120905] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Purchase With 2 ml Sample</span>
            </div>
            <p className="text-xs text-[#5C5248] leading-relaxed">
              Ensure you select the 2 ml companion sample bottle when purchasing your perfume to unlock full return and refund eligibility.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C49A45]">
              <span className="w-5 h-5 rounded-full bg-[#120905] text-white flex items-center justify-center text-[10px]">2</span>
              <span>Test the 2 ml Vial First</span>
            </div>
            <p className="text-xs text-[#5C5248] leading-relaxed">
              Upon parcel arrival, open and spray exclusively from the 2 ml discovery sample. Leave the main full-size perfume flacon sealed in its box.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C49A45]">
              <span className="w-5 h-5 rounded-full bg-[#120905] text-white flex items-center justify-center text-[10px]">3</span>
              <span>Decide Within 7 Days</span>
            </div>
            <p className="text-xs text-[#5C5248] leading-relaxed">
              If the formulation delights you, unseal your master bottle. If not, initiate a return within 7 days of package delivery.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C49A45]">
              <span className="w-5 h-5 rounded-full bg-[#120905] text-white flex items-center justify-center text-[10px]">4</span>
              <span>Receive 100% Refund</span>
            </div>
            <p className="text-xs text-[#5C5248] leading-relaxed">
              Once the sealed master flacon is safely returned to our atelier, a 100% refund of the full bottle purchase price is processed.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Eligibility vs Non-Eligibility Comparison */}
      <section className="space-y-4">
        <h3 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#C49A45]" />
          <span>3. Eligibility Breakdown</span>
        </h3>

        <div className="overflow-hidden rounded-xl border border-[#ECE7DE]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#120905] text-[#ECC880] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 sm:p-4">Purchase Condition</th>
                <th className="p-3 sm:p-4">Return / Refund Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DE] text-[#3D352E]">
              <tr className="bg-[#FAFDF9]">
                <td className="p-3 sm:p-4 font-medium flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                  <span>Purchased with 2 ml companion sample + Main flacon sealed</span>
                </td>
                <td className="p-3 sm:p-4 font-bold text-emerald-800">
                  Eligible (100% Refund within 7 days)
                </td>
              </tr>
              <tr className="bg-[#FFFDFB]">
                <td className="p-3 sm:p-4 font-medium flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-700 shrink-0" />
                  <span>Purchased WITHOUT 2 ml sample bottle</span>
                </td>
                <td className="p-3 sm:p-4 font-bold text-red-700">
                  Not Eligible (Final Sale)
                </td>
              </tr>
              <tr className="bg-[#FFFDFB]">
                <td className="p-3 sm:p-4 font-medium flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-700 shrink-0" />
                  <span>Full-size flacon opened, unsealed, or sprayed</span>
                </td>
                <td className="p-3 sm:p-4 font-bold text-red-700">
                  Not Eligible (Hygiene & Batch Integrity)
                </td>
              </tr>
              <tr className="bg-[#FFFDFB]">
                <td className="p-3 sm:p-4 font-medium flex items-center gap-2">
                  <AlertTriangle size={15} className="text-amber-700 shrink-0" />
                  <span>Return request initiated past 7 days of delivery</span>
                </td>
                <td className="p-3 sm:p-4 font-bold text-red-700">
                  Not Eligible (Window Expired)
                </td>
              </tr>
              <tr className="bg-[#FAFDF9]">
                <td className="p-3 sm:p-4 font-medium flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                  <span>Transit damage or defective atomizer (reported within 48h)</span>
                </td>
                <td className="p-3 sm:p-4 font-bold text-emerald-800">
                  Eligible for Immediate Complimentary Replacement
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Refund Processing */}
      <section className="space-y-3">
        <h3 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <CreditCard size={18} className="text-[#C49A45]" />
          <span>4. Refund Timelines & Reversal</span>
        </h3>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          Upon receiving the returned parcel at our atelier, our perfumers verify that the full-size flacon remains untampered and sealed. 
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#4D453E] pl-2">
          <li><strong>Prepaid Orders (UPI, Cards, Netbanking):</strong> Refund is credited directly to your original payment method via Razorpay within <strong>5–7 business days</strong>.</li>
          <li><strong>Cash on Delivery (COD) Orders:</strong> Our concierge will contact you to remit your verified refund directly to your designated bank account or UPI ID.</li>
        </ul>
      </section>

      {/* Section 5: How to Initiate a Return */}
      <section className="space-y-3 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5]">
        <h3 className="text-base sm:text-lg font-serif text-[#120905] font-semibold flex items-center gap-2">
          <RotateCcw size={16} className="text-[#C49A45]" />
          <span>5. Initiating an Eligible Return</span>
        </h3>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          If your order qualifies with the companion 2 ml sample bottle, you can request a return directly through:
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <Link
            href="/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#120905] text-[#ECC880] text-xs font-semibold uppercase tracking-wider hover:brightness-125 transition-all"
          >
            <span>Go to My Orders</span>
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#D5CDBD] text-[#1A1A1A] text-xs font-medium uppercase tracking-wider hover:border-black transition-all"
          >
            <span>Contact Concierge Desk</span>
          </Link>
        </div>
      </section>
    </LegalPageLayout>
  );
}

