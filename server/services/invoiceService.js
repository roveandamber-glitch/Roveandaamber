import PDFDocument from 'pdfkit';

/**
 * Generates a structured invoice JSON object from an order
 */
export const buildInvoiceData = (order) => {
  const ord = order.toObject ? order.toObject() : order;
  const orderNumber = ord.orderId || `#ORD-${String(ord._id || ord.id).slice(-4).toUpperCase()}`;
  const invNumber = ord.invoice?.invoiceNumber || `INV-${orderNumber.replace('#', '')}`;
  const invDate = ord.invoice?.invoiceDate || ord.createdAt || new Date();

  // 18% GST included estimation for luxury perfumes in India
  const taxableValue = Math.round((ord.subtotal / 1.18) * 100) / 100;
  const estimatedTax = Math.round((ord.subtotal - taxableValue) * 100) / 100;

  return {
    invoiceNumber: invNumber,
    orderId: orderNumber,
    date: new Date(invDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    company: {
      name: 'ROVE & AMBER',
      tagline: 'Maison de Haute Parfumerie',
      address: 'Luxury Fragrance Arcade, Galleria Boulevard',
      city: 'Mumbai, Maharashtra 400050',
      email: 'concierge@roveandamber.com',
      website: 'www.roveandamber.com',
      gstin: '27AABCR1234F1Z8'
    },
    customer: {
      name: ord.customer_name || 'Valued Client',
      phone: ord.phone || 'N/A',
      email: ord.email || (ord.user_id?.email || 'N/A'),
      billingAddress: ord.address || 'Standard Delivery Address',
      shippingAddress: ord.isGift && ord.giftRecipient?.address
        ? `${ord.giftRecipient.name}, ${ord.giftRecipient.address}, ${ord.giftRecipient.city} - ${ord.giftRecipient.postalCode}`
        : (ord.address || 'Standard Delivery Address')
    },
    payment: {
      method: ord.paymentMethod || 'Razorpay Online',
      status: ord.paymentStatus || 'Paid',
      transactionId: ord.razorpayPaymentId || ord.paymentDetails?.transactionId || 'N/A',
      paidAt: ord.paymentDetails?.paidAt ? new Date(ord.paymentDetails.paidAt).toLocaleDateString() : 'N/A'
    },
    items: (ord.items || []).map((item, idx) => ({
      serialNo: idx + 1,
      name: item.name || item.product_name || 'Luxury Perfume',
      size: item.size || '50ml',
      quantity: item.quantity || 1,
      unitPrice: item.price || 0,
      total: (item.price || 0) * (item.quantity || 1)
    })),
    charges: {
      subtotal: ord.subtotal || 0,
      taxableAmount: taxableValue,
      gstAmount: estimatedTax,
      discountAmount: ord.discountAmount || 0,
      couponCode: ord.couponCode || '',
      giftWrapFee: ord.giftWrapFee || 0,
      shippingFee: ord.shippingFee || 0,
      grandTotal: ord.total_amount || 0,
      currency: 'INR'
    },
    giftDetails: ord.isGift ? {
      isGift: true,
      occasion: ord.occasion || 'Special Celebration',
      giftMessage: ord.giftMessage || '',
      giftWrap: !!ord.giftWrap,
      recipientName: ord.giftRecipient?.name || ''
    } : null
  };
};

/**
 * Generates and streams a PDF invoice
 */
export const generateInvoicePDF = (order, res) => {
  const inv = buildInvoiceData(order);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream directly to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Invoice-${inv.orderId.replace('#', '')}.pdf"`
  );

  doc.pipe(res);

  // Colors
  const darkGold = '#9E7430';
  const black = '#1A1817';
  const lightGray = '#F5F2EC';
  const mutedText = '#666059';

  // --- Header ---
  doc.rect(40, 40, 515, 65).fill(black);

  doc.fillColor('#FFFFFF').fontSize(20).text('ROVE & AMBER', 55, 52, { characterSpacing: 2 });
  doc.fillColor(darkGold).fontSize(8).text('MAISON DE HAUTE PARFUMERIE', 55, 78, { characterSpacing: 1.5 });

  doc.fillColor('#FFFFFF').fontSize(16).text('TAX INVOICE', 400, 52, { align: 'right' });
  doc.fillColor(darkGold).fontSize(9).text(`${inv.invoiceNumber}`, 400, 75, { align: 'right' });

  // --- Meta Info Box ---
  doc.moveDown(3);
  const metaY = 120;
  doc.rect(40, metaY, 515, 65).fill(lightGray);

  doc.fillColor(mutedText).fontSize(8).text('INVOICE DATE', 55, metaY + 12);
  doc.fillColor(black).fontSize(10).text(inv.date, 55, metaY + 25);

  doc.fillColor(mutedText).fontSize(8).text('ORDER ID', 180, metaY + 12);
  doc.fillColor(black).fontSize(10).text(inv.orderId, 180, metaY + 25);

  doc.fillColor(mutedText).fontSize(8).text('PAYMENT METHOD', 300, metaY + 12);
  doc.fillColor(black).fontSize(10).text(inv.payment.method, 300, metaY + 25);

  doc.fillColor(mutedText).fontSize(8).text('PAYMENT STATUS', 420, metaY + 12);
  doc.fillColor(inv.payment.status === 'Paid' ? '#1E7E34' : '#D9534F')
    .fontSize(10)
    .text(inv.payment.status.toUpperCase(), 420, metaY + 25);

  // --- Customer & Delivery Info ---
  const addrY = 200;
  doc.fillColor(darkGold).fontSize(9).text('BILL TO:', 55, addrY);
  doc.fillColor(black).fontSize(10).text(inv.customer.name, 55, addrY + 14);
  doc.fillColor(mutedText).fontSize(8).text(`Phone: ${inv.customer.phone}`, 55, addrY + 28);
  doc.text(`Email: ${inv.customer.email}`, 55, addrY + 40);
  doc.text(inv.customer.billingAddress, 55, addrY + 52, { width: 200 });

  doc.fillColor(darkGold).fontSize(9).text('SHIP TO & RECIPIENT:', 320, addrY);
  doc.fillColor(black).fontSize(10).text(
    inv.giftDetails?.recipientName ? `Recipient: ${inv.giftDetails.recipientName}` : inv.customer.name,
    320,
    addrY + 14
  );
  doc.fillColor(mutedText).fontSize(8).text(inv.customer.shippingAddress, 320, addrY + 28, { width: 220 });

  if (inv.giftDetails?.isGift) {
    doc.fillColor(darkGold).fontSize(8).text(`Gift Occasion: ${inv.giftDetails.occasion}`, 320, addrY + 58);
    if (inv.giftDetails.giftMessage) {
      doc.fillColor(black).fontSize(8).text(`Message: "${inv.giftDetails.giftMessage}"`, 320, addrY + 70, {
        width: 220,
        oblique: true
      });
    }
  }

  // --- Items Table ---
  const tableY = 300;
  doc.rect(40, tableY, 515, 22).fill(black);

  doc.fillColor('#FFFFFF').fontSize(8);
  doc.text('#', 50, tableY + 6);
  doc.text('FRAGRANCE ITEM', 75, tableY + 6);
  doc.text('SIZE', 280, tableY + 6);
  doc.text('QTY', 340, tableY + 6);
  doc.text('UNIT PRICE', 390, tableY + 6, { align: 'right', width: 60 });
  doc.text('TOTAL', 470, tableY + 6, { align: 'right', width: 70 });

  let currentY = tableY + 26;
  doc.fillColor(black).fontSize(9);

  inv.items.forEach((item, index) => {
    // Alternate row styling
    if (index % 2 === 1) {
      doc.rect(40, currentY - 4, 515, 20).fill('#FAFAF8');
      doc.fillColor(black);
    }

    doc.text(String(item.serialNo), 50, currentY);
    doc.text(item.name, 75, currentY, { width: 195 });
    doc.text(item.size, 280, currentY);
    doc.text(String(item.quantity), 340, currentY);
    doc.text(`Rs ${item.unitPrice.toLocaleString()}`, 390, currentY, { align: 'right', width: 60 });
    doc.text(`Rs ${item.total.toLocaleString()}`, 470, currentY, { align: 'right', width: 70 });

    currentY += 22;
  });

  // Table bottom border
  doc.moveTo(40, currentY + 2).lineTo(555, currentY + 2).strokeColor('#E0DCD3').stroke();

  // --- Summary & Charges Section ---
  const summaryY = currentY + 15;
  const colX = 350;
  const valX = 460;
  const valW = 80;

  doc.fontSize(8).fillColor(mutedText);

  doc.text('Subtotal:', colX, summaryY);
  doc.fillColor(black).text(`Rs ${inv.charges.subtotal.toLocaleString()}`, valX, summaryY, { align: 'right', width: valW });

  let nextSummaryY = summaryY + 14;

  if (inv.charges.discountAmount > 0) {
    doc.fillColor(darkGold).text(`Promotional Discount (${inv.charges.couponCode || 'Code'}):`, colX, nextSummaryY);
    doc.text(`- Rs ${inv.charges.discountAmount.toLocaleString()}`, valX, nextSummaryY, { align: 'right', width: valW });
    nextSummaryY += 14;
  }

  if (inv.charges.giftWrapFee > 0) {
    doc.fillColor(mutedText).text('Luxury Gift Wrapping:', colX, nextSummaryY);
    doc.fillColor(black).text(`Rs ${inv.charges.giftWrapFee.toLocaleString()}`, valX, nextSummaryY, { align: 'right', width: valW });
    nextSummaryY += 14;
  }

  doc.fillColor(mutedText).text('Shipping & Handling:', colX, nextSummaryY);
  doc.fillColor(black).text(
    inv.charges.shippingFee === 0 ? 'Complimentary (Free)' : `Rs ${inv.charges.shippingFee.toLocaleString()}`,
    valX,
    nextSummaryY,
    { align: 'right', width: valW }
  );
  nextSummaryY += 16;

  // Grand Total Box
  doc.rect(colX - 10, nextSummaryY - 2, 215, 26).fill(lightGray);
  doc.fillColor(black).fontSize(10).text('GRAND TOTAL PAYABLE:', colX, nextSummaryY + 6);
  doc.fillColor(darkGold).fontSize(11).text(
    `Rs ${inv.charges.grandTotal.toLocaleString()}`,
    valX,
    nextSummaryY + 6,
    { align: 'right', width: valW }
  );

  // --- GST / Tax Note ---
  doc.fillColor(mutedText).fontSize(7.5).text(
    `*All prices are inclusive of applicable GST (Estimated Tax component: Rs ${inv.charges.gstAmount.toLocaleString()}).`,
    40,
    nextSummaryY + 10
  );

  // --- Luxury Footer ---
  const footerY = 720;
  doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor(darkGold).lineWidth(1).stroke();

  doc.fillColor(black).fontSize(8).text('ROVE & AMBER - Artisanal Luxury Fragrances', 40, footerY + 12, { align: 'center' });
  doc.fillColor(mutedText).fontSize(7).text(
    'For inquiries regarding this order, please contact concierge@roveandamber.com with your Order ID.',
    40,
    footerY + 24,
    { align: 'center' }
  );
  doc.fillColor(mutedText).fontSize(7).text(
    'Thank you for selecting ROVE & AMBER.',
    40,
    footerY + 36,
    { align: 'center', oblique: true }
  );

  doc.end();
};

export default {
  buildInvoiceData,
  generateInvoicePDF
};
