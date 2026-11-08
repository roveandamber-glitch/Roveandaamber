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
  
  // Adjustment state
  const [adjustMode, setAdjustMode] = useState('increase'); // 'increase' | 'decrease' | 'set'
  const [adjustPoints, setAdjustPoints] = useState(100);
  const [adjustReason, setAdjustReason] = useState('');
  const [savingPoints, setSavingPoints] = useState(false);
  const [togglingWallet, setTogglingWallet] = useState(false);

  useEffect(() => {
    if (open && targetUser) {
      loadUserWalletData();
    } else {
      setUserDetails(null);
      setTransactions([]);
      setAdjustPoints(100);
      setAdjustReason('');
      setAdjustMode('increase');
    }
  }, [open, targetUser]);

  const loadUserWalletData = async () => {
    const userId = targetUser?.userId || targetUser?.id || targetUser?._id || targetUser?.customer;
    if (!userId) return;

    setLoading(true);
    try {
      const res = await adminService.getUserRewardHistory(userId);
      if (res?.success && res.data) {
        setUserDetails(res.data.user);
        setTransactions(res.data.transactions || []);
      } else {
        setUserDetails({
          id: userId,
          name: targetUser.customer || targetUser.name || 'Valued Patron',
          email: targetUser.email || '',
          rewardPoints: targetUser.rawPoints || targetUser.points || 0,
          isWalletDisabled: Boolean(targetUser.isWalletDisabled)
        });
      }
    } catch (err) {
      console.warn('Failed to load user reward history:', err);
      setUserDetails({
        id: userId,
        name: targetUser.customer || targetUser.name || 'Valued Patron',
        email: targetUser.email || '',
        rewardPoints: targetUser.rawPoints || targetUser.points || 0,
        isWalletDisabled: Boolean(targetUser.isWalletDisabled)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async (e) => {
    e.preventDefault();
    if (!userDetails?.id) return;
    if (!adjustPoints || adjustPoints <= 0) {
      message.warning('Please enter a valid points amount');
      return;
    }

    setSavingPoints(true);
    try {
      const res = await adminService.adjustUserPoints(userDetails.id, {
        action: adjustMode,
        points: adjustPoints,
        reason: adjustReason.trim()
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
    if (!userDetails?.id) return;
    const nextStatus = !userDetails.isWalletDisabled;

    setTogglingWallet(true);
    try {
      const res = await adminService.toggleUserWallet(
        userDetails.id, 
        nextStatus,
        nextStatus ? 'Suspended by admin' : 'Restored by admin'
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
  let previewNewPoints = currentPoints;
  if (adjustMode === 'increase') previewNewPoints = currentPoints + Number(adjustPoints || 0);
  else if (adjustMode === 'decrease') previewNewPoints = Math.max(0, currentPoints - Number(adjustPoints || 0));
  else if (adjustMode === 'set') previewNewPoints = Math.max(0, Number(adjustPoints || 0));

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
                Patron Wallet & Points Management
              </h3>
              <p className="text-[11px] text-gray-500 font-normal m-0">
                View points history, adjust balance, and control wallet status.
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
          {/* User Profile & Current Wallet Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF8F5] via-[#F7F3EB] to-[#F3ECE0] border border-[#E0D0A5] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-[#1C1714]">
                  {userDetails?.name || 'Valued Patron'}
                </span>
                <span className="text-[10px] font-mono bg-white/80 border border-[#D9CEBA] px-2 py-0.5 rounded-md text-gray-600 font-semibold">
                  {userDetails?.email || 'Registered Patron'}
                </span>
              </div>
              <p className="text-xs text-[#5C5248] font-light">
                Manage bespoke flacon reward points, loyalty bonuses, and checkout redemption privileges.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/90 border border-[#D9CEBA] px-4 py-2.5 rounded-xl shadow-2xs text-right">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Available Balance</span>
                <span className="text-xl font-bold font-mono text-[#8C6D1F]">
                  {currentPoints.toLocaleString()} <span className="text-xs font-sans text-gray-500">pts</span>
                </span>
                <span className="text-[10px] text-gray-400 block">
                  ≈ ₹{Math.floor(currentPoints * 0.1).toLocaleString('en-IN')} boutique value
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleWallet}
                disabled={togglingWallet}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                  userDetails?.isWalletDisabled
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                }`}
                title={userDetails?.isWalletDisabled ? 'Enable customer wallet' : 'Disable customer wallet'}
              >
                {userDetails?.isWalletDisabled ? (
                  <>
                    <Unlock size={13} />
                    <span>Enable Wallet</span>
                  </>
                ) : (
                  <>
                    <Lock size={13} />
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
              message={<span className="text-xs font-semibold">This user's wallet is currently suspended.</span>}
              description={<span className="text-[11px] text-gray-600">The patron cannot redeem loyalty points in cart or checkout until you click "Enable Wallet".</span>}
              className="rounded-xl border-rose-200"
            />
          )}

          {/* Points Adjustment Form */}
          <UserWalletAdjustForm
            adjustMode={adjustMode}
            setAdjustMode={setAdjustMode}
            adjustPoints={adjustPoints}
            setAdjustPoints={setAdjustPoints}
            adjustReason={adjustReason}
            setAdjustReason={setAdjustReason}
            handleAdjustPoints={handleAdjustPoints}
            savingPoints={savingPoints}
            currentPoints={currentPoints}
            previewNewPoints={previewNewPoints}
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
