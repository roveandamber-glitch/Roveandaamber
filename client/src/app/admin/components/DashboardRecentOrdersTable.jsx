"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function DashboardRecentOrdersTable({
  recentOrders = [],
  getStatusBadge,
  getPaymentBadge
}) {
  return (
    <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#F6F0E6] mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-serif text-[#1B100A] font-medium tracking-tight">
            Recent Orders
          </h2>
          <p className="text-xs text-gray-500 font-light mt-0.5">
            Overview of latest boutique product purchases and patron orders.
          </p>
        </div>
        <Link 
          href="/admin/orders" 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F4ECE1] text-xs font-semibold text-[#B38728] border border-[#E8DFC8] transition-colors"
        >
          <span>View All Orders</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-[#E8DFC8] text-gray-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="pb-3 pr-2 font-semibold">Order</th>
              <th className="pb-3 px-2 font-semibold">Customer</th>
              <th className="pb-3 px-2 font-semibold">Fragrance</th>
              <th className="pb-3 px-2 font-semibold">Amount</th>
              <th className="pb-3 px-2 font-semibold">Payment</th>
              <th className="pb-3 px-2 font-semibold">Fulfillment</th>
              <th className="pb-3 pl-2 text-right font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F6F0E6]">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, idx) => {
                const orderIdStr = order.orderNumber || order.orderId || (order.id ? `#ORD-${String(order.id).slice(-4).toUpperCase()}` : `#ORD-${1000 + idx}`);
                const custName = order.customerName || order.customer?.name || order.customer_name || 'Valued Patron';
                const custEmail = order.email || order.customer?.email || '';
                const totalVal = order.total_amount ?? order.total ?? order.totalPrice ?? 0;
                const prodDesc = order.productSummary || order.items?.[0]?.name || 'Artisanal Perfume Flacon';
                const payStatus = order.paymentStatus || (order.paymentMethod ? 'Paid' : 'Pending');
                const orderStatus = order.status || 'Processing';
                const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today');

                return (
                  <tr key={order.id || order._id || idx} className="hover:bg-[#FAF7F2] transition-colors group">
                    <td className="py-3.5 pr-2 font-medium text-gray-900">
                      <Link 
                        href={`/admin/orders`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DFC8] font-mono text-[11px] font-semibold text-[#B38728] hover:bg-[#F4ECE1] transition-colors"
                      >
                        {orderIdStr}
                      </Link>
                    </td>

                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-2.5">
                        {order.customer?.avatar ? (
                          <img src={order.customer.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#E8DFC8]" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FAF7F2] to-[#E8DFC8] text-[#B38728] font-bold text-xs flex items-center justify-center shrink-0 border border-[#E8DFC8]">
                            {custName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[130px] leading-tight m-0">
                            {custName}
                          </p>
                          {custEmail && (
                            <p className="text-[10px] text-gray-400 truncate max-w-[130px] m-0">
                              {custEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-2 text-gray-700 font-medium truncate max-w-[160px]">
                      <span className="truncate block" title={prodDesc}>
                        {prodDesc}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 font-bold text-gray-900 font-sans whitespace-nowrap">
                      ₹{Number(totalVal).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-2 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getPaymentBadge(payStatus)}`}>
                        {payStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getStatusBadge(orderStatus)}`}>
                        {orderStatus}
                      </span>
                    </td>

                    <td className="py-3.5 pl-2 text-right text-gray-500 text-[11px] whitespace-nowrap font-medium">
                      {orderDate}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-400">
                  <ShoppingBag size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-600 m-0">No customer orders recorded yet.</p>
                  <p className="text-xs text-gray-400 mt-1 m-0">Orders placed on the boutique storefront will appear here instantly.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
