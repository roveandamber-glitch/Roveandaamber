"use client";
import React from 'react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { Shield, Lock, Eye, Database, Bell, CheckCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="At ROVE & AMBER, we hold the sanctity of your personal privacy and client trust in the highest regard."
      lastUpdated="October 2026"
    >
      {/* Overview Highlight Banner */}
      <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] flex items-start gap-3.5">
        <Shield className="text-[#C49A45] shrink-0 mt-0.5" size={20} />
        <div className="text-xs text-[#5C5248] leading-relaxed">
          <strong className="text-[#1A1A1A] block mb-1">Our Privacy Promise</strong>
          We never sell, rent, or trade your personal information. Every flacon ordered and every address provided is processed with strict encryption and handled solely to curate and deliver your artisanal fragrance orders.
        </div>
      </div>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <Eye size={18} className="text-[#C49A45]" />
          <span>1. Information We Collect</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          When you explore our fragrance collections, create an atelier account, or acquire a bespoke flacon, we may collect the following categories of information:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm text-[#4D453E] pl-2">
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-[#C49A45] shrink-0 mt-1" />
            <span><strong>Personal Identifiers:</strong> Name, email address, telephone contact, and delivery/shipping addresses.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-[#C49A45] shrink-0 mt-1" />
            <span><strong>Order & Transaction Records:</strong> Selected fragrance flacons, discovery sets, order timestamps, and invoice references.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-[#C49A45] shrink-0 mt-1" />
            <span><strong>Client Preferences:</strong> Saved wishlist items, scent profile inclinations, and personalized gift card messages.</span>
          </li>
        </ul>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <Lock size={18} className="text-[#C49A45]" />
          <span>2. Payment Security & Payment Gateways</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          All monetary transactions conducted across ROVE & AMBER are facilitated exclusively through RBI-authorized, PCI-DSS Level 1 certified payment partners (including Razorpay and bank UPI networks). 
        </p>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          ROVE & AMBER does not store or process your sensitive credit/debit card numbers, CVVs, or net banking passwords on our local servers. Payment confirmation is authenticated strictly via cryptographic SHA-256 HMAC tokens.
        </p>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <Database size={18} className="text-[#C49A45]" />
          <span>3. Purpose of Data Utilization</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          Your information is utilized solely for lawful commercial and customer-care pursuits, including:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#4D453E] pl-2">
          <li>Seamless fulfillment, dispatch, and Pan-India tracking of your perfume shipments.</li>
          <li>Sending automated dispatch tracking notifications and tax invoice receipts.</li>
          <li>Providing tailored olfactory recommendations and customer concierge assistance.</li>
          <li>Preventing illicit order fraud and safeguarding platform security.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold flex items-center gap-2">
          <Bell size={18} className="text-[#C49A45]" />
          <span>4. Cookies & Atelier Analytics</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          We deploy essential and functional session cookies to sustain your shopping bag items, keep your authentication session active, and preserve your preferred currency view. You may adjust cookie preferences within your browser settings at any time.
        </p>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-serif text-[#120905] font-semibold">
          5. Your Client Rights & Account Control
        </h2>
        <p className="text-xs sm:text-sm text-[#4D453E] leading-relaxed">
          You possess the explicit right to inspect, revise, or request the deletion of your client profile and order metadata. To execute a data disclosure or account deletion request, please reach out to our privacy officer at <a href="mailto:concierge@roveandamber.com" className="text-[#C49A45] underline font-medium">concierge@roveandamber.com</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}

