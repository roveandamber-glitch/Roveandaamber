"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Package, 
  Lock, 
  MapPin, 
  Phone, 
  Mail, 
  LogOut, 
  ArrowRight, 
  Sparkles, 
  Save, 
  KeyRound, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus 
} from 'lucide-react';
import { message, Spin } from 'antd';
import authService from '@/services/authService';
import orderService from '@/services/orderService';
import cartService from '@/services/cartService';
import { getImageUrl } from '@/utils/imageHelper';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'cart' | 'orders' | 'security'

  // Initial & Form State for Change Detection
  const [initialProfile, setInitialProfile] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const loadCart = () => {
    setCartItems(cartService.getCart());
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cartChange', loadCart);
    return () => window.removeEventListener('cartChange', loadCart);
  }, []);

  useEffect(() => {
    const initProfile = async () => {
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('userToken') || localStorage.getItem('adminToken') || localStorage.getItem('token') || localStorage.getItem('adminKey')) 
        : null;

      if (!token) {
        message.warning('Please sign in to access your profile.');
        router.push('/login?redirect=/profile');
        return;
      }

      try {
        const storedUser = localStorage.getItem('user');
        const [profileRes, ordersRes] = await Promise.all([
          authService.getProfile().catch(() => null),
          orderService.getMyOrders().catch(() => null)
        ]);

        if (profileRes?.success && profileRes.user) {
          const loadedData = {
            name: profileRes.user.name || '',
            phone: profileRes.user.phone || '',
            address: profileRes.user.address || ''
          };
          setUser(profileRes.user);
          setProfileForm(loadedData);
          setInitialProfile(loadedData);
        } else if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const loadedData = {
            name: parsed.name || '',
            phone: parsed.phone || '',
            address: parsed.address || ''
          };
          setUser(parsed);
          setProfileForm(loadedData);
          setInitialProfile(loadedData);
        }

        if (ordersRes?.success && Array.isArray(ordersRes.data)) {
          setOrders(ordersRes.data);
        }
      } catch (err) {
        console.error('Profile initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, [router]);

  // Validation: Check if anything has actually changed
  const isProfileChanged = 
    profileForm.name.trim() !== (initialProfile.name || '').trim() ||
    profileForm.phone.trim() !== (initialProfile.phone || '').trim() ||
    profileForm.address.trim() !== (initialProfile.address || '').trim();

  const isProfileValid = profileForm.name.trim().length >= 2 && isProfileChanged;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isProfileValid) return;

    setSavingProfile(true);
    try {
      const res = await authService.updateProfile(profileForm);
      if (res?.success && res.user) {
        const updatedData = {
          name: res.user.name || '',
          phone: res.user.phone || '',
          address: res.user.address || ''
        };
        setUser(res.user);
        setProfileForm(updatedData);
        setInitialProfile(updatedData);
        localStorage.setItem('user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('authChange'));
        message.success('Profile details updated successfully.');
      } else {
        message.error(res?.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      message.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Password validation
  const isPasswordValid = 
    passwordForm.currentPassword.trim().length > 0 &&
    passwordForm.newPassword.length >= 6 &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setSavingPassword(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (res?.success) {
        message.success('Password changed successfully.');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        message.error(res?.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error('Change password error:', err);
      message.error(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminKey');
    window.dispatchEvent(new Event('authChange'));
    message.success('Logged out successfully.');
    router.push('/');
  };

  const cartTotalAmount = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  );

  const handleUpdateCartQty = (productId, size, newQty) => {
    cartService.updateQuantity(productId, size, newQty);
  };

  const handleRemoveCartItem = (productId, size, name) => {
    cartService.removeFromCart(productId, size);
    message.info(`Removed ${name} from your bag`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between pt-28">
        <Navbar />
        <div className="py-32 flex flex-col items-center justify-center space-y-3">
          <Spin size="large" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#1A1A1A] pt-24 sm:pt-28 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        
        {/* Breadcrumb & Welcome Greeting */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D6]">
          <div>
            <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-gray-400 mb-1.5">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <span className="text-black font-semibold">Account Dashboard</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-black tracking-tight">
              My Account
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#D4AF37]/40 shadow-2xs text-[#3B1D11]">
              <Sparkles size={13} className="text-[#B86526]" />
              <span>ROVE & AMBER Connoisseur</span>
            </span>
          </div>
        </div>

        {/* 2-Column Split Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cohesive Modern Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Unified Profile Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E2D6] shadow-xs space-y-6">
              
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
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-center">
                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D8]">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Orders</span>
                  <span className="text-sm font-bold text-black font-sans mt-0.5 block">{orders.length}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D8]">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Bag</span>
                  <span className="text-sm font-bold text-black font-sans mt-0.5 block">{cartItems.length}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D8]">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Status</span>
                  <span className="text-xs font-bold text-black font-sans mt-0.5 block">VIP</span>
                </div>
              </div>

              {/* Navigation Menu Links */}
              <nav className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'details'
                      ? 'bg-black text-white shadow-xs font-bold'
                      : 'text-gray-700 hover:bg-[#FAF8F5] hover:text-black'
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
                      : 'text-gray-700 hover:bg-[#FAF8F5] hover:text-black'
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
                      : 'text-gray-700 hover:bg-[#FAF8F5] hover:text-black'
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
                      : 'text-gray-700 hover:bg-[#FAF8F5] hover:text-black'
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
              <div className="pt-2 border-t border-gray-100">
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

            {/* Direct Store Link Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#E8E2D6] shadow-2xs space-y-2">
              <h4 className="text-xs font-serif font-bold text-black">Curated Collections</h4>
              <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                Discover the latest haute couture & lifestyle pieces.
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

          {/* Right Column: Dynamic Workspace */}
          <div className="lg:col-span-8">
            
            {/* TAB 1: Personal Details */}
            {activeTab === 'details' && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D6] shadow-xs space-y-8">
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

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Default Shipping Address</label>
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          placeholder="Apartment/Flat, Street name, City, State, PIN Code..."
                          className="w-full p-4 pl-10 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/5 text-xs bg-[#FAF8F5]/60 focus:bg-white transition-all resize-none outline-none"
                        />
                        <MapPin size={15} className="absolute left-3.5 top-4 text-gray-400" />
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
            )}

            {/* TAB 2: Shopping Bag / Cart inside Profile */}
            {activeTab === 'cart' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-xs space-y-6">
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
            )}

            {/* TAB 3: Order History */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-black mb-1">Order History</h3>
                    <p className="text-xs text-gray-500 font-light">View your recent atelier purchases and live delivery status.</p>
                  </div>

                  <Link href="/orders">
                    <button className="bg-black hover:bg-[#262626] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-2xs">
                      <span>Live Order Tracker</span>
                      <ExternalLink size={13} />
                    </button>
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-[#E8E2D6] shadow-2xs space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-gray-400 border border-[#E8E2D6]">
                      <Package size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-serif font-bold text-black mb-1">No Orders Placed Yet</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto font-light">
                        Discover our artisanal collections of signature Eau de Parfum, aged amber flacons, and discovery sets.
                      </p>
                    </div>
                    <Link href="/shop" className="inline-block pt-2">
                      <button className="bg-black hover:bg-[#262626] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs">
                        Browse Collections
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div 
                        key={order.id || order._id} 
                        className="bg-white rounded-3xl p-6 border border-[#E8E2D6] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xs transition-shadow"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-black">{order.orderId || `#ORD-${order.id}`}</span>
                            <span className={`text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                              order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              order.status === 'Shipped' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                              order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {order.status || 'Placed'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Placed on {new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-sm font-bold text-black font-sans">
                            Total: ₹{(order.total_amount || 0).toLocaleString('en-IN')}
                          </p>
                        </div>

                        <Link href="/orders">
                          <button className="px-5 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-black hover:text-white border border-[#E0D8CA] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer">
                            <span>Track Order</span>
                            <ChevronRight size={13} />
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Security & Password */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D6] shadow-xs space-y-6">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-black mb-1">Security & Password</h3>
                  <p className="text-xs text-gray-500 font-light">Update your password to keep your patron account and purchases secure.</p>
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
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
