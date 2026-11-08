"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  Check, 
  MapPin, 
  FileText, 
  ExternalLink, 
  Copy, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { message } from 'antd';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import orderService from '@/services/orderService';
import authService from '@/services/authService';
import { getImageUrl } from '@/utils/imageHelper';
import OrderInvoiceModal from '../components/OrderInvoiceModal';

const TRACKING_STEPS = [
  { name: 'Order Confirmed', description: 'Order verified & payment logged', icon: Check },
  { name: 'Processing', description: 'Hand-inspected & prepared for courier dispatch', icon: Package },
  { name: 'In Transit', description: 'Dispatched via White-Glove courier', icon: Truck },
  { name: 'Delivered', description: 'Delivered to your destination', icon: MapPin }
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedTrack, setCopiedTrack] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const cleanId = String(id).replace('#', '');
        const res = await orderService.getOrderById(cleanId).catch(() => null);
        if (res?.success && res.data) {
          setOrder(res.data);
        } else {
          // Fallback: search within user's order list
          const listRes = await orderService.getMyOrders().catch(() => null);
          const allOrders = listRes?.data?.orders || listRes?.data || [];
          const found = allOrders.find(o => 
            String(o.orderId || '').replace('#', '').toLowerCase() === cleanId.toLowerCase() ||
            String(o.id || o._id) === cleanId
          );
          if (found) {
            setOrder(found);
          } else {
            setError('Order details could not be found or session has expired.');
          }
        }
      } catch (err) {
        console.error('Error fetching order by ID:', err);
        setError('Unable to load order details. Please sign in to access your order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStepIndex = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipped' || s === 'dispatch' || s === 'dispatched' || s === 'in transit') return 2;
    if (s === 'processing' || s === 'confirmed') return 1;
    return 0;
  };

  const copyTrackingId = (trackingNum) => {
    if (!trackingNum) return;
    navigator.clipboard.writeText(trackingNum);
    setCopiedTrack(true);
    message.success('Delhivery Track ID copied to clipboard');
    setTimeout(() => setCopiedTrack(false), 2500);
  };

  const orderIdDisplay = order?.orderId || (id ? `#${String(id).replace('#', '')}` : '#ORD');
  const stepIdx = getStepIndex(order?.status);

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-sans text-[#1A1A1A] pt-16 sm:pt-20 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 w-full flex-1">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/profile?tab=orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Orders</span>
          </Link>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5]">
            Maison Verified
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 size={36} className="animate-spin text-[#B8860B] mx-auto" />
            <p className="text-xs uppercase tracking-widest text-stone-500 font-medium">
              Retrieving Order Consignment...
            </p>
          </div>
        ) : error || !order ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DFC9] text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle size={24} />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#140D07]">
              Order Details
            </h1>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              {error || 'This order could not be retrieved directly. Please sign in to access your order history and tax invoice.'}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login?redirect=/profile?tab=orders"
                className="px-6 py-2.5 rounded-full bg-[#1C1714] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
              >
                Sign In to Account
              </Link>
              <Link
                href="/profile?tab=orders"
                className="px-6 py-2.5 rounded-full bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:border-black transition-colors"
              >
                View My Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. Master Order Card */}
            <div className="bg-white rounded-3xl border border-[#E8DFC9] shadow-xs overflow-hidden">
              
              {/* Header Bar */}
              <div className="p-5 sm:p-6 border-b border-[#F0EBE1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FCFBF9]">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-mono font-bold text-lg sm:text-xl text-[#140D07] m-0">
                      {orderIdDisplay}
                    </h1>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {order.status || 'Processing'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 m-0 mt-1">
                    Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <FileText size={14} className="text-[#8C6D1F]" />
                    <span>View Tax Invoice</span>
                  </button>
                </div>
              </div>

              {/* Stepper Progress */}
              <div className="p-5 sm:p-6 border-b border-[#F0EBE1]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isDone = stepIdx >= idx;
                    const isCurrent = stepIdx === idx;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.name} className="flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2 w-full">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isCurrent
                              ? 'bg-[#1C1714] text-[#ECC880] ring-4 ring-[#FAF0D4]'
                              : isDone
                                ? 'bg-[#8C6D1F] text-white'
                                : 'bg-stone-100 text-stone-400 border border-stone-200'
                          }`}>
                            <StepIcon size={14} strokeWidth={2.2} />
                          </div>
                          <div className={`flex-1 h-0.5 ${idx === 3 ? 'hidden' : isDone ? 'bg-[#8C6D1F]' : 'bg-stone-200'}`} />
                        </div>
                        <div>
                          <span className={`text-xs block font-bold ${isDone ? 'text-[#140D07]' : 'text-stone-400'}`}>
                            {step.name}
                          </span>
                          <span className="text-[10.5px] text-stone-500 font-light leading-tight block mt-0.5">
                            {step.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier & Consignment Details */}
              <div className="p-5 sm:p-6 bg-[#FAF9F7] border-b border-[#F0EBE1] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10.5px] uppercase font-bold text-stone-500 tracking-wider block">
                      Courier Partner
                    </span>
                    <span className="text-sm font-bold text-[#140D07]">
                      {order.tracking?.courierName || 'Delhivery Express'}
                    </span>
                  </div>

                  {order.tracking?.trackingNumber && (
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DFC9] flex items-center gap-2 font-mono text-xs font-bold text-[#140D07]">
                        <span>Track ID: {order.tracking.trackingNumber}</span>
                        <button
                          type="button"
                          onClick={() => copyTrackingId(order.tracking.trackingNumber)}
                          className="text-stone-400 hover:text-black transition-colors cursor-pointer"
                          title="Copy Track ID"
                        >
                          {copiedTrack ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </div>

                      <a
                        href={order.tracking.trackingUrl || 'https://www.delhivery.com/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1C1714] text-[#ECC880] text-xs font-bold hover:bg-black transition-colors"
                      >
                        <span>Track</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                <div className="text-xs text-stone-600 pt-2 border-t border-[#E8DFC9]">
                  <span className="font-bold text-stone-800">Dispatch Address: </span>
                  <span>{order.address || 'Address provided at checkout'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-5 sm:p-6 space-y-3">
                <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider block mb-2">
                  Artisanal Formulations
                </span>

                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-stone-100 last:border-b-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-200 overflow-hidden shrink-0 p-1">
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-serif font-bold text-[#140D07] block truncate">
                          {item.name || item.product_name}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {item.size || '50ml'} • Qty: {item.quantity || 1}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-xs sm:text-sm text-[#140D07] shrink-0">
                      ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Total Investment</span>
                  <span className="font-mono text-lg font-bold text-[#140D07]">
                    ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Invoice PDF Modal */}
      <OrderInvoiceModal
        order={order}
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />

      <Footer />
    </div>
  );
}

