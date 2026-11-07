"use client";
import React from 'react';
import { 
  Tag, 
  Sparkles, 
  Check, 
  Loader2, 
  Wallet, 
  Lock, 
  ArrowRight, 
  Ticket 
} from 'lucide-react';

/**
 * CartOrderSummary
 * Spacious luxury order summary with prominent Coupon and Wallet cards,
 * free of unwanted filler text.
 */
export default function CartOrderSummary({
  totalItemCount,
  subtotal,
  discountAmount,
  appliedCoupon,
  handleRemoveCoupon,
  rewardDiscountAmount,
  rewardPointsUsed,
  handleRemoveRewards,
  rewardLoading,
  finalTotal,
  promoCode,
  setPromoCode,
  promoLoading,
  handleApplyPromo,
  handleToggleRewards,
  availableRewardPoints,
  rewardRate,
  handleStartCheckout,
  availableCoupons = [],
  onOpenCouponsModal
}) {
  return (
    <div className="bg-[#FAF8F5] p-3.5 sm:p-6 flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        {/* Order Summary Header */}
        <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-3">
          <h3 className="text-base sm:text-lg font-serif font-bold text-black tracking-tight m-0">
            Order Summary
          </h3>
          <span className="text-xs font-semibold text-[#8C6D1F] bg-[#FAF3E0] px-2.5 py-0.5 rounded-full border border-[#E8DEC8]">
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Subtotals & Line Items */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="font-sans font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {discountAmount > 0 && appliedCoupon && (
            <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-1.5 min-w-0">
                <Tag size={12} className="text-emerald-700 shrink-0" />
                <span className="font-bold uppercase tracking-wider text-xs truncate">
                  {appliedCoupon.code} {appliedCoupon.discountType === 'percentage' ? `(${appliedCoupon.discountValue}% OFF)` : `(₹${appliedCoupon.discountValue} OFF)`}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-sans font-bold text-emerald-700">-₹{discountAmount.toLocaleString('en-IN')}</span>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-stone-400 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer"
                  title="Remove coupon"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {rewardDiscountAmount > 0 && (
            <div className="flex justify-between items-center text-[#8C6D1F] bg-gradient-to-r from-[#FAF6EC] to-[#F5ECE0] px-3 py-2 rounded-xl border border-[#D4AF37]/50 shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-4 h-4 rounded-full bg-[#B8860B]/15 flex items-center justify-center shrink-0">
                  <Sparkles size={10} className="text-[#B8860B]" />
                </div>
                <span className="font-semibold text-xs text-[#6B5115] tracking-wide truncate">
                  Privilege Points ({rewardPointsUsed.toLocaleString()} pts)
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-sans font-bold text-xs text-[#8C6D1F]">-₹{rewardDiscountAmount.toLocaleString('en-IN')}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRewards();
                  }}
                  disabled={rewardLoading}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-stone-400 hover:text-red-600 text-xs transition-colors cursor-pointer"
                  title="Remove privilege points"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-2.5 border-t border-[#ECE7DE]">
            <span className="text-sm font-semibold text-stone-800">Estimated Total</span>
            <span className="font-sans text-xl sm:text-2xl font-bold text-black tracking-tight">
              ₹{finalTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 1. COUPON SECTION (Enhanced Size & Prominence) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8DFC9] space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-700">
              Promo Code / Voucher
            </span>
            {availableCoupons && availableCoupons.length > 0 && (
              <span className="text-[10px] font-bold text-[#8C6D1F] bg-[#FAF3E0] px-2 py-0.5 rounded-full border border-[#E0D0A5]">
                {availableCoupons.length} Available
              </span>
            )}
          </div>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6ED] border border-[#E8DFC9]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                  <Check size={12} />
                </div>
                <span className="font-mono font-bold text-xs text-[#8C6D1F] uppercase tracking-wider truncate">
                  {appliedCoupon.code} applied
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                disabled={promoLoading}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline px-1.5 py-0.5 cursor-pointer shrink-0"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="ENTER VOUCHER CODE"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={promoLoading}
                className="flex-1 min-w-0 h-10 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm bg-[#FAF8F5] border border-[#E0D8CA] focus:outline-none focus:border-black uppercase text-black placeholder-stone-400 font-mono"
              />
              <button
                type="submit"
                disabled={promoLoading || !promoCode.trim()}
                className="h-10 bg-[#1C1714] hover:bg-black text-[#ECC880] px-3 sm:px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0 shadow-2xs"
              >
                {promoLoading ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
              </button>
            </form>
          )}

          {/* Trigger to Show Available Coupons */}
          {availableCoupons && availableCoupons.length > 0 && (
            <button
              type="button"
              onClick={onOpenCouponsModal}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FAF6EC] hover:bg-[#FAF0D8] border border-[#E0D0A5] text-[#8C6D1F] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Ticket size={14} className="text-[#8C6D1F] group-hover:rotate-12 transition-transform" />
                <span>View Available Coupons</span>
              </div>
              <span className="text-xs font-bold underline flex items-center gap-0.5">
                Apply →
              </span>
            </button>
          )}
        </div>

        {/* 2. PATRON PRIVILEGE WALLET (Enhanced Size & Prominence) */}
        <div
          onClick={handleToggleRewards}
          className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none ${
            rewardPointsUsed > 0
              ? 'bg-gradient-to-r from-[#FAF6EC] via-[#FFFDF9] to-[#F5ECE0] border-[#B8860B] shadow-2xs'
              : 'bg-white hover:bg-[#FAF8F5] border-[#E8DFC9] hover:border-[#B8860B]/60'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors border shadow-2xs ${
                  rewardPointsUsed > 0
                    ? 'bg-gradient-to-br from-[#E5B869] to-[#B8860B] text-white border-[#8C6D1F]'
                    : 'bg-[#FAF3E0] text-[#B8860B] border-[#E0D0A5]'
                }`}
              >
                <Wallet size={18} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight">
                    Patron Wallet
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      rewardPointsUsed > 0
                        ? 'bg-[#B8860B] text-white'
                        : 'bg-[#FAF0D4] text-[#8C6D1F] border border-[#E8DEC8]'
                    }`}
                  >
                    {availableRewardPoints.toLocaleString()} pts
                  </span>
                </div>
                <p className="text-xs text-stone-500 m-0 mt-0.5 font-light leading-snug truncate">
                  {rewardPointsUsed > 0 ? (
                    <span className="text-emerald-800 font-semibold">
                      ✓ {rewardPointsUsed.toLocaleString()} pts applied (-₹{rewardDiscountAmount.toLocaleString('en-IN')})
                    </span>
                  ) : availableRewardPoints > 0 ? (
                    <span>Redeem up to ₹{Math.floor(availableRewardPoints * (rewardRate / 100)).toLocaleString('en-IN')} off</span>
                  ) : (
                    <span>Earn reward points on this order</span>
                  )}
                </p>
              </div>
            </div>

            {/* Toggle Switch - Standard Comfortable Touch Size */}
            <button
              type="button"
              role="switch"
              aria-checked={rewardPointsUsed > 0}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleRewards();
              }}
              disabled={rewardLoading || (availableRewardPoints <= 0 && rewardPointsUsed === 0)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                rewardPointsUsed > 0
                  ? 'bg-[#1C1714] shadow-[0_0_6px_rgba(212,175,55,0.35)]'
                  : 'bg-[#D6CEC2] hover:bg-[#C9BFB0]'
              }`}
              title={rewardPointsUsed > 0 ? 'Click to remove privilege points' : 'Click to apply privilege points'}
            >
              <span
                className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                  rewardPointsUsed > 0
                    ? 'translate-x-5 bg-gradient-to-br from-[#F6D389] to-[#DEB368]'
                    : 'translate-x-0 bg-white'
                }`}
              >
                {rewardLoading && <Loader2 size={10} className="animate-spin text-[#241306]" />}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Action CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleStartCheckout}
          className="w-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-105 active:scale-[0.99] py-3.5 rounded-full font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-950/15 transition-all cursor-pointer group"
        >
          <Lock size={14} strokeWidth={2.2} />
          <span>Proceed to Checkout</span>
          <ArrowRight size={14} strokeWidth={2.2} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
