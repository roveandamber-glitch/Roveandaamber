"use client";
import React from 'react';
import { 
  User, 
  ShoppingBag, 
  Package, 
  KeyRound, 
  LogOut, 
  ChevronRight, 
  ShieldCheck 
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
    <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4 select-none">
      <div className="space-y-4">
        {/* User Identity Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'Z'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-serif font-bold text-black truncate m-0">
              {user?.name || 'Customer Account'}
            </h2>
            <p className="text-[11px] text-gray-500 truncate font-light mt-0.5 m-0">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Quick Metrics Bar (Orders, Bag, VIP) */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#ECE5D8] text-center">
          <div className="p-2 rounded-xl bg-white border border-[#EAE4D8]">
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Orders</span>
            <span className="text-xs sm:text-sm font-bold text-black font-sans mt-0.5 block">{orders.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-[#EAE4D8]">
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Bag</span>
            <span className="text-xs sm:text-sm font-bold text-black font-sans mt-0.5 block">{cartItems.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-[#EAE4D8]">
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Status</span>
            <span className="text-xs font-bold text-[#8C6D1F] font-sans mt-0.5 block">VIP</span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1">
          {user?.role === 'admin' && (
            <a
              href={typeof window !== 'undefined' && window.location.hostname.includes('roveandamber.com') ? 'https://admin.roveandamber.com' : '/admin'}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#1C120C] text-[#ECC880] hover:bg-black transition-all shadow-xs cursor-pointer border border-[#DEB368]/40 mb-1"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={15} className="text-[#DEB368]" />
                <span>Executive Atelier Portal</span>
              </div>
              <ChevronRight size={13} className="text-[#DEB368]" />
            </a>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'bg-black text-white shadow-xs font-bold'
                : 'text-gray-700 hover:bg-white hover:text-black'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User size={15} />
              <span>Personal Details</span>
            </div>
            <ChevronRight size={13} className={activeTab === 'details' ? 'text-white' : 'text-gray-400'} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cart')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cart'
                ? 'bg-black text-white shadow-xs font-bold'
                : 'text-gray-700 hover:bg-white hover:text-black'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={15} />
              <span>Shopping Bag ({cartItems.length})</span>
            </div>
            <ChevronRight size={13} className={activeTab === 'cart' ? 'text-white' : 'text-gray-400'} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-black text-white shadow-xs font-bold'
                : 'text-gray-700 hover:bg-white hover:text-black'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package size={15} />
              <span>Order History ({orders.length})</span>
            </div>
            <ChevronRight size={13} className={activeTab === 'orders' ? 'text-white' : 'text-gray-400'} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-black text-white shadow-xs font-bold'
                : 'text-gray-700 hover:bg-white hover:text-black'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <KeyRound size={15} />
              <span>Security & Password</span>
            </div>
            <ChevronRight size={13} className={activeTab === 'security' ? 'text-white' : 'text-gray-400'} />
          </button>
        </nav>

        {/* Sign Out Button */}
        <div className="pt-2 border-t border-[#ECE5D8]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut size={15} />
              <span>Sign Out</span>
            </div>
            <ChevronRight size={13} className="text-rose-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
