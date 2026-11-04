"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Gift, 
  CreditCard, 
  ArrowRight,
  AlertCircle,
  Tag,
  Coins,
  Sparkles
} from 'lucide-react';
import { message, Form, Input, Spin } from 'antd';
import cartService from '@/services/cartService';
import paymentService from '@/services/paymentService';
import { getImageUrl } from '@/utils/imageHelper';
import GiftPersonalizeModal from '@/components/cart/GiftPersonalizeModal';
import { AuthGateModal } from '@/components/common';
import authService from '@/services/authService';


// Dynamically load official Razorpay Checkout SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [giftOptions, setGiftOptions] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [useGiftAddress, setUseGiftAddress] = useState(false);
  
  const [paymentMethod] = useState('Razorpay');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [rewardPointsUsed, setRewardPointsUsed] = useState(0);
  const [rewardDiscountAmount, setRewardDiscountAmount] = useState(0);
  const [availableRewardPoints, setAvailableRewardPoints] = useState(0);
  const [rewardRate, setRewardRate] = useState(100);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadCartState = async () => {
    try {
      await cartService.fetchCart();
      const items = cartService.getCart();
      setCartItems(items);
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
    } catch (e) {
      console.warn('Error loading checkout cart summary:', e);
    }
  };

  useEffect(() => {
    setIsClient(true);
    document.title = 'Secure Boutique Checkout | ROVE & AMBER';

    // Verify authenticated customer account strictly
    if (!authService.isAuthenticated()) {
      setIsCheckingAuth(true);
      setShowAuthModal(true);
      return;
    }

    setIsCheckingAuth(false);
    loadRazorpayScript().catch(() => {});

    loadCartState();

    // Read saved gift options
    try {
      const storedGifts = localStorage.getItem('rove_amber_gift_options');
      if (storedGifts) {
        const parsed = JSON.parse(storedGifts);
        if (parsed && (parsed.recipientName || parsed.messageText || parsed.packagingName)) {
          setGiftOptions(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading gift options', e);
    }

    // Prefill form from user account if logged in
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        form.setFieldsValue({
          customerName: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || ''
        });
      }
    } catch (e) { console.debug(e); }
  }, [form]);

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  );
  const finalTotal = Math.max(0, subtotal - discountAmount - rewardDiscountAmount);

  // Patron Privilege Points Toggle handler in checkout
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
        await loadCartState();
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
      await loadCartState();
    } catch (err) {
      message.error(err.message || 'Failed to remove reward points.');
    } finally {
      setRewardLoading(false);
    }
  };

  // Toggle delivery address to gift recipient
  const handleToggleGiftAddress = (checked) => {
    setUseGiftAddress(checked);
    if (checked && giftOptions) {
      form.setFieldsValue({
        customerName: giftOptions.recipientName || form.getFieldValue('customerName'),
        phone: giftOptions.recipientPhone || form.getFieldValue('phone'),
        address: giftOptions.recipientAddress || form.getFieldValue('address')
      });
    } else {
      // Revert to user profile
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          form.setFieldsValue({
            customerName: user.name || '',
            phone: user.phone || '',
            address: user.address || ''
          });
        }
      } catch (e) { console.debug(e); }
    }
  };

  const handlePlaceOrder = async (values) => {
    if (cartItems.length === 0) {
      message.warning('Your shopping bag is empty.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Construct verified delivery address
      const fullAddress = [
        values.address,
        values.landmark,
        values.city,
        values.state,
        values.pincode
      ].filter(Boolean).join(', ');

      const orderPayload = {
        customerName: values.customerName.trim(),
        email: values.email?.trim() || '',
        phone: values.phone.trim(),
        address: fullAddress,
        paymentMethod: 'Razorpay',
        isGift: !!giftOptions?.isGift,
        occasion: giftOptions?.occasion || '',
        giftMessage: giftOptions?.messageText || '',
        giftWrap: !!giftOptions?.isGift,
        giftRecipient: giftOptions ? {
          name: giftOptions.recipientName || '',
          phone: giftOptions.recipientPhone || '',
          address: giftOptions.recipientAddress || ''
        } : {},
        couponCode: appliedCoupon?.code || '',
        rewardPointsUsed: rewardPointsUsed || 0,
        rewardDiscountAmount: rewardDiscountAmount || 0,
        hasSample: cartItems.some(i => i.hasSample || String(i.size || '').toLowerCase().includes('2ml') || String(i.name || '').toLowerCase().includes('sample')),
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          name: item.name || '',
          price: Number(item.price) || 0,
          quantity: parseInt(item.quantity, 10) || 1,
          size: item.size || '50ml',
          image: item.image || '',
          hasSample: Boolean(item.hasSample || String(item.size || '').toLowerCase().includes('2ml') || String(item.name || '').toLowerCase().includes('sample'))
        }))
      };

      // ONLINE PAYMENT VIA RAZORPAY GATEWAY
      const initRes = await paymentService.createPaymentOrder(orderPayload);
      if (!initRes?.success || !initRes?.data) {
        throw new Error(initRes?.message || 'Failed to initialize Razorpay payment order.');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      const { razorpayOrderId, amount, currency, keyId, orderId, internalId } = initRes.data;

      const rzpOptions = {
        key: keyId || 'rzp_test_Tq87qYzkJmzGUc',
        amount: amount,
        currency: currency || 'INR',
        name: 'ROVE & AMBER',
        description: `Order ${orderId || ''} • Luxury Fragrance Formulation`,
        image: '/images/perfumes/rove_amber_exact_banner_hd.jpg',
        order_id: razorpayOrderId,
        prefill: {
          name: values.customerName.trim(),
          email: values.email?.trim() || '',
          contact: values.phone.trim()
        },
        notes: {
          orderId: orderId,
          deliveryAddress: fullAddress
        },
        theme: {
          color: '#1A1412'
        },
        handler: async function (razorpayResponse) {
          setLoading(true);
          try {
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              orderId: orderId || internalId
            });

            if (verifyRes?.success) {
              const confirmedOrder = verifyRes.data?.order || {
                orderId: orderId,
                customer_name: values.customerName.trim(),
                phone: values.phone.trim(),
                address: fullAddress,
                paymentMethod: 'Razorpay',
                total_amount: (amount / 100),
                paymentStatus: 'Paid'
              };
              setOrderConfirmed(confirmedOrder);
              cartService.clearCart();
              try {
                localStorage.removeItem('rove_amber_gift_options');
              } catch (e) { console.debug(e); }
              message.success('Payment verified! Your luxury order has been confirmed.');
            } else {
              message.error(verifyRes?.message || 'Payment signature verification failed.');
            }
          } catch (vErr) {
            console.error('Payment verification error:', vErr);
            message.error(vErr.response?.data?.message || 'Verification error after payment.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            message.info('Payment checkout window was closed.');
          }
        }
      };

      const rzpInstance = new window.Razorpay(rzpOptions);

      rzpInstance.on('payment.failed', function (failResp) {
        console.error('Razorpay payment failed:', failResp.error);
        message.error(failResp.error?.description || 'Payment was declined or failed.');
        paymentService.recordPaymentFailure({
          razorpay_order_id: razorpayOrderId,
          orderId: orderId,
          error: failResp.error
        }).catch(() => {});
        setLoading(false);
      });

      rzpInstance.open();
    } catch (err) {
      console.error('Order creation error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unable to connect to order atelier. Please verify your connection.';
      setErrorMessage(errMsg);
      message.error(errMsg);
    } finally {
      // Keep loading false on error; on success, handler or COD turns it off
      setLoading(false);
    }
  };

  if (!isClient || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] font-sans text-black flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-32 space-y-4">
          <Spin size="large" />
          <p className="text-xs uppercase tracking-widest text-[#8C7A6B] font-semibold">
            Verifying Authentication...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-sans text-black flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-20 w-full flex-1">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 uppercase tracking-widest">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-black transition-colors">Shopping Bag</Link>
          <span>/</span>
          <span className="text-black font-semibold">Secure Checkout</span>
        </div>

        {orderConfirmed ? (
          /* ================= ORDER SUCCESS CONFIRMATION ================= */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DFC9] shadow-sm text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#FAF3E0] text-[#B8860B] border border-[#E0D0A5] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={40} />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6D1F] block mb-1">
                Atelier Order Registered
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-normal text-black tracking-tight">
                Thank You for Your Patronage
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-light mt-2 max-w-md mx-auto leading-relaxed">
                Your flacon formulations have entered our fragrance compounding studio. A confirmation dispatch has been dispatched to your email.
              </p>
            </div>

            {/* Order Summary Box */}
            <div className="p-5 bg-[#FAF9F7] rounded-2xl border border-[#E8DFC9] text-left space-y-3 text-xs">
              <div className="flex justify-between pb-3 border-b border-[#E8DFC9]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Order Reference</span>
                  <span className="font-mono font-bold text-base text-black">
                    {orderConfirmed.orderId || `#ORD-${orderConfirmed.id || orderConfirmed._id}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Investment</span>
                  <span className="font-serif font-bold text-base text-[#1A1A1A]">
                    ₹{(orderConfirmed.total_amount || finalTotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-gray-400 block">Recipient</span>
                  <span className="font-semibold text-black">{orderConfirmed.customer_name || 'Valued Patron'}</span>
                  <span className="text-gray-500 block text-[11px]">{orderConfirmed.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-gray-400 block">Payment Method</span>
                  <span className="font-semibold text-black">{orderConfirmed.paymentMethod || paymentMethod}</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">Confirmed via Secure Gateway</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 block">Dispatch Destination</span>
                <span className="text-gray-700 block text-[11px] leading-relaxed">{orderConfirmed.address}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/orders')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-black hover:bg-[#262626] text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-xs"
              >
                Track in My Orders
              </button>
              <button
                type="button"
                onClick={() => router.push('/shop')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 border border-[#E0D8CA] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* ================= EMPTY BAG CHECKOUT GUARD ================= */
          <div className="max-w-md mx-auto py-16 text-center space-y-4">
            <h2 className="text-2xl font-serif font-normal">Your Shopping Bag is Empty</h2>
            <p className="text-xs text-gray-500">Please select fine fragrance flacons before proceeding to checkout.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs font-bold uppercase tracking-widest"
            >
              <span>Explore Fragrance Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <Form
            id="checkout-form"
            form={form}
            layout="vertical"
            onFinish={handlePlaceOrder}
            requiredMark={false}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: DISPATCH & DELIVERY ADDRESS (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Server Error Alert */}
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Compact Gift Studio Banner */}
                <div className="bg-[#FAF8F5] border border-[#E8DFC9] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#FAF3E0] border border-[#E0D0A5] text-[#8C6D1F] flex items-center justify-center shrink-0">
                      <Gift size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-xs font-bold text-gray-900 truncate">
                          {giftOptions?.isGift ? `Gift for ${giftOptions.recipientName}` : 'Sending as an artisanal gift?'}
                        </span>
                        {giftOptions?.occasion && (
                          <span className="text-[9px] font-semibold px-2 py-0.2 rounded-full bg-white text-[#8C6D1F] border border-[#E0D0A5]">
                            {giftOptions.occasion}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 font-light truncate m-0">
                        {giftOptions?.isGift
                          ? 'Complimentary gold foil gift box & personal message card included.'
                          : 'Add complimentary gift presentation & personal message card.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsGiftModalOpen(true)}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-black hover:text-white text-black border border-[#D5C9B8] text-[11px] font-semibold tracking-wide transition-all shadow-2xs cursor-pointer"
                    >
                      {giftOptions?.isGift ? 'Edit Gift' : 'Add Gift Details'}
                    </button>
                    {giftOptions?.isGift && (
                      <button
                        type="button"
                        onClick={() => {
                          setGiftOptions(null);
                          try {
                            localStorage.removeItem('rove_amber_gift_options');
                          } catch (e) { console.debug(e); }
                          message.info('Gift option removed');
                        }}
                        className="text-[11px] text-gray-400 hover:text-red-600 transition-colors cursor-pointer px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* 1. SHIPPING & DISPATCH ADDRESS CARD */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DFC9] shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#ECE7DE]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-black text-[#ECC880] flex items-center justify-center text-[11px] font-serif font-bold">
                        1
                      </span>
                      <h2 className="font-serif text-base font-bold text-black m-0">
                        Dispatch & Delivery Address
                      </h2>
                    </div>

                    {giftOptions?.recipientName && (
                      <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-stone-600 select-none">
                        <input
                          type="checkbox"
                          checked={useGiftAddress}
                          onChange={(e) => handleToggleGiftAddress(e.target.checked)}
                          className="w-3.5 h-3.5 accent-black cursor-pointer"
                        />
                        <span>Deliver to recipient</span>
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Form.Item
                      label={<span className="text-[11px] font-semibold text-gray-700">Full Name *</span>}
                      name="customerName"
                      rules={[{ required: true, message: 'Please provide full name' }]}
                      className="mb-0"
                    >
                      <Input placeholder="e.g. Eleanor Vance" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-[11px] font-semibold text-gray-700">Phone Number (For Courier SMS) *</span>}
                      name="phone"
                      rules={[
                        { required: true, message: 'Please provide phone number' },
                        { min: 8, message: 'Valid phone required' }
                      ]}
                      className="mb-0"
                    >
                      <Input placeholder="+91 98765 43210" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    label={<span className="text-[11px] font-semibold text-gray-700">Email Address (For Invoicing & Dispatch Alerts) *</span>}
                    name="email"
                    rules={[
                      { required: true, message: 'Please provide email address' },
                      { type: 'email', message: 'Valid email required' }
                    ]}
                    className="mb-0"
                  >
                    <Input placeholder="eleanor.vance@atelier.com" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-[11px] font-semibold text-gray-700">Street Address, Apartment / Villa No. *</span>}
                    name="address"
                    rules={[{ required: true, message: 'Please provide street address' }]}
                    className="mb-0"
                  >
                    <Input placeholder="Flat / Bungalow No., Building Name, Street" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                  </Form.Item>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <Form.Item
                      label={<span className="text-[11px] font-semibold text-gray-700">City *</span>}
                      name="city"
                      rules={[{ required: true, message: 'City is required' }]}
                      className="mb-0"
                    >
                      <Input placeholder="Mumbai" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-[11px] font-semibold text-gray-700">State *</span>}
                      name="state"
                      rules={[{ required: true, message: 'State is required' }]}
                      className="mb-0"
                    >
                      <Input placeholder="Maharashtra" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-[11px] font-semibold text-gray-700">PIN Code *</span>}
                      name="pincode"
                      rules={[{ required: true, message: 'PIN Code is required' }]}
                      className="mb-0"
                    >
                      <Input placeholder="400001" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    label={<span className="text-[11px] font-semibold text-gray-700">Landmark / Delivery Instructions (Optional)</span>}
                    name="landmark"
                    className="mb-0"
                  >
                    <Input placeholder="Near Royal Heritage Circle, Gate #2" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                  </Form.Item>
                </div>

              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY & REALISTIC RAZORPAY PAYMENT (5 Cols) */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8DFC9] shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#ECE7DE]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-serif font-bold text-black m-0">
                        Fragrance Flacons ({cartItems.length})
                      </h3>
                      <span className="text-[10px] font-semibold text-[#8C6D1F] bg-[#FAF3E0] px-2 py-0.5 rounded-full border border-[#E8DEC8]">
                        Atelier Bag
                      </span>
                    </div>
                    <Link href="/cart" className="text-xs text-[#8C6D1F] hover:underline font-semibold">
                      Edit Bag
                    </Link>
                  </div>

                  {/* Fragrance List Items (Compact with slim scrollbar) */}
                  <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                    {cartItems.map((item, idx) => (
                      <div key={`${item.productId || item.id}-${item.size || idx}`} className="flex items-center gap-3 pb-2.5 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-10 h-12 rounded-lg bg-[#FAF7F2] p-1 border border-[#E8DFC8] flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={getImageUrl(item.image, '/images/no-image.jpg')}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.src = '/images/no-image.jpg'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-semibold text-xs text-black truncate">{item.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                            <span className="font-mono">{item.size || '50ML'}</span>
                            <span>•</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-black font-sans">
                            ₹{((Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 pt-2.5 border-t border-[#ECE7DE] text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {discountAmount > 0 && appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1">
                          <Tag size={12} className="text-emerald-700" />
                          Privilege Discount ({appliedCoupon.code})
                        </span>
                        <span className="font-sans font-bold text-emerald-700">-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {rewardDiscountAmount > 0 && (
                      <div className="flex justify-between items-center text-[#8C6D1F] bg-[#FAF3E0] px-2.5 py-1.5 rounded-lg border border-[#E0D0A5]">
                        <span className="font-bold text-[11px] flex items-center gap-1">
                          <Sparkles size={12} className="text-[#B8860B]" />
                          Privilege Points ({rewardPointsUsed} pts)
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-sans font-bold text-[#8C6D1F]">-₹{rewardDiscountAmount.toLocaleString('en-IN')}</span>
                          <button
                            type="button"
                            onClick={handleRemoveRewards}
                            disabled={rewardLoading}
                            className="text-gray-400 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer ml-1"
                            title="Remove reward points"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>White-Glove Courier Delivery</span>
                      <span className="text-emerald-700 font-bold uppercase text-[10px]">COMPLIMENTARY</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Signature Coffret & Samples</span>
                      <span className="text-emerald-700 font-bold uppercase text-[10px]">INCLUDED</span>
                    </div>

                    {giftOptions?.isGift && (
                      <div className="flex justify-between text-gray-600">
                        <span>Bespoke Gift Wrapping & Wax Seal</span>
                        <span className="text-emerald-700 font-bold uppercase text-[10px]">COMPLIMENTARY</span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-2.5 border-t border-[#ECE7DE] font-serif">
                      <span className="font-bold text-sm text-black">Total Investment</span>
                      <span className="font-sans text-xl font-bold text-black tracking-tight">
                        ₹{finalTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Patron Privilege Points with Clean Toggle Switch */}
                  <div className="pt-2 border-t border-[#ECE7DE]">
                    <div className={`p-3 rounded-2xl border transition-all ${
                      rewardPointsUsed > 0 
                        ? 'bg-gradient-to-r from-[#FAF6EC] to-[#F5ECE0] border-[#D4AF37]/50 shadow-2xs' 
                        : 'bg-[#FAF9F7] border-[#E8DFC9]'
                    }`}>
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            rewardPointsUsed > 0 
                              ? 'bg-[#B8860B] text-white border-[#8C6D1F]' 
                              : 'bg-white text-[#B8860B] border-[#E0D8CA]'
                          }`}>
                            <Coins size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#1A1A1A] truncate">
                                Privilege Points
                              </span>
                              <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                                rewardPointsUsed > 0 
                                  ? 'bg-[#B8860B] text-white' 
                                  : 'bg-[#FAF0D4] text-[#8C6D1F] border border-[#E8DEC8]'
                              }`}>
                                {availableRewardPoints.toLocaleString()} pts
                              </span>
                            </div>
                            <p className="text-[10px] text-[#7A6B5D] mt-0.2 font-light truncate m-0">
                              {rewardPointsUsed > 0 ? (
                                <span className="text-emerald-700 font-semibold">
                                  ✓ Applied (Saved ₹{rewardDiscountAmount.toLocaleString('en-IN')})
                                </span>
                              ) : availableRewardPoints > 0 ? (
                                <span>
                                  Toggle to redeem {availableRewardPoints.toLocaleString()} pts (Save ₹{Math.floor(availableRewardPoints * (rewardRate / 100)).toLocaleString('en-IN')})
                                </span>
                              ) : (
                                <span>Earn points on this acquisition</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={rewardPointsUsed > 0}
                          onClick={handleToggleRewards}
                          disabled={rewardLoading || (availableRewardPoints <= 0 && rewardPointsUsed === 0)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                            rewardPointsUsed > 0 ? 'bg-[#1C1714]' : 'bg-[#D6CEC2]'
                          }`}
                          title={rewardPointsUsed > 0 ? 'Click to remove points' : 'Click to apply privilege points'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              rewardPointsUsed > 0 ? 'translate-x-4 bg-[#ECC880]' : 'translate-x-0 bg-white'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* REALISTIC RAZORPAY PAYMENT SELECTION & REAL ICONS */}
                  <div className="pt-2 border-t border-[#ECE7DE] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={13} className="text-[#B8860B]" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-black">
                          Payment Method
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck size={11} className="text-emerald-600" />
                        100% Encrypted
                      </span>
                    </div>

                    {/* Realistic Razorpay Container */}
                    <div className="p-3 rounded-2xl bg-gradient-to-b from-[#FAF9F7] to-[#F5ECE0] border-2 border-[#1C1714] shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#1C1714] text-[#ECC880] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            ₹
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-black font-sans">Razorpay Online Gateway</span>
                              <span className="text-[8.5px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#1C1714] text-[#ECC880]">
                                Instant
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 m-0">UPI, Cards, NetBanking & Wallets</p>
                          </div>
                        </div>

                        <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center shrink-0">
                          <div className="w-2 h-2 rounded-full bg-black" />
                        </div>
                      </div>

                      {/* Real Payment Method Badges (Google Pay, PhonePe, Paytm, UPI, Cards) */}
                      <div className="pt-2 border-t border-[#EAE3D6] flex flex-wrap items-center gap-1.5">
                        {/* Google Pay (GPay) */}
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#E0D8CA] shadow-2xs">
                          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.94H1.21v3.15C3.25 21.4 7.31 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.32 14.26c-.24-.72-.37-1.49-.37-2.26s.13-1.54.37-2.26V6.59H1.21C.44 8.12 0 9.99 0 12s.44 3.88 1.21 5.41l4.11-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.6 1.21 6.59l4.11 3.15c.94-2.84 3.58-4.99 6.68-4.99z"/>
                          </svg>
                          <span className="text-[9.5px] font-bold text-gray-800">GPay</span>
                        </div>

                        {/* PhonePe */}
                        <div className="flex items-center gap-1 bg-[#5F259F] text-white px-2 py-1 rounded-md shadow-2xs font-bold text-[9.5px] tracking-tight">
                          <span className="w-3 h-3 rounded-full bg-white text-[#5F259F] flex items-center justify-center text-[7.5px] font-black leading-none">पे</span>
                          <span>PhonePe</span>
                        </div>

                        {/* Paytm */}
                        <div className="flex items-center gap-0.5 bg-white px-2 py-1 rounded-md border border-[#00BAF2]/40 shadow-2xs font-black text-[9.5px]">
                          <span className="text-[#002970]">pay</span>
                          <span className="text-[#00BAF2]">tm</span>
                        </div>

                        {/* Official UPI Badge */}
                        <div className="flex items-center gap-0.5 bg-white px-2 py-1 rounded-md border border-[#097939]/30 shadow-2xs text-[9.5px] font-black tracking-wider">
                          <span className="text-[#097939]">U</span>
                          <span className="text-[#1A1A1A]">P</span>
                          <span className="text-[#ED7524]">I</span>
                        </div>

                        {/* Cards: Visa & Mastercard */}
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-[#E0D8CA] shadow-2xs text-[9px] font-semibold text-gray-700">
                          <span className="font-bold text-[#1A1F71] italic text-[8.5px]">VISA</span>
                          <span className="flex items-center -space-x-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B] inline-block" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B]/90 inline-block" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Primary Submit CTA Button inside right card */}
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={loading}
                      onClick={() => form.submit()}
                      className="w-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-105 active:scale-[0.99] py-3.5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 shadow-md shadow-amber-950/15 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Lock size={13} strokeWidth={2.4} />
                      <span>
                        {loading
                          ? 'Opening Razorpay Gateway...'
                          : `Pay with Razorpay • ₹${finalTotal.toLocaleString('en-IN')}`}
                      </span>
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#ECE7DE] text-[10px] text-gray-500 text-center">
                    <div className="p-2 rounded-xl bg-[#FAF9F7] flex items-center justify-center gap-1.5">
                      <Truck size={12} className="text-[#B8860B]" />
                      <span>Insured Transit</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAF9F7] flex items-center justify-center gap-1.5">
                      <ShieldCheck size={12} className="text-[#B8860B]" />
                      <span>Atelier Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Form>
        )}
      </main>

      <Footer />

      {/* Strict Authentication Gate for Checkout */}
      <AuthGateModal
        open={showAuthModal}
        onClose={() => router.replace('/cart')}
        onCancelAction={() => router.replace('/cart')}
        redirectPath="/checkout"
        title="Sign In to Complete Checkout"
        subtitle="Private Checkout Access"
        description="Private checkout requires verified customer authentication. Please sign in or register to complete your order."
        confirmText="Sign In to Checkout"
        cancelText="Return to Shopping Bag"
      />

      {/* Gift Customization Modal Re-usable */}
      <GiftPersonalizeModal
        open={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        initialData={giftOptions}
        onSave={(data) => {
          setGiftOptions(data);
          if (data?.recipientName) {
            form.setFieldsValue({
              customerName: data.recipientName,
              phone: data.recipientPhone || form.getFieldValue('phone'),
              address: data.recipientAddress || form.getFieldValue('address')
            });
            setUseGiftAddress(true);
          }
        }}
      />
    </div>
  );
}

