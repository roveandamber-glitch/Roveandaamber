"use client";
import React from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, Layers, Star } from 'lucide-react';

export default function DashboardPipelineCard({ totalOrdersCount = 0, statusCounts = {} }) {
  const getPct = (val) => (totalOrdersCount > 0 ? Math.round(((val || 0) / totalOrdersCount) * 100) : 0);

  return (
    <div className="lg:col-span-4 space-y-5">
      {/* FULFILLMENT PIPELINE CARD */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#F6F0E6] mb-4">
          <div>
            <h3 className="text-base font-serif text-[#1B100A] font-medium tracking-tight">
              Fulfillment Pipeline
            </h3>
            <p className="text-xs text-gray-500 font-light mt-0.5">
              Order status allocation
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#B38728] border border-[#E8DFC8]">
            {totalOrdersCount} Total
          </span>
        </div>

        <div className="space-y-3.5">
          {/* Delivered */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Delivered
              </span>
              <span className="font-semibold text-gray-900">{statusCounts.Delivered || 0} orders</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${getPct(statusCounts.Delivered)}%` }} 
              />
            </div>
          </div>

          {/* Processing */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Processing
              </span>
              <span className="font-semibold text-gray-900">{statusCounts.Processing || 0} orders</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${getPct(statusCounts.Processing)}%` }} 
              />
            </div>
          </div>

          {/* Dispatch */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Dispatch
              </span>
              <span className="font-semibold text-gray-900">{statusCounts.Shipped || 0} orders</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-500 rounded-full transition-all duration-500" 
                style={{ width: `${getPct(statusCounts.Shipped)}%` }} 
              />
            </div>
          </div>

          {/* Pending */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Pending
              </span>
              <span className="font-semibold text-gray-900">{statusCounts.Pending || 0} orders</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                style={{ width: `${getPct(statusCounts.Pending)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* QUICK MANAGEMENT SHORTCUTS */}
      <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5ECE0] rounded-2xl border border-[#E8DFC8] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <h3 className="text-sm font-serif text-[#1B100A] font-semibold tracking-tight mb-3">
          Admin Quick Tools
        </h3>
        
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href="/admin/products"
            className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] text-left transition-all group"
          >
            <Package size={16} className="text-[#B38728] mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-gray-900">Fragrance Catalog</p>
            <p className="text-[10px] text-gray-500">Edit products</p>
          </Link>

          <Link
            href="/admin/orders"
            className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] text-left transition-all group"
          >
            <ShoppingBag size={16} className="text-[#B38728] mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-gray-900">Order Dispatch</p>
            <p className="text-[10px] text-gray-500">Manage status</p>
          </Link>

          <Link
            href="/admin/products"
            className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] text-left transition-all group"
          >
            <Layers size={16} className="text-[#B38728] mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-gray-900">All Perfumes</p>
            <p className="text-[10px] text-gray-500">Catalog & products</p>
          </Link>

          <Link
            href="/admin/reviews"
            className="p-3 bg-white hover:bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] text-left transition-all group"
          >
            <Star size={16} className="text-[#B38728] mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-gray-900">Moderation</p>
            <p className="text-[10px] text-gray-500">Patron reviews</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

