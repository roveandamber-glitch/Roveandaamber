"use client";
import React, { useMemo } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

/**
 * FlaconFormatSelector
 * Clean 1-row fragrance format selector with subtle return policy reassurance.
 */
export default function FlaconFormatSelector({
  comboSelection,
  setComboSelection,
  basePrice = 0,
  samplePrice = 199,
  baseBottleSize = '50ML',
  onOpenReturnPolicy,
  isOutOfStock = false,
  isProductOutOfStock = false,
  isComboOutOfStock = false,
  isBottleOutOfStock = false,
  isSampleOutOfStock = false
}) {
  const isAllOutOfStock = Boolean(isProductOutOfStock || isOutOfStock);
  const comboDisabled = Boolean(isAllOutOfStock || isComboOutOfStock);
  const bottleDisabled = Boolean(isAllOutOfStock || isBottleOutOfStock);
  const sampleDisabled = Boolean(isAllOutOfStock || isSampleOutOfStock);

  // Concise short label for size (e.g. "Coffret" for gift sets, "50ml" for flacons)
  const shortBottleSize = useMemo(() => {
    if (!baseBottleSize) return 'Flacon';
    const trimmed = String(baseBottleSize).trim();
    if (/coffret/i.test(trimmed)) return 'Coffret';
    if (/3x30/i.test(trimmed)) return '3×30ml';
    return trimmed;
  }, [baseBottleSize]);

  const comboTotal = basePrice + samplePrice;

  return (
    <div className="space-y-2 pt-0.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#170E08]">
          Select Format & Trial
        </span>
      </div>

      {/* 3 Options in One Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        
        {/* 1. COMBO: Flacon + 2ml Sample (Recommended) */}
        <button
          type="button"
          onClick={() => !comboDisabled && setComboSelection('combo')}
          disabled={comboDisabled}
          aria-disabled={comboDisabled}
          className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between relative select-none ${
            comboDisabled
              ? 'bg-[#F6F3EC]/70 border-stone-200/80 opacity-55 cursor-not-allowed shadow-none'
              : comboSelection === 'combo'
                ? 'bg-[#FCF9F3] border-[#B8860B] ring-1 ring-[#B8860B]/40 shadow-xs cursor-pointer'
                : 'bg-white border-[#ECE7DE] hover:border-stone-400 cursor-pointer'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              {comboDisabled ? (
                <span className="bg-stone-200/90 text-stone-500 text-[7.5px] sm:text-[8px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded truncate">
                  Sold Out
                </span>
              ) : (
                <span className="bg-[#8C6D1F] text-white text-[7.5px] sm:text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded truncate">
                  ★ Recommended
                </span>
              )}
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  comboDisabled
                    ? 'border-stone-300 bg-stone-200/60'
                    : comboSelection === 'combo'
                      ? 'border-[#8C6D1F] bg-[#8C6D1F]'
                      : 'border-stone-300 bg-white'
                }`}
              >
                {!comboDisabled && comboSelection === 'combo' && (
                  <div className="w-1 h-1 rounded-full bg-white" />
                )}
              </div>
            </div>

            <span className={`text-[11px] sm:text-xs font-sans block truncate leading-tight ${
              comboDisabled ? 'font-medium text-stone-400 line-through' : 'font-bold text-[#140D07]'
            }`}>
              {shortBottleSize} + 2ml
            </span>
            <span className="text-[9.5px] sm:text-[10px] text-stone-400 font-light block truncate leading-tight mt-0.5">
              {comboDisabled ? 'Unavailable' : 'With 7-Day Return Trial'}
            </span>
          </div>

          <div className="mt-2 pt-1 border-t border-stone-200/50 flex items-center justify-between">
            <span className={`text-xs sm:text-[13px] font-sans block leading-tight ${
              comboDisabled ? 'text-stone-400 line-through' : 'font-bold text-[#140D07]'
            }`}>
              ₹{comboTotal.toLocaleString('en-IN')}
            </span>
            {comboDisabled && (
              <span className="text-[8.5px] text-stone-400 font-semibold uppercase tracking-wider">Out of Stock</span>
            )}
          </div>
        </button>

        {/* 2. STANDALONE FLACON */}
        <button
          type="button"
          onClick={() => !bottleDisabled && setComboSelection('bottle')}
          disabled={bottleDisabled}
          aria-disabled={bottleDisabled}
          className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between relative select-none ${
            bottleDisabled
              ? 'bg-[#F6F3EC]/70 border-stone-200/80 opacity-55 cursor-not-allowed shadow-none'
              : comboSelection === 'bottle'
                ? 'bg-[#FCF9F3] border-[#1C120C] ring-1 ring-black/20 shadow-xs cursor-pointer'
                : 'bg-white border-[#ECE7DE] hover:border-stone-400 cursor-pointer'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="bg-stone-100 text-stone-500 text-[7.5px] sm:text-[8px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded truncate">
                {bottleDisabled ? 'Sold Out' : 'Standard'}
              </span>
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  bottleDisabled
                    ? 'border-stone-300 bg-stone-200/60'
                    : comboSelection === 'bottle'
                      ? 'border-[#1C120C] bg-[#1C120C]'
                      : 'border-stone-300 bg-white'
                }`}
              >
                {!bottleDisabled && comboSelection === 'bottle' && (
                  <div className="w-1 h-1 rounded-full bg-white" />
                )}
              </div>
            </div>

            <span className={`text-[11px] sm:text-xs font-sans block truncate leading-tight ${
              bottleDisabled ? 'font-normal text-stone-400 line-through' : 'font-semibold text-[#140D07]'
            }`}>
              {shortBottleSize} Only
            </span>
            <span className="text-[9.5px] sm:text-[10px] text-stone-400 font-light block truncate leading-tight mt-0.5">
              {bottleDisabled ? 'Unavailable' : 'Final Sale (No Return)'}
            </span>
          </div>

          <div className="mt-2 pt-1 border-t border-stone-200/50 flex items-center justify-between">
            <span className={`text-xs sm:text-[13px] font-sans block leading-tight ${
              bottleDisabled ? 'text-stone-400 line-through' : 'font-bold text-[#140D07]'
            }`}>
              ₹{basePrice.toLocaleString('en-IN')}
            </span>
            {bottleDisabled && (
              <span className="text-[8.5px] text-stone-400 font-semibold uppercase tracking-wider">Out of Stock</span>
            )}
          </div>
        </button>

        {/* 3. 2ML DISCOVERY SAMPLE */}
        <button
          type="button"
          onClick={() => !sampleDisabled && setComboSelection('sample')}
          disabled={sampleDisabled}
          aria-disabled={sampleDisabled}
          className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between relative select-none ${
            sampleDisabled
              ? 'bg-[#F6F3EC]/70 border-stone-200/80 opacity-55 cursor-not-allowed shadow-none'
              : comboSelection === 'sample'
                ? 'bg-[#FCF9F3] border-[#1C120C] ring-1 ring-black/20 shadow-xs cursor-pointer'
                : 'bg-white border-[#ECE7DE] hover:border-stone-400 cursor-pointer'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="bg-stone-100 text-stone-500 text-[7.5px] sm:text-[8px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded truncate">
                {sampleDisabled ? 'Sold Out' : 'Trial Wear'}
              </span>
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  sampleDisabled
                    ? 'border-stone-300 bg-stone-200/60'
                    : comboSelection === 'sample'
                      ? 'border-[#1C120C] bg-[#1C120C]'
                      : 'border-stone-300 bg-white'
                }`}
              >
                {!sampleDisabled && comboSelection === 'sample' && (
                  <div className="w-1 h-1 rounded-full bg-white" />
                )}
              </div>
            </div>

            <span className={`text-[11px] sm:text-xs font-sans block truncate leading-tight ${
              sampleDisabled ? 'font-normal text-stone-400 line-through' : 'font-semibold text-[#140D07]'
            }`}>
              2ml Sample
            </span>
            <span className="text-[9.5px] sm:text-[10px] text-stone-400 font-light block truncate leading-tight mt-0.5">
              {sampleDisabled ? 'Unavailable' : 'Discovery Vial (No Return)'}
            </span>
          </div>

          <div className="mt-2 pt-1 border-t border-stone-200/50 flex items-center justify-between">
            <span className={`text-xs sm:text-[13px] font-sans block leading-tight ${
              sampleDisabled ? 'text-stone-400 line-through' : 'font-bold text-[#140D07]'
            }`}>
              ₹{samplePrice.toLocaleString('en-IN')}
            </span>
            {sampleDisabled && (
              <span className="text-[8.5px] text-stone-400 font-semibold uppercase tracking-wider">Out of Stock</span>
            )}
          </div>
        </button>

      </div>

      {/* Subtle Return Policy / Availability Reassurance Bar */}
      <div className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-stone-600 transition-colors ${
        isAllOutOfStock
          ? 'bg-[#F8F6F2] border-stone-200 text-stone-500'
          : 'bg-[#FAF8F4] border-[#E8DFC9]'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {isAllOutOfStock ? (
            <ShieldAlert size={13} className="text-stone-400 shrink-0" />
          ) : comboSelection === 'combo' ? (
            <ShieldCheck size={13} className="text-[#8C6D1F] shrink-0" />
          ) : (
            <ShieldAlert size={13} className="text-[#A67C38] shrink-0" />
          )}
          <span className="truncate text-[10.5px] sm:text-[11px] text-stone-700">
            {isAllOutOfStock ? (
              <>
                <strong className="text-stone-800 font-semibold">Currently Unavailable:</strong> All flacon formats are out of stock. Restock in progress.
              </>
            ) : comboSelection === 'combo' ? (
              <>
                <strong className="text-stone-900 font-semibold">7-Day Home Trial:</strong> Test 2ml vial first. Full refund on unopened flacon.
              </>
            ) : comboSelection === 'bottle' ? (
              <>
                <strong className="text-stone-900 font-semibold">Final Sale:</strong> Standalone flacon has no return. Only combo edition includes 7-day home trial.
              </>
            ) : (
              <>
                <strong className="text-stone-900 font-semibold">Final Sale:</strong> 2ml discovery vial is strictly non-returnable.
              </>
            )}
          </span>
        </div>
        {onOpenReturnPolicy && !isAllOutOfStock && (
          <button
            type="button"
            onClick={onOpenReturnPolicy}
            className="text-[10.5px] sm:text-[11px] text-[#A67C38] hover:text-black font-semibold whitespace-nowrap shrink-0 cursor-pointer underline decoration-[#A67C38]/40 hover:decoration-black transition-colors"
          >
            Policy Details ↗
          </button>
        )}
      </div>
    </div>
  );
}
