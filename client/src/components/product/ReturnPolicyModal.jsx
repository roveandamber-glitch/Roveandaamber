"use client";
import React from 'react';
import { Modal } from 'antd';
import { 
  ShieldCheck, 
  PackageCheck, 
  X, 
  Sparkles, 
  RotateCcw, 
  FlaskConical, 
  CheckCircle2, 
  Lock,
  Truck
} from 'lucide-react';

export default function ReturnPolicyModal({ open, onClose, flaconSize = 'Flacon' }) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={620}
      closeIcon={null}
      className="luxury-return-policy-modal"
    >
      <div className="bg-[#FAF9F7] -m-6 p-6 sm:p-8 rounded-2xl border border-[#ECE7DE] relative font-sans text-stone-900 shadow-xl overflow-hidden">
        
        {/* Subtle Top Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B8860B] to-transparent opacity-60" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-black hover:text-white border border-stone-200 flex items-center justify-center text-stone-500 transition-all cursor-pointer shadow-2xs z-10"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3E0] border border-[#E0D0A5] text-[#8C6D1F] text-[10.5px] font-bold uppercase tracking-widest mb-3">
            <Sparkles size={12} className="text-[#8C6D1F]" />
            <span>Atelier Guarantee</span>
          </div>
          <h3 className="text-2xl sm:text-[26px] font-serif font-bold text-[#140D07] m-0 tracking-tight leading-tight">
            7-Day Home Trial Policy
          </h3>
          <p className="text-xs sm:text-[13px] text-stone-600 font-light mt-1.5 max-w-md mx-auto leading-relaxed">
            Experience our artisanal formulations at home with complete confidence and zero risk.
          </p>
        </div>

        {/* 3-Step Simple Visual Guide */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DFC9] shadow-2xs mb-5">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C6D1F] mb-3 text-center sm:text-left">
            How The Risk-Free Trial Works
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/60 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#8C6D1F] flex items-center justify-center shrink-0 font-bold text-xs font-mono">
                01
              </div>
              <div>
                <span className="text-xs font-bold text-[#140D07] block leading-tight">
                  Spritz 2ml Vial
                </span>
                <span className="text-[11px] text-stone-500 font-light leading-snug block mt-0.5">
                  Test the scent on skin while leaving the full flacon sealed.
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/60 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#8C6D1F] flex items-center justify-center shrink-0 font-bold text-xs font-mono">
                02
              </div>
              <div>
                <span className="text-xs font-bold text-[#140D07] block leading-tight">
                  Wear for 7 Days
                </span>
                <span className="text-[11px] text-stone-500 font-light leading-snug block mt-0.5">
                  Evaluate sillage, longevity, and skin chemistry across a week.
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/60 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs font-mono">
                03
              </div>
              <div>
                <span className="text-xs font-bold text-[#140D07] block leading-tight">
                  Keep or Return
                </span>
                <span className="text-[11px] text-stone-500 font-light leading-snug block mt-0.5">
                  Love it? Open flacon. Not your match? Return for a 100% refund.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Policy Breakdown Cards */}
        <div className="space-y-2.5 mb-5 text-xs">
          
          {/* 1. Combo Order Return Guarantee */}
          <div className="p-3.5 rounded-xl bg-white border border-[#C6A15B]/50 ring-1 ring-[#C6A15B]/20 flex items-start gap-3 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                <span className="font-bold text-xs text-[#140D07]">
                  Trial Combo (Flacon + 2ml Sample)
                </span>
                <span className="text-[9.5px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  100% Refund Guarantee
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-light m-0 leading-relaxed">
                Eligible for a full refund within <strong>7 days of delivery</strong> as long as the main flacon box remains unopened with its original atelier security seal intact. The 2ml trial vial is yours to keep.
              </p>
            </div>
          </div>

          {/* 2. Standalone & Sample Hygiene Standard */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E8DFC9] flex items-start gap-3 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 border border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
              <Lock size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                <span className="font-bold text-xs text-[#140D07]">
                  Standalone Flacon & Individual Samples
                </span>
                <span className="text-[9.5px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  Hygiene Standard • Final Sale
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-light m-0 leading-relaxed">
                Under international fine fragrance hygiene standards, opened bottles cannot be restocked or resold. To test risk-free, always select the <strong>Recommended Trial Combo</strong> format.
              </p>
            </div>
          </div>

          {/* 3. Free Transit Damage Protection */}
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFC9] flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-[#8C6D1F] flex items-center justify-center shrink-0">
              <PackageCheck size={15} />
            </div>
            <p className="text-[11.5px] text-stone-700 m-0 leading-snug">
              <strong>Damaged or Leaking Flacon?</strong> We provide an instant 100% free courier replacement with door-step white-glove pickup.
            </p>
          </div>
        </div>

        {/* Reassurance Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#ECE7DE]">
          <div className="flex items-center gap-2 text-stone-500 text-[11px] font-light">
            <ShieldCheck size={14} className="text-[#8C6D1F]" />
            <span>Zero Restocking Fees • Doorstep Courier Pickup</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#140D07] hover:bg-black text-[#FAF7F2] text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-sm active:scale-98"
          >
            I Understand
          </button>
        </div>
      </div>
    </Modal>
  );
}
