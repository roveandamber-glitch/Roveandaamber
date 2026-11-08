"use client";
import React from 'react';
import { Drawer, Avatar, Button } from 'antd';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Coins, 
  ShieldCheck, 
  Ban,
  SlidersHorizontal,
  Lock
} from 'lucide-react';

export default function CustomerProfileDrawer({
  open,
  onClose,
  selectedCustomer,
  actionLoading,
  handleToggleBlock,
  confirmBlockCustomer,
  onOpenWallet
}) {
  if (!selectedCustomer) return null;

  const totalSpend = selectedCustomer.totalSpent ?? selectedCustomer.total_spent ?? 0;
  const ordersCount = selectedCustomer.ordersCount ?? selectedCustomer.orders_count ?? 0;
  const rewardPoints = selectedCustomer.rewardPoints ?? Math.floor(totalSpend * 0.1);
  const customerOrders = selectedCustomer.orders || [];
  const isSelectedBlocked = Boolean(selectedCustomer.isBlocked);
  const isWalletDisabled = Boolean(selectedCustomer.isWalletDisabled);

  return (
    <Drawer
      title={
        <span className="font-serif font-medium text-base text-[#1B100A]">
          Customer Profile
        </span>
      }
      placement="right"
      size="default"
      onClose={onClose}
      open={open}
      className="luxury-admin-drawer"
    >
      <div className="space-y-6 text-xs text-[#1B100A]">
        {/* Header info */}
        <div className="flex flex-col items-center text-center p-5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D6]">
          <Avatar src={selectedCustomer.avatar} size={70} className="border-2 border-[#B8860B] mb-3">
            {selectedCustomer.name?.[0]}
          </Avatar>
          <h3 className="font-serif font-bold text-lg text-[#1A1A1A]">
            {selectedCustomer.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{selectedCustomer.email}</p>
          
          <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
            {isSelectedBlocked ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-rose-50 text-rose-800 border border-rose-200 px-3 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Account Blocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active Patron
              </span>
            )}

            {isWalletDisabled && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-semibold">
                <Lock size={10} />
                Wallet Suspended
              </span>
            )}
          </div>
        </div>

        {/* Account Status & Admin Actions */}
        <div className="p-4 rounded-xl border bg-white space-y-3 border-[#EAE3D6]">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-xs text-[#1A1A1A]">
                {isSelectedBlocked ? 'Account is Suspended' : 'Account Status: Active'}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {isSelectedBlocked 
                  ? 'Customer cannot log in to their account or place orders.' 
                  : 'Customer has full access to the boutique storefront.'}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0EAE1] flex flex-col gap-2">
            {isSelectedBlocked ? (
              <Button 
                type="primary"
                loading={actionLoading}
                onClick={() => handleToggleBlock(selectedCustomer, false)}
                icon={<ShieldCheck size={14} />}
                className="!bg-[#B8860B] hover:!bg-[#996e07] text-xs h-9 w-full rounded-xl font-medium"
              >
                Unblock Customer Account
              </Button>
            ) : (
              <Button 
                danger
                loading={actionLoading}
                onClick={() => confirmBlockCustomer(selectedCustomer)}
                icon={<Ban size={14} />}
                className="text-xs h-9 w-full rounded-xl font-medium"
              >
                Block Customer Account
              </Button>
            )}

            {onOpenWallet && (
              <button
                type="button"
                onClick={() => onOpenWallet(selectedCustomer)}
                className="w-full h-9 rounded-xl border border-[#D4AF37] bg-gradient-to-r from-[#FAF3E0] to-[#F5ECE0] hover:from-[#F5EAD0] hover:to-[#EEDFC8] text-[#8C6D1F] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal size={13} />
                <span>Manage Points & Wallet</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-xl border border-[#EAE3D6] text-center">
            <div className="text-[11px] text-gray-400">Total Spend</div>
            <div className="font-bold text-sm text-[#1A1A1A] mt-1">
              ₹{Number(totalSpend).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-[#EAE3D6] text-center">
            <div className="text-[11px] text-gray-400">Orders</div>
            <div className="font-bold text-sm text-[#1A1A1A] mt-1">
              {ordersCount}
            </div>
          </div>
          <div 
            onClick={() => onOpenWallet && onOpenWallet(selectedCustomer)}
            className="bg-white hover:bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE3D6] hover:border-[#D4AF37] text-center cursor-pointer transition-colors"
            title="Click to edit points"
          >
            <div className="text-[11px] text-[#B8860B] font-semibold underline decoration-[#B8860B]/40">Reward Points</div>
            <div className="font-bold text-sm text-[#B8860B] mt-1">
              {Number(rewardPoints).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">Contact & Location</h4>
          <div className="bg-white p-3.5 rounded-xl border border-[#EAE3D6] space-y-2.5 text-gray-600">
            <div className="flex items-center gap-2.5">
              <Phone size={14} className="text-[#B8860B]" />
              <span>{selectedCustomer.phone || 'Phone not provided'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-[#B8860B]" />
              <span>{selectedCustomer.email}</span>
            </div>
            {selectedCustomer.city && (
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-[#B8860B]" />
                <span>{selectedCustomer.city}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Calendar size={14} className="text-[#B8860B]" />
              <span>Customer since {selectedCustomer.joinedDate || 'Recently joined'}</span>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">
              Recent Orders
            </h4>
            <span className="text-[11px] text-gray-400">
              {ordersCount} {ordersCount === 1 ? 'order' : 'orders'} total
            </span>
          </div>
          
          {customerOrders.length > 0 ? (
            <div className="space-y-2.5">
              {customerOrders.map((ord, idx) => (
                <div key={ord._id || idx} className="bg-white p-3 rounded-xl border border-[#EAE3D6] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-[#1A1A1A]">{ord.orderNumber}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xs text-[#1A1A1A]">₹{Number(ord.totalAmount).toLocaleString('en-IN')}</div>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5 ${
                      ord.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      ord.status === 'Dispatch' || ord.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      ord.status === 'Processing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {ord.status === 'Shipped' ? 'Dispatch' : ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-[#EAE3D6] text-center text-gray-400 text-xs">
              No orders recorded yet.
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

