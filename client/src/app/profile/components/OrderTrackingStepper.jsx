"use client";
import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  Check, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { message } from 'antd';

export const TRACKING_STEPS = [
  { name: 'Order Confirmed', description: 'Order verified & payment logged', icon: Check },
  { name: 'Processing', description: 'Order verified & preparing for dispatch', icon: Package },
  { name: 'In Transit', description: 'Dispatched via White-Glove courier', icon: Truck },
  { name: 'Delivered', description: 'Delivered to your destination', icon: MapPin }
];

export default function OrderTrackingStepper({ order, currentStep }) {
  const [showTimeline, setShowTimeline] = useState(false);

  if (!order) return null;

  const handleCopy = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      message.success(`${label} copied to clipboard`);
    }
  };

  return (
    <div className="px-5 sm:px-8 py-5 bg-[#FCFAF7] border-b border-[#ECE5D8]">
      {/* Rail & Stepper Nodes */}
      <div className="relative flex items-center justify-between max-w-lg mx-auto my-2">
        <div className="absolute top-4 left-6 right-6 h-[2px] bg-[#E8E0D2] -translate-y-1/2 z-0" />
        
        <div 
          className="absolute top-4 left-6 h-[2.5px] bg-gradient-to-r from-[#D4A64A] via-[#B8860B] to-[#916515] -translate-y-1/2 z-0 transition-all duration-700 shadow-xs"
          style={{
            width: currentStep === 0 ? '0%' : currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%'
          }}
        />

        {TRACKING_STEPS.map((step, idx) => {
          const isPassed = currentStep >= idx;
          const isCurrent = currentStep === idx;
          const IconComp = step.icon;

          return (
            <div key={step.name} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-[#1C1714] text-[#ECC880] ring-3 ring-[#EFE5D3] shadow-md scale-105'
                    : isPassed
                    ? 'bg-[#D4A64A] text-white shadow-2xs'
                    : 'bg-white text-[#BDB2A5] border border-[#DDD5C7]'
                }`}
              >
                <IconComp size={13} strokeWidth={isPassed ? 2.4 : 1.8} />
              </div>

              <span className={`text-[10px] sm:text-[11px] mt-1.5 font-medium tracking-wide text-center whitespace-nowrap ${
                isCurrent ? 'text-[#1C1714] font-bold' : isPassed ? 'text-[#5C4A38] font-semibold' : 'text-[#AFA495]'
              }`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Micro Notification Bar */}
      <div className="mt-4 p-2.5 rounded-xl bg-[#F4EFE6]/80 border border-[#E3DACB] flex items-center justify-between gap-3 text-xs text-[#5C4A38]">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-[#A47E3B] shrink-0" />
          <span>
            {currentStep === 0 && 'Your fragrance order has been confirmed.'}
            {currentStep === 1 && 'Order is confirmed and being prepared for courier dispatch.'}
            {currentStep === 2 && `Consignment is in transit with ${order.tracking?.courierName || 'Delhivery'}.`}
            {currentStep === 3 && 'Order delivered successfully. Thank you for choosing ROVE & AMBER.'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowTimeline(!showTimeline)}
          className="text-xs font-semibold text-[#8C6228] hover:text-[#5C4A38] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>{showTimeline ? 'Hide Timeline' : 'Live Timeline'}</span>
          <ChevronRight size={12} className={`transition-transform ${showTimeline ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Expandable Live Timeline Log */}
      {showTimeline && (
        <div className="mt-3 p-4 rounded-xl bg-white border border-[#E3DACB] space-y-3 animate-fadeIn">
          <h5 className="text-xs font-bold text-[#1C1714] uppercase tracking-wider m-0">Consignment Dispatch Log</h5>
          <div className="space-y-2.5 text-xs">
            {TRACKING_STEPS.map((step, idx) => {
              const isDone = currentStep >= idx;
              const isCur = currentStep === idx;
              return (
                <div key={idx} className="flex items-start gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isDone ? 'bg-[#D4A64A] text-white' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <Check size={10} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${isCur ? 'text-[#1C1714] font-bold' : isDone ? 'text-stone-800' : 'text-stone-400'}`}>
                        {step.name}
                      </span>
                      {isCur && <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded">Active Milestone</span>}
                    </div>
                    <p className="text-[11px] text-stone-500 m-0">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delhivery Express Banner */}
      {order.tracking?.trackingNumber && ['Dispatch', 'Dispatched', 'Shipped', 'Delivered'].includes(order.status) && (
        <div className="mt-3 p-3.5 rounded-2xl bg-[#1C1714] text-[#FBF9F5] border border-[#3A2D25] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ECC880]/15 flex items-center justify-center shrink-0 border border-[#ECC880]/20">
              <Truck size={15} className="text-[#ECC880]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#ECC880] block">
                {order.tracking?.courierName || 'Delhivery'} Express Delivery
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[#A89F91]">Track ID:</span>
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  {order.tracking.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(order.tracking.trackingNumber, 'Delhivery Track ID')}
                  title="Copy Tracking ID"
                  className="text-gray-400 hover:text-white p-0.5 rounded cursor-pointer"
                >
                  <Copy size={11} />
                </button>
              </div>
            </div>
          </div>

          <a
            href="https://www.delhivery.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#ECC880] hover:bg-[#DEB368] text-[#1C1714] transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <span>Track on Delhivery.com</span>
            <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}

