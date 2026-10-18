"use client";
import React, { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import { 
  Package, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Phone,
  ArrowRight,
  MapPin,
  Check,
  Copy
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import orderService from '@/services/orderService';
import { getImageUrl } from '@/utils/imageHelper';

const TRACKING_STEPS = [
  { name: 'Confirmed', icon: Check },
  { name: 'Processing', icon: Package },
  { name: 'Shipped', icon: Truck },
  { name: 'Delivered', icon: MapPin }
];

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('userToken') || localStorage.getItem('adminToken') || localStorage.getItem('token') || localStorage.getItem('adminKey')) 
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
    if (status === 'Cancelled') return -1;
    if (status === 'Delivered') return 3;
    if (status === 'Shipped') return 2;
    return 1; // Processing / Placed
  };

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    message.success(`Copied ${id}`);
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return order.status !== 'Delivered' && order.status !== 'Cancelled';
    if (filterStatus === 'delivered') return order.status === 'Delivered';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between pt-24 sm:pt-28 font-sans text-black">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1">
        
        {/* Simple Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D6]">
          <div>
            <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-gray-400 mb-1">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <span className="text-black font-semibold">Orders</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-black">
              My Orders
            </h1>
          </div>

          {/* Simple Filter Pills */}
          {isLoggedIn && orders.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#E0D8CA] shadow-2xs">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('active')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === 'active'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('delivered')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === 'delivered'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Delivered
              </button>
            </div>
          )}
        </div>

        {!isLoggedIn ? (
          /* Sign In Prompt */
          <div className="bg-white rounded-3xl p-10 text-center border border-[#E8E2D6] shadow-2xs max-w-md mx-auto my-12 space-y-4">
            <div className="w-14 h-14 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto text-gray-500 border border-[#E8E2D6]">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-black mb-1">Please Sign In</h3>
              <p className="text-xs text-gray-500 font-light">
                Sign in to view your orders and track live shipments.
              </p>
            </div>
            <Link href="/login?redirect=/orders" className="inline-block pt-2">
              <button className="bg-black hover:bg-[#262626] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
                Sign In
              </button>
            </Link>
          </div>
        ) : loading ? (
          /* Loading */
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Spin size="large" />
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D6] shadow-2xs max-w-md mx-auto my-12 space-y-4">
            <div className="w-14 h-14 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto text-gray-400 border border-[#E8E2D6]">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-black mb-1">No Orders Found</h3>
              <p className="text-xs text-gray-500 font-light">
                You have no orders in this category.
              </p>
            </div>
            <Link href="/shop" className="inline-block pt-2">
              <button className="bg-black hover:bg-[#262626] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
                Explore Collections
              </button>
            </Link>
          </div>
        ) : (
          /* Simple, Clean Order Cards */
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const currentStep = getStepIndex(order.status || 'Processing');
              const isCancelled = order.status === 'Cancelled';
              const orderRef = order.orderId || `#ORD-${order.id}`;

              return (
                <div 
                  key={order.id || order._id} 
                  className="bg-white rounded-2xl border border-[#E8E2D6] shadow-2xs overflow-hidden"
                >
                  {/* Compact Header Bar */}
                  <div className="bg-[#FAF8F5] px-5 py-3.5 border-b border-[#E8E2D6] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-black">
                        <span>{orderRef}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderId(orderRef)}
                          className="text-gray-400 hover:text-black transition-colors cursor-pointer"
                          title="Copy Order ID"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isCancelled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <XCircle size={12} />
                          <span>Cancelled</span>
                        </span>
                      ) : order.status === 'Delivered' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          <span>Delivered</span>
                        </span>
                      ) : order.status === 'Shipped' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          <Truck size={12} className="animate-pulse" />
                          <span>Shipped</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF8F5] text-black border border-[#E0D8CA]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                          <span>Processing</span>
                        </span>
                      )}

                      <span className="text-sm font-bold text-black font-sans">
                        ₹{(order.total_amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Clean Modern Pure-Cream Progress Stepper */}
                  {!isCancelled && (
                    <div className="px-5 sm:px-8 py-5 bg-[#FAF8F5] border-b border-[#E8E2D6]">
                      <div className="relative flex items-center justify-between max-w-lg mx-auto">
                        
                        {/* Connecting line background in soft cream */}
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#EAE2D5] -translate-y-1/2 z-0" />
                        
                        {/* Active filled line in matching warm cream/taupe */}
                        <div 
                          className="absolute top-4 left-6 h-0.5 bg-gradient-to-r from-[#BFA888] to-[#9C8666] -translate-y-1/2 z-0 transition-all duration-500 shadow-2xs"
                          style={{
                            width: currentStep === 0 ? '0%' : currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%'
                          }}
                        />

                        {/* Step Nodes */}
                        {TRACKING_STEPS.map((step, idx) => {
                          const isPassed = currentStep >= idx;
                          const isCurrent = currentStep === idx;
                          const IconComponent = step.icon;

                          return (
                            <div key={step.name} className="relative z-10 flex flex-col items-center">
                              {/* Node Squircle in Matching Luxury Cream */}
                              <div 
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                                  isCurrent
                                    ? 'bg-[#F4EFE6] border-2 border-[#8A7459] text-[#4A3B2C] ring-4 ring-[#E8E0D2] scale-110 shadow-xs font-bold'
                                    : isPassed
                                    ? 'bg-[#F4EFE6] border-2 border-[#BFA888] text-[#5C4A38] ring-4 ring-[#FAF8F5] shadow-2xs font-bold'
                                    : 'bg-white text-[#C2B7A8] border border-[#E5DDD0]'
                                }`}
                              >
                                <IconComponent size={13} strokeWidth={isPassed ? 2.5 : 1.8} />
                              </div>

                              <span className={`text-[11px] mt-1.5 font-medium tracking-wide ${
                                isCurrent ? 'text-[#4A3B2C] font-bold' : isPassed ? 'text-[#5C4A38]' : 'text-[#A89E90]'
                              }`}>
                                {step.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fragrance Items List */}
                  <div className="p-5 space-y-3">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <Link
                              href={`/product/${item.product_id || item.productId || ''}`}
                              className="w-12 h-16 bg-[#FAF8F5] rounded-xl p-1 flex items-center justify-center flex-shrink-0 border border-gray-100"
                            >
                              <img 
                                src={getImageUrl(item.product_image || item.image)} 
                                alt={item.product_name || item.name} 
                                className="w-full h-full object-contain"
                                onError={(e) => { e.target.src = '/images/perfumes/amber_oud_perfume.jpg'; }}
                              />
                            </Link>

                            <div className="min-w-0">
                              <Link
                                href={`/product/${item.product_id || item.productId || ''}`}
                                className="text-xs sm:text-sm font-serif font-bold text-black hover:underline block truncate"
                              >
                                {item.product_name || item.name || 'Fine Fragrance'}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold bg-[#FAF8F5] border border-[#E0D8CA] text-black px-1.5 py-0.5 rounded">
                                  Size: {item.size || 'M'}
                                </span>
                                <span className="text-xs text-gray-500 font-light">
                                  Qty: {item.quantity || 1}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-black font-sans">
                              ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">Item details available upon dispatch.</p>
                    )}

                    {/* Simple Destination Line */}
                    <div className="pt-3 mt-1 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate max-w-sm">
                          {order.address || 'Standard Delivery Address'}
                        </span>
                      </div>

                      {order.phone && (
                        <div className="flex items-center gap-1 shrink-0 text-gray-600">
                          <Phone size={12} className="text-gray-400" />
                          <span>{order.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyOrdersPage;
