"use client";
import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { message, Spin } from 'antd';
import authService from '@/services/authService';
import orderService from '@/services/orderService';
import cartService from '@/services/cartService';
import { AuthGateModal } from '@/components/common';

import ProfileSidebar from './components/ProfileSidebar';
import ProfilePersonalDetails from './components/ProfilePersonalDetails';
import ProfileShoppingBag from './components/ProfileShoppingBag';
import ProfileOrderHistory from './components/ProfileOrderHistory';
import ProfileSecurity from './components/ProfileSecurity';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'cart' | 'orders' | 'security'

  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['details', 'cart', 'orders', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Initial & Form State for Change Detection
  const [initialProfile, setInitialProfile] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
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
      if (!authService.isAuthenticated()) {
        setLoading(false);
        setShowAuthModal(true);
        return;
      }

      try {
        const storedUser = localStorage.getItem('user');
        const [profileRes, ordersRes] = await Promise.all([
          authService.getProfile().catch(() => null),
          orderService.getMyOrders().catch(() => null)
        ]);

        if (profileRes?.success && profileRes.user) {
          const u = profileRes.user;
          const loadedData = {
            name: u.name || '',
            phone: u.phone || '',
            address: u.address || '',
            city: u.city || '',
            state: u.state || '',
            pincode: u.pincode || ''
          };
          setUser(u);
          setProfileForm(loadedData);
          setInitialProfile(loadedData);
        } else if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const loadedData = {
            name: parsed.name || '',
            phone: parsed.phone || '',
            address: parsed.address || '',
            city: parsed.city || '',
            state: parsed.state || '',
            pincode: parsed.pincode || ''
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
    profileForm.address.trim() !== (initialProfile.address || '').trim() ||
    profileForm.city.trim() !== (initialProfile.city || '').trim() ||
    profileForm.state.trim() !== (initialProfile.state || '').trim() ||
    profileForm.pincode.trim() !== (initialProfile.pincode || '').trim();

  const isProfileValid = profileForm.name.trim().length >= 2 && isProfileChanged;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isProfileValid) return;

    setSavingProfile(true);
    try {
      const res = await authService.updateProfile(profileForm);
      if (res?.success && res.user) {
        const u = res.user;
        const updatedData = {
          name: u.name || profileForm.name,
          phone: u.phone || profileForm.phone,
          address: u.address || profileForm.address,
          city: u.city || profileForm.city,
          state: u.state || profileForm.state,
          pincode: u.pincode || profileForm.pincode
        };
        setUser(u);
        setProfileForm(updatedData);
        setInitialProfile(updatedData);
        localStorage.setItem('user', JSON.stringify({ ...u, ...updatedData }));
        localStorage.setItem('rove_amber_saved_address', JSON.stringify({
          customerName: updatedData.name,
          phone: updatedData.phone,
          address: updatedData.address,
          city: updatedData.city,
          state: updatedData.state,
          pincode: updatedData.pincode
        }));
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
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between pt-16 sm:pt-20">
        <Navbar />
        <div className="py-32 flex flex-col items-center justify-center space-y-3">
          <Spin size="large" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Profile...</p>
        </div>
        <AuthGateModal
          open={showAuthModal}
          onClose={() => router.replace('/')}
          onCancelAction={() => router.replace('/')}
          redirectPath="/profile"
          title="Sign In to Access Profile"
          subtitle="Private Patron Suite"
          description="Your profile details, personal preferences, and atelier orders are private. Please sign in to access your customer account."
          confirmText="Sign In / Register"
          cancelText="Return to Boutique"
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#1A1A1A] pt-16 sm:pt-20 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-10 flex-1">
        
        {/* Breadcrumb & Welcome Greeting */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D6]">
          <div>
            <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-gray-400 mb-1">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <span className="text-black font-semibold">Account Dashboard</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-black tracking-tight m-0">
              My Account
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#D4AF37]/40 shadow-2xs text-[#3B1D11]">
              <Sparkles size={13} className="text-[#B86526]" />
              <span>ROVE & AMBER Connoisseur</span>
            </span>
          </div>
        </div>

        {/* Connected Master Workspace Card with Fixed Sidebar & Scrollable Content */}
        <div className="bg-white rounded-3xl border border-[#E8E2D6] shadow-xs grid grid-cols-1 lg:grid-cols-12 min-h-[600px] lg:h-[calc(100vh-180px)] overflow-hidden">
          
          {/* Left Column: Fixed Sidebar Menu (Never moves, zero scroll, always in screen) */}
          <div className="lg:col-span-4 xl:col-span-3.5 bg-[#FCFBF8] border-b lg:border-b-0 lg:border-r border-[#ECE6D9] rounded-t-3xl lg:rounded-tr-none lg:rounded-l-3xl flex flex-col justify-between shrink-0 h-full overflow-hidden select-none">
            <ProfileSidebar
              user={user}
              orders={orders}
              cartItems={cartItems}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleLogout={handleLogout}
            />
          </div>

          {/* Right Column: Scrollable Content Workspace (Orders scroll smoothly inside this pane) */}
          <div className="lg:col-span-8 xl:col-span-8.5 p-6 sm:p-8 lg:p-10 bg-white rounded-b-3xl lg:rounded-bl-none lg:rounded-r-3xl flex flex-col justify-between min-w-0 h-full lg:overflow-y-auto profile-scroll-pane">
            <div>
              {activeTab === 'details' && (
                <ProfilePersonalDetails
                  user={user}
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  handleUpdateProfile={handleUpdateProfile}
                  isProfileValid={isProfileValid}
                  isProfileChanged={isProfileChanged}
                  savingProfile={savingProfile}
                />
              )}

              {activeTab === 'cart' && (
                <ProfileShoppingBag
                  cartItems={cartItems}
                  cartTotalAmount={cartTotalAmount}
                  handleUpdateCartQty={handleUpdateCartQty}
                  handleRemoveCartItem={handleRemoveCartItem}
                />
              )}

              {activeTab === 'orders' && (
                <ProfileOrderHistory
                  orders={orders}
                />
              )}

              {activeTab === 'security' && (
                <ProfileSecurity
                  passwordForm={passwordForm}
                  setPasswordForm={setPasswordForm}
                  handleChangePassword={handleChangePassword}
                  isPasswordValid={isPasswordValid}
                  savingPassword={savingPassword}
                />
              )}
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between pt-16 sm:pt-20 font-sans">
          <Navbar />
          <div className="py-32 flex flex-col items-center justify-center space-y-3">
            <Spin size="large" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Profile...</p>
          </div>
          <Footer />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
