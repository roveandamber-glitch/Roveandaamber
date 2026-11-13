"use client";
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  message, 
  Spin,
  Alert 
} from 'antd';
import { 
  Coins, 
  ShieldCheck, 
  Lock,
  Unlock
} from 'lucide-react';
import adminService from '@/services/adminService';

import UserWalletAdjustForm from './UserWalletAdjustForm';
import UserWalletHistoryTable from './UserWalletHistoryTable';

export default function UserWalletModal({
  open,
  onClose,
  targetUser,
  onUserUpdated
}) {
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Direct adjustment state
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [savingPoints, setSavingPoints] = useState(false);
  const [togglingWallet, setTogglingWallet] = useState(false);

  useEffect(() => {
    if (open && targetUser) {
      loadUserWalletData();
    } else {
      setUserDetails(null);
      setTransactions([]);
      setAdjustPoints(0);
      setAdjustReason('');
    }
  }, [open, targetUser]);

  const loadUserWalletData = async () => {
    const userId = targetUser?.userId || targetUser?.customerEmail || targetUser?.customerName || targetUser?.customer || targetUser?.id || targetUser?._id;
    if (!userId) return;

    setLoading(true);
    try {
      const res = await adminService.getUserRewardHistory(userId);
      if (res?.success && res.data) {
        setUserDetails(res.data.user);
        setTransactions(res.data.transactions || []);
        setAdjustPoints(Number(res.data.user.rewardPoints || 0));
      } else {
        const fallbackPts = Number(targetUser.rawPoints || targetUser.points || 0);
        setUserDetails({
          id: userId,
          name: targetUser.customer || targetUser.name || 'Valued Patron',
          email: targetUser.customerEmail || targetUser.email || '',
          rewardPoints: fallbackPts,
          isWalletDisabled: Boolean(targetUser.isWalletDisabled)
        });
        setAdjustPoints(fallbackPts);
      }
    } catch (err) {
      console.warn('Failed to load user reward history:', err);
      const fallbackPts = Number(targetUser.rawPoints || targetUser.points || 0);
      setUserDetails({
        id: userId,
        name: targetUser.customer || targetUser.name || 'Valued Patron',
        email: targetUser.customerEmail || targetUser.email || '',
        rewardPoints: fallbackPts,
        isWalletDisabled: Boolean(targetUser.isWalletDisabled)
      });
      setAdjustPoints(fallbackPts);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async (e) => {
    e.preventDefault();
    const resolvedId = userDetails?.id || userDetails?._id || targetUser?.userId || targetUser?.customerEmail || targetUser?.customerName || targetUser?.customer || targetUser?.id;
    if (!resolvedId) {
      message.error('Unable to identify customer account.');
      return;
    }
    if (adjustPoints === undefined || adjustPoints === null || adjustPoints < 0) {
      message.warning('Please enter a valid points balance (0 or higher)');
      return;
    }

    setSavingPoints(true);
    try {
      const res = await adminService.adjustUserPoints(resolvedId, {
        action: 'set',
        points: Number(adjustPoints),
        reason: adjustReason.trim() || 'Points balance updated by administrator'
      });

      if (res?.success) {
        message.success(res.message || 'Patron points updated successfully');
        await loadUserWalletData();
        if (onUserUpdated) onUserUpdated();
        setAdjustReason('');
      } else {
        message.error(res?.message || 'Failed to adjust points');
      }
    } catch (err) {
      console.error('Adjust points error:', err);
      message.error(err?.response?.data?.message || 'Failed to update points balance');
    } finally {
      setSavingPoints(false);
    }
  };

  const handleToggleWallet = async () => {
    const resolvedId = userDetails?.id || userDetails?._id || targetUser?.userId || targetUser?.customerEmail || targetUser?.customerName || targetUser?.customer || targetUser?.id;
    if (!resolvedId) return;
    const nextStatus = !userDetails?.isWalletDisabled;

    setTogglingWallet(true);
    try {
      const res = await adminService.toggleUserWallet(
        resolvedId, 
        nextStatus,
        nextStatus ? 'Suspended by boutique administration' : 'Restored by boutique administration'
      );

      if (res?.success) {
        message.success(nextStatus ? 'Customer wallet has been disabled' : 'Customer wallet has been restored & enabled');
        setUserDetails(prev => prev ? { ...prev, isWalletDisabled: nextStatus } : prev);
        if (onUserUpdated) onUserUpdated();
      } else {
        message.error(res?.message || 'Failed to update wallet status');
      }
    } catch (err) {
      console.error('Toggle wallet error:', err);
      message.error(err?.response?.data?.message || 'Failed to update wallet status');
    } finally {
      setTogglingWallet(false);
    }
  };

  const currentPoints = Number(userDetails?.rewardPoints || 0);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
      destroyOnClose
      title={
        <div className="flex items-center justify-between pr-8 pb-3 border-b border-[#EAE3D6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1C1714] to-[#3B2D25] text-[#ECC880] flex items-center justify-center shadow-xs">
              <Coins size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A] tracking-tight m-0">
                Wallet & Points Management
              </h3>
              <p className="text-[11px] text-gray-500 font-normal m-0">
                View points history, edit balance, and control wallet access.
              </p>
            </div>
          </div>

          {userDetails && (
            <div>
              {userDetails.isWalletDisabled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <Lock size={12} />
                  <span>Wallet Disabled</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={12} />
                  <span>Wallet Active</span>
                </span>
              )}
            </div>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-2">
          <Spin size="large" />
          <p className="text-xs text-gray-400 font-medium">Loading patron ledger...</p>
        </div>
      ) : (
        <div className="pt-4 space-y-5 text-[#1B100A]">
          {/* User Profile & Current Wallet Card (Clean Alignment) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E0D0A5] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif font-bold text-base text-[#1C1714]">
                  {userDetails?.name || 'Valued Patron'}
                </span>
                <span className="text-[11px] font-mono bg-white border border-[#D9CEBA] px-2 py-0.5 rounded-md text-gray-600 font-semibold truncate max-w-[200px]">
                  {userDetails?.email || 'Registered Patron'}
                </span>
              </div>
              <p className="text-xs text-[#6B5E52] font-light m-0">
                Manage bespoke flacon reward points, loyalty bonuses, and checkout redemption privileges.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-center">
              <div className="bg-white border border-[#D9CEBA] px-4 py-2 rounded-xl shadow-2xs text-right min-w-[130px]">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Available Balance</span>
                <span className="text-lg font-bold font-mono text-[#8C6D1F] leading-tight block my-0.5">
                  {currentPoints.toLocaleString()} <span className="text-xs font-sans text-gray-500 font-normal">pts</span>
                </span>
                <span className="text-[10.5px] text-gray-500 block">
                  ≈ ₹{Math.floor(currentPoints * 0.1).toLocaleString('en-IN')} value
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleWallet}
                disabled={togglingWallet}
                className={`h-[58px] px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 shrink-0 ${
                  userDetails?.isWalletDisabled
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                }`}
                title={userDetails?.isWalletDisabled ? 'Enable customer wallet' : 'Disable customer wallet'}
              >
                {userDetails?.isWalletDisabled ? (
                  <>
                    <Unlock size={14} />
                    <span>Enable Wallet</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Disable Wallet</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {userDetails?.isWalletDisabled && (
            <Alert
              type="error"
              showIcon
              message={<span className="text-xs font-semibold">This user&apos;s wallet is currently suspended.</span>}
              description={<span className="text-[11px] text-gray-600">The patron cannot redeem loyalty points in cart or checkout until you click &quot;Enable Wallet&quot;.</span>}
              className="rounded-xl border-rose-200"
            />
          )}

          {/* Simple Direct Points Edit Form */}
          <UserWalletAdjustForm
            adjustPoints={adjustPoints}
            setAdjustPoints={setAdjustPoints}
            adjustReason={adjustReason}
            setAdjustReason={setAdjustReason}
            handleAdjustPoints={handleAdjustPoints}
            savingPoints={savingPoints}
            currentPoints={currentPoints}
          />

          {/* User's Points History Table */}
          <UserWalletHistoryTable
            transactions={transactions}
            userName={userDetails?.name}
          />
        </div>
      )}
    </Modal>
  );
}
