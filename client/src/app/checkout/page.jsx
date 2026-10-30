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
  Smartphone, 
  Building2, 
  Banknote, 
  ArrowLeft, 
  ArrowRight,
  AlertCircle,
  Package,
  Edit3
} from 'lucide-react';
import { message, Form, Input, Radio } from 'antd';
import cartService from '@/services/cartService';
import orderService from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';
import GiftPersonalizeModal from '@/components/cart/GiftPersonalizeModal';

export default function CheckoutPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [giftOptions, setGiftOptions] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [useGiftAddress, setUseGiftAddress] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  useEffect(() => {
    setIsClient(true);
    document.title = 'Secure Boutique Checkout | ROVE & AMBER';

    // Load cart items
    const items = cartService.getCart();
    setCartItems(items);

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
    } catch (e) {}
  }, [form]);

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  );
  const finalTotal = subtotal;

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
      } catch (e) {}
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
        paymentMethod: paymentMethod,
        isGift: !!giftOptions?.isGift,
        occasion: giftOptions?.occasion || '',
        giftMessage: giftOptions?.messageText || '',
        giftWrap: !!giftOptions?.isGift,
        giftRecipient: giftOptions ? {
          name: giftOptions.recipientName || '',
          phone: giftOptions.recipientPhone || '',
          address: giftOptions.recipientAddress || ''
        } : {},
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          quantity: parseInt(item.quantity, 10) || 1,
          size: item.size || '50ml'
        }))
      };

      const response = await orderService.createOrder(orderPayload);
      if (response?.success && response.data) {
        setOrderConfirmed(response.data);
        cartService.clearCart();
        try {
          localStorage.removeItem('rove_amber_gift_options');
        } catch (e) {}
        message.success('Your boutique order has been registered successfully!');
      } else {
        const errMsg = response?.message || 'Failed to place order. Please review your details.';
        setErrorMessage(errMsg);
        message.error(errMsg);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const errMsg = err.response?.data?.message || 'Unable to connect to order atelier. Please verify your connection.';
      setErrorMessage(errMsg);
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

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
          /* ================= CHECKOUT MAIN LAYOUT ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: ADDRESS & PAYMENT (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Server Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Gift Options Active Banner */}
              {giftOptions?.isGift && (
                <div className="bg-[#FAF3E0] border border-[#E0D0A5] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#E0D0A5] text-[#8C6D1F] flex items-center justify-center shrink-0">
                      <Gift size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs text-[#1B100A]">
                          Gift Presentation For {giftOptions.recipientName}
                        </span>
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-white text-[#8C6D1F] border border-[#E0D0A5]">
                          {giftOptions.occasion}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Packaging: {giftOptions.packagingName} • Inscription card prepared
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsGiftModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C6D1F] hover:underline cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>Edit Gift</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Form starts */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handlePlaceOrder}
                requiredMark={false}
                className="space-y-6"
              >
                {/* 1. SHIPPING & DISPATCH ADDRESS CARD */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFC9] shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DE]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-serif font-bold">
                        1
                      </span>
                      <h2 className="font-serif text-lg font-bold text-black m-0">
                        Dispatch & Delivery Address
                      </h2>
                    </div>

                    {giftOptions?.recipientName && (
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600 select-none">
                        <input
                          type="checkbox"
                          checked={useGiftAddress}
                          onChange={(e) => handleToggleGiftAddress(e.target.checked)}
                          className="w-3.5 h-3.5 accent-black cursor-pointer"
                        />
                        <span>Deliver directly to recipient</span>
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item
                      label={<span className="text-xs font-semibold text-gray-700">Full Name *</span>}
                      name="customerName"
                      rules={[{ required: true, message: 'Please provide full name' }]}
                      className="mb-0"
                    >
                      <Input placeholder="e.g. Eleanor Vance" className="rounded-xl text-xs py-2.5 bg-[#FAF9F7]" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-xs font-semibold text-gray-700">Phone Number (For Courier SMS) *</span>}
                      name="phone"
                      rules={[
                        { required: true, message: 'Please provide phone number' },
                        { min: 8, message: 'Valid phone required' }
                      ]}
                      className="mb-0"
                    >
                      <Input placeholder="+91 98765 43210" className="rounded-xl text-xs py-2.5 bg-[#FAF9F7]" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Email Address (For Invoicing & Dispatch Alerts) *</span>}
                    name="email"
                    rules={[
                      { required: true, message: 'Please provide email address' },
                      { type: 'email', message: 'Valid email required' }
                    ]}
                    className="mb-0"
                  >
                    <Input placeholder="eleanor.vance@atelier.com" className="rounded-xl text-xs py-2.5 bg-[#FAF9F7]" />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Street Address, Apartment / Villa No. *</span>}
                    name="address"
                    rules={[{ required: true, message: 'Please provide street address' }]}
                    className="mb-0"
                  >
                    <Input placeholder="Flat / Bungalow No., Building Name, Street" className="rounded-xl text-xs py-2.5 bg-[#FAF9F7]" />
                  </Form.Item>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Form.Item
                      label={<span className="text-xs font-semibold text-gray-700">City *</span>}
                      name="city"
                      rules={[{ required: true, message: 'City is required' }]}
                      className="mb-0"
                    >
                      <Input placeholder="Mumbai" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-xs font-semibold text-gray-700">State *</span>}
                      name="state"
                      rules={[{ required: true, message: 'State is required' }]}
                      className="mb-0"
                    >
                      <Input placeholder="Maharashtra" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-xs font-semibold text-gray-700">PIN Code *</span>}
                      name="pincode"
                      rules={[{ required: true, message: 'PIN Code is required' }]}
                      className="mb-0"
                    >
                      <Input placeholder="400001" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Landmark / Delivery Instructions (Optional)</span>}
                    name="landmark"
                    className="mb-0"
                  >
                    <Input placeholder="Near Royal Heritage Circle, Gate #2" className="rounded-xl text-xs py-2 bg-[#FAF9F7]" />
                  </Form.Item>
                </div>

                {/* 2. PAYMENT METHOD SELECTION CARD */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFC9] shadow-xs space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#ECE7DE]">
                    <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-serif font-bold">
                      2
                    </span>
                    <h2 className="font-serif text-lg font-bold text-black m-0">
                      Payment & Settlement Method
                    </h2>
                  </div>

                  {/* Payment Method Selector Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Option 1: UPI / QR */}
                    <div
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        paymentMethod === 'UPI'
                          ? 'border-[#B8860B] bg-[#FAF8F3] ring-1 ring-[#B8860B]'
                          : 'border-[#E0D8CA] bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-stone-400 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                        {paymentMethod === 'UPI' && <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Smartphone size={16} className="text-[#8C6D1F]" />
                          <span className="font-bold text-xs text-black">Instant UPI / QR</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          GPay, PhonePe, Paytm, Cred, BHIM with zero processing fees.
                        </p>
                      </div>
                    </div>

                    {/* Option 2: Cards */}
                    <div
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        paymentMethod === 'Card'
                          ? 'border-[#B8860B] bg-[#FAF8F3] ring-1 ring-[#B8860B]'
                          : 'border-[#E0D8CA] bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-stone-400 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                        {paymentMethod === 'Card' && <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-[#8C6D1F]" />
                          <span className="font-bold text-xs text-black">Credit / Debit Card</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Visa, Mastercard, RuPay, American Express.
                        </p>
                      </div>
                    </div>

                    {/* Option 3: Net Banking */}
                    <div
                      onClick={() => setPaymentMethod('NetBanking')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        paymentMethod === 'NetBanking'
                          ? 'border-[#B8860B] bg-[#FAF8F3] ring-1 ring-[#B8860B]'
                          : 'border-[#E0D8CA] bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-stone-400 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                        {paymentMethod === 'NetBanking' && <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-[#8C6D1F]" />
                          <span className="font-bold text-xs text-black">Net Banking</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Direct clearance with HDFC, ICICI, SBI, Axis, and all major banks.
                        </p>
                      </div>
                    </div>

                    {/* Option 4: Cash on Delivery */}
                    <div
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        paymentMethod === 'Cash on Delivery'
                          ? 'border-[#B8860B] bg-[#FAF8F3] ring-1 ring-[#B8860B]'
                          : 'border-[#E0D8CA] bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-stone-400 flex items-center justify-center shrink-0 mt-0.5 bg-white">
                        {paymentMethod === 'Cash on Delivery' && <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Banknote size={16} className="text-[#8C6D1F]" />
                          <span className="font-bold text-xs text-black">Pay on Delivery</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Settle upon courier arrival via cash or UPI.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Payment Details Subform */}
                  <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#E8DFC9] space-y-3">
                    {paymentMethod === 'UPI' && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-700 block">
                          Enter your UPI Virtual Payment Address (VPA)
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="username@okhdfcbank / mobile@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-black"
                          />
                          <span className="text-[10px] uppercase font-bold px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
                            Verified Instant
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          A payment authorization prompt will be dispatched to your UPI application upon order confirmation.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'Card' && (
                      <div className="space-y-3">
                        <div>
                          <span className="text-[11px] text-gray-500 block mb-1">Cardholder Name</span>
                          <input
                            type="text"
                            placeholder="Name as printed on card"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-gray-500 block mb-1">Card Number</span>
                          <input
                            type="text"
                            maxLength={19}
                            placeholder="4111 2222 3333 4444"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-black font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[11px] text-gray-500 block mb-1">Expiry (MM/YY)</span>
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="12/28"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-black font-mono"
                            />
                          </div>
                          <div>
                            <span className="text-[11px] text-gray-500 block mb-1">CVV Security Code</span>
                            <input
                              type="password"
                              maxLength={4}
                              placeholder="•••"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-[#E0D8CA] focus:outline-none focus:border-black font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'NetBanking' && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-gray-700 block">Select Banking Partner</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Other Banks'].map((bank) => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => setSelectedBank(bank)}
                              className={`p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                                selectedBank === bank
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white text-gray-700 border-[#E0D8CA] hover:border-black'
                              }`}
                            >
                              {bank}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'Cash on Delivery' && (
                      <div className="text-xs text-gray-600 space-y-1">
                        <p className="font-semibold text-black">Pay upon Courier Delivery</p>
                        <p className="font-light text-[11px]">
                          Please keep exact cash or have your UPI application ready when our white-glove logistics executive arrives with your luxury fragrance order.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Submit CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-105 active:scale-[0.99] py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-amber-950/15 transition-all cursor-pointer"
                >
                  <Lock size={14} strokeWidth={2.4} />
                  <span>{loading ? 'Compounding Order...' : `Complete Order & Pay • ₹${finalTotal.toLocaleString('en-IN')}`}</span>
                </button>
              </Form>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY (5 Cols) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8DFC9] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DE]">
                  <h3 className="text-base font-serif font-bold text-black m-0">
                    Fragrance Flacons ({cartItems.length})
                  </h3>
                  <Link href="/cart" className="text-xs text-[#8C6D1F] hover:underline font-semibold">
                    Edit Bag
                  </Link>
                </div>

                {/* Fragrance List Items */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => (
                    <div key={`${item.productId || item.id}-${item.size || idx}`} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-12 h-14 rounded-xl bg-[#FAF7F2] p-1 border border-[#E8DFC8] flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={getImageUrl(item.image, '/images/no-image.jpg')}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.currentTarget.src = '/images/no-image.jpg'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-semibold text-xs text-black truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
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
                <div className="space-y-2.5 pt-3 border-t border-[#ECE7DE] text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

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

                  <div className="flex justify-between items-baseline pt-3 border-t border-[#ECE7DE] font-serif">
                    <span className="font-bold text-sm text-black">Total Investment</span>
                    <span className="font-sans text-xl font-bold text-black">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
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
        )}
      </main>

      <Footer />

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

