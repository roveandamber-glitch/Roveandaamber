"use client";
import React from 'react';
import { Lock, KeyRound, AlertCircle } from 'lucide-react';

export default function ProfileSecurity({
  passwordForm,
  setPasswordForm,
  handleChangePassword,
  isPasswordValid,
  savingPassword
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-serif font-bold text-black mb-1">Security & Password</h3>
        <p className="text-xs text-gray-500 font-light">
          Update your password to keep your patron account and purchases secure.
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-2">Current Password *</label>
          <div className="relative">
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Enter current password"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-[#FAF8F5]/60 focus:bg-white transition-all outline-none"
            />
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-2">New Password *</label>
          <div className="relative">
            <input
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Min 6 characters"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-[#FAF8F5]/60 focus:bg-white transition-all outline-none"
            />
            <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-2">Confirm New Password *</label>
          <div className="relative">
            <input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Repeat new password"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-[#FAF8F5]/60 focus:bg-white transition-all outline-none"
            />
            <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
          <p className="text-[11px] text-[#9A3412] font-medium flex items-center gap-1">
            <AlertCircle size={12} className="text-[#C2410C]" />
            <span>New passwords do not match</span>
          </p>
        )}

        <div className="pt-3">
          <button
            type="submit"
            disabled={!isPasswordValid || savingPassword}
            className={`px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all inline-flex items-center gap-2 ${
              isPasswordValid && !savingPassword
                ? 'bg-black hover:bg-[#262626] text-white shadow-xs cursor-pointer active:scale-95'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
          >
            <Lock size={14} />
            <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

