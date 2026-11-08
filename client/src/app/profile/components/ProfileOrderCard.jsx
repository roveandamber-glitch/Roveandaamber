"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Copy, 
  FileText,
  Calendar,
  Gift,
  RotateCcw,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { message } from 'antd';
import { getImageUrl } from '@/utils/imageHelper';
import OrderTrackingStepper from './OrderTrackingStepper';

export default function ProfileOrderCard({ order, onViewInvoice, onBuyAgain }) {
  const [showTimelineDirect, setShowTimelineDirect] = useState(false);

  if (!order) return null;

  const orderRef = order.orderId || `#ORD-${String(order.id || order._id || '').slice(-4).toUpperCase()}`;
  const isCancelled = String(order.status || '').toLowerCase() === 'cancelled';
  const isPaid = String(order.paymentStatus || '').toLowerCase() === 'paid';
  const isCOD = String(order.paymentMethod || '').toLowerCase().includes('cod');

  const getStepIndex = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'cancelled') return -1;
    if (s === 'delivered') return 3;
    if (['dispatch', 'dispatched', 'shipped', 'in transit'].includes(s)) return 2;
    if (['processing', 'artisan prep', 'pending'].includes(s)) return 1;
    return 0;
  };

  const currentStep = getStepIndex(order.status || 'Processing');

  const orderDate = new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const estDate = order.tracking?.estimatedDelivery || new Date(
    new Date(order.createdAt || Date.now()).getTime() + 4 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const itemsTotal = (order.items || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  );
  const resolvedTotal = Number(order.total_amount) || Number(order.totalAmount) || Number(order.total) || itemsTotal || 0;

  const handleCopy = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      message.success(`${label} copied to clipboard`);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#ECE5D8] shadow-[0_4px_24px_rgba(30,20,10,0.04)] hover:shadow-[0_8px_32px_rgba(30,20,10,0.07)] transition-all overflow-hidden mb-6">
      
      {/* Top Bar: Order ID, Date, Badges & Amount */}
      <div className="bg-[#F8F5EE] px-5 sm:px-7 py-4 border-b border-[#ECE5D8] flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Identifier, Date, Estimated Delivery */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#E3DACB] shadow-2xs">
            <span className="font-mono text-xs sm:text-sm font-bold text-[#1C1714] tracking-wide">
              {orderRef}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(orderRef, 'Order Reference')}
              className="text-[#8C7A6B] hover:text-black transition-colors cursor-pointer p-0.5"
              title="Copy Order Reference"
            >
              <Copy size={12} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#7D7063]">
            <Calendar size={13} className="text-[#A47E3B]" />
            <span>Placed on {orderDate}</span>
          </div>

          <span className="hidden sm:inline text-[#D8CEBE]">•</span>

          <div className="flex items-center gap-1.5 text-xs text-[#5C4A38] font-medium bg-[#EFE9DD]/80 px-2.5 py-0.5 rounded-lg">
            <Truck size={13} className="text-[#8C6D1F]" />
            <span>Est. Delivery: <strong>{estDate}</strong></span>
          </div>
        </div>

        {/* Right: Badges & Total */}
        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
          {/* Payment Badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
            isPaid
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : isCOD
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'bg-stone-100 text-stone-700 border border-stone-200'
          }`}>
            <ShieldCheck size={12} className={isPaid ? 'text-emerald-600' : 'text-amber-700'} />
            <span>{isPaid ? 'Razorpay • Paid' : isCOD ? 'COD' : 'Pending'}</span>
          </span>

          {/* Status Badge */}
          {isCancelled ? (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
              <XCircle size={12} />
              <span>Cancelled</span>
            </span>
          ) : order.status === 'Delivered' ? (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={12} />
              <span>Delivered</span>
            </span>
          ) : ['Dispatch', 'Dispatched', 'Shipped'].includes(order.status) ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
              <span>Dispatched</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              <span>Processing</span>
            </span>
          )}

          {/* Total Amount */}
          <div className="text-right pl-2 border-l border-[#E3DACB]">
            <span className="text-sm sm:text-base font-sans font-bold text-[#1C1714]">
              ₹{resolvedTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Stepper & Delhivery Consignment Section */}
      {!isCancelled && (
        <OrderTrackingStepper order={order} currentStep={currentStep} />
      )}

      {/* Fragrance Items */}
      <div className="p-5 sm:p-7 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A6B] font-semibold m-0">
          Curated Fragrance Flacons
        </p>

        <div className="divide-y divide-[#F0EAE0]">
          {(order.items && order.items.length > 0) ? (
            order.items.map((item, idx) => {
              const itemName = item.product_name || item.name || 'Fine Fragrance Flacon';
              const itemImg = item.product_image || item.image;
              const itemSize = item.size || '50ml';
              const itemQty = parseInt(item.quantity, 10) || 1;
              const itemPrice = Number(item.price) || 0;
              const lineTotal = itemPrice * itemQty;

              return (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-16 bg-[#FAF7F2] rounded-xl p-1 flex items-center justify-center shrink-0 border border-[#ECE5D8] shadow-2xs">
                      <img 
                        src={getImageUrl(itemImg)} 
                        alt={itemName} 
                        className="w-full h-full object-contain drop-shadow-xs"
                        onError={(e) => { e.target.src = '/images/perfumes/amber_oud_perfume.jpg'; }}
                      />
                    </div>

                    <div>
                      <Link
                        href={`/product/${item.product_id || item.productId || ''}`}
                        className="text-xs sm:text-sm font-serif font-bold text-[#1C1714] hover:text-[#A47E3B] transition-colors block"
                      >
                        {itemName}
                      </Link>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-[#F4EFE6] text-[#4A3B2C] px-2 py-0.5 rounded-md border border-[#E3DACB]">
                          {itemSize}
                        </span>
                        <span className="text-[11px] text-[#7D7063]">
                          Qty: <strong>{itemQty}</strong>
                        </span>
                        <span className="text-xs text-[#A89E90]">×</span>
                        <span className="text-[11px] text-[#5C4A38] font-medium">
                          ₹{itemPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right pt-2 sm:pt-0 border-t sm:border-0 border-[#F5EFE6]">
                    <span className="text-xs sm:text-sm font-bold text-[#1C1714] font-sans">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </span>

                    {onBuyAgain && (
                      <button
                        type="button"
                        onClick={() => onBuyAgain(item)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold text-[#3D2E20] bg-[#F4EFE6] hover:bg-[#EAE2D5] border border-[#E0D5C3] transition-all cursor-pointer"
                      >
                        <RotateCcw size={10} />
                        <span>Buy Again</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 italic py-2 m-0">Fragrance formulation details on file.</p>
          )}
        </div>

        {/* Card Footer: Delivery Destination & Actions */}
        <div className="pt-4 mt-3 border-t border-[#ECE5D8] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5 text-xs text-[#6B5D50]">
            <div className="flex items-start gap-1.5">
              <MapPin size={13} className="text-[#A47E3B] shrink-0 mt-0.5" />
              <span className="leading-snug">
                Deliver to: <strong>{order.customer_name || 'Customer'}</strong> — {order.address || 'Standard Atelier Address'}
              </span>
            </div>

            {order.isGift && (
              <div className="flex items-center gap-1.5 text-[#8C6228] font-medium text-[11px]">
                <Gift size={12} className="shrink-0" />
                <span>Gift Packaging & Wax-Sealed Note Included</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {onViewInvoice && (
              <button
                type="button"
                onClick={() => onViewInvoice(order)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#1C1714] bg-white hover:bg-[#FAF8F5] border border-[#D8CEBE] shadow-2xs transition-all cursor-pointer"
              >
                <FileText size={12} />
                <span>View Invoice</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowTimelineDirect(!showTimelineDirect)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#1C1714] hover:bg-[#2C2420] shadow-xs transition-all cursor-pointer"
            >
              <Truck size={12} />
              <span>{showTimelineDirect ? 'Hide Tracking' : 'Track Dispatch'}</span>
            </button>
          </div>
        </div>

        {/* Direct Toggle Timeline if clicked from footer button */}
        {showTimelineDirect && (
          <div className="mt-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E3DACB] space-y-2 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-1 border-b border-[#ECE5D8]">
              <span className="font-bold text-[#1C1714]">Live Tracking Dispatch Log</span>
              <span className="text-[10px] text-[#8C6228] font-semibold">{order.tracking?.courierName || 'Delhivery Express'}</span>
            </div>
            <p className="text-[11px] text-stone-600 m-0 leading-relaxed">
              Consignment is synchronized with national courier logistics. Real-time scanning events update automatically upon hub clearance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
