"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { 
  Download, 
  Printer, 
  ExternalLink, 
  X, 
  Loader2, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import orderService from '@/services/orderService';

export default function OrderInvoiceModal({ order, open, onClose }) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const orderIdRaw = order?.orderId || order?.id || order?._id || '';
  const cleanId = String(orderIdRaw).replace('#', '');
  const invoiceNumber = `INV-${cleanId}`;

  useEffect(() => {
    let activeUrl = null;

    const fetchPDF = async () => {
      if (!open || !order) return;
      setLoading(true);
      setError(false);

      try {
        const blob = await orderService.downloadInvoicePDF(order.id || order._id || cleanId);
        if (blob && blob.size > 0) {
          const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          activeUrl = url;
          setPdfBlobUrl(url);
        } else {
          setError(true);
        }
      } catch (err) {
        console.warn('PDF fetch error, using structured preview fallback:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [open, order, cleanId]);

  if (!order) return null;

  const handleDownload = () => {
    if (pdfBlobUrl) {
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = `RoveAmber-${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      window.print();
    }
  };

  const handlePrint = () => {
    if (pdfBlobUrl) {
      const iframe = document.getElementById('invoice-pdf-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.print();
        return;
      }
    }
    window.print();
  };

  const handleOpenNewTab = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={820}
      closeIcon={null}
      className="luxury-pdf-invoice-modal"
    >
      <div className="bg-[#FAF9F7] -m-6 p-4 sm:p-6 rounded-3xl border border-[#E8DFC9] shadow-2xl relative font-sans text-stone-900 overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#ECE5D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF3E0] text-[#B8860B] border border-[#E0D0A5] flex items-center justify-center shrink-0 shadow-2xs">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-[#140D07] tracking-tight">
                  ROVE & AMBER
                </span>
                <span className="text-[10px] font-sans font-bold bg-[#FAF0D4] text-[#8C6D1F] px-2 py-0.5 rounded-full border border-[#E8DEC8]">
                  {invoiceNumber}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 m-0 font-light">
                Official GST Tax Invoice • Maison Fine Fragrance
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {pdfBlobUrl && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Download PDF File"
                >
                  <Download size={13} />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Print Invoice"
                >
                  <Printer size={13} />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="p-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 transition-all cursor-pointer"
                  title="Open in Full Tab"
                >
                  <ExternalLink size={14} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-black hover:text-white border border-stone-200 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full">
          {loading ? (
            <div className="h-[65vh] min-h-[480px] rounded-2xl bg-white border border-[#E8DFC9] flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#B8860B]" />
              <span className="text-xs font-serif tracking-widest text-[#8C6D1F] uppercase font-bold">
                Rendering Official PDF Invoice...
              </span>
            </div>
          ) : pdfBlobUrl && !error ? (
            /* Embedded Native Browser PDF Viewer */
            <div className="w-full h-[68vh] min-h-[500px] rounded-2xl overflow-hidden border border-[#E8DFC9] bg-stone-100 shadow-inner">
              <iframe
                id="invoice-pdf-iframe"
                src={`${pdfBlobUrl}#view=FitH&toolbar=1`}
                className="w-full h-full border-none"
                title={`Tax Invoice ${invoiceNumber}`}
              />
            </div>
          ) : (
            /* Structured Fallback Document View */
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC9] shadow-2xs space-y-5">
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#FAF8F5] p-4 rounded-xl border border-[#ECE5D8]">
                <div>
                  <p className="text-[10px] text-[#8C7A6B] uppercase font-bold tracking-wider m-0">Invoice Number</p>
                  <p className="font-mono font-bold text-[#1C1714] mt-0.5 m-0">{invoiceNumber}</p>
                  <p className="text-[10px] text-[#8C7A6B] uppercase font-bold tracking-wider mt-2.5 m-0">Billed To</p>
                  <p className="font-bold text-[#1C1714] mt-0.5 m-0">{order.customer_name || 'Valued Patron'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8C7A6B] uppercase font-bold tracking-wider m-0">Issue Date</p>
                  <p className="font-medium text-[#1C1714] mt-0.5 m-0">
                    {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-[#8C7A6B] uppercase font-bold tracking-wider mt-2.5 m-0">Payment Method</p>
                  <p className="font-bold text-emerald-800 mt-0.5 m-0">
                    {order.paymentMethod || 'Razorpay Online'} ({order.paymentStatus || 'Paid'})
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-[#8C7A6B] uppercase pb-2 border-b border-[#ECE5D8]">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                {(order.items || []).map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-2 border-b border-stone-100">
                    <div>
                      <span className="font-semibold text-stone-900">{it.product_name || it.name || 'Fine Fragrance'}</span>
                      <span className="text-stone-500 ml-2 font-mono text-[11px]">({it.size || '50ml'} × {it.quantity || 1})</span>
                    </div>
                    <span className="font-mono font-bold">₹{((Number(it.price) || 0) * (it.quantity || 1)).toLocaleString('en-IN')}</span>
                  </div>
                ))}

                <div className="pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span className="font-mono font-medium">₹{((order.items || []).reduce((s, i) => s + (Number(i.price) * (parseInt(i.quantity, 10) || 1)), 0)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>White-Glove Courier Logistics</span>
                    <span className="text-emerald-800 font-semibold uppercase text-[10px]">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans font-bold text-stone-950 pt-2 border-t border-[#ECE5D8]">
                    <span>Total Amount Settled</span>
                    <span>₹{(Number(order.total_amount) || Number(order.totalAmount) || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-3 border-t border-[#ECE5D8]">
          <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
            <ShieldCheck size={14} className="text-[#8C6D1F]" />
            <span>Official Computer Generated Tax Invoice • No signature required</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#140D07] hover:bg-black text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

