"use client";
import React from 'react';
import { User, Mail, Phone, MapPin, Save, CheckCircle2 } from 'lucide-react';

export default function ProfilePersonalDetails({
  user,
  profileForm,
  setProfileForm,
  handleUpdateProfile,
  isProfileValid,
  isProfileChanged,
  savingProfile
}) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-serif font-bold text-black mb-1">Personal Details</h3>
        <p className="text-xs text-gray-500 font-light">
          Update your contact details and default delivery address for seamless atelier orders.
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        
        {/* Account Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Your Full Name"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-[#FAF8F5]/60 focus:bg-white transition-all outline-none"
                />
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full h-12 pl-10 pr-10 rounded-xl border border-gray-200 text-xs bg-gray-100 text-gray-500 cursor-not-allowed font-mono outline-none"
                />
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <CheckCircle2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">Account identifier cannot be changed</span>
            </div>
          </div>
        </div>

        {/* Shipping & Contact */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-2">Contact Phone Number</label>
            <div className="relative">
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-[#FAF8F5]/60 focus:bg-white transition-all outline-none"
              />
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Default Shipping Address */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">Street Address, Apartment / Villa No.</label>
              <div className="relative">
                <input
                  type="text"
                  value={profileForm.address || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="House / Flat No., Apartment / Society Name, Street / Avenue"
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-[#FAF8F5]/60 focus:bg-white transition-all outline-none"
                />
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* City, State, PIN Code (3-column layout matching checkout) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">City</label>
                <input
                  type="text"
                  value={profileForm.city || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-[#FAF8F5]/60 focus:bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">State</label>
                <input
                  type="text"
                  value={profileForm.state || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  placeholder="e.g. Maharashtra"
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-[#FAF8F5]/60 focus:bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">PIN Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={profileForm.pincode || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 400001"
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-[#FAF8F5]/60 focus:bg-white transition-all outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={!isProfileValid || savingProfile}
            className={`px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all inline-flex items-center gap-2 ${
              isProfileValid && !savingProfile
                ? 'bg-black hover:bg-[#262626] text-white shadow-xs cursor-pointer active:scale-95'
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
          >
            <Save size={14} />
            <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
          </button>

          {isProfileChanged && (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Unsaved Changes</span>
            </span>
          )}
        </div>

      </form>
    </div>
  );
}

