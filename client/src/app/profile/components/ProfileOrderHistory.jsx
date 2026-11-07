"use client";
import React from 'react';
import Link from 'next/link';
import { Package, ExternalLink, Copy, ChevronRight } from 'lucide-react';
import { message } from 'antd';

export default function ProfileOrderHistory({ orders = [] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-black mb-1">Order History</h3>
          <p className="text-xs text-gray-500 font-light">
            View your recent atelier purchases and live delivery status.
          </p>
        </div>

        <Link href="/orders">
          <button className="bg-black hover:bg-[#262626] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-2xs">
            <span>Live Order Tracker</span>
            <ExternalLink size={13} />
          </button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-14 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-gray-400 border border-[#E8E2D6]">
            <Package size={28} />
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold text-black mb-1">No Orders Placed Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto font-light">
              Discover our artisanal collections of signature Eau de Parfum, aged amber flacons, and discovery sets.
            </p>
          </div>
          <Link href="/shop" className="inline-block pt-2">
            <button className="bg-black hover:bg-[#262626] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs">
              Browse Collections
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div 
              key={order.id || order._id} 
              className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#E8E2D6] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-black/30 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-black">{order.orderId || `#ORD-${order.id}`}</span>
                  <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                    order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    ['Dispatch', 'Dispatched', 'Shipped'].includes(order.status) ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                    order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {order.status === 'Shipped' || order.status === 'Dispatch' ? 'Dispatched' : (order.status || 'Placed')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 m-0">
                  Placed on {new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-sm font-bold text-black font-sans m-0">
                  Total: ₹{(order.total_amount || 0).toLocaleString('en-IN')}
                </p>
                {order.tracking?.trackingNumber && ['Dispatch', 'Dispatched', 'Shipped', 'Delivered'].includes(order.status) ? (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-[#8C6228] bg-[#F9F4EB] px-2 py-0.5 rounded-md border border-[#E8DEC8]">
                      {order.tracking.courierName || 'Delhivery'}:
                    </span>
                    <span className="font-mono text-xs font-bold text-black bg-stone-100 px-2 py-0.5 rounded-md">
                      {order.tracking.trackingNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(order.tracking.trackingNumber);
                        message.success('Delhivery Track ID copied');
                      }}
                      className="text-gray-400 hover:text-black text-[11px] p-0.5 cursor-pointer"
                      title="Copy Track ID"
                    >
                      <Copy size={12} />
                    </button>
                    <a
                      href="https://www.delhivery.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#8C6228] hover:underline flex items-center gap-1 font-semibold ml-1"
                    >
                      <span>Track on delhivery.com</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                ) : (
                  <div className="pt-1.5 flex items-center gap-1.5 text-[11px] text-stone-500 font-light">
                    {order.status === 'Cancelled' ? (
                      <span className="text-red-600 font-medium">Order Cancelled</span>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Tracking ID will be provided upon dispatch</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link href="/orders">
                <button className="px-5 py-2.5 rounded-full bg-white hover:bg-black hover:text-white border border-[#E0D8CA] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-2xs">
                  <span>{['Dispatch', 'Dispatched', 'Shipped', 'Delivered'].includes(order.status) ? 'Track Order' : 'View Order'}</span>
                  <ChevronRight size={13} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

