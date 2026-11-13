"use client";
import React from 'react';
import { Modal } from 'antd';
import { Tag, Check, Sparkles, X, Lock } from 'lucide-react';

/**
 * AvailableCouponsModal
 * Luxury boutique modal showing active promotional coupons with 1-click apply,
 * and previously redeemed coupons disabled at the bottom.
 */
export default function AvailableCouponsModal({
  open,
  onClose,
  coupons = [],
  subtotal = 0,
  appliedCoupon = null,
  onApplyCoupon,
  loading = false
}) {
  const activeCoupons = (coupons || []).filter(c => !c.isAlreadyUsed);
  const usedCoupons = (coupons || []).filter(c => Boolean(c.isAlreadyUsed));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      closeIcon={null}
      className="luxury-coupons-modal"
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

        {/* Modal Header */}
        <div className="text-center mb-5 pr-6 pl-6">
          <div className="w-11 h-11 rounded-full bg-[#FAF3E0] text-[#B8860B] border border-[#E0D0A5] flex items-center justify-center mx-auto mb-2 shadow-2xs">
            <Tag size={20} />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.22em] text-[#B8860B] block mb-0.5">
            ROVE & AMBER • Privilege Vouchers
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-normal text-black m-0">
            Available Atelier Coupons
          </h3>
          <p className="text-xs text-stone-500 font-light mt-1">
            Select a promotional privilege code to apply directly to your order
          </p>
        </div>

        {/* Coupons Scroll Area */}
        <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
          
          {/* 1. Active / Available Coupons */}
          {activeCoupons.length > 0 ? (
            <div className="space-y-3">
              {activeCoupons.map((coupon) => {
                const isApplied = appliedCoupon && appliedCoupon.code?.toUpperCase() === coupon.code?.toUpperCase();
                const minSpend = Number(coupon.minOrderAmount) || 0;
                const isEligible = subtotal >= minSpend;
                const deficit = minSpend - subtotal;

                // Calculate expected discount for display
                let estimatedSavings = 0;
                if (coupon.discountType === 'percentage') {
                  estimatedSavings = Math.round((subtotal * coupon.discountValue) / 100);
                  if (coupon.maxDiscountAmount && estimatedSavings > coupon.maxDiscountAmount) {
                    estimatedSavings = coupon.maxDiscountAmount;
                  }
                } else {
                  estimatedSavings = coupon.discountValue;
                }

                return (
                  <div
                    key={coupon.code}
                    className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between gap-2.5 ${
                      isApplied
                        ? 'bg-[#FAF6EC] border-[#B8860B] shadow-2xs'
                        : isEligible
                        ? 'bg-white border-[#E8DFC9] hover:border-[#B8860B]/70'
                        : 'bg-stone-50/70 border-stone-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs uppercase tracking-wider bg-[#1C1714] text-[#ECC880] px-2 py-0.5 rounded-md">
                            {coupon.code}
                          </span>
                          <span className="text-[10px] font-bold text-[#8C6D1F] bg-[#FAF3E0] border border-[#E0D0A5] px-2 py-0.5 rounded-full">
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`}
                          </span>
                          {isApplied && (
                            <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={10} className="stroke-[3]" /> Applied
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-800 font-medium mt-1.5 leading-snug">
                          {coupon.description || `${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : ' INR'} promotional privilege`}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                          {minSpend > 0 ? (
                            <span>Min. spend: ₹{minSpend.toLocaleString('en-IN')}</span>
                          ) : (
                            <span>No minimum spend</span>
                          )}
                          {coupon.maxDiscountAmount && (
                            <span>• Max discount: ₹{coupon.maxDiscountAmount.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>

                      {/* Apply Button */}
                      <div className="shrink-0 text-right">
                        {isApplied ? (
                          <span className="inline-block px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
                            Active
                          </span>
                        ) : isEligible ? (
                          <button
                            type="button"
                            onClick={() => {
                              onApplyCoupon(coupon.code);
                              onClose();
                            }}
                            disabled={loading}
                            className="px-3.5 py-1.5 rounded-lg bg-[#1C1714] hover:bg-black text-[#ECC880] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 disabled:opacity-50"
                          >
                            Apply
                          </button>
                        ) : (
                          <span className="text-[10.5px] text-stone-400 font-medium block">
                            Add ₹{deficit.toLocaleString('en-IN')} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Savings Reassurance for Eligible Coupons */}
                    {isEligible && !isApplied && estimatedSavings > 0 && (
                      <div className="text-[11px] text-emerald-800 font-medium pt-1.5 border-t border-stone-100 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Sparkles size={11} className="text-[#B8860B]" />
                          <span>Saves approximately ₹{estimatedSavings.toLocaleString('en-IN')} on this order</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-stone-500 text-xs font-light">
              No unused promotional coupons currently available.
            </div>
          )}

          {/* 2. Used Coupons Section (Disabled at the Bottom) */}
          {usedCoupons.length > 0 && (
            <div className="pt-3.5 mt-2 border-t border-[#ECE7DE]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                    Used Coupons
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200/80 text-stone-600 font-semibold">
                    {usedCoupons.length}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-light">
                  1-time redemption per customer
                </span>
              </div>

              <div className="space-y-2.5">
                {usedCoupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="p-3 sm:p-3.5 rounded-xl border border-dashed border-stone-300 bg-stone-100/60 text-stone-400 opacity-60 flex flex-col justify-between gap-2 select-none cursor-not-allowed"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs uppercase tracking-wider bg-stone-300/80 text-stone-600 px-2 py-0.5 rounded-md line-through decoration-stone-500">
                            {coupon.code}
                          </span>
                          <span className="text-[10px] font-bold text-stone-500 bg-stone-200/60 border border-stone-300 px-2 py-0.5 rounded-full">
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}% OFF`
                              : `₹${coupon.discountValue} OFF`}
                          </span>
                          <span className="text-[9.5px] font-bold text-stone-500 bg-stone-200 border border-stone-300/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock size={10} /> Already Used
                          </span>
                        </div>

                        <p className="text-xs text-stone-600 font-normal mt-1.5 leading-snug">
                          {coupon.description || 'Promotional privilege voucher'}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                          <span>Min. spend: ₹{(coupon.minOrderAmount || 0).toLocaleString('en-IN')}</span>
                          {coupon.maxDiscountAmount && (
                            <span>• Max discount: ₹{coupon.maxDiscountAmount.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>

                      {/* Disabled Button */}
                      <div className="shrink-0 text-right">
                        <button
                          type="button"
                          disabled
                          className="px-3.5 py-1.5 rounded-lg bg-stone-200 text-stone-400 text-xs font-bold uppercase tracking-wider cursor-not-allowed border border-stone-300/60"
                        >
                          Disabled
                        </button>
                      </div>
                    </div>

                    <div className="text-[10.5px] text-stone-400 pt-1.5 border-t border-stone-200/80 flex items-center gap-1">
                      <span>✕</span>
                      <span>{coupon.usedReason || 'You have already redeemed this promotional code on a previous order.'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-[#ECE7DE] text-center text-[10px] text-stone-400 whitespace-nowrap">
          Note: Only one discount (Coupon or Wallet) can be applied per order.
        </div>
      </div>
    </Modal>
  );
}
