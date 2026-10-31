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
  Edit3
} from 'lucide-react';
import { Modal, Form, Input, message, ConfigProvider } from 'antd';
import cartService from '@/services/cartService';
import orderService from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';
import GiftPersonalizeModal from '@/components/cart/GiftPersonalizeModal';

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
  const [promoCode, setPromoCode] = useState('');
  const [appliedPrivilege, setAppliedPrivilege] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [giftOptions, setGiftOptions] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [useGiftAddress, setUseGiftAddress] = useState(false);
  const [checkoutForm] = Form.useForm();

  // Initialize and load cart data safely on client
  const loadCart = useCallback(() => {
    setCartItems(cartService.getCart());
  }, []);

  useEffect(() => {
    setIsClient(true);
    document.title = 'Shopping Bag | ROVE & AMBER Fine Fragrance';
    loadCart();

    // Read saved gift options from localStorage if any
    try {
      const storedGifts = localStorage.getItem('rove_amber_gift_options');
      if (storedGifts) {
        const parsed = JSON.parse(storedGifts);
        if (parsed && (parsed.recipientName || parsed.messageText || parsed.packagingId)) {
          setGiftOptions(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read gift options', e);
    }

    window.addEventListener('cartChange', loadCart);
    window.addEventListener('authChange', loadCart);
    return () => {
      window.removeEventListener('cartChange', loadCart);
      window.removeEventListener('authChange', loadCart);
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

  // Final Total matches verified catalog subtotal
  const finalTotal = subtotal;

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
    Modal.confirm({
      title: 'Remove Fragrance?',
      content: `Remove ${name} (${size}) from your shopping bag?`,
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Keep in Bag',
      centered: true,
      onOk() {
        cartService.removeFromCart(productId, size);
        message.info(`Removed ${name} from your bag`);
      }
    });
  };

  const handleClearCart = () => {
    Modal.confirm({
      title: 'Clear Shopping Bag?',
      content: 'Are you sure you want to remove all items from your bag?',
      okText: 'Clear All',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk() {
        cartService.clearCart();
        message.info('Shopping bag cleared');
      }
    });
  };

  // Promo code / voucher handling
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'AMBER10' || code === 'ROVE10' || code === 'ZYRA10' || code === 'VIP10' || code === 'WELCOME10') {
      setAppliedPrivilege({
        code,
        title: 'VIP Patron Privilege',
        benefit: 'Complimentary Deluxe 2ml Discovery Miniature Coffret & Signature Satin Ribboning applied to your order.'
      });
      message.success('Promotional privilege applied to your order!');
    } else if (code === 'AMBER15' || code === 'LUXE15' || code === 'ATELIER15') {
      setAppliedPrivilege({
        code,
        title: 'Atelier Discovery Privilege',
        benefit: 'Dual Complimentary Extrait Discovery Miniatures included with your dispatch.'
      });
      message.success('Atelier privilege applied to your order!');
    } else {
      message.info('Promotional voucher not recognized. Note: Direct currency discounts require an active store payment promotion gateway.');
    }
  };

  // Check auth before starting checkout
  const handleStartCheckout = () => {
    router.push('/checkout');
    return;

    const token = 
      localStorage.getItem('userToken') || 
      localStorage.getItem('adminToken') || 
      localStorage.getItem('token') || 
      localStorage.getItem('adminKey');
    
    // Backend POST /orders requires protect middleware (token)
    if (!token) {
      setIsAuthPromptOpen(true);
      return;
    }

    // Prefill form from localStorage user profile if available
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
        console.warn('Could not parse user info for checkout', e);
      }
    }

    setCheckoutError(null);
    setIsCheckoutModalOpen(true);
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
                {totalItemCount} {totalItemCount === 1 ? 'fragrance flacon' : 'fragrance flacons'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-black tracking-tight">
              Your Shopping Bag
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light mt-1.5 max-w-xl leading-relaxed">
              Review your preserved signature fragrances, review complimentary packaging, and proceed to secure boutique order registration.
            </p>
          </div>

          {cartItems.length > 0 && (
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

        {/* CART CONTENT: EMPTY STATE OR ITEMS */}
        {cartItems.length === 0 ? (
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
            
            {/* LEFT COLUMN: ITEMS & GIFT OPTIONS (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Product Cards List */}
              <div className="space-y-3.5">
                {cartItems.map((item) => {
                  const itemKey = `${item.productId || item.id}_${item.size || '50ML'}`;
                  const price = Number(item.price) || 0;
                  const itemTotal = price * (parseInt(item.quantity, 10) || 1);
                  const maxStock = item.maxStock !== undefined ? item.maxStock : 99;
                  const isMaxReached = item.quantity >= maxStock;

                  return (
                    <div
                      key={itemKey}
                      className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8DFC9] shadow-xs flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between transition-all hover:border-[#D4AF37]/60 hover:shadow-md"
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
                          <div className="flex items-center gap-2">
                            <span className="text-[9.5px] tracking-[0.2em] uppercase font-semibold text-[#B86526]">
                              Fine Fragrance
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[#D5C9B8]" />
                            <span className="text-[10px] text-gray-500 font-medium">
                              {item.size || '50ML'}
                            </span>
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

              {/* Bottom Return Action */}
              <div className="pt-2 flex items-center justify-between">
                <Link 
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:text-[#B8860B] transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Continue Exploring Collections</span>
                </Link>
              </div>

              {/* GIFT OPTIONS SUMMARY / BANNER */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#FAF6ED] via-[#FFFDF9] to-[#FAF6ED] border border-[#E8DFC9] shadow-xs">
                {giftOptions ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#FAF3E0] border border-[#E0D0A5] flex items-center justify-center text-[#B8860B]">
                          <Gift size={14} />
                        </div>
                        <h4 className="font-serif text-sm sm:text-base font-bold text-black">
                          Complimentary Gift Presentation Configured
                        </h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsGiftModalOpen(true)}
                          className="text-xs font-bold text-[#8C6D1F] hover:text-black uppercase tracking-wider transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={11} />
                          <span>Edit Details</span>
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            setGiftOptions(null);
                            try {
                              localStorage.removeItem('rove_amber_gift_options');
                            } catch (e) {}
                            message.info('Gift customization removed');
                          }}
                          className="text-xs text-stone-400 hover:text-red-500 uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-white p-3 rounded-xl border border-[#E0D8CA]">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                          Packaging Selection
                        </span>
                        <span className="font-semibold text-black">
                          {giftOptions.packagingId === 'velvet_coffret' 
                            ? 'Midnight Velvet Presentation Coffret' 
                            : giftOptions.packagingId === 'silk_sachet'
                            ? 'Imperial Raw Silk Keepsake Sachet'
                            : 'Atelier Signature Gold Foil Box'}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                          Included Complimentary
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#E0D8CA]">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                          Recipient & Occasion
                        </span>
                        <span className="font-semibold text-black block truncate">
                          To: {giftOptions.recipientName || 'Gift Recipient'}
                        </span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          Motif: {giftOptions.occasion || 'Milestone Celebration'}
                        </span>
                      </div>
                    </div>

                    {giftOptions.messageText && (
                      <div className="p-3 bg-white rounded-xl border border-[#E0D8CA] text-xs">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                          Personal Inscription Card
                        </span>
                        <p className="font-serif italic text-gray-700 line-clamp-2">
                          &ldquo;{giftOptions.messageText}&rdquo;
                        </p>
                      </div>
                    )}

                    <p className="text-[11px] text-gray-500 font-light pt-1 leading-relaxed">
                      <strong>Transparency Notice:</strong> Complimentary gold-embossed packaging and ribbon are prepared for your order. Your inscription is saved in your current browsing session and confirmed with our concierge team prior to dispatch.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Gift size={16} className="text-[#B8860B]" />
                        <h4 className="font-serif text-sm font-bold text-black">
                          Sending as a Gift?
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 font-light max-w-lg">
                        Select complimentary gold foil packaging, embossed satin ribbon, and a personalized wax-sealed calligraphic note in our Gift Studio.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGiftModalOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-white hover:bg-black hover:text-white text-black border border-[#E0D8CA] text-xs font-bold uppercase tracking-wider transition-all shadow-2xs whitespace-nowrap cursor-pointer"
                    >
                      Personalize Gift
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: STICKY ORDER SUMMARY (4 Cols) */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl p-6 border border-[#E8DFC9] shadow-xs space-y-5">
                <h3 className="text-lg font-serif font-bold text-black border-b border-[#ECE7DE] pb-3">
                  Order Summary
                </h3>

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

                  {appliedPrivilege && (
                    <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#E8DFC9] text-[11px] text-[#6B5738] space-y-0.5">
                      <span className="font-bold flex items-center gap-1 text-[#8C6D1F]">
                        <Check size={12} />
                        {appliedPrivilege.title}
                      </span>
                      <p className="text-[10px] text-gray-600 leading-snug">
                        {appliedPrivilege.benefit}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline text-sm font-bold text-black pt-3 border-t border-[#ECE7DE] font-serif">
                    <span>Estimated Total</span>
                    <span className="font-sans text-xl font-bold text-black">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input Form */}
                <form onSubmit={handleApplyPromo} className="pt-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">
                    Promotional Voucher / Patron Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. AMBER10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-[#FAF9F7] border border-[#E0D8CA] focus:outline-none focus:border-black uppercase text-black placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      className="bg-black hover:bg-[#262626] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </form>

                {/* Primary Proceed to Checkout CTA */}
                <button
                  type="button"
                  onClick={handleStartCheckout}
                  className="w-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-105 active:scale-[0.99] py-3.5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-amber-950/15 transition-all cursor-pointer group"
                >
                  <Lock size={13} strokeWidth={2.2} />
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={13} strokeWidth={2.2} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Trust and Payment Security Badges */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#ECE7DE] text-[10px] text-gray-500 text-center">
                  <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-[#FAF9F7]">
                    <Truck size={12} className="text-[#B8860B]" />
                    <span>Insured Transit</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-[#FAF9F7]">
                    <ShieldCheck size={12} className="text-[#B8860B]" />
                    <span>Atelier Guarantee</span>
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
      <Modal
        open={isAuthPromptOpen}
        onCancel={() => setIsAuthPromptOpen(false)}
        footer={null}
        centered
        width={440}
        className="font-sans"
      >
        <div className="p-4 sm:p-5 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF3E0] border border-[#E0D0A5] text-[#B8860B] flex items-center justify-center mx-auto">
            <User size={26} />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C6D1F] block mb-1">
              Atelier Account
            </span>
            <h3 className="font-serif text-2xl font-normal text-black">
              Sign In to Complete Checkout
            </h3>
            <p className="text-xs text-gray-500 font-light mt-2 max-w-sm mx-auto leading-relaxed">
              To guarantee verified dispatch notifications, direct courier tracking, and order history, please sign in or register your customer profile.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href="/login?redirect=/cart"
              className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-[#262626] text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-xs"
            >
              <span>Sign In to Checkout</span>
              <ArrowRight size={13} />
            </Link>

            <button
              type="button"
              onClick={() => setIsAuthPromptOpen(false)}
              className="text-xs text-gray-500 hover:text-black transition-colors"
            >
              Continue Reviewing Bag
            </button>
          </div>
        </div>
      </Modal>

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

      <Footer />
    </div>
  );
}
