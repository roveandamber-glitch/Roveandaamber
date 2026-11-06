"use client";
import React from 'react';
import { Modal } from 'antd';
import { ShieldCheck, PackageCheck, X } from 'lucide-react';

export default function ReturnPolicyModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={560}
      closeIcon={null}
      className="luxury-return-policy-modal"
    >
      <div className="bg-[#FAF9F7] -m-6 p-6 sm:p-7 rounded-2xl border border-[#ECE7DE] relative font-sans text-stone-900">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white hover:bg-black hover:text-white border border-stone-200 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div className="text-center mb-6 pr-6 pl-6">
          <div className="w-12 h-12 rounded-full bg-[#FAF3E0] text-[#B8860B] border border-[#E0D0A5] flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
            <ShieldCheck size={24} />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.22em] text-[#B8860B] block mb-0.5">
            ROVE & AMBER • Atelier Guarantees
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-normal text-black m-0">
            Atelier Return & Trial Policy
          </h3>
          <p className="text-xs text-stone-500 font-light mt-1">
            Understanding our hygiene standards and risk-free trial protection
          </p>
        </div>

        {/* Policy Pillars */}
        <div className="space-y-3.5 text-xs">
          
          {/* 1. 50ml + 2ml Combo Guarantee */}
          <div className="p-3.5 rounded-xl bg-white border-2 border-emerald-600/30 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xs">
                ✨
              </span>
              <span className="text-xs font-sans font-semibold uppercase tracking-wider">
                50ml + 2ml Combo • 7-Day Return Guarantee
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed font-light m-0 pl-8">
              Every combo comes with a companion <strong>2ml discovery vial</strong> alongside the boxed 50ml flacon. Test the 2ml sample at home first. If it does not resonate with your chemistry, return the <strong>unopened, sealed 50ml flacon within 7 days</strong> for a 100% full refund. You keep the 2ml sample as our gift!
            </p>
          </div>

          {/* 2. Standalone Flacons (50ml Only) */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D6] shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-stone-800 font-bold">
              <span className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-xs">
                ⚠️
              </span>
              <span className="text-xs font-sans font-semibold uppercase tracking-wider">
                Standalone Flacon (50ml Only) • Non-Returnable
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed font-light m-0 pl-8">
              Under international luxury cosmetic & fine fragrance standards, opened or unsealed bottles cannot be accepted for return or restocked to safeguard hygiene and product purity. Standalone flacons are considered final sale once delivered.
            </p>
          </div>

          {/* 3. Discovery Sample Vials (2ml Only) */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D6] shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-stone-800 font-bold">
              <span className="w-6 h-6 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-xs">
                🧪
              </span>
              <span className="text-xs font-sans font-semibold uppercase tracking-wider">
                Discovery Sample (2ml Only) • Non-Returnable
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed font-light m-0 pl-8">
              Single 2ml sample vials are personal discovery formats created for testing and are strictly non-returnable.
            </p>
          </div>

          {/* 4. Transit Damage Guarantee */}
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFC9] flex items-center gap-3">
            <PackageCheck size={18} className="text-[#B8860B] shrink-0" />
            <p className="text-[11px] text-stone-600 leading-snug font-light m-0">
              <strong>Damaged in Transit?</strong> If your flacon arrives damaged or defective, we provide an immediate 100% free courier replacement.
            </p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-5 mt-4 border-t border-stone-200 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-serif uppercase tracking-widest transition-all cursor-pointer shadow-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </Modal>
  );
}
