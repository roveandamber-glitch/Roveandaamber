"use client";
import React from 'react';

export default function RewardsTiersGrid({ tiers = [] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif font-bold text-base text-[#1A1A1A]">
          Privilege Tier Structure
        </h3>
        <span className="text-xs text-gray-500">4 Tier Escalation Tiers</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier, idx) => (
          <div 
            key={idx}
            className="bg-white rounded-2xl p-4 border border-[#EAE3D6] shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#B8860B]/10 to-transparent rounded-bl-full pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-serif font-bold text-base text-[#1A1A1A]">
                  {tier.name}
                </span>
                <span className="text-xs bg-[#FAF7F2] text-[#B8860B] font-semibold px-2 py-0.5 rounded-full border border-[#EAE3D6]">
                  {tier.membersCount ?? tier.members ?? 0} Members
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-3 font-medium">
                Spending: <span className="text-[#1A1A1A] font-semibold">{tier.threshold || `₹${Number(tier.minSpend || 0).toLocaleString('en-IN')}`}</span>
              </div>
              <div className="text-xs text-gray-700 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE3D6] leading-relaxed">
                {tier.multiplier || tier.perk || 'Standard Privilege Tier'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

