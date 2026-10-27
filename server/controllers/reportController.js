import mongoose from 'mongoose';
import { Order } from '../models/orderModel.js';
import { Product } from '../models/productModel.js';
import {
  generateSalesReportPDF,
  generateSalesReportCSV
} from '../services/reportExportService.js';

/**
 * Core Financial & Analytics Aggregation Engine
 * Calculation Rules:
 * - Gross Sales: Sum of items total (or subtotal) before any discounts
 * - Discounts: Sum of all promotional and coupon deductions
 * - Refunds: Sum of refunded amounts for cancelled and returned orders
 * - Net Sales: Gross Sales - Discounts - Refunds + Shipping Fees + Gift Wrap Fees
 * - Average Order Value (AOV): Net Sales / Valid (non-cancelled) Orders
 */
const aggregateOrderFinancials = (orders, periodName = 'Selected Period') => {
  let grossSales = 0;
  let totalDiscounts = 0;
  let totalRefunds = 0;
  let totalShippingFees = 0;
  let totalGiftWrapFees = 0;

  let completedOrders = 0;
  let inProgressOrders = 0;
  let cancelledOrders = 0;
  let refundedOrders = 0;

  const productSalesMap = {};
  const categorySalesMap = {};
  const paymentMethodsMap = {
    Razorpay: { count: 0, revenue: 0 },
    'Cash on Delivery': { count: 0, revenue: 0 }
  };

  orders.forEach(o => {
    const subtotal = o.subtotal || 0;
    const discount = o.discountAmount || 0;
    const shipping = o.shippingFee || 0;
    const giftWrap = o.giftWrapFee || 0;
    const totalAmount = o.total_amount || 0;

    grossSales += subtotal;
    totalDiscounts += discount;
    totalShippingFees += shipping;
    totalGiftWrapFees += giftWrap;

    // Status tracking
    if (o.status === 'Delivered') {
      completedOrders++;
    } else if (['Processing', 'Confirmed', 'Shipped'].includes(o.status)) {
      inProgressOrders++;
    } else if (o.status === 'Cancelled' || o.cancellation?.isCancelled) {
      cancelledOrders++;
      const ref = o.cancellation?.refundAmount || (o.paymentStatus === 'Paid' ? totalAmount : 0);
      totalRefunds += ref;
    }

    if (o.paymentStatus === 'Refunded' || o.returnDetails?.status === 'Completed') {
      refundedOrders++;
      const ref = o.returnDetails?.refundAmount || totalAmount;
      if (o.status !== 'Cancelled') {
        totalRefunds += ref;
      }
    }

    // Payment channel tracking
    const method = o.paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Razorpay';
    if (!paymentMethodsMap[method]) {
      paymentMethodsMap[method] = { count: 0, revenue: 0 };
    }
    paymentMethodsMap[method].count++;
    if (o.paymentStatus === 'Paid' || o.status === 'Delivered') {
      paymentMethodsMap[method].revenue += totalAmount;
    }

    // Product-wise sales aggregation
    (o.items || []).forEach(item => {
      const pid = String(item.productId || item.product_id || item.name);
      const qty = item.quantity || 1;
      const rev = (item.price || 0) * qty;

      if (!productSalesMap[pid]) {
        productSalesMap[pid] = {
          productId: pid,
          name: item.name || item.product_name || 'Artisanal Perfume',
          unitsSold: 0,
          revenue: 0,
          categoryName: 'Haute Parfumerie'
        };
      }
      productSalesMap[pid].unitsSold += qty;
      productSalesMap[pid].revenue += rev;
    });
  });

  const netSales = Math.max(0, grossSales - totalDiscounts - totalRefunds + totalShippingFees + totalGiftWrapFees);
  const validOrdersCount = Math.max(1, orders.length - cancelledOrders);
  const averageOrderValue = orders.length > 0 ? Math.round(netSales / validOrdersCount) : 0;

  // Format and sort top products
  const topProducts = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

  return {
    periodName,
    financials: {
      grossSales,
      discounts: totalDiscounts,
      refunds: totalRefunds,
      shippingFees: totalShippingFees,
      giftWrapFees: totalGiftWrapFees,
      netSales,
      averageOrderValue
    },
    orderStats: {
      totalOrders: orders.length,
      completedOrders,
      inProgressOrders,
      cancelledOrders,
      refundedOrders,
      fulfillmentRate: orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 100
    },
    topProducts,
    paymentSummary: paymentMethodsMap
  };
};

/* ==========================================================================
   11.1 SALES REPORTS (MONTHLY & EXPORTS)
   • Generate monthly sales reports.
   • Select a specific month and year.
   • View total sales and order counts.
   • Review completed, cancelled, and refunded orders.
   • Analyse product-wise sales and best-selling perfumes.
   • Review discounts and payment summaries.
   • Download reports in PDF and CSV formats.
   ========================================================================== */

/**
 * GET /api/admin/reports/monthly
 * Generate monthly sales report for a specific month and year
 */
export const getMonthlySalesReport = async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year, 10) || now.getFullYear();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);

    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const monthName = startDate.toLocaleString('en-US', { month: 'long' });
    const periodName = `${monthName} ${year}`;

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    const report = aggregateOrderFinancials(orders, periodName);

    // Build day-by-day timeline for this month
    const daysInMonth = endDate.getDate();
    const timeline = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOrders = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getFullYear() === year && od.getMonth() === (month - 1) && od.getDate() === day;
      });

      const dayGross = dayOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
      const dayDiscounts = dayOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
      const dayRefunds = dayOrders.reduce((sum, o) => {
        return sum + (o.cancellation?.refundAmount || (o.status === 'Cancelled' ? o.total_amount : 0));
      }, 0);
      const dayNet = Math.max(0, dayGross - dayDiscounts - dayRefunds);

      timeline.push({
        date: dayDateStr,
        day,
        ordersCount: dayOrders.length,
        grossSales: dayGross,
        discounts: dayDiscounts,
        refunds: dayRefunds,
        netSales: dayNet
      });
    }

    report.timeline = timeline;
    report.period = { month, year, monthName, daysInMonth };

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Monthly sales report error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate monthly sales report.' });
  }
};

/**
 * GET /api/admin/reports/export/pdf
 * Download luxury PDF sales report for selected period (monthly, daily, or custom range)
 */
export const downloadSalesReportPDF = async (req, res) => {
  try {
    const { type = 'monthly', month, year, date, startDate, endDate } = req.query;

    let start;
    let end;
    let periodName;

    if (type === 'daily' || date) {
      const d = date ? new Date(date) : new Date();
      start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      periodName = `Daily Report - ${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    } else if (type === 'custom' || (startDate && endDate)) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      periodName = `Custom Range: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
    } else {
      // Monthly default
      const now = new Date();
      const y = parseInt(year, 10) || now.getFullYear();
      const m = parseInt(month, 10) || (now.getMonth() + 1);
      start = new Date(y, m - 1, 1, 0, 0, 0, 0);
      end = new Date(y, m, 0, 23, 59, 59, 999);
      periodName = `${start.toLocaleString('en-US', { month: 'long' })} ${y}`;
    }

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } }).lean();
    const reportData = aggregateOrderFinancials(orders, periodName);

    const safeFilename = `RoveAmber_Sales_Report_${periodName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

    generateSalesReportPDF(reportData, res);
  } catch (error) {
    console.error('Download PDF report error:', error);
    return res.status(500).json({ success: false, message: 'Failed to download PDF sales report.' });
  }
};

/**
 * GET /api/admin/reports/export/csv
 * Download standard CSV sales report for spreadsheet / financial analysis
 */
export const downloadSalesReportCSV = async (req, res) => {
  try {
    const { type = 'monthly', month, year, date, startDate, endDate } = req.query;

    let start;
    let end;
    let periodName;

    if (type === 'daily' || date) {
      const d = date ? new Date(date) : new Date();
      start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      periodName = `Daily Report - ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (type === 'custom' || (startDate && endDate)) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      periodName = `Custom Range ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
    } else {
      const now = new Date();
      const y = parseInt(year, 10) || now.getFullYear();
      const m = parseInt(month, 10) || (now.getMonth() + 1);
      start = new Date(y, m - 1, 1, 0, 0, 0, 0);
      end = new Date(y, m, 0, 23, 59, 59, 999);
      periodName = `${start.toLocaleString('en-US', { month: 'long' })} ${y}`;
    }

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } }).lean();
    const reportData = aggregateOrderFinancials(orders, periodName);

    const csvContent = generateSalesReportCSV(reportData);
    const safeFilename = `RoveAmber_Sales_Report_${periodName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Download CSV report error:', error);
    return res.status(500).json({ success: false, message: 'Failed to download CSV report.' });
  }
};

/* ==========================================================================
   11.2 ADDITIONAL REPORTING OPTIONS
   • Daily sales reports.
   • Monthly sales reports.
   • Custom date-range reports.
   ========================================================================== */

/**
 * GET /api/admin/reports/daily
 * Generate daily sales report with hourly sales breakdown
 */
export const getDailySalesReport = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const formattedDate = start.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } })
      .populate('user_id', 'name email')
      .lean();

    const report = aggregateOrderFinancials(orders, formattedDate);

    // Hourly intervals breakdown (24 hours)
    const hourlyBreakdown = [];
    for (let h = 0; h < 24; h += 3) {
      const slotStart = h;
      const slotEnd = h + 3;
      const slotLabel = `${String(slotStart).padStart(2, '0')}:00 - ${String(slotEnd).padStart(2, '0')}:00`;

      const slotOrders = orders.filter(o => {
        const hour = new Date(o.createdAt).getHours();
        return hour >= slotStart && hour < slotEnd;
      });

      const slotGross = slotOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
      const slotNet = slotOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      hourlyBreakdown.push({
        timeSlot: slotLabel,
        ordersCount: slotOrders.length,
        grossSales: slotGross,
        netSales: slotNet
      });
    }

    report.timeline = hourlyBreakdown;
    report.ordersList = orders.map(o => ({
      id: o._id.toString(),
      orderId: o.orderId,
      customerName: o.customer_name,
      totalAmount: o.total_amount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Daily sales report error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate daily sales report.' });
  }
};

/**
 * GET /api/admin/reports/custom
 * Generate custom date-range sales report
 */
export const getCustomRangeSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Both startDate and endDate are required for custom range reporting.'
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const periodName = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } }).lean();

    const report = aggregateOrderFinancials(orders, periodName);

    // Group day-by-day trend
    const dayMap = {};
    orders.forEach(o => {
      const dayKey = new Date(o.createdAt).toISOString().split('T')[0];
      if (!dayMap[dayKey]) {
        dayMap[dayKey] = { date: dayKey, ordersCount: 0, grossSales: 0, netSales: 0, discounts: 0, refunds: 0 };
      }
      dayMap[dayKey].ordersCount++;
      dayMap[dayKey].grossSales += (o.subtotal || 0);
      dayMap[dayKey].discounts += (o.discountAmount || 0);
      dayMap[dayKey].netSales += (o.total_amount || 0);
    });

    report.timeline = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Custom range sales report error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate custom date-range report.' });
  }
};

/* ==========================================================================
   11.3 CUSTOMER PURCHASE ANALYTICS
   • Identify best-selling products.
   • Monitor repeat customer purchases.
   • Analyse average order value.
   • Review product and category performance.
   • Monitor monthly sales trends.
   • Use historical sales information to support business decisions.
   ========================================================================== */

/**
 * GET /api/admin/reports/analytics
 * Comprehensive customer purchase analytics and business intelligence
 */
export const getCustomerPurchaseAnalytics = async (req, res) => {
  try {
    const allOrders = await Order.find().lean();
    const allProducts = await Product.find().lean();

    // 1. Identify Best-Selling Products (by units sold and gross revenue)
    const productMetrics = {};
    allProducts.forEach(p => {
      productMetrics[String(p._id)] = {
        productId: String(p._id),
        name: p.name,
        slug: p.slug,
        image: p.image,
        category: p.categoryName || 'Haute Parfumerie',
        unitPrice: p.price,
        unitsSold: 0,
        revenue: 0
      };
    });

    allOrders.forEach(o => {
      if (o.status !== 'Cancelled') {
        (o.items || []).forEach(item => {
          const pid = String(item.productId || item.product_id);
          const qty = item.quantity || 1;
          const price = item.price || 0;

          if (productMetrics[pid]) {
            productMetrics[pid].unitsSold += qty;
            productMetrics[pid].revenue += (price * qty);
          } else {
            productMetrics[pid] = {
              productId: pid,
              name: item.name || 'Artisanal Perfume',
              unitsSold: qty,
              revenue: price * qty
            };
          }
        });
      }
    });

    const bestSellingProducts = Object.values(productMetrics)
      .filter(p => p.unitsSold > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // 2. Monitor Repeat Customer Purchases
    const customerOrdersMap = {};
    allOrders.forEach(o => {
      const email = (o.email || (o.user_id ? String(o.user_id) : o.customer_name || 'Guest')).toLowerCase();
      if (!customerOrdersMap[email]) {
        customerOrdersMap[email] = {
          identifier: email,
          name: o.customer_name || 'Valued Client',
          email: o.email || '',
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: o.createdAt
        };
      }
      customerOrdersMap[email].orderCount++;
      if (o.status !== 'Cancelled') {
        customerOrdersMap[email].totalSpent += (o.total_amount || 0);
      }
    });

    const uniqueCustomersCount = Object.keys(customerOrdersMap).length;
    const repeatCustomersList = Object.values(customerOrdersMap).filter(c => c.orderCount >= 2);
    const singlePurchaseCustomersCount = uniqueCustomersCount - repeatCustomersList.length;
    const repeatCustomerRate = uniqueCustomersCount > 0
      ? Math.round((repeatCustomersList.length / uniqueCustomersCount) * 100)
      : 0;

    const topRepeatCustomers = repeatCustomersList
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // 3. Average Order Value (AOV)
    const validOrders = allOrders.filter(o => o.status !== 'Cancelled');
    const totalValidRevenue = validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const averageOrderValue = validOrders.length > 0 ? Math.round(totalValidRevenue / validOrders.length) : 0;

    // 4. Product and Category Performance
    const categoryMap = {};
    bestSellingProducts.forEach(p => {
      const cat = p.category || 'Haute Parfumerie';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, unitsSold: 0, revenue: 0 };
      }
      categoryMap[cat].unitsSold += p.unitsSold;
      categoryMap[cat].revenue += p.revenue;
    });
    const categoryPerformance = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

    // 5. Monthly Sales Trends (Last 12 Rolling Months)
    const now = new Date();
    const monthlyTrends = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const monthStart = new Date(y, m, 1);
      const monthEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);

      const monthOrders = allOrders.filter(o => {
        const od = new Date(o.createdAt);
        return od >= monthStart && od <= monthEnd;
      });

      const gross = monthOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
      const discounts = monthOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
      const net = monthOrders.reduce((sum, o) => {
        return o.status !== 'Cancelled' ? sum + (o.total_amount || 0) : sum;
      }, 0);

      monthlyTrends.push({
        monthKey: `${y}-${String(m + 1).padStart(2, '0')}`,
        monthName: d.toLocaleString('en-US', { month: 'short' }),
        year: y,
        ordersCount: monthOrders.length,
        grossSales: gross,
        discounts,
        netSales: net
      });
    }

    // 6. Strategic Business Decision Insights
    const decisionSupport = {
      primaryRevenueDriver: bestSellingProducts.length > 0 ? bestSellingProducts[0].name : 'Amber Oud',
      repeatLoyaltyHealth: repeatCustomerRate >= 25 ? 'High (Strong Patronage)' : 'Standard (Growth Opportunity)',
      recommendedAction: repeatCustomerRate >= 25
        ? 'Launch exclusive VIP preview collection for repeat connoisseurs.'
        : 'Introduce post-purchase discovery coffret voucher to incentivize repeat purchase.'
    };

    return res.json({
      success: true,
      data: {
        summary: {
          totalLifetimeRevenue: totalValidRevenue,
          totalLifetimeOrders: validOrders.length,
          overallAverageOrderValue: averageOrderValue,
          uniqueCustomersCount,
          repeatCustomerRate: `${repeatCustomerRate}%`
        },
        repeatCustomerAnalytics: {
          uniqueBuyers: uniqueCustomersCount,
          singlePurchaseBuyers: singlePurchaseCustomersCount,
          repeatBuyers: repeatCustomersList.length,
          repeatRatePercentage: repeatCustomerRate,
          topRepeatPatrons: topRepeatCustomers
        },
        bestSellingProducts,
        categoryPerformance,
        monthlySalesTrends: monthlyTrends,
        decisionSupport
      }
    });
  } catch (error) {
    console.error('Customer purchase analytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate customer purchase analytics.' });
  }
};
