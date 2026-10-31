"use client";
import React, { useState, useEffect } from 'react';
import { Spin, message, Modal } from 'antd';
import { 
  Package, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MapPin, 
  Check, 
  Copy, 
  ExternalLink,
  FileText,
  Calendar,
  Gift,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Printer,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import orderService from '@/services/orderService';
import cartService from '@/services/cartService';
import { getImageUrl } from '@/utils/imageHelper';

const TRACKING_STEPS = [
  { name: 'Order Confirmed', description: 'Order verified & payment logged', icon: Check },
  { name: 'Artisan Prep', description: 'Hand-blended, bottled & wax-sealed', icon: Sparkles },
  { name: 'In Transit', description: 'Dispatched via White-Glove courier', icon: Truck },
  { name: 'Delivered', description: 'Arrived at your sanctuary', icon: MapPin }
];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modals state
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('userToken') || localStorage.getItem('token')) 
      : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    
    if (token) {
      setIsLoggedIn(true);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {}
      }
      fetchOrders();
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders();
      if (res?.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'cancelled') return -1;
    if (s === 'delivered') return 3;
    if (s === 'shipped' || s === 'in transit') return 2;
    if (s === 'processing' || s === 'artisan prep') return 1;
    return 0; // Placed / Confirmed
  };

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    message.success(`Copied ${id} to clipboard`);
  };

  const handleBuyAgain = (item) => {
    try {
      cartService.addToCart({
        id: item.productId || item.product_id,
        productId: item.productId || item.product_id,
        name: item.name || item.product_name,
        price: item.price,
        image: item.image || item.product_image,
        size: item.size || '50ML',
        quantity: 1
      });
      message.success(`Added ${item.name || item.product_name} back to your shopping bag`);
    } catch (e) {
      message.error('Failed to add item to bag');
    }
  };

  const filteredOrders = orders.filter(order => {
    const s = String(order.status || '').toLowerCase();
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return s !== 'delivered' && s !== 'cancelled';
    if (filterStatus === 'delivered') return s === 'delivered';
    return true;
  });

  const activeCount = orders.filter(o => {
    const s = String(o.status || '').toLowerCase();
    return s !== 'delivered' && s !== 'cancelled';
  }).length;

  const deliveredCount = orders.filter(o => {
    const s = String(o.status || '').toLowerCase();
    return s === 'delivered';
  }).length;

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-between pt-24 sm:pt-28 font-sans text-stone-900">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        
        {/* Luxury Hero Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#ECE5D8]">
          <div>
            <nav className="flex items-center space-x-2 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#8C7A6B] mb-2 font-medium">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#2C1810] font-semibold">Client Portal</span>
              <span>/</span>
              <span className="text-[#A47E3B] font-semibold">Orders</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#1C1714] tracking-tight">
              My Orders & Acquisitions
            </h1>
            <p className="text-xs sm:text-sm text-[#7D7063] font-light mt-1.5 max-w-xl">
              Track artisanal packaging progress, review verified boutique receipts, and manage your fine fragrance deliveries.
            </p>
          </div>

          {/* Luxury Filter Pills */}
          {isLoggedIn && orders.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[#F2EDE4] p-1.5 rounded-full border border-[#E3DACB] shadow-xs shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-[#1C1714] text-[#FBF9F5] shadow-sm'
                    : 'text-[#6B5D50] hover:text-[#1C1714]'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  filterStatus === 'active'
                    ? 'bg-[#1C1714] text-[#FBF9F5] shadow-sm'
                    : 'text-[#6B5D50] hover:text-[#1C1714]'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('delivered')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  filterStatus === 'delivered'
                    ? 'bg-[#1C1714] text-[#FBF9F5] shadow-sm'
                    : 'text-[#6B5D50] hover:text-[#1C1714]'
                }`}
              >
                Delivered ({deliveredCount})
              </button>
            </div>
          )}
        </div>

        {/* 1. SIGN IN PROMPT IF GUEST */}
        {!isLoggedIn ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-[#ECE5D8] shadow-sm max-w-lg mx-auto my-12 space-y-5">
            <div className="w-16 h-16 bg-[#F8F4EC] rounded-2xl flex items-center justify-center mx-auto text-[#8C6D1F] border border-[#EAE2D2] shadow-inner">
              <Package size={28} strokeWidth={1.7} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-normal text-[#1C1714] mb-1.5">Sign In to View Orders</h3>
              <p className="text-xs sm:text-sm text-[#7D7063] font-light leading-relaxed max-w-sm mx-auto">
                Sign in to your ROVE & AMBER client account to view live dispatch milestones, certificate serials, and orders history.
              </p>
            </div>
            <Link href="/login?redirect=/orders" className="inline-block pt-2">
              <button className="bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-105 active:scale-95 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md shadow-amber-950/15 transition-all cursor-pointer">
                Client Sign In
              </button>
            </Link>
          </div>
        ) : loading ? (
          /* 2. LOADING STATE */
          <div className="py-28 flex flex-col items-center justify-center space-y-4">
            <Spin size="large" />
            <p className="text-xs text-[#8C7A6B] font-semibold uppercase tracking-widest">
              Connecting to Maison Archives...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* 3. EMPTY STATE */
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#ECE5D8] shadow-sm max-w-lg mx-auto my-12 space-y-5">
            <div className="w-16 h-16 bg-[#F8F4EC] rounded-2xl flex items-center justify-center mx-auto text-[#8C6D1F] border border-[#EAE2D2]">
              <ShoppingBag size={28} strokeWidth={1.6} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-normal text-[#1C1714] mb-1.5">No Orders Found</h3>
              <p className="text-xs sm:text-sm text-[#7D7063] font-light max-w-xs mx-auto leading-relaxed">
                You currently have no orders in this archive filter. Explore our latest reserve extraits and discovery coffrets.
              </p>
            </div>
            <Link href="/shop" className="inline-block pt-2">
              <button className="bg-[#1C1714] hover:bg-[#2C2420] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer">
                Explore Fragrance Collections
              </button>
            </Link>
          </div>
        ) : (
          /* 4. PROFESSIONAL LUXURY ORDER CARDS */
          <div className="space-y-8">
            {filteredOrders.map((order) => {
              const currentStep = getStepIndex(order.status || 'Processing');
              const isCancelled = String(order.status || '').toLowerCase() === 'cancelled';
              const orderRef = order.orderId || `#ORD-${String(order.id || order._id || '').slice(-6).toUpperCase()}`;
              
              // Robust total amount resolution (guarantees real numbers, never ₹0)
              const itemsTotal = (order.items || []).reduce((sum, item) => sum + ((Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1)), 0);
              const resolvedTotal = Number(order.total_amount) || Number(order.totalAmount) || Number(order.total) || itemsTotal || 0;
              
              const isPaid = order.paymentStatus === 'Paid';
              const isCOD = order.paymentMethod === 'Cash on Delivery';
              const orderDate = new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              const estDate = order.tracking?.estimatedDelivery || new Date(new Date(order.createdAt || Date.now()).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div 
                  key={order.id || order._id || orderRef} 
                  className="bg-white rounded-3xl border border-[#ECE5D8] shadow-[0_4px_24px_rgba(30,20,10,0.04)] hover:shadow-[0_8px_32px_rgba(30,20,10,0.07)] transition-all overflow-hidden"
                >
                  {/* Top Bar: Order ID, Date, Status, Payment & Total */}
                  <div className="bg-[#F8F5EE] px-6 sm:px-8 py-5 border-b border-[#ECE5D8] flex flex-wrap items-center justify-between gap-4">
                    
                    {/* Left: Identifier, Date, Estimated Delivery */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E3DACB] shadow-2xs">
                        <span className="font-mono text-xs sm:text-sm font-bold text-[#1C1714] tracking-wide">
                          {orderRef}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderId(orderRef)}
                          className="text-[#8C7A6B] hover:text-black transition-colors cursor-pointer p-0.5"
                          title="Copy Order ID"
                        >
                          <Copy size={13} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#7D7063]">
                        <Calendar size={13} className="text-[#A47E3B]" />
                        <span>Placed on {orderDate}</span>
                      </div>

                      <span className="hidden sm:inline text-[#D8CEBE]">•</span>

                      <div className="flex items-center gap-1.5 text-xs text-[#5C4A38] font-medium bg-[#EFE9DD]/80 px-2.5 py-1 rounded-lg">
                        <Truck size={13} className="text-[#8C6D1F]" />
                        <span>Est. Delivery: <strong>{estDate}</strong></span>
                      </div>
                    </div>

                    {/* Right: Badges & Total */}
                    <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                      
                      {/* Payment Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isCOD
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}>
                        <ShieldCheck size={13} className={isPaid ? 'text-emerald-600' : 'text-amber-700'} />
                        <span>{isPaid ? 'Razorpay • Paid' : isCOD ? 'Cash on Delivery' : 'Payment Pending'}</span>
                      </span>

                      {/* Status Badge */}
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle size={13} />
                          <span>Cancelled</span>
                        </span>
                      ) : order.status === 'Delivered' ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={13} />
                          <span>Delivered</span>
                        </span>
                      ) : order.status === 'Shipped' ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
                          <span>In Transit</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                          <span>Processing</span>
                        </span>
                      )}

                      {/* Verified Grand Total */}
                      <div className="text-right pl-2 border-l border-[#E3DACB]">
                        <span className="text-base sm:text-lg font-serif font-bold text-[#1C1714]">
                          ₹{resolvedTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Elegant Milestone Tracking Stepper */}
                  {!isCancelled && (
                    <div className="px-6 sm:px-10 py-6 bg-[#FCFAF7] border-b border-[#ECE5D8]">
                      
                      <div className="relative flex items-center justify-between max-w-xl mx-auto my-2">
                        {/* Background Rail */}
                        <div className="absolute top-4 left-6 right-6 h-[2px] bg-[#E8E0D2] -translate-y-1/2 z-0" />
                        
                        {/* Active Progress Gold Line */}
                        <div 
                          className="absolute top-4 left-6 h-[2.5px] bg-gradient-to-r from-[#D4A64A] via-[#B8860B] to-[#916515] -translate-y-1/2 z-0 transition-all duration-700 shadow-sm"
                          style={{
                            width: currentStep === 0 ? '0%' : currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%'
                          }}
                        />

                        {/* Step Nodes */}
                        {TRACKING_STEPS.map((step, idx) => {
                          const isPassed = currentStep >= idx;
                          const isCurrent = currentStep === idx;
                          const IconComp = step.icon;

                          return (
                            <div key={step.name} className="relative z-10 flex flex-col items-center group">
                              <div 
                                className={`w-8 sm:w-9 h-8 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isCurrent
                                    ? 'bg-[#1C1714] text-[#ECC880] ring-4 ring-[#EFE5D3] shadow-md scale-110'
                                    : isPassed
                                    ? 'bg-[#D4A64A] text-white shadow-xs'
                                    : 'bg-white text-[#BDB2A5] border border-[#DDD5C7]'
                                }`}
                              >
                                <IconComp size={14} strokeWidth={isPassed ? 2.4 : 1.8} />
                              </div>

                              <span className={`text-[11px] sm:text-xs mt-2 font-medium tracking-wide text-center whitespace-nowrap ${
                                isCurrent ? 'text-[#1C1714] font-bold' : isPassed ? 'text-[#5C4A38] font-semibold' : 'text-[#AFA495]'
                              }`}>
                                {step.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Micro-Notification Banner explaining current milestone */}
                      <div className="mt-4 p-3 rounded-2xl bg-[#F4EFE6]/80 border border-[#E3DACB] flex items-center justify-between gap-3 text-xs text-[#5C4A38]">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-[#A47E3B] shrink-0" />
                          <span>
                            {currentStep === 0 && 'Your bespoke fragrance order has been logged into the maison atelier queue.'}
                            {currentStep === 1 && 'Our perfumers are blending, bottling, and preparing the gold-embossed presentation coffret.'}
                            {currentStep === 2 && `Consignment is in transit with ${order.tracking?.courierName || 'Maison White-Glove Logistics'}.`}
                            {currentStep === 3 && 'Order delivered successfully. Enjoy your signature olfactory impression.'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTrackingOrder(order)}
                          className="text-xs font-semibold text-[#8C6228] hover:text-[#5C4A38] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <span>Live Timeline</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="p-6 sm:p-8 space-y-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#8C7A6B] font-semibold">
                      Curated Fragrance Flacons
                    </p>

                    <div className="divide-y divide-[#F0EAE0]">
                      {(order.items && order.items.length > 0) ? (
                        order.items.map((item, idx) => {
                          const itemName = item.product_name || item.name || 'Fine Fragrance Flacon';
                          const itemImg = item.product_image || item.image;
                          const itemSize = item.size || '50ml';
                          const itemQty = parseInt(item.quantity, 10) || 1;
                          const itemPrice = Number(item.price) || 0;
                          const lineTotal = itemPrice * itemQty;

                          return (
                            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                
                                {/* Luxury Flacon Squircle Image */}
                                <div className="w-16 h-20 bg-[#FAF7F2] rounded-2xl p-1.5 flex items-center justify-center shrink-0 border border-[#ECE5D8] shadow-2xs">
                                  <img 
                                    src={getImageUrl(itemImg)} 
                                    alt={itemName} 
                                    className="w-full h-full object-contain drop-shadow-sm"
                                    onError={(e) => { e.target.src = '/images/perfumes/amber_oud_perfume.jpg'; }}
                                  />
                                </div>

                                <div>
                                  <Link
                                    href={`/product/${item.product_id || item.productId || ''}`}
                                    className="text-sm sm:text-base font-serif font-bold text-[#1C1714] hover:text-[#A47E3B] transition-colors block"
                                  >
                                    {itemName}
                                  </Link>

                                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F4EFE6] text-[#4A3B2C] px-2 py-0.5 rounded-md border border-[#E3DACB]">
                                      {itemSize}
                                    </span>
                                    <span className="text-xs text-[#7D7063]">
                                      Qty: <strong>{itemQty}</strong>
                                    </span>
                                    <span className="text-xs text-[#A89E90]">×</span>
                                    <span className="text-xs text-[#5C4A38] font-medium">
                                      ₹{itemPrice.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Price & Reorder Action */}
                              <div className="flex items-center justify-between sm:justify-end gap-4 sm:text-right pt-2 sm:pt-0 border-t sm:border-0 border-[#F5EFE6]">
                                <div>
                                  <span className="text-sm sm:text-base font-bold text-[#1C1714] font-sans">
                                    ₹{lineTotal.toLocaleString('en-IN')}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleBuyAgain(item)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#3D2E20] bg-[#F4EFE6] hover:bg-[#EAE2D5] border border-[#E0D5C3] transition-all cursor-pointer"
                                >
                                  <RotateCcw size={11} />
                                  <span>Buy Again</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-400 italic py-2">Fragrance formulation details on file.</p>
                      )}
                    </div>

                    {/* Card Footer: Delivery Destination & Actions */}
                    <div className="pt-5 mt-4 border-t border-[#ECE5D8] flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Destination Details */}
                      <div className="space-y-1 text-xs text-[#6B5D50]">
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-[#A47E3B] shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            Deliver to: <strong>{order.customer_name || user?.name || 'Customer'}</strong> — {order.address || 'Standard Atelier Address'}
                          </span>
                        </div>

                        {order.isGift && (
                          <div className="flex items-center gap-2 text-[#8C6228] font-medium pt-0.5">
                            <Gift size={13} className="shrink-0" />
                            <span>Gift Packaging & Personalized Wax-Sealed Note Included</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                        <button
                          type="button"
                          onClick={() => setActiveInvoiceOrder(order)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#1C1714] bg-white hover:bg-[#FAF8F5] border border-[#D8CEBE] shadow-2xs transition-all cursor-pointer"
                        >
                          <FileText size={13} />
                          <span>View Invoice</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTrackingOrder(order)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1C1714] hover:bg-[#2C2420] shadow-sm transition-all cursor-pointer"
                        >
                          <Truck size={13} />
                          <span>Track Dispatch</span>
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* 5. LUXURY LIVE TRACKING MODAL */}
      <Modal
        open={Boolean(activeTrackingOrder)}
        onCancel={() => setActiveTrackingOrder(null)}
        footer={null}
        centered
        width={540}
        className="rounded-3xl overflow-hidden"
      >
        {activeTrackingOrder && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE5D8]">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#A47E3B]">
                  Live Consignment Tracking
                </span>
                <h3 className="text-xl font-serif font-bold text-[#1C1714]">
                  {activeTrackingOrder.orderId || `#ORD-${String(activeTrackingOrder.id || '').slice(-6)}`}
                </h3>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                <span>{activeTrackingOrder.status || 'Processing'}</span>
              </span>
            </div>

            {/* Courier Meta */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#ECE5D8] grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[#8C7A6B] text-[10px] uppercase tracking-wider">Courier Partner</p>
                <p className="font-bold text-[#1C1714] mt-0.5">
                  {activeTrackingOrder.tracking?.courierName || 'Maison White-Glove Logistics'}
                </p>
              </div>
              <div>
                <p className="text-[#8C7A6B] text-[10px] uppercase tracking-wider">Tracking Waybill #</p>
                <p className="font-mono font-bold text-[#1C1714] mt-0.5">
                  {activeTrackingOrder.tracking?.trackingNumber || `RW-${Date.now().toString().slice(-8)}`}
                </p>
              </div>
            </div>

            {/* Step Checkpoints */}
            <div className="space-y-4 pl-2">
              {TRACKING_STEPS.map((step, idx) => {
                const stepIdx = getStepIndex(activeTrackingOrder.status);
                const isPassed = stepIdx >= idx;
                const isCurrent = stepIdx === idx;
                const StepIcon = step.icon;

                return (
                  <div key={step.name} className="flex items-start gap-3.5 relative">
                    {idx < TRACKING_STEPS.length - 1 && (
                      <div className={`absolute left-3.5 top-7 bottom-0 w-0.5 -translate-x-1/2 ${
                        isPassed ? 'bg-[#D4A64A]' : 'bg-[#EAE2D5]'
                      }`} />
                    )}

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-[#1C1714] text-[#ECC880] ring-4 ring-[#EFE5D3]'
                        : isPassed
                        ? 'bg-[#D4A64A] text-white'
                        : 'bg-white text-stone-300 border border-[#DDD5C7]'
                    }`}>
                      <StepIcon size={12} strokeWidth={2.4} />
                    </div>

                    <div className="pb-3">
                      <p className={`text-xs font-bold ${isPassed ? 'text-[#1C1714]' : 'text-stone-400'}`}>
                        {step.name}
                      </p>
                      <p className="text-[11px] text-[#7D7063] mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setActiveTrackingOrder(null)}
              className="w-full bg-[#1C1714] text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#2C2420] transition-colors cursor-pointer"
            >
              Close Tracking Window
            </button>
          </div>
        )}
      </Modal>

      {/* 6. LUXURY INVOICE & RECEIPT MODAL */}
      <Modal
        open={Boolean(activeInvoiceOrder)}
        onCancel={() => setActiveInvoiceOrder(null)}
        footer={null}
        centered
        width={600}
        className="rounded-3xl overflow-hidden"
      >
        {activeInvoiceOrder && (
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Invoice Header */}
            <div className="text-center pb-5 border-b border-[#ECE5D8] space-y-1">
              <span className="font-serif text-lg font-bold tracking-[0.22em] text-[#A47E3B] uppercase">
                ROVE & AMBER
              </span>
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#7D7063]">
                Maison Fine Fragrance • Tax Invoice
              </p>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-[#ECE5D8]">
              <div>
                <p className="text-[10px] text-[#8C7A6B] uppercase tracking-wider">Invoice Number</p>
                <p className="font-mono font-bold text-[#1C1714] mt-0.5">
                  INV-{String(activeInvoiceOrder.orderId || activeInvoiceOrder.id || '').replace('#', '')}
                </p>
                <p className="text-[10px] text-[#8C7A6B] uppercase tracking-wider mt-2">Billed To</p>
                <p className="font-bold text-[#1C1714] mt-0.5">
                  {activeInvoiceOrder.customer_name || user?.name || 'Valued Patron'}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-[#8C7A6B] uppercase tracking-wider">Issue Date</p>
                <p className="font-medium text-[#1C1714] mt-0.5">
                  {new Date(activeInvoiceOrder.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-[10px] text-[#8C7A6B] uppercase tracking-wider mt-2">Payment Clearance</p>
                <p className="font-bold text-emerald-800 mt-0.5">
                  {activeInvoiceOrder.paymentMethod || 'Razorpay Gateway'} ({activeInvoiceOrder.paymentStatus || 'Paid'})
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-[#8C7A6B] uppercase pb-2 border-b border-[#ECE5D8]">
                <span>Description</span>
                <span>Amount</span>
              </div>

              {(activeInvoiceOrder.items || []).map((it, idx) => {
                const itName = it.product_name || it.name || 'Fine Fragrance';
                const itQty = parseInt(it.quantity, 10) || 1;
                const itPrice = Number(it.price) || 0;
                return (
                  <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-stone-100">
                    <div>
                      <span className="font-medium text-black">{itName}</span>
                      <span className="text-[#8C7A6B] ml-2 font-mono text-[11px]">({it.size || '50ml'} × {itQty})</span>
                    </div>
                    <span className="font-mono font-bold">₹{(itPrice * itQty).toLocaleString('en-IN')}</span>
                  </div>
                );
              })}

              {/* Total Calculation */}
              <div className="pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-[#7D7063]">
                  <span>Subtotal</span>
                  <span className="font-mono">
                    ₹{((activeInvoiceOrder.items || []).reduce((s, i) => s + (Number(i.price) * (parseInt(i.quantity, 10) || 1)), 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#7D7063]">
                  <span>White-Glove Courier Logistics</span>
                  <span className="text-emerald-800 font-semibold uppercase text-[10px]">Complimentary</span>
                </div>
                <div className="flex justify-between text-sm font-serif font-bold text-black pt-2 border-t border-[#ECE5D8]">
                  <span>Total Amount Settled</span>
                  <span className="font-sans font-bold">
                    ₹{(Number(activeInvoiceOrder.total_amount) || Number(activeInvoiceOrder.totalAmount) || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#D8CEBE] text-black py-3 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInvoiceOrder(null)}
                className="flex-1 bg-[#1C1714] text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#2C2420] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
