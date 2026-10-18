"use client";
import React, { useState, useEffect } from 'react';
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
  RotateCcw, 
  CheckCircle2, 
  Lock,
  ArrowLeft
} from 'lucide-react';
import { Modal, Form, Input, message, ConfigProvider } from 'antd';
import cartService from '@/services/cartService';
import orderService from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';

const cartTheme = {
  token: {
    colorPrimary: '#000000',
    colorError: '#9A3412', // Warm luxury terracotta / amber
    colorErrorBorder: '#FDBA74',
    colorErrorHover: '#C2410C',
    borderRadius: 12,
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    Input: {
      activeBorderColor: '#000000',
      hoverBorderColor: '#444444',
      paddingBlock: 8,
    },
    Form: {
      itemMarginBottom: 18,
      verticalLabelPadding: '0 0 5px',
    }
  }
};

const CartPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountName, setDiscountName] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [checkoutForm] = Form.useForm();

  const loadCart = () => {
    setCartItems(cartService.getCart());
  };

  useEffect(() => {
    loadCart();
    window.addEventListener('cartChange', loadCart);
    return () => window.removeEventListener('cartChange', loadCart);
  }, []);

  const totalItemCount = cartItems.reduce(
    (acc, item) => acc + (parseInt(item.quantity, 10) || 1),
    0
  );

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  );

  const discountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleUpdateQty = (productId, size, newQty) => {
    cartService.updateQuantity(productId, size, newQty);
  };

  const handleRemoveItem = (productId, size, name) => {
    cartService.removeFromCart(productId, size);
    message.info(`Removed ${name} from your bag`);
  };

  const handleClearCart = () => {
    cartService.clearCart();
    message.info('Shopping bag cleared');
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'AMBER10' || code === 'ROVE10' || code === 'ZYRA10' || code === 'VIP10' || code === 'WELCOME10') {
      setAppliedDiscount(10);
      setDiscountName(`${code} (10% Off)`);
      message.success('10% VIP Patron discount applied!');
    } else if (code === 'AMBER15' || code === 'ROVE15' || code === 'AMBERVIP15' || code === 'ATELIER15' || code === 'LUXE15') {
      setAppliedDiscount(15);
      setDiscountName(`${code} (15% Off)`);
      message.success('15% Fragrance privilege discount applied!');
    } else {
      message.error('Invalid promo code. Try "AMBER10" for 10% off.');
    }
  };

  const handleStartCheckout = () => {
    if (typeof window !== 'undefined') {
      const token = 
        localStorage.getItem('userToken') || 
        localStorage.getItem('adminToken') || 
        localStorage.getItem('token') || 
        localStorage.getItem('adminKey');
      
      if (!token) {
        message.warning('Please sign in to complete your order.');
        router.push('/login?redirect=/cart');
        return;
      }

      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          checkoutForm.setFieldsValue({
            customerName: user.name || '',
            phone: user.phone || '',
            address: user.address || ''
          });
        } catch (e) {}
      }
    }
    setIsCheckoutModalOpen(true);
  };

  const handlePlaceOrder = async (values) => {
    if (cartItems.length === 0) return;
    setCheckoutLoading(true);
    try {
      const orderPayload = {
        customerName: values.customerName.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        items: cartItems.map((item) => ({
          productId: parseInt(item.productId || item.id, 10),
          quantity: parseInt(item.quantity, 10) || 1,
          size: (item.size || 'M').toUpperCase()
        }))
      };

      const response = await orderService.createOrder(orderPayload);
      if (response?.success) {
        setOrderSuccessData(response.data);
        cartService.clearCart();
        message.success('Your order has been placed successfully!');
      } else {
        message.error(response?.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      message.error(err.response?.data?.message || 'Error placing order. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-black pt-24 sm:pt-28 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full flex-1">
        
        {/* Breadcrumb & Simple Title Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D6]">
          <div>
            <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-gray-400 mb-1">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <span className="text-black font-semibold">Shopping Bag</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-black">
              Shopping Bag
            </h1>
          </div>

          {cartItems.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-500">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Clean Empty Bag State */
          <div className="py-16 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto text-gray-400 border border-[#E8E2D6] shadow-2xs">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-black mb-1">
                Your Bag is Empty
              </h2>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                Explore our artisanal collections of signature Eau de Parfum, aged amber flacons, and discovery sets.
              </p>
            </div>
            <Link href="/shop" className="inline-block pt-2">
              <button
                type="button"
                className="bg-black hover:bg-[#262626] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                Explore Collections
              </button>
            </Link>
          </div>
        ) : (
          /* Simple, Clean 2-Column Cart Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Clean Cart Items List */}
            <div className="lg:col-span-8 space-y-3">
              {cartItems.map((item) => {
                const itemKey = `${item.productId || item.id}_${item.size || 'M'}`;
                const itemTotal = (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1);

                return (
                  <div
                    key={itemKey}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E2D6] shadow-2xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all hover:shadow-xs"
                  >
                    {/* Item Thumbnail & Details */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Link 
                        href={`/product/${item.productId || item.id}`}
                        className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-[#FAF8F5] overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-100"
                      >
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = '/Images/brown.png'; }}
                        />
                      </Link>

                      <div className="space-y-1 min-w-0 flex-1">
                        <Link 
                          href={`/product/${item.productId || item.id}`}
                          className="text-sm font-serif font-bold text-black hover:underline block truncate"
                        >
                          {item.name}
                        </Link>
                        
                        <div className="flex items-center gap-2">
                          <span className="bg-[#FAF8F5] border border-[#E0D8CA] text-black text-[11px] font-bold px-2 py-0.5 rounded-md">
                            Size: {item.size}
                          </span>
                          <span className="text-xs text-gray-500 font-sans">
                            ₹{(Number(item.price) || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls, Price & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      
                      {/* Qty Adjuster */}
                      <div className="inline-flex items-center bg-[#FAF8F5] border border-gray-200 rounded-full p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId || item.id, item.size, item.quantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-gray-700 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-black font-sans">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.productId || item.id, item.size, item.quantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-gray-700 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-sm font-bold text-black font-sans block">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productId || item.id, item.size, item.name)}
                        className="w-8 h-8 rounded-full bg-[#FAF8F5] hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 flex items-center justify-between">
                <Link 
                  href="/shop"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:underline"
                >
                  <ArrowLeft size={13} />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Clean Order Summary */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl p-6 border border-[#E8E2D6] shadow-2xs space-y-5">
                <h3 className="text-lg font-serif font-bold text-black border-b border-gray-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItemCount} items)</span>
                    <span className="font-sans font-semibold text-black">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Standard Shipping</span>
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">FREE</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Voucher ({discountName})</span>
                      <span className="font-sans font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-black pt-3 border-t border-gray-100 font-serif">
                    <span>Total</span>
                    <span className="font-sans text-lg font-bold">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. AMBER10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-[#FAF8F5] border border-[#E0D8CA] focus:outline-none focus:border-black uppercase text-black placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      className="bg-black hover:bg-[#262626] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </form>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={handleStartCheckout}
                  className="w-full bg-black hover:bg-[#262626] active:bg-black text-white py-3.5 rounded-full font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer group active:scale-98"
                >
                  <Lock size={13} />
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Truck size={12} />
                    <span>Express Delivery</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <ShieldCheck size={12} />
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />

      {/* Checkout Modal */}
      <Modal
        open={isCheckoutModalOpen}
        onCancel={() => !checkoutLoading && setIsCheckoutModalOpen(false)}
        footer={null}
        centered
        width={480}
        className="font-sans"
      >
        <ConfigProvider theme={cartTheme}>
          {orderSuccessData ? (
            <div className="p-3 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 block mb-1">
                  Order Confirmed
                </span>
                <h3 className="text-xl font-serif font-bold text-black">Thank You For Your Order</h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-sm mx-auto">
                  Order #{orderSuccessData.id || orderSuccessData._id} has been registered successfully.
                </p>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D6] text-left space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="font-bold text-black font-sans">₹{(orderSuccessData.total_amount || finalTotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Recipient:</span>
                  <span className="font-semibold text-black">{orderSuccessData.customer_name || 'Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destination:</span>
                  <span className="font-semibold text-black truncate max-w-[200px]">{orderSuccessData.address}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCheckoutModalOpen(false);
                  setOrderSuccessData(null);
                  router.push('/orders');
                }}
                className="w-full bg-black hover:bg-[#262626] text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                View in My Orders
              </button>
            </div>
          ) : (
            <div className="p-1 space-y-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-black">Checkout Information</h3>
                <p className="text-xs text-gray-500">
                  Confirm your delivery details for {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} (₹{finalTotal.toLocaleString('en-IN')}).
                </p>
              </div>

              <Form
                form={checkoutForm}
                layout="vertical"
                onFinish={handlePlaceOrder}
                requiredMark={false}
              >
                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Full Name</span>}
                  name="customerName"
                  rules={[{ required: true, message: 'Recipient name is required' }]}
                  className="mb-3"
                >
                  <Input placeholder="Recipient Full Name" className="rounded-xl text-xs py-2 bg-[#FAF8F5]/60 focus:bg-white" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Phone Number</span>}
                  name="phone"
                  rules={[{ required: true, message: 'Contact phone number is required' }]}
                  className="mb-3"
                >
                  <Input placeholder="+91 98765 43210" className="rounded-xl text-xs py-2 bg-[#FAF8F5]/60 focus:bg-white" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Delivery Address</span>}
                  name="address"
                  rules={[{ required: true, message: 'Delivery address is required' }]}
                  className="mb-5"
                >
                  <Input.TextArea 
                    placeholder="House/Apartment number, Street, City, State, PIN Code..." 
                    rows={3} 
                    className="rounded-xl text-xs bg-[#FAF8F5]/60 focus:bg-white"
                  />
                </Form.Item>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full bg-black hover:bg-[#262626] active:bg-black text-white py-3.5 rounded-full font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>{checkoutLoading ? 'Placing Order...' : `Place Order (₹${finalTotal.toLocaleString('en-IN')})`}</span>
                  <ArrowRight size={13} />
                </button>
              </Form>
            </div>
          )}
        </ConfigProvider>
      </Modal>
    </div>
  );
};

export default CartPage;
