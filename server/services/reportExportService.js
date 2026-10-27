import PDFDocument from 'pdfkit';

/**
 * Generates and streams a luxury executive PDF Sales Report
 */
export const generateSalesReportPDF = (reportData, res) => {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true
  });

  // Pipe to response
  doc.pipe(res);

  // Luxury Brand Color Palette
  const black = '#1A1817';
  const gold = '#C49A45';
  const darkGold = '#9E7430';
  const lightGold = '#FBF8F2';
  const darkGray = '#2B2826';
  const muted = '#666059';
  const borderGray = '#E8E3D9';
  const green = '#1E7E34';
  const red = '#BD2130';

  // --- HEADER SECTION ---
  doc.rect(40, 40, 515, 70).fill(black);

  doc.fillColor('#FFFFFF').fontSize(20).text('ROVE & AMBER', 55, 52, { characterSpacing: 2 });
  doc.fillColor(gold).fontSize(8).text('MAISON DE HAUTE PARFUMERIE  •  FINANCIAL REPORTING', 55, 78, { characterSpacing: 1.5 });

  doc.fillColor('#FFFFFF').fontSize(14).text('EXECUTIVE SALES AUDIT', 320, 52, { align: 'right' });
  doc.fillColor(gold).fontSize(9).text(`${reportData.periodName || 'Sales Summary'}`, 320, 72, { align: 'right' });
  doc.fillColor('#CCCCCC').fontSize(7.5).text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 320, 87, { align: 'right' });

  let y = 125;

  // --- EXECUTIVE FINANCIAL LEDGER CARDS ---
  doc.rect(40, y, 515, 20).fill(borderGray);
  doc.fillColor(black).fontSize(9).font('Helvetica-Bold').text('1. EXECUTIVE FINANCIAL LEDGER', 48, y + 6);
  y += 28;

  const cardWidth = 120;
  const cardHeight = 48;
  const cards = [
    { title: 'GROSS SALES', val: `Rs ${(reportData.financials?.grossSales || 0).toLocaleString()}`, color: black },
    { title: 'TOTAL DISCOUNTS', val: `- Rs ${(reportData.financials?.discounts || 0).toLocaleString()}`, color: muted },
    { title: 'REFUNDS / CANCELLATIONS', val: `- Rs ${(reportData.financials?.refunds || 0).toLocaleString()}`, color: red },
    { title: 'NET REALIZED SALES', val: `Rs ${(reportData.financials?.netSales || 0).toLocaleString()}`, color: gold, bold: true }
  ];

  cards.forEach((c, idx) => {
    const x = 40 + idx * (cardWidth + 11.5);
    doc.rect(x, y, cardWidth, cardHeight).fillAndStroke(lightGold, borderGray);
    doc.fillColor(muted).fontSize(7).font('Helvetica').text(c.title, x + 8, y + 8);
    doc.fillColor(c.color).fontSize(11).font('Helvetica-Bold').text(c.val, x + 8, y + 24);
  });

  y += cardHeight + 14;

  // Secondary metrics bar
  const aov = reportData.financials?.averageOrderValue || 0;
  const totalOrders = reportData.orderStats?.totalOrders || 0;
  const completedOrders = reportData.orderStats?.completedOrders || 0;
  const fulfillmentRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;

  doc.rect(40, y, 515, 24).fillAndStroke('#F5F2EC', borderGray);
  doc.fillColor(black).fontSize(8).font('Helvetica')
    .text(`Total Orders: ${totalOrders}   |   Completed: ${completedOrders}   |   Fulfillment Rate: ${fulfillmentRate}%   |   Average Order Value (AOV): Rs ${Math.round(aov).toLocaleString()}`, 48, y + 8);

  y += 36;

  // --- ORDER STATUS BREAKDOWN ---
  doc.rect(40, y, 515, 20).fill(borderGray);
  doc.fillColor(black).fontSize(9).font('Helvetica-Bold').text('2. ORDER FULFILLMENT & PAYMENT SUMMARY', 48, y + 6);
  y += 26;

  const colWidth = 515 / 5;
  const statusHeaders = ['TOTAL PLACED', 'COMPLETED', 'PROCESSING / SHIPPED', 'CANCELLED', 'REFUNDED'];
  const statusValues = [
    reportData.orderStats?.totalOrders || 0,
    reportData.orderStats?.completedOrders || 0,
    reportData.orderStats?.inProgressOrders || 0,
    reportData.orderStats?.cancelledOrders || 0,
    reportData.orderStats?.refundedOrders || 0
  ];

  statusHeaders.forEach((h, idx) => {
    const x = 40 + idx * colWidth;
    doc.fillColor(muted).fontSize(7).font('Helvetica').text(h, x + 6, y);
    doc.fillColor(idx === 3 || idx === 4 ? red : (idx === 1 ? green : black)).fontSize(11).font('Helvetica-Bold').text(String(statusValues[idx]), x + 6, y + 12);
  });

  y += 34;

  // --- BEST SELLING PERFUMES TABLE ---
  doc.rect(40, y, 515, 20).fill(borderGray);
  doc.fillColor(black).fontSize(9).font('Helvetica-Bold').text('3. PRODUCT-WISE SALES & BEST-SELLING PERFUMES', 48, y + 6);
  y += 24;

  // Table header
  doc.rect(40, y, 515, 18).fill('#EFECE6');
  doc.fillColor(muted).fontSize(7.5).font('Helvetica-Bold');
  doc.text('#', 48, y + 5);
  doc.text('FRAGRANCE CREATION', 75, y + 5);
  doc.text('CATEGORY / OLFACTORY', 250, y + 5);
  doc.text('UNITS SOLD', 380, y + 5, { align: 'right', width: 60 });
  doc.text('GROSS REVENUE', 450, y + 5, { align: 'right', width: 95 });
  y += 20;

  const topProducts = reportData.topProducts || [];
  if (topProducts.length === 0) {
    doc.fillColor(muted).fontSize(8).font('Helvetica-Oblique').text('No product sales recorded in this period.', 48, y + 6);
    y += 20;
  } else {
    topProducts.slice(0, 7).forEach((p, index) => {
      if (index % 2 === 1) {
        doc.rect(40, y, 515, 18).fill('#FAF8F5');
      }
      doc.fillColor(black).fontSize(8).font('Helvetica');
      doc.text(String(index + 1), 48, y + 5);
      doc.font('Helvetica-Bold').text(p.name || 'Perfume', 75, y + 5, { width: 170, ellipsis: true });
      doc.font('Helvetica').fillColor(muted).text(p.categoryName || 'Haute Parfumerie', 250, y + 5);
      doc.fillColor(black).text(`${p.unitsSold || p.sales || 0}`, 380, y + 5, { align: 'right', width: 60 });
      doc.font('Helvetica-Bold').fillColor(darkGold).text(`Rs ${(p.revenue || 0).toLocaleString()}`, 450, y + 5, { align: 'right', width: 95 });
      y += 18;
    });
  }

  y += 10;

  // --- PAYMENT METHODS & DISCOUNTS SUMMARY ---
  doc.rect(40, y, 515, 20).fill(borderGray);
  doc.fillColor(black).fontSize(9).font('Helvetica-Bold').text('4. PAYMENT CHANNELS & PROMOTIONAL SUMMARY', 48, y + 6);
  y += 26;

  const paymentMethods = reportData.paymentSummary || {};
  const razorpayTotal = paymentMethods.Razorpay?.revenue || 0;
  const codTotal = paymentMethods['Cash on Delivery']?.revenue || paymentMethods.COD?.revenue || 0;

  doc.rect(40, y, 250, 42).fillAndStroke(lightGold, borderGray);
  doc.fillColor(muted).fontSize(7.5).font('Helvetica').text('ONLINE PAYMENT GATEWAY (RAZORPAY)', 48, y + 8);
  doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text(`Rs ${razorpayTotal.toLocaleString()}`, 48, y + 22);

  doc.rect(305, y, 250, 42).fillAndStroke(lightGold, borderGray);
  doc.fillColor(muted).fontSize(7.5).font('Helvetica').text('CASH ON DELIVERY (CONCIERGE)', 313, y + 8);
  doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text(`Rs ${codTotal.toLocaleString()}`, 313, y + 22);

  y += 56;

  // --- FOOTER & AUDIT VERIFICATION ---
  doc.rect(40, 765, 515, 0.5).fill(borderGray);
  doc.fillColor(muted).fontSize(7).font('Helvetica')
    .text('CONFIDENTIAL & PROPRIETARY  •  ROVE & AMBER MAISON DE HAUTE PARFUMERIE', 40, 775, { align: 'center', width: 515 });
  doc.text('This executive report reflects official audited sales, deductions, and inventory releases.', 40, 786, { align: 'center', width: 515 });

  doc.end();
};

/**
 * Generates standard RFC 4180 CSV Sales Report
 */
export const generateSalesReportCSV = (reportData) => {
  const lines = [];

  const escapeCSV = (field) => {
    if (field === null || field === undefined) return '""';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  // Section 1: Report Metadata
  lines.push(['ROVE & AMBER - EXECUTIVE SALES REPORT'].map(escapeCSV).join(','));
  lines.push(['Report Period', reportData.periodName || 'Custom Range'].map(escapeCSV).join(','));
  lines.push(['Generated At', new Date().toISOString()].map(escapeCSV).join(','));
  lines.push([]);

  // Section 2: Financial Summary
  lines.push(['FINANCIAL SUMMARY', 'AMOUNT (INR)'].map(escapeCSV).join(','));
  lines.push(['Gross Sales (Before Discounts)', reportData.financials?.grossSales || 0].map(escapeCSV).join(','));
  lines.push(['Total Promotional Discounts', -(reportData.financials?.discounts || 0)].map(escapeCSV).join(','));
  lines.push(['Total Refunds & Cancellations', -(reportData.financials?.refunds || 0)].map(escapeCSV).join(','));
  lines.push(['Shipping & Delivery Fees', reportData.financials?.shippingFees || 0].map(escapeCSV).join(','));
  lines.push(['Luxury Gift Wrap Fees', reportData.financials?.giftWrapFees || 0].map(escapeCSV).join(','));
  lines.push(['Net Sales (Realized Revenue)', reportData.financials?.netSales || 0].map(escapeCSV).join(','));
  lines.push(['Average Order Value (AOV)', Math.round(reportData.financials?.averageOrderValue || 0)].map(escapeCSV).join(','));
  lines.push([]);

  // Section 3: Order Statistics
  lines.push(['ORDER METRICS', 'COUNT'].map(escapeCSV).join(','));
  lines.push(['Total Orders Placed', reportData.orderStats?.totalOrders || 0].map(escapeCSV).join(','));
  lines.push(['Completed / Delivered Orders', reportData.orderStats?.completedOrders || 0].map(escapeCSV).join(','));
  lines.push(['In-Progress Orders (Processing / Shipped)', reportData.orderStats?.inProgressOrders || 0].map(escapeCSV).join(','));
  lines.push(['Cancelled Orders', reportData.orderStats?.cancelledOrders || 0].map(escapeCSV).join(','));
  lines.push(['Refunded Orders', reportData.orderStats?.refundedOrders || 0].map(escapeCSV).join(','));
  lines.push([]);

  // Section 4: Best-Selling Products
  lines.push(['BEST-SELLING PERFUMES', 'CATEGORY', 'UNITS SOLD', 'GROSS REVENUE (INR)'].map(escapeCSV).join(','));
  const topProducts = reportData.topProducts || [];
  topProducts.forEach((p, idx) => {
    lines.push([
      p.name || `Product ${idx + 1}`,
      p.categoryName || 'Haute Parfumerie',
      p.unitsSold || p.sales || 0,
      p.revenue || 0
    ].map(escapeCSV).join(','));
  });
  lines.push([]);

  // Section 5: Daily / Periodic Breakdown
  if (reportData.timeline && reportData.timeline.length > 0) {
    lines.push(['TIMELINE BREAKDOWN', 'ORDERS COUNT', 'GROSS SALES', 'DISCOUNTS', 'REFUNDS', 'NET SALES'].map(escapeCSV).join(','));
    reportData.timeline.forEach(t => {
      lines.push([
        t.date || t.month || t.hour || 'Period',
        t.ordersCount || 0,
        t.grossSales || 0,
        t.discounts || 0,
        t.refunds || 0,
        t.netSales || 0
      ].map(escapeCSV).join(','));
    });
  }

  return lines.join('\n');
};
