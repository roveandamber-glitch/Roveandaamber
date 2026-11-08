"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingBag } from 'lucide-react';
import { message } from 'antd';
import cartService from '@/services/cartService';
import ProfileOrderCard from './ProfileOrderCard';
import OrderInvoiceModal from '@/app/orders/components/OrderInvoiceModal';

export default function ProfileOrderHistory({ orders = [] }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);

  const filteredOrders = orders.filter((order) => {
    const s = String(order.status || '').toLowerCase();
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return s !== 'delivered' && s !== 'cancelled';
    if (filterStatus === 'delivered') return s === 'delivered';
    return true;
  });

  const activeCount = orders.filter((o) => {
    const s = String(o.status || '').toLowerCase();
    return s !== 'delivered' && s !== 'cancelled';
  }).length;

  const deliveredCount = orders.filter((o) => {
    const s = String(o.status || '').toLowerCase();
    return s === 'delivered';
  }).length;

  const handleBuyAgain = (item) => {
    if (!item) return;
    try {
      cartService.addToCart({
        id: item.product_id || item.productId || item.id,
        name: item.product_name || item.name || 'Fine Fragrance',
        price: Number(item.price) || 0,
        size: item.size || '50ml',
        image: item.product_image || item.image
      }, 1);
      message.success(`Added ${item.product_name || item.name} to your bag`);
    } catch (err) {
      console.warn('Buy again error:', err);
      message.info('Redirecting to fragrance flacon...');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE5D8] pb-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-black mb-1">
            Order History & Live Tracking
          </h3>
          <p className="text-xs text-gray-500 font-light m-0">
            Monitor real-time courier milestones, delivery progress, and verified boutique tax receipts.
          </p>
        </div>

        {/* Filter Pills */}
        {orders.length > 0 && (
          <div className="flex items-center gap-1.5 bg-[#F2EDE4] p-1 rounded-full border border-[#E3DACB] shadow-2xs self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#1C1714] text-[#FBF9F5] shadow-xs'
                  : 'text-[#6B5D50] hover:text-[#1C1714]'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                filterStatus === 'active'
                  ? 'bg-[#1C1714] text-[#FBF9F5] shadow-xs'
                  : 'text-[#6B5D50] hover:text-[#1C1714]'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('delivered')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                filterStatus === 'delivered'
                  ? 'bg-[#1C1714] text-[#FBF9F5] shadow-xs'
                  : 'text-[#6B5D50] hover:text-[#1C1714]'
              }`}
            >
              Delivered ({deliveredCount})
            </button>
          </div>
        )}
      </div>

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-[#FCFBF8] rounded-3xl border border-[#ECE5D8] p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] flex items-center justify-center mx-auto text-gray-400 border border-[#E8E2D6]">
            {orders.length === 0 ? <Package size={28} /> : <ShoppingBag size={28} />}
          </div>
          <div>
            <h4 className="text-lg font-serif font-bold text-black mb-1">
              {orders.length === 0 ? 'No Orders Placed Yet' : 'No Orders In This Filter'}
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto font-light m-0">
              {orders.length === 0
                ? 'Discover our artisanal collections of signature Eau de Parfum, aged amber flacons, and discovery sets.'
                : 'You have no orders matching this filter. Switch back to view all acquisitions.'}
            </p>
          </div>
          {orders.length === 0 ? (
            <Link href="/shop" className="inline-block pt-2">
              <button className="bg-black hover:bg-[#262626] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs">
                Browse Collections
              </button>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className="px-5 py-2 rounded-full bg-white hover:bg-black hover:text-white border border-[#E0D8CA] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              View All Orders
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <ProfileOrderCard
              key={order.id || order._id}
              order={order}
              onViewInvoice={(ord) => setActiveInvoiceOrder(ord)}
              onBuyAgain={handleBuyAgain}
            />
          ))}
        </div>
      )}

      {/* Official PDF Invoice Modal */}
      {activeInvoiceOrder && (
        <OrderInvoiceModal
          order={activeInvoiceOrder}
          open={Boolean(activeInvoiceOrder)}
          onClose={() => setActiveInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
