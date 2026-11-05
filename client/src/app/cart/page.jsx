"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Lock,
  ArrowLeft,
  Gift,
  AlertCircle,
  Check,
  User,
  ExternalLink,
  Edit3,
  Tag,
  Loader2,
  Coins,
  Sparkles,
  Wallet,
  CreditCard
} from 'lucide-react';
import { Modal, Form, Input, message, ConfigProvider } from 'antd';
import cartService from '@/services/cartService';
import orderService from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';
import GiftPersonalizeModal from '@/components/cart/GiftPersonalizeModal';
import ReturnPolicyModal from '@/components/product/ReturnPolicyModal';
import { showLuxuryDeleteModal, AuthGateModal } from '@/components/common';
import authService from '@/services/authService';

const cartTheme = {
  token: {
    colorPrimary: '#000000',
    colorError: '#9A3412',
    colorErrorBorder: '#FDBA74',
    colorErrorHover: '#C2410C',
    borderRadius: 12,
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    Input: {
      activeBorderColor: '#000000',
      hoverBorderColor: '#444444',
      paddingBlock: 9,
    },
    Form: {
      itemMarginBottom: 16,
      verticalLabelPadding: '0 0 5px',
    }
  }
};

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [rewardPointsUsed, setRewardPointsUsed] = useState(0);
  const [rewardDiscountAmount, setRewardDiscountAmount] = useState(0);
  const [availableRewardPoints, setAvailableRewardPoints] = useState(0);
  const [rewardRate, setRewardRate] = useState(100);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [giftOptions, setGiftOptions] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [useGiftAddress, setUseGiftAddress] = useState(false);
  const [showReturnPolicyModal, setShowReturnPolicyModal] = useState(false);
  const [checkoutForm] = Form.useForm();

  const handleUpgradeToCombo = async (item) => {
    try {
      await cartService.upgradeToCombo(item.itemId || item.productId || item.id, item.size);
      message.success('Upgraded to 50ml + 2ml combo');
      loadCart();
    } catch (err) {
      message.error('Failed to upgrade item');
    }
  };

  // Initialize and load cart data safely on client
  const loadCart = useCallback(() => {
    setCartItems(cartService.getCart());
    const summary = cartService.getCartSummary();
    if (summary && summary.coupon && summary.coupon.code) {
      setAppliedCoupon(summary.coupon);
      setDiscountAmount(Number(summary.discountAmount) || Number(summary.coupon.discountAmount) || 0);
    } else {
      setAppliedCoupon(null);
      setDiscountAmount(0);
    }

    if (summary) {
      setRewardPointsUsed(Number(summary.rewardPointsUsed) || 0);
      setRewardDiscountAmount(Number(summary.rewardDiscountAmount) || 0);
      if (summary.availableRewardPoints !== undefined) {
        setAvailableRewardPoints(Number(summary.availableRewardPoints) || 0);
      }
      if (summary.rewardRate) {
        setRewardRate(Number(summary.rewardRate) || 100);
      }
    } else {
      const user = authService.getUser();
      if (user && user.rewardPoints !== undefined) {
        setAvailableRewardPoints(Number(user.rewardPoints) || 0);
      }
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    document.title = 'Shopping Bag | ROVE & AMBER Fine Fragrance';

    const verifyAuth = () => {
      if (!authService.isAuthenticated()) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        setIsAuthPromptOpen(true);
        return false;
      }
      setIsAuthenticated(true);
      setIsCheckingAuth(false);
      setIsAuthPromptOpen(false);
      return true;
    };

    if (!verifyAuth()) {
      setIsCartLoading(false);
      return;
    }

    // Immediately load any cached in-memory cart items to eliminate initial empty flash
    loadCart();
    const immediateCart = cartService.getCart();
    if (immediateCart && immediateCart.length > 0) {
      setIsCartLoading(false);
    }

    cartService.fetchCart()
      .then(() => {
        loadCart();
      })
      .catch((err) => {
        console.warn('Failed to fetch cart:', err);
      })
      .finally(() => {
        setIsCartLoading(false);
      });

    const liveGifts = cartService.getGiftOptions();
    if (liveGifts && (liveGifts.isGift || liveGifts.giftRecipient?.name)) {
      setGiftOptions({
        recipientName: liveGifts.giftRecipient?.name || '',
        recipientPhone: liveGifts.giftRecipient?.phone || '',
        recipientAddress: liveGifts.giftRecipient?.address || '',
        occasion: liveGifts.occasion || '',
        giftMessage: liveGifts.giftMessage || '',
        giftWrap: liveGifts.giftWrap
      });
    }

    window.addEventListener('cartChange', loadCart);
    const onAuthChange = () => {
      if (verifyAuth()) {
        setIsCartLoading(true);
        cartService.fetchCart()
          .then(() => loadCart())
          .finally(() => setIsCartLoading(false));
      } else {
        setIsCartLoading(false);
      }
    };

    window.addEventListener('authChange', onAuthChange);
    return () => {
      window.removeEventListener('cartChange', loadCart);
      window.removeEventListener('authChange', onAuthChange);
    };
  }, [loadCart]);

  // Calculations
  const totalItemCount = cartItems.reduce(
    (acc, item) => acc + (parseInt(item.quantity, 10) || 1),
    0
  );

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  );

  // Final Total calculates subtotal minus verified promotional and reward points discounts
  const finalTotal = Math.max(0, subtotal - discountAmount - rewardDiscountAmount);

  // Quantity updates with min (1) and maxStock validation
  const handleUpdateQty = (productId, size, currentQty, delta, maxStock) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    const stockLimit = maxStock || 99;
    if (newQty > stockLimit) {
      message.warning(`Maximum available atelier inventory is ${stockLimit} units.`);
      return;
    }

    cartService.updateQuantity(productId, size, newQty);
  };

  const handleRemoveItem = (productId, size, name) => {
    showLuxuryDeleteModal({
      title: 'Remove Fragrance',
      itemName: `${name} (${size})`,
      itemType: 'flacon from your bag',
      description: `Remove ${name} (${size}) from your shopping bag? You can always add it again later from the boutique collection.`,
      confirmText: 'Remove Item',
      cancelText: 'Keep in Bag',
      onConfirm: () => {
        cartService.removeFromCart(productId, size);
        message.info(`Removed ${name} from your bag`);
      }
    });
  };

  const handleClearCart = () => {
    showLuxuryDeleteModal({
      title: 'Clear Shopping Bag',
      itemType: 'all items in your bag',
      description: 'Are you sure you want to remove all selected fragrance flacons and coffrets from your luxury bag?',
      confirmText: 'Clear Entire Bag',
      cancelText: 'Keep Items',
      onConfirm: () => {
        cartService.clearCart();
        message.info('Shopping bag cleared');
      }
    });
  };

  // Promo code / voucher handling connecting directly to backend Coupon verification
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) {
      message.warning('Please enter a promotional voucher code.');
      return;
    }

    setPromoLoading(true);
    try {
      const res = await cartService.applyCoupon(cleanCode);
      if (res?.success) {
        message.success(res.message || `Promotional code "${cleanCode}" applied successfully!`);
        setPromoCode('');
        loadCart();
      } else {
        message.error(res?.message || 'Invalid promotional voucher code.');
      }
    } catch (err) {
      message.error(err.message || 'Failed to apply promotional coupon.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setPromoLoading(true);
    try {
      const res = await cartService.removeCoupon();
      message.info(res?.message || 'Promotional coupon removed from shopping bag.');
      setAppliedCoupon(null);
      setDiscountAmount(0);
      loadCart();
    } catch (err) {
      message.error(err.message || 'Failed to remove promotional coupon.');
    } finally {
      setPromoLoading(false);
    }
  };

  // Patron Privilege Points Toggle handler
  const handleToggleRewards = async () => {
    if (rewardLoading) return;
    if (rewardPointsUsed > 0) {
      await handleRemoveRewards();
    } else {
      if (availableRewardPoints <= 0) {
        message.info('You have 0 privilege points available. Earn points on this order!');
        return;
      }
      const maxPtsBySubtotal = Math.floor(subtotal / (rewardRate / 100));
      const pointsToApply = Math.min(availableRewardPoints, maxPtsBySubtotal);
      if (pointsToApply <= 0) {
        message.warning('Subtotal is too low to redeem privilege points.');
        return;
      }

      setRewardLoading(true);
      try {
        await cartService.applyRewards(pointsToApply);
        message.success(`${pointsToApply.toLocaleString()} privilege points applied! (Saved ₹${Math.floor(pointsToApply * (rewardRate / 100)).toLocaleString('en-IN')})`);
        loadCart();
      } catch (err) {
        message.error(err.message || 'Failed to apply reward points.');
      } finally {
        setRewardLoading(false);
      }
    }
  };

  // Patron Privilege Points Remove handler
  const handleRemoveRewards = async () => {
    setRewardLoading(true);
    try {
      await cartService.removeRewards();
      message.info('Loyalty privilege points discount removed.');
      loadCart();
    } catch (err) {
      message.error(err.message || 'Failed to remove reward points.');
    } finally {
      setRewardLoading(false);
    }
  };

  // Check verified patron authentication before starting checkout
  const handleStartCheckout = () => {
    if (!authService.isAuthenticated()) {
      setIsAuthPromptOpen(true);
      return;
    }

    router.push('/checkout');
  };

  // Toggle recipient address from gift options if available
  const handleToggleGiftAddress = (checked) => {
    setUseGiftAddress(checked);
    if (checked && giftOptions?.recipientName) {
      checkoutForm.setFieldsValue({
        customerName: giftOptions.recipientName,
        phone: giftOptions.recipientPhone || checkoutForm.getFieldValue('phone') || '',
        address: giftOptions.recipientAddress || checkoutForm.getFieldValue('address') || ''
      });
    } else {
      // Revert to user profile
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          checkoutForm.setFieldsValue({
            customerName: user.name || '',
            phone: user.phone || '',
            address: user.address || ''
          });
        } catch (e) {
          console.warn('Could not revert to user profile', e);
        }
      }
    }
  };

  // Submit order using verified backend contract: { customerName, phone, address, items }
  const handlePlaceOrder = async (values) => {
    if (cartItems.length === 0) return;
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const orderPayload = {
        customerName: values.customerName.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        items: cartItems.map((item) => ({
          productId: parseInt(item.productId || item.id, 10),
          quantity: parseInt(item.quantity, 10) || 1,
          size: (item.size || '50ML').toUpperCase()
        }))
      };

      const response = await orderService.createOrder(orderPayload);
      if (response?.success && response.data) {
        setOrderSuccessData(response.data);
        // Clear cart ONLY after verified successful order response
        cartService.clearCart();
        message.success('Your boutique order has been registered successfully!');
      } else {
        const errMsg = response?.message || 'Failed to place order. Please review your details.';
        setCheckoutError(errMsg);
        message.error(errMsg);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const errMsg = err.response?.data?.message || 'Unable to connect to order atelier. Please verify your connection.';
      setCheckoutError(errMsg);
      message.error(errMsg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex flex-col justify-between">
        <Navbar />
        <div className="pt-28 pb-16 max-w-6xl mx-auto px-4 w-full">
          <div className="h-8 w-48 bg-[#ECE7DE] rounded animate-pulse mb-4" />
          <div className="h-4 w-80 bg-[#ECE7DE] rounded animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  // Strict Authentication Gate for Private Cart Route
  if (isCheckingAuth || !isAuthenticated) {
    return (
      <ConfigProvider theme={cartTheme}>
        <div className="min-h-screen bg-[#FAF9F7] font-sans flex flex-col justify-between selection:bg-[#E5D7C0]">
          <Navbar />
          <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1C120C] border border-[#D4AF37]/40 text-[#ECC880] flex items-center justify-center mx-auto mb-4 shadow-md">
              <Lock size={26} strokeWidth={2.2} className="text-[#DEB368]" />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-[0.22em] text-[#8C6D1F] block mb-2">
              Private Patron Suite
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 mb-2">
              Private Shopping Bag
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-light max-w-md mx-auto leading-relaxed mb-6">
              Access to your shopping bag, preserved artisanal flacons, and atelier checkout is reserved for registered patrons. Please sign in to access your bag.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthPromptOpen(true)}
              className="inline-flex items-center gap-2 bg-[#1C120C] text-[#ECC880] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer shadow-sm"
            >
              <span>Sign In to Access Bag</span>
              <ArrowRight size={14} />
            </button>
          </main>
          <Footer />

          {/* Strict Authentication Gate Modal */}
          <AuthGateModal
            open={isAuthPromptOpen}
            onClose={() => router.replace('/')}
            onCancelAction={() => router.replace('/')}
            redirectPath="/cart"
            title="Sign In to Access Your Bag"
            subtitle="Atelier Customer Privilege"
            description="Your shopping bag, preserved fragrance flacons, and white-glove delivery options are private to your customer account. Please sign in or register to access your shopping bag."
            confirmText="Sign In / Register"
            cancelText="Return to Boutique"
          />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-sans text-black selection:bg-[#B8860B] selection:text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-24 md:pb-20 w-full flex-1">
        
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-gray-400 mb-6 uppercase tracking-widest">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/shop" className="hover:text-black transition-colors">Collections</Link>
          <span className="text-gray-300">/</span>
          <span className="text-black font-semibold">Shopping Bag</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#ECE7DE]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] text-[10px] font-bold uppercase tracking-widest">
                Atelier Checkout
              </span>
              <span className="text-xs text-gray-500">
                {isCartLoading ? (
                  <span className="inline-block w-24 h-3 bg-[#EAE3D2] rounded animate-pulse align-middle" />
                ) : (
                  `${totalItemCount} ${totalItemCount === 1 ? 'fragrance flacon' : 'fragrance flacons'}`
                )}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-black tracking-tight">
              Your Shopping Bag
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light mt-1.5 max-w-xl leading-relaxed">
              Review your preserved signature fragrances, review complimentary packaging, and proceed to secure boutique order registration.
            </p>
          </div>

          {!isCartLoading && cartItems.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearCart}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 border border-[#E0D8CA] hover:border-red-200 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* CART CONTENT: SKELETON, EMPTY STATE OR ACTIVE ITEMS */}
        {isCartLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
            {/* Left Column: Product Card Skeleton */}
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-white rounded-2xl border border-[#E8DFC9] shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[#ECE7DE] flex items-center justify-between">
                  <div className="h-4 w-36 bg-[#ECE7DE] rounded" />
                  <div className="h-4 w-20 bg-[#F4EFE6] rounded" />
                </div>
                <div className="divide-y divide-[#ECE7DE]">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0 w-full sm:w-auto">
                        <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-[#F4EFE6] shrink-0 border border-[#EAE3D2]" />
                        <div className="space-y-2.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-20 bg-[#ECE7DE] rounded" />
                            <div className="h-3 w-16 bg-[#F4EFE6] rounded" />
                          </div>
                          <div className="h-5 w-44 sm:w-64 bg-[#ECE7DE] rounded" />
                          <div className="h-3 w-32 bg-[#F4EFE6] rounded" />
                          <div className="h-5 w-24 bg-[#E0D0A5]/60 rounded mt-1" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <div className="h-9 w-28 rounded-full bg-[#F4EFE6] border border-[#EAE3D2]" />
                        <div className="h-8 w-8 rounded-full bg-[#F4EFE6]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complimentary Gifting Bar Skeleton */}
              <div className="rounded-2xl border border-[#E8DFC9] bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FAF3E0] border border-[#E0D0A5]" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-40 bg-[#ECE7DE] rounded" />
                    <div className="h-2.5 w-56 bg-[#F4EFE6] rounded" />
                  </div>
                </div>
                <div className="h-7 w-20 rounded-full bg-[#F4EFE6]" />
              </div>
            </div>

            {/* Right Column: Order Summary Skeleton */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-[#E8DFC9] shadow-xs p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-[#ECE7DE]">
                  <div className="h-5 w-32 bg-[#ECE7DE] rounded" />
                  <div className="h-4 w-12 bg-[#F4EFE6] rounded" />
                </div>
                <div className="h-10 rounded-full bg-[#F4EFE6] border border-[#EAE3D2]" />
                <div className="h-16 rounded-xl bg-[#FAF9F7] border border-[#ECE7DE]" />
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-24 bg-[#F4EFE6] rounded" />
                    <div className="h-3.5 w-16 bg-[#F4EFE6] rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3.5 w-28 bg-[#F4EFE6] rounded" />
                    <div className="h-3.5 w-20 bg-[#F4EFE6] rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3.5 w-20 bg-[#F4EFE6] rounded" />
                    <div className="h-3.5 w-14 bg-[#F4EFE6] rounded" />
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#ECE7DE]">
                    <div className="h-5 w-20 bg-[#ECE7DE] rounded" />
                    <div className="h-6 w-24 bg-[#E0D0A5]/70 rounded" />
                  </div>
                </div>
                <div className="h-12 w-full rounded-full bg-[#E8DFC9]" />
                <div className="h-8 w-full rounded bg-[#FAF9F7]" />
              </div>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* LUXURY EMPTY STATE */
          <div className="py-16 sm:py-24 text-center max-w-xl mx-auto flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FAF3E0] border border-[#E0D0A5] flex items-center justify-center text-[#B8860B] shadow-sm mb-6">
              <ShoppingBag size={36} strokeWidth={1.4} />
            </div>

            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6D1F] mb-2 block">
              Atelier Wardrobe
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-black tracking-tight mb-2">
              Your Shopping Bag is Empty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed max-w-md mb-8">
              You haven&apos;t added any signature flacons or discovery sets to your shopping bag yet. Explore our handcrafted creations or discover curated gifts.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-black text-white text-xs uppercase font-bold tracking-widest hover:bg-[#262626] transition-all shadow-md group cursor-pointer"
              >
                <span>Explore All Fragrances</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/gifts"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-black border border-[#E0D8CA] text-xs uppercase font-semibold tracking-wider hover:border-black transition-all shadow-2xs"
              >
                <Gift size={14} className="text-[#B8860B]" />
                <span>Gift Collections</span>
              </Link>
            </div>

            {/* Luxury Gifting Guarantees */}
            <div className="grid grid-cols-3 gap-4 pt-12 mt-12 border-t border-[#ECE7DE] w-full text-center">
              <div>
                <h4 className="font-serif text-sm font-semibold text-black">Artisanal Sillage</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">High Extrait Concentration</p>
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-black">Complimentary Samples</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Included with every bottle</p>
              </div>
              <div>
                <h4 className="font-serif text-sm font-semibold text-black">Gold Foil Box</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Complimentary with every order</p>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE 2-COLUMN LUXURY CART GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: SINGLE PRODUCT CARD (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Single Luxury Product Card containing all cart items */}
              <div className="bg-white rounded-2xl border border-[#E8DFC9] shadow-xs overflow-hidden">
                {/* Products List inside single card with dividers */}
                <div className="divide-y divide-[#ECE7DE]">
                  {cartItems.map((item) => {
                    const itemKey = `${item.productId || item.id}_${item.size || '50ML'}`;
                    const price = Number(item.price) || 0;
                    const itemTotal = price * (parseInt(item.quantity, 10) || 1);
                    const maxStock = item.maxStock !== undefined ? item.maxStock : 99;
                    const isMaxReached = item.quantity >= maxStock;

                    return (
                      <div
                        key={itemKey}
                        className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between transition-colors hover:bg-[#FAF9F7]/40"
                      >
                        {/* Fixed Size Thumbnail & Title */}
                        <div className="flex items-center gap-4 flex-1 min-w-0 w-full sm:w-auto">
                          <Link 
                            href={`/product/${item.productId || item.id}`}
                            className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-[#FAF7F2] overflow-hidden shrink-0 flex items-center justify-center p-2 border border-[#EAE3D2] hover:border-[#B86526] transition-colors group"
                          >
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.target.src = '/images/perfumes/gemini_amber_royal.jpg'; }}
                            />
                          </Link>

                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9.5px] tracking-[0.2em] uppercase font-semibold text-[#B86526]">
                                Fine Fragrance
                              </span>
                              <span className="w-1 h-1 rounded-full bg-[#D5C9B8]" />
                              <span className="text-[10px] text-gray-700 font-bold bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8DFC9]">
                                Size: {item.size || '50ML'}
                              </span>

                              {/* Return Policy Badges */}
                              {(item.isCombo || item.hasSample || (item.size && item.size.includes('+'))) ? (
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <ShieldCheck size={11} className="text-emerald-600" />
                                  <span>7-Day Return Guarantee Included</span>
                                </span>
                              ) : (item.isSampleOnly || (item.size && item.size.includes('SAMPLE') && !item.size.includes('+'))) ? (
                                <span className="text-[9.5px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                                  Discovery Sample (Non-Returnable)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-[#8C6D1F] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                  <AlertCircle size={10} className="text-[#8C6D1F]" />
                                  <span>Non-Returnable (Final Sale)</span>
                                </span>
                              )}
                            </div>

                            <Link 
                              href={`/product/${item.productId || item.id}`}
                              className="text-base sm:text-lg font-serif font-medium text-[#1A1A1A] hover:text-[#B86526] transition-colors block truncate"
                            >
                              {item.name}
                            </Link>
                            
                            <p className="text-xs sm:text-sm font-semibold text-[#1A1A1A] font-sans">
                              ₹{price.toLocaleString('en-IN')}
                              <span className="text-[11px] font-normal text-gray-400 ml-1">/ unit</span>
                            </p>

                            {/* Upgrade Option for Standalone Bottle */}
                            {!(item.isCombo || item.hasSample || (item.size && item.size.includes('+'))) && !(item.isSampleOnly || (item.size && item.size.includes('SAMPLE') && !item.size.includes('+'))) && (
                              <div className="mt-2 p-2 rounded-xl bg-[#FAF6EE] border border-[#E0D0A5] flex items-center justify-between gap-3 max-w-md">
                                <div className="min-w-0">
                                  <p className="text-[10.5px] font-bold text-[#8C6D1F] m-0 flex items-center gap-1">
                                    <Sparkles size={11} className="text-[#B8860B]" />
                                    <span>Add 2ml Companion Sample & Return Guarantee (+₹199)</span>
                                  </p>
                                  <p className="text-[9.5px] text-gray-500 m-0">
                                    Test at home first — return sealed 50ml flacon if not satisfied.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUpgradeToCombo(item)}
                                  className="px-3 py-1 rounded-full bg-black text-white hover:bg-stone-800 text-[9.5px] uppercase font-bold tracking-wider transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
                                >
                                  + Upgrade
                                </button>
                              </div>
                            )}

                            {/* Note for Combo */}
                            {(item.isCombo || item.hasSample || (item.size && item.size.includes('+'))) && (
                              <p className="text-[10px] text-emerald-800 m-0 leading-tight">
                                ★ <em>Includes 2ml companion sample. Test on skin at home; keep 50ml box sealed for 100% full refund within 7 days.</em>
                              </p>
                            )}

                            {isMaxReached && (
                              <span className="text-[10px] text-amber-700 font-medium block">
                                Max available atelier inventory ({maxStock})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls & Line Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F0EBE0]">
                          
                          {/* Quantity Counter */}
                          <div className="inline-flex items-center bg-[#FAF7F2] border border-[#E0D8CA] rounded-full p-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.productId || item.id, item.size, item.quantity, -1, maxStock)}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} strokeWidth={2} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-[#1A1A1A] font-sans">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.productId || item.id, item.size, item.quantity, 1, maxStock)}
                              disabled={isMaxReached}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} strokeWidth={2} />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[85px]">
                            <span className="text-base sm:text-lg font-bold text-[#1A1A1A] font-sans block">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Remove Action */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId || item.id, item.size, item.name)}
                            className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-red-50 text-gray-400 hover:text-red-600 border border-[#E8DFC9] hover:border-red-200 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                            title="Remove fragrance"
                            aria-label={`Remove ${item.name} from bag`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Card Footer: Continue Exploring Collections inside the card */}
                <div className="p-4 sm:p-5 bg-[#FAF9F7]/80 border-t border-[#ECE7DE] flex items-center justify-between">
                  <Link 
                    href="/shop"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:text-[#B8860B] transition-colors group cursor-pointer"
                  >
                    <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Continue Exploring Collections</span>
                  </Link>

                  <span className="text-[11px] text-[#8C7A6B] font-medium hidden sm:inline-block">
                    {cartItems.length} {cartItems.length === 1 ? 'fragrance flacon' : 'fragrance flacons'} in bag
                  </span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: STICKY ORDER SUMMARY (4 Cols) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DFC9] shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#ECE7DE] pb-4">
                  <h3 className="text-xl font-serif font-bold text-black tracking-tight">
                    Order Summary
                  </h3>
                  <span className="text-[11px] font-semibold text-[#8C6D1F] bg-[#FAF3E0] px-3 py-1 rounded-full border border-[#E8DEC8]">
                    {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-sans font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>White-Glove Courier Delivery</span>
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">COMPLIMENTARY</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Signature Packaging & Samples</span>
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">INCLUDED</span>
                  </div>

                  {discountAmount > 0 && appliedCoupon && (
                    <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-1.5">
                        <Tag size={13} className="text-emerald-700" />
                        <span className="font-bold uppercase tracking-wider text-[11px]">
                          {appliedCoupon.code} {appliedCoupon.discountType === 'percentage' ? `(${appliedCoupon.discountValue}% OFF)` : `(₹${appliedCoupon.discountValue} OFF)`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-emerald-700">-₹{discountAmount.toLocaleString('en-IN')}</span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-gray-400 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer ml-1"
                          title="Remove coupon"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {rewardDiscountAmount > 0 && (
                    <div className="flex justify-between items-center text-[#8C6D1F] bg-gradient-to-r from-[#FAF6EC] to-[#F5ECE0] px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50 shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-[#B8860B]/15 flex items-center justify-center shrink-0">
                          <Sparkles size={11} className="text-[#B8860B]" />
                        </div>
                        <span className="font-semibold text-xs text-[#6B5115] tracking-wide truncate">
                          Privilege Points ({rewardPointsUsed.toLocaleString()} pts)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-sans font-bold text-xs text-[#8C6D1F]">-₹{rewardDiscountAmount.toLocaleString('en-IN')}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRewards();
                          }}
                          disabled={rewardLoading}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-stone-200/60 text-xs transition-colors cursor-pointer"
                          title="Remove privilege points"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline text-sm font-bold text-black pt-3 border-t border-[#ECE7DE] font-serif">
                    <span className="text-base text-gray-800">Estimated Total</span>
                    <span className="font-sans text-2xl font-bold text-black tracking-tight">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input Form or Active Coupon Card */}
                {appliedCoupon ? (
                  <div className="pt-2">
                    <label className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#8C7A6B] block mb-1.5">
                      Applied Promotional Voucher
                    </label>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6ED] border border-[#E8DFC9]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          <Check size={14} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-[#8C6D1F] uppercase tracking-wider">
                              {appliedCoupon.code}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                              Applied
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 m-0">
                            {appliedCoupon.description || 'Promotional coupon active'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        disabled={promoLoading}
                        className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline px-2 py-1 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <label className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#8C7A6B] block mb-1.5">
                      Promotional Voucher / Patron Code
                    </label>
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. ROVE101"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoLoading}
                        className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-[#FAF9F7] border border-[#E0D8CA] focus:outline-none focus:border-black uppercase text-black placeholder-gray-400 font-mono"
                      />
                      <button
                        type="submit"
                        disabled={promoLoading || !promoCode.trim()}
                        className="bg-[#1C1714] hover:bg-black text-[#ECC880] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0 shadow-xs"
                      >
                        {promoLoading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Patron Privilege Wallet Card with High-Precision Luxury Toggle */}
                <div className="pt-3 border-t border-[#ECE7DE]">
                  <div 
                    onClick={handleToggleRewards}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none ${
                      rewardPointsUsed > 0 
                        ? 'bg-gradient-to-r from-[#FAF6EC] via-[#FFFDF9] to-[#F5ECE0] border-[#D4AF37]/60 shadow-xs' 
                        : 'bg-[#FAF9F7] hover:bg-[#F7F4EC] border-[#E8DFC9] hover:border-[#D5C7A8]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-2xs border ${
                          rewardPointsUsed > 0 
                            ? 'bg-gradient-to-br from-[#E5B869] to-[#B8860B] text-white border-[#8C6D1F]' 
                            : 'bg-white text-[#B8860B] border-[#E5DAC6]'
                        }`}>
                          <Coins size={18} strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-[13px] font-bold text-[#1A1A1A] tracking-tight">
                              Patron Privilege Wallet
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              rewardPointsUsed > 0 
                                ? 'bg-[#B8860B] text-white shadow-2xs' 
                                : 'bg-[#FAF0D4] text-[#8C6D1F] border border-[#E8DEC8]'
                            }`}>
                              {availableRewardPoints.toLocaleString()} pts
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A6B5D] mt-0.5 font-light leading-snug">
                            {rewardPointsUsed > 0 ? (
                              <span className="text-emerald-800 font-semibold flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                {rewardPointsUsed.toLocaleString()} pts applied (Saving ₹{rewardDiscountAmount.toLocaleString('en-IN')})
                              </span>
                            ) : availableRewardPoints > 0 ? (
                              <span>
                                Tap to redeem up to {availableRewardPoints.toLocaleString()} pts (Save ₹{Math.floor(availableRewardPoints * (rewardRate / 100)).toLocaleString('en-IN')})
                              </span>
                            ) : (
                              <span>Earn privilege points on this order for future acquisitions</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Luxury Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={rewardPointsUsed > 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRewards();
                        }}
                        disabled={rewardLoading || (availableRewardPoints <= 0 && rewardPointsUsed === 0)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                          rewardPointsUsed > 0 
                            ? 'bg-[#1C1714] shadow-[0_0_8px_rgba(212,175,55,0.35)]' 
                            : 'bg-[#D6CEC2] hover:bg-[#C9BFB0]'
                        }`}
                        title={rewardPointsUsed > 0 ? 'Click to remove privilege points' : 'Click to apply privilege points'}
                      >
                        <span
                          className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full shadow-md ring-0 transition-transform duration-300 ease-in-out ${
                            rewardPointsUsed > 0 
                              ? 'translate-x-5 bg-gradient-to-br from-[#F6D389] to-[#DEB368]' 
                              : 'translate-x-0 bg-white'
                          }`}
                        >
                          {rewardLoading && (
                            <Loader2 size={10} className="animate-spin text-[#241306]" />
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Proceed to Checkout CTA */}
                <button
                  type="button"
                  onClick={handleStartCheckout}
                  className="w-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-105 active:scale-[0.99] py-3.5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 shadow-md shadow-amber-950/10 transition-all cursor-pointer group"
                >
                  <Lock size={13} strokeWidth={2.2} />
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={13} strokeWidth={2.2} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Trust and Payment Security Badges */}
                <div className="pt-3 border-t border-[#ECE7DE] grid grid-cols-3 gap-2 text-[10px] text-gray-500 text-center">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-[#FAF9F7] border border-[#F0EAE0]">
                    <ShieldCheck size={14} className="text-[#B8860B] mb-1" />
                    <span className="font-semibold text-gray-700 text-[10px]">100% Authentic</span>
                    <span className="text-[9px] text-gray-400">Atelier Perfume</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-[#FAF9F7] border border-[#F0EAE0]">
                    <Sparkles size={14} className="text-[#B8860B] mb-1" />
                    <span className="font-semibold text-gray-700 text-[10px]">2ml Guarantee</span>
                    <span className="text-[9px] text-gray-400">Complimentary</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-[#FAF9F7] border border-[#F0EAE0]">
                    <Lock size={14} className="text-[#B8860B] mb-1" />
                    <span className="font-semibold text-gray-700 text-[10px]">256-Bit SSL</span>
                    <span className="text-[9px] text-gray-400">Encrypted</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
        {/* Gift Studio Personalization Popup Modal */}
      <GiftPersonalizeModal
        open={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        initialData={giftOptions}
        onSave={(data) => {
          setGiftOptions(data);
        }}
      />
    </main>

      {/* MODAL: AUTHENTICATION GATE PROMPT (For Unauthenticated Checkout Attempts) */}
      <AuthGateModal
        open={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        redirectPath="/checkout"
        title="Sign In to Complete Checkout"
        subtitle="Atelier Customer Account"
        description="To guarantee verified dispatch notifications, insured white-glove courier tracking, and order history, please sign in or register your customer profile."
        confirmText="Sign In to Checkout"
        cancelText="Continue Reviewing Bag"
      />

      {/* MODAL: CHECKOUT INFORMATION & ORDER PLACEMENT */}
      <Modal
        open={isCheckoutModalOpen}
        onCancel={() => !checkoutLoading && setIsCheckoutModalOpen(false)}
        footer={null}
        centered
        width={540}
        className="font-sans"
      >
        <ConfigProvider theme={cartTheme}>
          {orderSuccessData ? (
            /* ORDER SUCCESS CONFIRMATION VIEW */
            <div className="p-4 sm:p-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-700 block mb-1">
                  Boutique Order Confirmed
                </span>
                <h3 className="text-2xl font-serif font-normal text-black">
                  Thank You for Your Order
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Order Reference: <strong className="font-mono text-black font-semibold">{orderSuccessData.orderId || `#ORD-${orderSuccessData.id || orderSuccessData._id}`}</strong>
                </p>
              </div>

              {/* Order Confirmation Details Box */}
              <div className="p-4 bg-[#FAF9F7] rounded-xl border border-[#E8DFC9] text-left space-y-2 text-xs">
                <div className="flex justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="font-bold text-black font-sans text-sm">
                    ₹{(orderSuccessData.total_amount || finalTotal).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipient Name:</span>
                  <span className="font-semibold text-black">{orderSuccessData.customer_name || 'Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact Phone:</span>
                  <span className="font-semibold text-black">{orderSuccessData.phone}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 shrink-0">Delivery Address:</span>
                  <span className="font-semibold text-black text-right max-w-[220px] truncate">{orderSuccessData.address}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500">Order Status:</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {orderSuccessData.status || 'Processing'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutModalOpen(false);
                    setOrderSuccessData(null);
                    router.push('/orders');
                  }}
                  className="w-full bg-black hover:bg-[#262626] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-xs cursor-pointer"
                >
                  View in My Orders
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCheckoutModalOpen(false);
                    setOrderSuccessData(null);
                    router.push('/shop');
                  }}
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:text-black transition-colors"
                >
                  Continue Exploring Fragrances
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT DETAILS SUBMISSION FORM */
            <div className="p-2 sm:p-4 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C6D1F] block mb-1">
                  Dispatch Details
                </span>
                <h3 className="text-2xl font-serif font-normal text-black">
                  Confirm Delivery Information
                </h3>
                <p className="text-xs text-gray-500 font-light mt-0.5">
                  Confirm recipient and dispatch address for {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} (Total: ₹{finalTotal.toLocaleString('en-IN')}).
                </p>
              </div>

              {/* Server Error Alert Banner if any */}
              {checkoutError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Gift Recipient Sync Toggle if Gift Options Exist */}
              {giftOptions?.recipientName && (
                <div className="p-3 bg-[#FAF6ED] rounded-xl border border-[#E8DFC9] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Gift size={15} className="text-[#B8860B]" />
                    <span>Send directly to gift recipient (<strong>{giftOptions.recipientName}</strong>)?</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useGiftAddress}
                    onChange={(e) => handleToggleGiftAddress(e.target.checked)}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </div>
              )}

              <Form
                form={checkoutForm}
                layout="vertical"
                onFinish={handlePlaceOrder}
                requiredMark={false}
              >
                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Recipient Full Name</span>}
                  name="customerName"
                  rules={[
                    { required: true, message: 'Please provide recipient full name' },
                    { min: 2, message: 'Name must be at least 2 characters' }
                  ]}
                  className="mb-3"
                >
                  <Input placeholder="Recipient Full Name" className="rounded-xl text-xs py-2.5 bg-[#FAF9F7] focus:bg-white" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Contact Phone Number</span>}
                  name="phone"
                  rules={[
                    { required: true, message: 'Please provide contact phone number' },
                    { min: 8, message: 'Please provide a valid phone number' }
                  ]}
                  className="mb-3"
                >
                  <Input placeholder="+91 98765 43210" className="rounded-xl text-xs py-2.5 bg-[#FAF9F7] focus:bg-white" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Complete Delivery Address</span>}
                  name="address"
                  rules={[
                    { required: true, message: 'Delivery address is required' },
                    { min: 8, message: 'Please provide apartment, street, city and pin code' }
                  ]}
                  className="mb-4"
                >
                  <Input.TextArea 
                    placeholder="House/Apartment number, Street, Landmark, City, State, PIN code..." 
                    rows={3} 
                    className="rounded-xl text-xs bg-[#FAF9F7] focus:bg-white"
                  />
                </Form.Item>

                {/* Payment Method Notice */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 mb-5 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-black">
                    <span>Payment Method:</span>
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">
                      Atelier Pay on Delivery / Direct Billing
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-light">
                    Direct order placement. Order items and availability are verified immediately against our atelier archives.
                  </p>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full bg-black hover:bg-[#262626] active:bg-black text-white py-3.5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Lock size={13} />
                  <span>{checkoutLoading ? 'Securing Atelier Order...' : `Confirm Order (₹${finalTotal.toLocaleString('en-IN')})`}</span>
                  <ArrowRight size={13} />
                </button>
              </Form>
            </div>
          )}
        </ConfigProvider>
      </Modal>

      {/* Luxury Return Policy & Home Trial Guarantee Modal */}
      <ReturnPolicyModal
        open={showReturnPolicyModal}
        onClose={() => setShowReturnPolicyModal(false)}
      />

      <Footer />
    </div>
  );
}
