"use client";
import React from 'react';
import Link from 'next/link';
import { 
  User, 
  ShoppingBag, 
  Package, 
  KeyRound, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

export default function ProfileSidebar({
  user,
  orders = [],
  cartItems = [],
  activeTab,
  setActiveTab,
  handleLogout
}) {
  return (
    <div className="p-6 sm:p-7 flex flex-col justify-between h-full space-y-6">
      
      <div className="space-y-6">
        {/* User Identity Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-serif text-xl font-bold shadow-sm shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'Z'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-serif font-bold text-black truncate">
              {user?.name || 'Customer Account'}
            </h2>
            <p className="text-xs text-gray-500 truncate font-light mt-0.5">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Quick Metrics Bar (3 Columns) */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#ECE5D8] text-center">
          <div className="p-2.5 rounded-2xl bg-white border border-[#EAE4D8]">
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Orders</span>
            <span className="text-sm font-bold text-black font-sans mt-0.5 block">{orders.length}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white border border-[#EAE4D8]">
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Bag</span>
            <span className="text-sm font-bold text-black font-sans mt-0.5 block">{cartItems.length}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white border border-[#EAE4D8]">
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Status</span>
            <span className="text-xs font-bold text-black font-sans mt-0.5 block">VIP</span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1.5">
          {user?.role === 'admin' && (
            <a
              href={typeof window !== 'undefined' && window.location.hostname.includes('roveandamber.com') ? 'https://admin.roveandamber.com' : '/admin'}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold bg-[#1C120C] text-[#ECC880] hover:bg-black transition-all shadow-xs cursor-pointer border border-[#DEB368]/40 mb-1"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-[#DEB368]" />
                <span>Executive Atelier Portal</span>
              </div>
              <ChevronRight size={14} className="text-[#DEB368]" />
            </a>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'bg-black text-white shadow-xs font-bold'
                : 'text-gray-700 hover:bg-white hover:text-black'
            }`}
          >
            <div className="flex items-center gap-3">
              <User size={16} />
              <span>Personal Details</span>
            </div>
            <ChevronRight size={14} className={activeTab === 'details' ? 'text-white' : 'text-gray-400'} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cart'
                ? 'bg-black text-white shadow-xs font-bold'
                : 'text-gray-700 hover:bg-white hover:text-black'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={16} />
              <span>Shopping Bag ({cartItems.length})</span>
            </div>
            <ChevronRight size={14} className={activeTab === 'cart' ? 'text-white' : 'text-gray-400'} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-black text-white shadow-xs font-bold'
                : 'text-gray-700 hover:bg-white hover:text-black'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package size={16} />
              <span>Order History ({orders.length})</span>
            </div>
            <ChevronRight size={14} className={activeTab === 'orders' ? 'text-white' : 'text-gray-400'} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-black text-white shadow-xs font-bold'
                : 'text-gray-700 hover:bg-white hover:text-black'
            }`}
          >
            <div className="flex items-center gap-3">
              <KeyRound size={16} />
              <span>Security & Password</span>
            </div>
            <ChevronRight size={14} className={activeTab === 'security' ? 'text-white' : 'text-gray-400'} />
          </button>
        </nav>

        {/* Sign Out Button */}
        <div className="pt-2 border-t border-[#ECE5D8]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LogOut size={16} />
              <span>Sign Out</span>
            </div>
            <ChevronRight size={14} className="text-red-300" />
          </button>
        </div>
      </div>

      {/* Direct Store Link Card at Bottom */}
      <div className="bg-white rounded-2xl p-4 border border-[#ECE5D8] shadow-2xs space-y-1.5 mt-auto">
        <h4 className="text-xs font-serif font-bold text-black m-0">Curated Collections</h4>
        <p className="text-[11px] text-gray-500 font-light leading-relaxed m-0">
          Discover the latest fine fragrance formulations.
        </p>
        <Link 
          href="/shop" 
          className="text-xs font-bold uppercase tracking-wider text-black hover:underline inline-flex items-center gap-1.5 pt-1"
        >
          <span>Browse Store</span>
          <ArrowRight size={12} />
        </Link>
      </div>

    </div>
  );
}

