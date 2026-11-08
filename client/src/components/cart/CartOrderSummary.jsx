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
  pointsPerHundred = 10,
  handleStartCheckout,
  availableCoupons = [],
  onOpenCouponsModal
}) {
  const walletBalanceInRupees = Math.floor((availableRewardPoints || 0) * ((rewardRate || 100) / 100));
  const pointsPerRupee = (rewardRate || 100) > 0 ? Math.round(100 / (rewardRate || 100)) : 10;
  const pointsToEarn = Math.floor(((finalTotal || 0) / 100) * (pointsPerHundred || 10));

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
                  Patron Wallet Credit
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

          {/* Privilege Points Earned on this Purchase */}
          {pointsToEarn > 0 && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#FAF6EC] to-[#F5ECE0] border border-[#E8DFC9] flex items-center justify-between gap-2 shadow-2xs mt-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-[#FAF0D4] border border-[#E0D0A5] flex items-center justify-center text-[#B8860B] shrink-0">
                  <Sparkles size={12} />
                </div>
                <span className="text-xs text-[#6B5115] font-medium leading-tight">
                  You will earn <strong className="font-bold text-[#B8860B]">+{pointsToEarn.toLocaleString('en-IN')} pts</strong> on this order
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-[#8C6D1F] border border-[#E8DEC8] shrink-0">
                +{pointsPerHundred} pts / ₹100
              </span>
            </div>
          )}
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

        {/* 2. PATRON PRIVILEGE WALLET (Compact & Clean) */}
        <div
          onClick={handleToggleRewards}
          className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
            rewardPointsUsed > 0
              ? 'bg-gradient-to-r from-[#FAF6EC] to-[#F5ECE0] border-[#D4AF37]/70 shadow-2xs'
              : 'bg-white hover:bg-[#FAF8F5] border-[#E8DFC9] hover:border-[#B8860B]/60'
          }`}
        >
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs transition-colors ${
                  rewardPointsUsed > 0
                    ? 'bg-[#B8860B] text-white border-[#8C6D1F]'
                    : 'bg-[#FAF3E0] text-[#B8860B] border-[#E0D0A5]'
                }`}
              >
                <Wallet size={15} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900 tracking-tight">
                    Patron Wallet
                  </span>
                  <span
                    className={`text-[11px] font-sans font-bold px-2 py-0.5 rounded-full shrink-0 inline-flex items-center gap-1 ${
                      rewardPointsUsed > 0
                        ? 'bg-[#B8860B] text-white'
                        : 'bg-[#FAF0D4] text-[#8C6D1F] border border-[#E8DEC8]'
                    }`}
                  >
                    <span>{Number(availableRewardPoints || 0).toLocaleString('en-IN')} pts</span>
                    <span className="font-normal opacity-85">
                      ({walletBalanceInRupees > 0 ? `₹${walletBalanceInRupees.toLocaleString('en-IN')}` : '₹0'})
                    </span>
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 m-0 mt-0.5 font-light leading-tight truncate">
                  {rewardPointsUsed > 0 ? (
                    <span className="text-emerald-800 font-semibold">
                      ✓ Applied {Number(rewardPointsUsed).toLocaleString('en-IN')} pts (-₹{rewardDiscountAmount.toLocaleString('en-IN')})
                    </span>
                  ) : walletBalanceInRupees > 0 ? (
                    <span>
                      Redeem {Number(availableRewardPoints || 0).toLocaleString('en-IN')} pts for ₹{walletBalanceInRupees.toLocaleString('en-IN')} off
                    </span>
                  ) : (
                    <span>Earn points on every order</span>
                  )}
                </p>
              </div>
            </div>

            {/* Action: Apply / Remove Button */}
            {rewardPointsUsed > 0 ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  ✓ Applied
                </span>
                <button
                  type="button"
                  disabled={rewardLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleRewards();
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline px-1 py-0.5 cursor-pointer disabled:opacity-50"
                >
                  {rewardLoading ? <Loader2 size={11} className="animate-spin inline" /> : 'Remove'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={rewardLoading || (availableRewardPoints <= 0 && rewardPointsUsed === 0)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleRewards();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#1C1714] hover:bg-black text-[#ECC880] text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {rewardLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 size={11} className="animate-spin" />
                    <span>Applying...</span>
                  </span>
                ) : (
                  'Apply'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Action CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleStartCheckout}
          className="w-full min-h-[52px] sm:min-h-[56px] px-6 py-3.5 bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-105 active:scale-[0.99] rounded-2xl font-bold uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md shadow-amber-950/15 transition-all cursor-pointer group"
        >
          <Lock size={14} strokeWidth={2.2} />
          <span>Proceed to Checkout</span>
          <ArrowRight size={14} strokeWidth={2.2} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {pointsToEarn > 0 && (
          <p className="text-[11px] text-center text-[#8C6D1F] font-medium mt-2 flex items-center justify-center gap-1.5 m-0 pt-1">
            <Sparkles size={11} className="text-[#C49A45] shrink-0" />
            <span>Earn <strong>+{pointsToEarn.toLocaleString('en-IN')} pts</strong> upon completing this purchase</span>
          </p>
        )}
      </div>
    </div>
  );
}
