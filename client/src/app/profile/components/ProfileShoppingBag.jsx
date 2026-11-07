"use client";
import React from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  ExternalLink, 
  Minus, 
  Plus, 
  Trash2, 
  ArrowRight 
} from 'lucide-react';
import { getImageUrl } from '@/utils/imageHelper';

export default function ProfileShoppingBag({
  cartItems = [],
  cartTotalAmount = 0,
  handleUpdateCartQty,
  handleRemoveCartItem
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-black mb-1">My Shopping Bag</h3>
          <p className="text-xs text-gray-500 font-light">
            Review reserved flacons in your shopping bag and proceed to checkout.
          </p>
        </div>

        <Link href="/cart">
          <button className="bg-black hover:bg-[#262626] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-2xs">
            <span>Full Cart Page</span>
            <ExternalLink size={13} />
          </button>
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-14 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-gray-400 border border-[#E8E2D6]">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold text-black mb-1">Your Bag is Empty</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto font-light">
              You currently have no items reserved. Explore collections to add fine fragrance flacons to your bag.
            </p>
          </div>
          <Link href="/shop" className="inline-block pt-2">
            <button className="bg-black hover:bg-[#262626] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs">
              Browse Collections
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cart Items List */}
          <div className="space-y-3">
            {cartItems.map((item) => {
              const itemKey = `${item.productId || item.id}_${item.size || 'M'}`;
              const itemTotal = (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1);

              return (
                <div
                  key={itemKey}
                  className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D6] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-18 rounded-xl bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-200">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.src = '/Images/brown.png'; }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-serif font-bold text-black truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-white border border-[#E0D8CA] text-black text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Size: {item.size}
                        </span>
                        <span className="text-xs text-gray-500 font-sans">
                          ₹{(Number(item.price) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                    <div className="inline-flex items-center bg-white border border-gray-200 rounded-full p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateCartQty(item.productId || item.id, item.size, item.quantity - 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-black font-sans">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCartQty(item.productId || item.id, item.size, item.quantity + 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-black font-sans min-w-[70px] text-right">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveCartItem(item.productId || item.id, item.size, item.name)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary & Checkout Button */}
          <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D6] flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div>
              <span className="text-xs text-gray-500 font-light block">Total Bag Amount:</span>
              <span className="text-xl font-bold font-sans text-black">
                ₹{cartTotalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <Link href="/cart">
              <button className="bg-black hover:bg-[#262626] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer">
                <span>Complete Checkout</span>
                <ArrowRight size={13} />
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

