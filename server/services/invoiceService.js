import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Converts numeric amount to Indian Currency Words
 */
export const amountToWords = (amount) => {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'INR Zero Rupees Only';

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  return 'INR ' + inWords(num).trim() + ' Rupees Only';
};

/**
 * Generates structured invoice JSON data from an order model
 */
export const buildInvoiceData = (order) => {
  const ord = order.toObject ? order.toObject() : order;
  const orderNumber = ord.orderId || `#ORD-${String(ord._id || ord.id).slice(-4).toUpperCase()}`;
  const invNumber = ord.invoice?.invoiceNumber || `INV-${orderNumber.replace('#', '')}`;
  const invDate = ord.invoice?.invoiceDate || ord.createdAt || new Date();

  const totalAmount = Number(ord.total_amount) || Number(ord.totalAmount) || Number(ord.subtotal) || 0;
  const subtotalAmount = Number(ord.subtotal) || totalAmount;

  // 18% GST calculation (Standard luxury perfume GST rate in India)
  const taxableValue = Math.round((totalAmount / 1.18) * 100) / 100;
  const estimatedTax = Math.round((totalAmount - taxableValue) * 100) / 100;

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
      gstin: '27AABCR1234F1Z8',
      stateCode: '27 (Maharashtra)'
    },
    customer: {
      name: ord.customer_name || 'Valued Patron',
      phone: ord.phone || 'N/A',
      email: ord.email || (ord.user_id?.email || 'N/A'),
      billingAddress: ord.address || 'Standard Delivery Address, India',
      shippingAddress: ord.isGift && ord.giftRecipient?.address
        ? `${ord.giftRecipient.name}, ${ord.giftRecipient.address}, ${ord.giftRecipient.city} - ${ord.giftRecipient.postalCode}`
        : (ord.address || 'Standard Delivery Address, India')
    },
    payment: {
      method: ord.paymentMethod || 'Razorpay Online',
      status: ord.paymentStatus || 'Paid',
      transactionId: ord.razorpayPaymentId || ord.paymentDetails?.transactionId || 'N/A'
    },
    items: (ord.items || []).map((item, idx) => {
      const unitPrice = Number(item.price) || 0;
      const qty = parseInt(item.quantity, 10) || 1;
      return {
        serialNo: idx + 1,
        name: item.name || item.product_name || 'Luxury Perfume Flacon',
        size: item.size || '50ml',
        quantity: qty,
        unitPrice: unitPrice,
        total: unitPrice * qty
      };
    }),
    charges: {
      subtotal: subtotalAmount,
      taxableAmount: taxableValue,
      gstAmount: estimatedTax,
      discountAmount: Number(ord.discountAmount) || 0,
      couponCode: ord.couponCode || '',
      giftWrapFee: Number(ord.giftWrapFee) || 0,
      shippingFee: Number(ord.shippingFee) || 0,
      grandTotal: totalAmount,
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
 * Draws the complete, official luxury tax invoice onto a PDFKit document instance
 */
export const renderOfficialInvoice = (doc, inv) => {
  // Brand Color Palette
  const noir = '#12100E';
  const gold = '#C49A45';
  const darkGold = '#9E7430';
  const warmBg = '#FAF8F5';
  const tableAltBg = '#FBF9F6';
  const borderCol = '#E5DFD5';
  const textDark = '#1C1714';
  const textMuted = '#6B6258';
  const textSubtle = '#8C8277';

  // --- 1. Top Decorative Stripe & Dark Header ---
  const headerY = 32;
  const headerHeight = 78;
  const pageWidth = 515;
  const startX = 40;

  // Gold Top Accent
  doc.rect(startX, headerY, pageWidth, 3).fill(gold);

  // Noir Luxury Header Bar
  doc.rect(startX, headerY + 3, pageWidth, headerHeight).fill(noir);

  // Brand Logo Rendering
  const logoPath = path.join(__dirname, '..', 'assets', 'logo_cropped.png');
  const faviconPath = path.join(__dirname, '..', 'assets', 'favicon.png');
  let hasLogo = false;

  try {
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, startX + 12, headerY + 12, { height: 56 });
      hasLogo = true;
    } else if (fs.existsSync(faviconPath)) {
      doc.image(faviconPath, startX + 12, headerY + 16, { width: 48, height: 48 });
      hasLogo = true;
    }
  } catch (err) {
    console.warn('⚠️ [Invoice PDF]: Logo rendering notice:', err.message);
  }

  // Header Left Info
  const brandTextX = hasLogo ? startX + 115 : startX + 18;
  doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('ROVE & AMBER', brandTextX, headerY + 16, { characterSpacing: 2 });
  doc.fillColor(gold).fontSize(7.5).font('Helvetica').text('MAISON DE HAUTE PARFUMERIE', brandTextX, headerY + 36, { characterSpacing: 1.6 });
  doc.fillColor('#9E9B95').fontSize(6.8).font('Helvetica').text('GSTIN: 27AABCR1234F1Z8 • STATE CODE: 27 (MAHARASHTRA)', brandTextX, headerY + 49);
  doc.fillColor('#7E7B75').fontSize(6.5).font('Helvetica').text('Luxury Fragrance Arcade, Galleria Blvd, Mumbai 400050', brandTextX, headerY + 60);

  // Header Right (Tax Invoice Title & Invoice Number)
  const rightColX = startX + 310;
  const rightColW = pageWidth - 310 - 16;
  doc.fillColor('#FFFFFF').fontSize(15).font('Helvetica-Bold').text('TAX INVOICE', rightColX, headerY + 15, { align: 'right', width: rightColW });
  doc.fillColor(gold).fontSize(9).font('Helvetica-Bold').text(inv.invoiceNumber, rightColX, headerY + 34, { align: 'right', width: rightColW });
  doc.fillColor('#E5A835').fontSize(7).font('Helvetica').text('ORIGINAL FOR RECIPIENT', rightColX, headerY + 47, { align: 'right', width: rightColW });
  doc.fillColor('#B0ADA8').fontSize(7.5).font('Helvetica').text(`Issue Date: ${inv.date}`, rightColX, headerY + 59, { align: 'right', width: rightColW });

  // --- 2. Order & Payment Metadata Strip ---
  const metaY = headerY + headerHeight + 12;
  const metaH = 44;
  doc.roundedRect(startX, metaY, pageWidth, metaH, 4).fillAndStroke(warmBg, borderCol);

  const metaColW = pageWidth / 4;
  // Col 1: Order Reference
  doc.fillColor(textSubtle).fontSize(7).font('Helvetica-Bold').text('ORDER REFERENCE', startX + 12, metaY + 9);
  doc.fillColor(textDark).fontSize(9).font('Helvetica-Bold').text(inv.orderId, startX + 12, metaY + 22);

  // Col 2: Order Date
  doc.fillColor(textSubtle).fontSize(7).font('Helvetica-Bold').text('ORDER DATE', startX + metaColW + 8, metaY + 9);
  doc.fillColor(textDark).fontSize(8.5).font('Helvetica').text(inv.date, startX + metaColW + 8, metaY + 22);

  // Col 3: Payment Method
  doc.fillColor(textSubtle).fontSize(7).font('Helvetica-Bold').text('PAYMENT CHANNEL', startX + metaColW * 2 + 8, metaY + 9);
  doc.fillColor(textDark).fontSize(8.5).font('Helvetica').text(inv.payment.method, startX + metaColW * 2 + 8, metaY + 22);

  // Col 4: Payment Status & Verification
  doc.fillColor(textSubtle).fontSize(7).font('Helvetica-Bold').text('PAYMENT STATUS', startX + metaColW * 3 + 8, metaY + 9);
  const isPaid = String(inv.payment.status).toLowerCase().includes('paid');
  doc.fillColor(isPaid ? '#1E7E34' : '#B94A48').fontSize(8.5).font('Helvetica-Bold').text(
    isPaid ? 'PAID / VERIFIED' : inv.payment.status.toUpperCase(),
    startX + metaColW * 3 + 8,
    metaY + 22
  );

  // --- 3. Billed To & Shipped To Luxury Cards ---
  const addrY = metaY + metaH + 10;
  const cardW = (pageWidth - 12) / 2;
  const cardH = 82;

  // Bill To Card
  doc.roundedRect(startX, addrY, cardW, cardH, 4).fillAndStroke('#FFFFFF', borderCol);
  doc.rect(startX, addrY, cardW, 16).fill('#F5F1E8');
  doc.fillColor(darkGold).fontSize(7.5).font('Helvetica-Bold').text('BILL TO (BUYER DETAILS)', startX + 10, addrY + 4);

  doc.fillColor(textDark).fontSize(9).font('Helvetica-Bold').text(inv.customer.name, startX + 10, addrY + 22, { width: cardW - 20 });
  doc.fillColor(textMuted).fontSize(7.5).font('Helvetica')
    .text(`Phone: ${inv.customer.phone || 'N/A'}  •  Email: ${inv.customer.email || 'N/A'}`, startX + 10, addrY + 35, { width: cardW - 20 })
    .text(inv.customer.billingAddress, startX + 10, addrY + 47, { width: cardW - 20, lineGap: 1 });

  // Ship To Card
  const shipX = startX + cardW + 12;
  doc.roundedRect(shipX, addrY, cardW, cardH, 4).fillAndStroke('#FFFFFF', borderCol);
  doc.rect(shipX, addrY, cardW, 16).fill('#F5F1E8');
  doc.fillColor(darkGold).fontSize(7.5).font('Helvetica-Bold').text('SHIP TO & RECIPIENT', shipX + 10, addrY + 4);

  const recipientName = inv.giftDetails?.recipientName ? `Recipient: ${inv.giftDetails.recipientName}` : inv.customer.name;
  doc.fillColor(textDark).fontSize(9).font('Helvetica-Bold').text(recipientName, shipX + 10, addrY + 22, { width: cardW - 20 });
  doc.fillColor(textMuted).fontSize(7.5).font('Helvetica')
    .text(inv.customer.shippingAddress, shipX + 10, addrY + 35, { width: cardW - 20, lineGap: 1 });

  if (inv.giftDetails?.isGift && inv.giftDetails.giftMessage) {
    doc.fillColor(darkGold).fontSize(7).font('Helvetica-Oblique').text(`Gift Message: "${inv.giftDetails.giftMessage}"`, shipX + 10, addrY + 62, { width: cardW - 20 });
  }

  // --- 4. Items Table (Bounded Columns & Wrap Safety) ---
  const tableY = addrY + cardH + 12;
  const tableHeaderH = 22;

  // Table Header Background
  doc.rect(startX, tableY, pageWidth, tableHeaderH).fill(noir);

  // Mathematically defined columns (Exact sum = 515)
  const cols = {
    num: { x: startX, w: 28, align: 'center' },
    desc: { x: startX + 28, w: 196, align: 'left' },
    size: { x: startX + 224, w: 98, align: 'left' },
    qty: { x: startX + 322, w: 38, align: 'center' },
    rate: { x: startX + 360, w: 75, align: 'right' },
    amount: { x: startX + 435, w: 80, align: 'right' }
  };

  doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
  doc.text('#', cols.num.x, tableY + 7, { width: cols.num.w, align: cols.num.align });
  doc.text('ITEM DESCRIPTION', cols.desc.x + 6, tableY + 7, { width: cols.desc.w - 6, align: cols.desc.align });
  doc.text('FORMAT / SIZE', cols.size.x + 4, tableY + 7, { width: cols.size.w - 4, align: cols.size.align });
  doc.text('QTY', cols.qty.x, tableY + 7, { width: cols.qty.w, align: cols.qty.align });
  doc.text('UNIT PRICE', cols.rate.x, tableY + 7, { width: cols.rate.w - 4, align: cols.rate.align });
  doc.text('AMOUNT (INR)', cols.amount.x, tableY + 7, { width: cols.amount.w - 6, align: cols.amount.align });

  let curY = tableY + tableHeaderH;

  inv.items.forEach((item, idx) => {
    // Height calculation for multi-line support
    const descHeight = doc.heightOfString(item.name, { width: cols.desc.w - 8, fontSize: 8.5 });
    const sizeHeight = doc.heightOfString(item.size, { width: cols.size.w - 8, fontSize: 8 });
    const rowH = Math.max(26, Math.max(descHeight, sizeHeight) + 14);

    // Alternate Row Fills
    if (idx % 2 === 1) {
      doc.rect(startX, curY, pageWidth, rowH).fill(tableAltBg);
    } else {
      doc.rect(startX, curY, pageWidth, rowH).fill('#FFFFFF');
    }

    // Border line beneath row
    doc.moveTo(startX, curY + rowH).lineTo(startX + pageWidth, curY + rowH).strokeColor(borderCol).lineWidth(0.5).stroke();

    const textY = curY + 6;

    // Col 1: Serial #
    doc.fillColor(textSubtle).fontSize(8).font('Helvetica').text(String(item.serialNo || idx + 1), cols.num.x, textY, {
      width: cols.num.w,
      align: cols.num.align
    });

    // Col 2: Item Description
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold').text(item.name, cols.desc.x + 6, textY, {
      width: cols.desc.w - 8,
      align: cols.desc.align
    });
    // HSN Subtitle
    doc.fillColor(textSubtle).fontSize(6.8).font('Helvetica').text('HSN: 33030010 • Artisanal Extrait de Parfum', cols.desc.x + 6, textY + descHeight + 1, {
      width: cols.desc.w - 8
    });

    // Col 3: Format / Size (Strictly bounded so it CANNOT touch QTY)
    doc.fillColor('#2F2924').fontSize(8).font('Helvetica').text(item.size, cols.size.x + 4, textY, {
      width: cols.size.w - 8,
      align: cols.size.align
    });

    // Col 4: Qty (Centered & Completely Clear)
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold').text(String(item.quantity), cols.qty.x, textY, {
      width: cols.qty.w,
      align: cols.qty.align
    });

    // Col 5: Unit Price
    doc.fillColor('#2F2924').fontSize(8.5).font('Helvetica').text(`Rs. ${Number(item.unitPrice).toLocaleString('en-IN')}`, cols.rate.x, textY, {
      width: cols.rate.w - 4,
      align: cols.rate.align
    });

    // Col 6: Total Amount
    doc.fillColor(textDark).fontSize(8.5).font('Helvetica-Bold').text(`Rs. ${Number(item.total).toLocaleString('en-IN')}`, cols.amount.x, textY, {
      width: cols.amount.w - 6,
      align: cols.amount.align
    });

    curY += rowH;
  });

  // Table Bottom Accent
  doc.rect(startX, curY, pageWidth, 1.5).fill(gold);
  curY += 10;

  // --- 5. Tax Breakdown & Financial Totals ---
  const summaryBlockH = 148;
  const leftColW = 280;
  const rightColWidth = pageWidth - leftColW - 12; // ~223
  const rightStartX = startX + leftColW + 12;

  // Left Card: GST Breakdown & Statutory Declarations
  doc.roundedRect(startX, curY, leftColW, summaryBlockH, 4).fillAndStroke('#FFFFFF', borderCol);
  doc.rect(startX, curY, leftColW, 16).fill('#F5F1E8');
  doc.fillColor(darkGold).fontSize(7.5).font('Helvetica-Bold').text('GST BREAKDOWN & STATUTORY TAX NOTICE', startX + 10, curY + 4);

  // Tax Table Inside Left Card
  const taxY = curY + 22;
  doc.fillColor(textSubtle).fontSize(7).font('Helvetica-Bold');
  doc.text('Tax Component', startX + 10, taxY);
  doc.text('Rate', startX + 120, taxY);
  doc.text('Amount', startX + leftColW - 65, taxY, { width: 55, align: 'right' });

  doc.moveTo(startX + 10, taxY + 11).lineTo(startX + leftColW - 10, taxY + 11).strokeColor(borderCol).lineWidth(0.5).stroke();

  const halfGst = Math.round((inv.charges.gstAmount / 2) * 100) / 100;
  const taxableVal = inv.charges.taxableAmount || (inv.charges.subtotal - inv.charges.gstAmount);

  const taxRows = [
    { name: 'Central GST (CGST)', rate: '9.0%', amount: halfGst },
    { name: 'State GST (SGST)', rate: '9.0%', amount: halfGst },
    { name: 'Taxable Goods Value', rate: 'Net', amount: taxableVal }
  ];

  let trY = taxY + 16;
  taxRows.forEach(tr => {
    doc.fillColor(textDark).fontSize(7.5).font('Helvetica').text(tr.name, startX + 10, trY);
    doc.fillColor(textMuted).fontSize(7.5).text(tr.rate, startX + 120, trY);
    doc.fillColor(textDark).fontSize(7.5).font('Helvetica-Bold').text(`Rs. ${Number(tr.amount).toLocaleString('en-IN')}`, startX + leftColW - 65, trY, {
      width: 55,
      align: 'right'
    });
    trY += 13;
  });

  // Amount in words
  doc.moveTo(startX + 10, trY + 3).lineTo(startX + leftColW - 10, trY + 3).strokeColor(borderCol).lineWidth(0.5).stroke();
  doc.fillColor(textSubtle).fontSize(6.8).font('Helvetica-Bold').text('AMOUNT IN WORDS:', startX + 10, trY + 7);
  doc.fillColor(darkGold).fontSize(7.5).font('Helvetica-Bold').text(amountToWords(inv.charges.grandTotal), startX + 10, trY + 17, {
    width: leftColW - 20
  });

  // Computer generated declaration
  doc.fillColor(textSubtle).fontSize(6.5).font('Helvetica-Oblique').text(
    'Certified that the particulars given above are true and correct. Electronic Tax Invoice issued in accordance with Rule 48 of CGST Rules 2017.',
    startX + 10,
    curY + summaryBlockH - 24,
    { width: leftColW - 20 }
  );

  // Right Card: Financial Totals Summary
  doc.roundedRect(rightStartX, curY, rightColWidth, summaryBlockH, 4).fillAndStroke('#FFFFFF', borderCol);
  doc.rect(rightStartX, curY, rightColWidth, 16).fill('#F5F1E8');
  doc.fillColor(darkGold).fontSize(7.5).font('Helvetica-Bold').text('FINANCIAL SETTLEMENT', rightStartX + 10, curY + 4);

  let finY = curY + 24;
  const labelW = 110;
  const valW = rightColWidth - labelW - 20;
  const valX = rightStartX + labelW + 10;

  // Subtotal
  doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('Items Subtotal:', rightStartX + 10, finY);
  doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold').text(`Rs. ${Number(inv.charges.subtotal).toLocaleString('en-IN')}`, valX, finY, {
    width: valW,
    align: 'right'
  });
  finY += 14;

  // Promotional Discount
  if (inv.charges.discountAmount > 0) {
    doc.fillColor(darkGold).fontSize(8).font('Helvetica').text(`Discount (${inv.charges.couponCode || 'Promo'}):`, rightStartX + 10, finY);
    doc.fillColor(darkGold).fontSize(8).font('Helvetica-Bold').text(`- Rs. ${Number(inv.charges.discountAmount).toLocaleString('en-IN')}`, valX, finY, {
      width: valW,
      align: 'right'
    });
    finY += 14;
  }

  // Gift Wrap
  if (inv.charges.giftWrapFee > 0) {
    doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('Gift Presentation:', rightStartX + 10, finY);
    doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold').text(`Rs. ${Number(inv.charges.giftWrapFee).toLocaleString('en-IN')}`, valX, finY, {
      width: valW,
      align: 'right'
    });
    finY += 14;
  }

  // Insured Shipping
  doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('Insured Courier:', rightStartX + 10, finY);
  doc.fillColor(inv.charges.shippingFee === 0 ? '#1E7E34' : textDark).fontSize(8).font('Helvetica-Bold').text(
    inv.charges.shippingFee === 0 ? 'COMPLIMENTARY' : `Rs. ${Number(inv.charges.shippingFee).toLocaleString('en-IN')}`,
    valX,
    finY,
    { width: valW, align: 'right' }
  );
  finY += 14;

  // Tax Included Note
  doc.fillColor(textSubtle).fontSize(7).font('Helvetica').text('(GST 18% Included):', rightStartX + 10, finY);
  doc.fillColor(textSubtle).fontSize(7).text(`Rs. ${Number(inv.charges.gstAmount).toLocaleString('en-IN')}`, valX, finY, {
    width: valW,
    align: 'right'
  });
  finY += 18;

  // Grand Total Highlight Box
  const grandBoxH = 28;
  doc.roundedRect(rightStartX + 6, finY - 3, rightColWidth - 12, grandBoxH, 3).fill(noir);
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('TOTAL SETTLED:', rightStartX + 14, finY + 6);
  doc.fillColor(gold).fontSize(11).font('Helvetica-Bold').text(
    `Rs. ${Number(inv.charges.grandTotal).toLocaleString('en-IN')}`,
    valX - 6,
    finY + 5,
    { width: valW, align: 'right' }
  );

  // Digital Signatory
  const sigY = finY + grandBoxH + 10;
  doc.fillColor(textSubtle).fontSize(6.5).font('Helvetica').text('For ROVE & AMBER MAISON DE HAUTE PARFUMERIE', rightStartX + 10, sigY, {
    width: rightColWidth - 20,
    align: 'center'
  });
  doc.fillColor(darkGold).fontSize(7).font('Helvetica-Bold').text('[ Authorized Digital Stamp ]', rightStartX + 10, sigY + 11, {
    width: rightColWidth - 20,
    align: 'center'
  });

  // --- 6. Luxury Footer ---
  const footerY = 790;
  doc.moveTo(startX, footerY).lineTo(startX + pageWidth, footerY).strokeColor(gold).lineWidth(1).stroke();

  doc.fillColor(noir).fontSize(7.5).font('Helvetica-Bold').text(
    'ROVE & AMBER  •  MAISON DE HAUTE PARFUMERIE  •  MUMBAI',
    startX,
    footerY + 10,
    { align: 'center', width: pageWidth, characterSpacing: 1.2 }
  );
  doc.fillColor(textSubtle).fontSize(6.8).font('Helvetica').text(
    'Concierge Inquiries: concierge@roveandamber.com  |  Visit: www.roveandamber.com  |  GSTIN: 27AABCR1234F1Z8',
    startX,
    footerY + 22,
    { align: 'center', width: pageWidth }
  );
  doc.fillColor(textSubtle).fontSize(6.2).font('Helvetica-Oblique').text(
    'This is an authentic, system-generated computer invoice issued under luxury retail e-commerce regulations.',
    startX,
    footerY + 33,
    { align: 'center', width: pageWidth }
  );
};

/**
 * Generates and streams a PDF invoice to an HTTP response
 */
export const generateInvoicePDF = (order, res) => {
  const inv = buildInvoiceData(order);
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream directly to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="Invoice-${inv.orderId.replace('#', '')}.pdf"`
  );

  doc.pipe(res);
  renderOfficialInvoice(doc, inv);
  doc.end();
};

/**
 * Generates an in-memory PDF Buffer for email attachments and background tasks
 */
export const generateInvoiceBuffer = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const inv = buildInvoiceData(order);
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', (err) => {
        reject(err);
      });

      renderOfficialInvoice(doc, inv);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export default {
  amountToWords,
  buildInvoiceData,
  renderOfficialInvoice,
  generateInvoicePDF,
  generateInvoiceBuffer
};
