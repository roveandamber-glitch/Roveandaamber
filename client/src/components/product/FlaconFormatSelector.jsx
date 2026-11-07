"use client";
import React, { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * FlaconFormatSelector
 * Clean, minimal fragrance format selector without static dummy text or clutter.
 */
export default function FlaconFormatSelector({
  comboSelection,
  setComboSelection,
  basePrice = 0,
  samplePrice = 199,
  baseBottleSize = '50ML',
  onOpenReturnPolicy
}) {
  // Format long uppercase sizes gracefully (e.g. "DISCOVERY COFFRET (3X30ML)" -> "Discovery Coffret (3×30ml)")
  const displayBottleSize = useMemo(() => {
    if (!baseBottleSize) return 'Flacon';
    const trimmed = String(baseBottleSize).trim();
    if (trimmed.length > 8 || trimmed.includes('COFFRET') || trimmed.includes('(')) {
      return trimmed
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
        .replace(/3x30ml/i, '3×30ml');
    }
    return trimmed;
  }, [baseBottleSize]);

  const comboTotal = basePrice + samplePrice;

  return (
    <div className="space-y-2 pt-0.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#170E08]">
          Select Format & Trial
        </span>
        {onOpenReturnPolicy && (
          <button
            type="button"
            onClick={onOpenReturnPolicy}
            className="text-xs text-[#A67C38] hover:text-black font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ShieldCheck size={12} className="text-[#A67C38]" />
            <span>Return Policy Details ↗</span>
          </button>
        )}
      </div>

      {/* Format Options List - Single-line clean rows */}
      <div className="space-y-1.5">
        {/* 1. COMBO: Flacon + 2ml Sample (Recommended) */}
        <button
          type="button"
          onClick={() => setComboSelection('combo')}
          className={`w-full py-2.5 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
            comboSelection === 'combo'
              ? 'bg-[#FCF9F3] border-[#B8860B] shadow-2xs ring-1 ring-[#B8860B]/25'
              : 'bg-white border-[#ECE7DE] hover:border-stone-400'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Custom Luxury Radio Indicator */}
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                comboSelection === 'combo'
                  ? 'border-[#8C6D1F] bg-[#8C6D1F]'
                  : 'border-stone-300 bg-white'
              }`}
            >
              {comboSelection === 'combo' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>

            <span className="text-[13px] sm:text-[13.5px] font-sans font-bold text-[#140D07] truncate">
              {displayBottleSize} + 2ml Sample
            </span>
            <span className="bg-[#8C6D1F] text-white text-[8.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shrink-0">
              ★ Recommended
            </span>
          </div>

          <span className="text-sm font-bold text-[#140D07] font-sans shrink-0">
            ₹{comboTotal.toLocaleString('en-IN')}
          </span>
        </button>

        {/* 2. STANDALONE FLACON */}
        <button
          type="button"
          onClick={() => setComboSelection('bottle')}
          className={`w-full py-2.5 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
            comboSelection === 'bottle'
              ? 'bg-[#FCF9F3] border-[#1C120C] shadow-2xs ring-1 ring-black/20'
              : 'bg-white border-[#ECE7DE] hover:border-stone-400'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                comboSelection === 'bottle'
                  ? 'border-[#1C120C] bg-[#1C120C]'
                  : 'border-stone-300 bg-white'
              }`}
            >
              {comboSelection === 'bottle' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>

            <span className="text-[13px] sm:text-[13.5px] font-sans font-medium text-[#140D07] truncate">
              {displayBottleSize} Flacon Only
            </span>
          </div>

          <span className="text-sm font-bold text-[#140D07] font-sans shrink-0">
            ₹{basePrice.toLocaleString('en-IN')}
          </span>
        </button>

        {/* 3. 2ML DISCOVERY SAMPLE */}
        <button
          type="button"
          onClick={() => setComboSelection('sample')}
          className={`w-full py-2.5 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
            comboSelection === 'sample'
              ? 'bg-[#FCF9F3] border-[#1C120C] shadow-2xs ring-1 ring-black/20'
              : 'bg-white border-[#ECE7DE] hover:border-stone-400'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                comboSelection === 'sample'
                  ? 'border-[#1C120C] bg-[#1C120C]'
                  : 'border-stone-300 bg-white'
              }`}
            >
              {comboSelection === 'sample' && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>

            <span className="text-[13px] sm:text-[13.5px] font-sans font-medium text-[#140D07] truncate">
              2ml Discovery Sample
            </span>
          </div>

          <span className="text-sm font-bold text-[#140D07] font-sans shrink-0">
            ₹{samplePrice.toLocaleString('en-IN')}
          </span>
        </button>
      </div>
    </div>
  );
}
