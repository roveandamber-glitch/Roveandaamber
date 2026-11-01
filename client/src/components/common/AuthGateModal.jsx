"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal } from 'antd';
import { Lock, ArrowRight, ShieldCheck, User, Sparkles } from 'lucide-react';

export default function AuthGateModal({
  open,
  onClose,
  redirectPath = '/checkout',
  title = 'Sign In to Complete Checkout',
  subtitle = 'Atelier Customer Privilege',
  description = 'To guarantee verified dispatch notifications, insured white-glove courier tracking, and order history, please sign in or register your customer profile.',
  confirmText = 'Sign In to Proceed',
  cancelText = 'Continue Reviewing Bag',
  onCancelAction = null
}) {
  const router = useRouter();

  const handleClose = () => {
    if (onCancelAction) {
      onCancelAction();
    } else if (onClose) {
      onClose();
    }
  };

  const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={460}
      className="font-sans luxury-auth-modal"
      maskClosable={false}
      destroyOnClose
    >
      <div className="p-5 sm:p-7 text-center relative overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-gradient-to-b from-amber-100/70 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Brand Luxury Icon */}
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1C120C] to-black border border-[#D4AF37]/40 text-[#ECC880] flex items-center justify-center mx-auto mb-4 shadow-md">
          <Lock size={26} strokeWidth={2.2} className="text-[#DEB368]" />
        </div>

        {/* Title & Narrative */}
        <div className="relative z-10 space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DFC9] text-[10px] font-bold uppercase tracking-[0.22em] text-[#8C6D1F]">
            <Sparkles size={11} className="text-[#B8860B]" />
            <span>{subtitle}</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-[26px] font-normal text-stone-900 tracking-tight leading-tight m-0">
            {title}
          </h3>

          <p className="text-xs text-stone-500 font-light leading-relaxed max-w-[360px] mx-auto pt-1">
            {description}
          </p>
        </div>

        {/* Security Reassurance */}
        <div className="relative z-10 mb-6 py-2 px-3 rounded-xl bg-[#FAF9F7] border border-[#ECE7DE] flex items-center justify-center gap-2 text-[10px] text-stone-600 font-medium">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>256-Bit Encrypted Secure Patron Portal</span>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 space-y-2.5">
          <Link
            href={loginUrl}
            className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-105 active:scale-[0.99] py-3.5 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg shadow-amber-950/15 transition-all cursor-pointer group"
          >
            <span>{confirmText}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 text-xs text-stone-500 hover:text-black font-medium transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
