"use client";
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Truck,
  Sparkles,
  Lock
} from 'lucide-react';
import { Modal, message, Form, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import cartService from '@/services/cartService';
import orderService from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';

const CartDrawer = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
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

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  );
  const totalItemCount = cartItems.reduce(
    (acc, item) => acc + (parseInt(item.quantity, 10) || 1),
    0
  );

  const handleUpdateQty = (productId, size, newQty) => {
    cartService.updateQuantity(productId, size, newQty);
  };

  const handleRemove = (productId, size, name) => {
    cartService.removeFromCart(productId, size);
    message.info(`Removed ${name} from bag`);
  };

  const handleStartCheckout = () => {
    if (typeof window !== 'undefined') {
      const token = 
        localStorage.getItem('userToken') || 
        localStorage.getItem('adminToken') || 
        localStorage.getItem('token') || 
        localStorage.getItem('adminKey');
      
      if (!token) {
        message.warning('Please sign in to complete your checkout.');
        onClose();
        router.push('/login?redirect=/shop');
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

  const handlePlaceCartOrder = async (values) => {
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
        message.success('Your boutique order has been placed successfully!');
      } else {
        message.error(response?.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      message.error(err.response?.data?.message || 'Failed to place order. Please check your network.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setIsCheckoutModalOpen(false);
    setOrderSuccessData(null);
    onClose();
    router.push('/orders');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-Over Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#FAF8F5] z-50 shadow-2xl flex flex-col justify-between border-l border-[#E8E2D6] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8E2D6] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#F5F1E9] flex items-center justify-center text-black">
              <ShoppingBag size={17} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-black">Shopping Bag</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#8C827A]">
                {totalItemCount} {totalItemCount === 1 ? 'Piece' : 'Pieces'} Selected
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF8F5] hover:bg-black hover:text-white flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cart Items Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-[#EFE8DC] flex items-center justify-center text-gray-400">
                <ShoppingBag size={28} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-black mb-1">Your bag is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs font-light">
                  Explore our artisanal collections of signature Eau de Parfum and discovery sets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/shop');
                }}
                className="bg-black hover:bg-[#262626] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                Shop Fragrances
              </button>
            </div>
          ) : (
            <>
              {/* Complimentary shipping note */}
              <div className="p-3 bg-[#EFE8DC]/70 rounded-2xl border border-[#E0D8CA] flex items-center gap-2.5 text-[11px] text-gray-700">
                <Sparkles size={14} className="text-[#B86526] shrink-0" />
                <span>Complimentary Pan-India Express Shipping included on this order.</span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const key = `${item.productId || item.id}_${item.size || 'M'}`;
                  return (
                    <div 
                      key={key} 
                      className="p-3.5 bg-white rounded-2xl border border-[#E8E2D6] shadow-2xs flex gap-3 items-center group"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-16 h-20 bg-[#F3EEE6] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-100">
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = '/images/perfumes/amber_oud_perfume.jpg'; }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-serif font-bold text-black truncate">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.productId || item.id, item.size, item.name)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-[#FAF8F5] text-black text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E8E2D6]">
                            Size: {item.size}
                          </span>
                          <span className="text-xs font-bold text-black font-sans">
                            ₹{(item.price || 0).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                          <div className="inline-flex items-center bg-[#FAF8F5] border border-gray-200 rounded-full p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.productId || item.id, item.size, item.quantity - 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-gray-700 transition-colors cursor-pointer"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-black">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.productId || item.id, item.size, item.quantity + 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-gray-700 transition-colors cursor-pointer"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-black font-sans">
                            ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-5 sm:p-6 bg-white border-t border-[#E8E2D6] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500 font-light">
                <span>Subtotal ({totalItemCount} items)</span>
                <span className="font-sans font-semibold text-black">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-light">
                <span>Atelier White-Glove Shipping</span>
                <span className="text-emerald-700 font-bold uppercase text-[10px]">Free</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-gray-100 font-serif">
                <span>Total Amount</span>
                <span className="font-sans text-base font-bold">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleStartCheckout}
                className="w-full bg-black hover:bg-[#262626] active:bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer group active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/cart');
                }}
                className="w-full bg-[#FAF8F5] hover:bg-[#EFE8DC] text-black border border-[#E0D8CA] py-3 rounded-full font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer text-center block"
              >
                View Full Cart Page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Item Cart Checkout Modal */}
      <Modal
        open={isCheckoutModalOpen}
        onCancel={() => !checkoutLoading && setIsCheckoutModalOpen(false)}
        footer={null}
        centered
        width={500}
        className="font-sans"
      >
        {orderSuccessData ? (
          <div className="p-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-700 block mb-1">
                Order Confirmed
              </span>
              <h3 className="text-2xl font-serif font-bold text-black">Thank You For Your Order</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Order #{orderSuccessData.id || orderSuccessData._id} has been registered and sent to the atelier dispatch floor.
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D6] text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Total Paid:</span>
                <span className="font-bold text-black font-sans">₹{(orderSuccessData.total_amount || totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Recipient:</span>
                <span className="font-semibold text-black">{orderSuccessData.customer_name || 'Valued Patron'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Destination:</span>
                <span className="font-semibold text-black truncate max-w-[220px]">{orderSuccessData.address}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseSuccess}
              className="w-full bg-black hover:bg-[#262626] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              View in My Orders
            </button>
          </div>
        ) : (
          <div className="p-2 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C827A] block mb-1">
                Express Atelier Checkout
              </span>
              <h3 className="text-2xl font-serif font-bold text-black">Delivery Details</h3>
              <p className="text-xs text-gray-500">
                Confirm your dispatch information for all {totalItemCount} items (₹{totalAmount.toLocaleString('en-IN')}).
              </p>
            </div>

            <Form
              form={checkoutForm}
              layout="vertical"
              onFinish={handlePlaceCartOrder}
              requiredMark={false}
            >
              <Form.Item
                label={<span className="text-xs font-semibold text-gray-700">Full Name</span>}
                name="customerName"
                rules={[{ required: true, message: 'Please enter your name' }]}
                className="mb-3"
              >
                <Input placeholder="Recipient Full Name" className="rounded-xl text-xs py-2.5" />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-700">Phone Number (For Tracking SMS)</span>}
                name="phone"
                rules={[{ required: true, message: 'Please enter contact phone number' }]}
                className="mb-3"
              >
                <Input placeholder="+91 98765 43210" className="rounded-xl text-xs py-2.5" />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-700">Delivery Address</span>}
                name="address"
                rules={[{ required: true, message: 'Please enter your shipping address' }]}
                className="mb-5"
              >
                <Input.TextArea 
                  placeholder="Street address, apartment/suite, city, state, postal code..." 
                  rows={3} 
                  className="rounded-xl text-xs"
                />
              </Form.Item>

              <button
                type="submit"
                disabled={checkoutLoading}
                className="w-full bg-black hover:bg-[#262626] active:bg-black text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>{checkoutLoading ? 'Processing Order...' : `Confirm & Place Order (₹${totalAmount.toLocaleString('en-IN')})`}</span>
                <ArrowRight size={13} />
              </button>
            </Form>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CartDrawer;
