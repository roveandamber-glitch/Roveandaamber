import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { buildInvoiceData } from './invoiceService.js';
import PDFDocument from 'pdfkit';

dotenv.config();

// Helper to check if SMTP credentials are configured
export const isEmailConfigured = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  return Boolean(host && user && pass && host.trim() && user.trim() && pass.trim());
};

// Create nodemailer transporter lazily
let transporter = null;
const getTransporter = () => {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: (process.env.SMTP_USER || process.env.SMTP_EMAIL).trim(),
        pass: (process.env.SMTP_PASS || process.env.SMTP_PASSWORD).trim()
      }
    });
  }
  return transporter;
};

// Generate buffer of PDF invoice for email attachment
const generateInvoiceBuffer = (order) => {
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

      // Colors
      const darkGold = '#9E7430';
      const black = '#1A1817';
      const lightGray = '#F5F2EC';
      const mutedText = '#666059';

      // Header
      doc.rect(40, 40, 515, 65).fill(black);
      doc.fillColor('#FFFFFF').fontSize(20).text('ROVE & AMBER', 55, 52, { characterSpacing: 2 });
      doc.fillColor(darkGold).fontSize(8).text('MAISON DE HAUTE PARFUMERIE', 55, 78, { characterSpacing: 1.5 });
      doc.fillColor('#FFFFFF').fontSize(16).text('TAX INVOICE', 400, 52, { align: 'right' });
      doc.fillColor(darkGold).fontSize(9).text(`${inv.invoiceNumber}`, 400, 75, { align: 'right' });

      // Meta Box
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

      // Customer Info
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

      // Table
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

      doc.moveTo(40, currentY + 2).lineTo(555, currentY + 2).strokeColor('#E0DCD3').stroke();

      // Totals
      const summaryY = currentY + 15;
      doc.fontSize(8).fillColor(mutedText);
      doc.text('Subtotal:', 350, summaryY);
      doc.fillColor(black).text(`Rs ${inv.charges.subtotal.toLocaleString()}`, 460, summaryY, { align: 'right', width: 80 });

      let nextY = summaryY + 14;
      if (inv.charges.discountAmount > 0) {
        doc.fillColor(darkGold).text(`Discount (${inv.charges.couponCode || 'Code'}):`, 350, nextY);
        doc.text(`- Rs ${inv.charges.discountAmount.toLocaleString()}`, 460, nextY, { align: 'right', width: 80 });
        nextY += 14;
      }
      if (inv.charges.giftWrapFee > 0) {
        doc.fillColor(mutedText).text('Luxury Gift Wrapping:', 350, nextY);
        doc.fillColor(black).text(`Rs ${inv.charges.giftWrapFee.toLocaleString()}`, 460, nextY, { align: 'right', width: 80 });
        nextY += 14;
      }
      doc.fillColor(mutedText).text('Shipping:', 350, nextY);
      doc.fillColor(black).text(inv.charges.shippingFee === 0 ? 'Free' : `Rs ${inv.charges.shippingFee}`, 460, nextY, { align: 'right', width: 80 });
      nextY += 16;

      doc.rect(340, nextY - 2, 215, 26).fill(lightGray);
      doc.fillColor(black).fontSize(10).text('GRAND TOTAL:', 350, nextY + 6);
      doc.fillColor(darkGold).fontSize(11).text(`Rs ${inv.charges.grandTotal.toLocaleString()}`, 460, nextY + 6, { align: 'right', width: 80 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Base HTML Template Generator with Luxury Styling
const buildEmailHtml = ({ preheader, title, subtitle, contentHtml, orderId, actionUrl, actionText }) => {
  const brandGold = '#C49A45';
  const brandDark = '#141416';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const finalActionUrl = actionUrl || `${clientUrl}/orders/${(orderId || '').replace('#', '')}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0F0F10; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #E5E5E5; }
    .container { max-width: 600px; margin: 40px auto; background-color: #1A1A1D; border: 1px solid #2B2824; border-radius: 6px; overflow: hidden; }
    .header { background-color: #141416; padding: 36px 40px; text-align: center; border-bottom: 1px solid #2B2824; }
    .brand-title { font-size: 24px; letter-spacing: 4px; color: #FFFFFF; margin: 0; font-weight: 300; }
    .brand-subtitle { font-size: 10px; letter-spacing: 2.5px; color: ${brandGold}; margin-top: 8px; text-transform: uppercase; }
    .hero { padding: 36px 40px 24px; text-align: center; }
    .hero-title { font-size: 20px; color: #FFFFFF; margin: 0 0 8px; font-weight: 400; letter-spacing: 0.5px; }
    .hero-subtitle { font-size: 13px; color: #9E9B95; margin: 0; line-height: 1.6; }
    .body-content { padding: 0 40px 30px; font-size: 14px; line-height: 1.6; color: #D1CEC7; }
    .card { background-color: #212024; border: 1px solid #332F2A; border-radius: 4px; padding: 20px; margin: 20px 0; }
    .item-row { display: table; width: 100%; padding: 8px 0; border-bottom: 1px solid #2D2B30; }
    .item-cell-name { display: table-cell; text-align: left; font-size: 13px; color: #FFFFFF; }
    .item-cell-price { display: table-cell; text-align: right; font-size: 13px; color: ${brandGold}; font-weight: bold; }
    .cta-container { text-align: center; margin: 32px 0 16px; }
    .cta-button { display: inline-block; background-color: ${brandGold}; color: #000000 !important; text-decoration: none; padding: 14px 32px; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; border-radius: 2px; }
    .footer { background-color: #141416; padding: 28px 40px; text-align: center; font-size: 11px; color: #736E65; border-top: 1px solid #2B2824; line-height: 1.8; }
    .footer a { color: ${brandGold}; text-decoration: none; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader || title}
  </div>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">ROVE & AMBER</h1>
      <div class="brand-subtitle">Maison de Haute Parfumerie</div>
    </div>
    <div class="hero">
      <h2 class="hero-title">${title}</h2>
      <p class="hero-subtitle">${subtitle || ''}</p>
    </div>
    <div class="body-content">
      ${contentHtml}
      ${
        actionText
          ? `<div class="cta-container">
              <a href="${finalActionUrl}" class="cta-button">${actionText}</a>
             </div>`
          : ''
      }
    </div>
    <div class="footer">
      <p>ROVE & AMBER | Luxury Fragrance Arcade, Galleria Boulevard, Mumbai</p>
      <p>Questions regarding your flacons? Contact our concierge at <a href="mailto:concierge@roveandamber.com">concierge@roveandamber.com</a></p>
      <p style="margin-top: 12px; font-style: italic;">Crafted with pure resins, natural botanical essences, and rare oud.</p>
    </div>
  </div>
</body>
</html>
`;
};

// Generic Mail Sender
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const fromAddress = process.env.EMAIL_FROM || '"ROVE & AMBER Concierge" <concierge@roveandamber.com>';

  // Check if live SMTP is configured
  if (isEmailConfigured()) {
    try {
      const mailer = getTransporter();
      const info = await mailer.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        attachments
      });

      console.log(`✉️ [Email Service]: Sent "${subject}" to ${to} (MessageId: ${info.messageId})`);
      return {
        success: true,
        messageId: info.messageId,
        recipient: to,
        isSimulated: false
      };
    } catch (error) {
      console.error(`❌ [Email Service Error]: Failed to send email to ${to}:`, error.message);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  }

  // Development / Simulation Mode: Log preview safely
  console.log('----------------------------------------------------');
  console.log(`💌 [Email Service (Simulated)]:`);
  console.log(` Recipient:   ${to}`);
  console.log(` Subject:     ${subject}`);
  console.log(` Attachments: ${attachments.length > 0 ? attachments.map(a => a.filename).join(', ') : 'None'}`);
  console.log(` Notice:      SMTP credentials not yet added in .env. Email simulated successfully.`);
  console.log('----------------------------------------------------');

  return {
    success: true,
    recipient: to,
    subject,
    isSimulated: true,
    notice: 'Email simulated in development mode. Configure SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env for live delivery.'
  };
};

export const emailService = {
  // 1. Order Confirmation Email
  sendOrderConfirmation: async (order) => {
    const recipientEmail = order.email || (order.user_id && order.user_id.email);
    if (!recipientEmail) {
      console.warn('⚠️ [Email Service]: No customer email found for order confirmation.');
      return { success: false, message: 'Customer email missing.' };
    }

    const orderId = order.orderId || `#ORD-${String(order.id || order._id).slice(-4).toUpperCase()}`;
    const itemsHtml = (order.items || [])
      .map(
        i => `
        <div class="item-row">
          <div class="item-cell-name">
            <strong>${i.name || i.product_name || 'Artisanal Perfume'}</strong> (${i.size || '50ml'}) x ${i.quantity || 1}
          </div>
          <div class="item-cell-price">Rs ${((i.price || 0) * (i.quantity || 1)).toLocaleString()}</div>
        </div>
      `
      )
      .join('');

    const giftSection = order.isGift
      ? `
        <div class="card" style="border-left: 3px solid #C49A45;">
          <div style="color:#C49A45; font-size:12px; font-weight:bold; text-transform:uppercase;">Luxury Gift Presentation</div>
          <div style="font-size:13px; margin-top:6px;">Occasion: ${order.occasion || 'Celebration'}</div>
          ${order.giftMessage ? `<div style="font-style:italic; margin-top:4px; color:#E0DCD3;">"${order.giftMessage}"</div>` : ''}
          <div style="font-size:12px; color:#9E9B95; margin-top:4px;">Recipient: ${order.giftRecipient?.name || 'Valued Recipient'} (${order.giftRecipient?.city || ''})</div>
        </div>
      `
      : '';

    const contentHtml = `
      <p>Dear ${order.customer_name || 'Valued Client'},</p>
      <p>Thank you for choosing <strong>ROVE & AMBER</strong>. We are pleased to confirm that your order <strong>${orderId}</strong> has been received and logged in our atelier.</p>
      
      <div class="card">
        <div style="font-size:12px; color:#9E9B95; text-transform:uppercase; margin-bottom:12px; letter-spacing:1px;">Selected Olfactory Creations</div>
        ${itemsHtml}
        <div style="margin-top:14px; padding-top:10px; border-top:1px solid #38353A; font-size:14px; color:#FFFFFF; text-align:right;">
          Total Amount: <span style="color:#C49A45; font-size:16px; font-weight:bold;">Rs ${(order.total_amount || 0).toLocaleString()}</span>
        </div>
      </div>

      ${giftSection}

      <p style="font-size:13px; color:#9E9B95;">
        Delivery Address: <em>${order.address || 'Standard Delivery'}</em><br>
        Estimated Delivery: <strong>${order.tracking?.estimatedDelivery ? new Date(order.tracking.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '3-5 business days'}</strong>
      </p>
    `;

    const html = buildEmailHtml({
      title: 'Order Confirmed',
      subtitle: `Your flacons are being reserved for order ${orderId}`,
      contentHtml,
      orderId,
      actionText: 'Track Your Order',
      actionUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/order-confirmation/${orderId.replace('#', '')}`
    });

    return sendEmail({
      to: recipientEmail,
      subject: `Order Confirmed: ${orderId} | ROVE & AMBER`,
      html
    });
  },

  // 2. Payment Confirmation Email
  sendPaymentConfirmation: async (order) => {
    const recipientEmail = order.email || (order.user_id && order.user_id.email);
    if (!recipientEmail) return { success: false, message: 'Customer email missing.' };

    const orderId = order.orderId || `#ORD-${String(order.id || order._id).slice(-4).toUpperCase()}`;
    const transactionId = order.razorpayPaymentId || order.paymentDetails?.transactionId || 'Verified';

    const contentHtml = `
      <p>Dear ${order.customer_name || 'Valued Client'},</p>
      <p>We are delighted to confirm that your payment of <strong>Rs ${(order.total_amount || 0).toLocaleString()}</strong> has been successfully verified.</p>
      
      <div class="card" style="border-left: 3px solid #1E7E34;">
        <div style="color:#1E7E34; font-size:12px; font-weight:bold; text-transform:uppercase;">Payment Receipt Verified</div>
        <div style="font-size:13px; margin-top:6px;">Transaction ID: <code style="color:#C49A45;">${transactionId}</code></div>
        <div style="font-size:13px; margin-top:4px;">Payment Method: ${order.paymentMethod || 'Razorpay Online'}</div>
        <div style="font-size:13px; margin-top:4px;">Invoice Number: <strong>${order.invoice?.invoiceNumber || `INV-${orderId.replace('#', '')}`}</strong></div>
      </div>

      <p>Your flacons have now entered the <strong>Artisan Packaging</strong> stage. Each flacon is carefully inspected, capped, and housed in our protective gold-embossed coffrets.</p>
      <p style="font-size:13px; color:#9E9B95;">You can download your official tax invoice anytime using the button below or directly in your account.</p>
    `;

    const html = buildEmailHtml({
      title: 'Payment Confirmed',
      subtitle: `Payment verified for Order ${orderId}`,
      contentHtml,
      orderId,
      actionText: 'View Order & Invoice',
      actionUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${orderId.replace('#', '')}`
    });

    return sendEmail({
      to: recipientEmail,
      subject: `Payment Receipt: ${orderId} | ROVE & AMBER`,
      html
    });
  },

  // 3. Shipping Notification Email (Dispatched with Courier)
  sendShippingNotification: async (order) => {
    const recipientEmail = order.email || (order.user_id && order.user_id.email);
    if (!recipientEmail) return { success: false, message: 'Customer email missing.' };

    const orderId = order.orderId || `#ORD-${String(order.id || order._id).slice(-4).toUpperCase()}`;
    const courier = order.tracking?.courierName || 'BlueDart Luxury Express';
    const trackingNumber = order.tracking?.trackingNumber || 'Available shortly';
    const trackingUrl = order.tracking?.trackingUrl || 'https://www.bluedart.com';
    const estDate = order.tracking?.estimatedDelivery
      ? new Date(order.tracking.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'In 2-3 business days';

    const contentHtml = `
      <p>Dear ${order.customer_name || 'Valued Client'},</p>
      <p>Your artisanal flacons have been hand-packaged and dispatched for delivery.</p>

      <div class="card" style="border-left: 3px solid #C49A45;">
        <div style="color:#C49A45; font-size:12px; font-weight:bold; text-transform:uppercase;">Courier Dispatch Information</div>
        <div style="font-size:13px; margin-top:8px;">Courier Partner: <strong>${courier}</strong></div>
        <div style="font-size:13px; margin-top:4px;">Airway Bill / Tracking #: <strong style="color:#FFFFFF;">${trackingNumber}</strong></div>
        <div style="font-size:13px; margin-top:4px;">Estimated Arrival: <strong style="color:#C49A45;">${estDate}</strong></div>
        <div style="font-size:13px; margin-top:4px;">Current Hub: ${order.tracking?.currentLocation || 'Express Transit Facility, Mumbai'}</div>
      </div>

      <p style="font-size:13px; color:#9E9B95;">
        Delivering to: ${order.isGift && order.giftRecipient?.name ? `<strong>${order.giftRecipient.name}</strong>, ` : ''}${order.address || 'Your address'}
      </p>
    `;

    const html = buildEmailHtml({
      title: 'Your Order Has Shipped',
      subtitle: `Your fragrances are traveling via ${courier}`,
      contentHtml,
      orderId,
      actionText: 'Track Delivery Live',
      actionUrl: trackingUrl.startsWith('http') ? trackingUrl : `${process.env.CLIENT_URL || 'http://localhost:3000'}/track/${orderId.replace('#', '')}`
    });

    return sendEmail({
      to: recipientEmail,
      subject: `Your Fragrance Has Shipped: ${orderId} | ROVE & AMBER`,
      html
    });
  },

  // 4. Delivery Completed Notification Email
  sendDeliveryNotification: async (order) => {
    const recipientEmail = order.email || (order.user_id && order.user_id.email);
    if (!recipientEmail) return { success: false, message: 'Customer email missing.' };

    const orderId = order.orderId || `#ORD-${String(order.id || order._id).slice(-4).toUpperCase()}`;

    const contentHtml = `
      <p>Dear ${order.customer_name || 'Valued Client'},</p>
      <p>Your package for order <strong>${orderId}</strong> has been safely delivered.</p>

      <div class="card" style="border-left: 3px solid #1E7E34;">
        <div style="color:#1E7E34; font-size:12px; font-weight:bold; text-transform:uppercase;">Delivered Successfully</div>
        <div style="font-size:13px; margin-top:6px;">Delivered to: <strong>${order.isGift && order.giftRecipient?.name ? order.giftRecipient.name : order.customer_name}</strong></div>
        <div style="font-size:13px; margin-top:4px;">Delivered at: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>

      <h4 style="color:#FFFFFF; margin: 20px 0 8px; font-size:14px;">The Art of Wearing Your Scent:</h4>
      <ul style="padding-left: 20px; font-size:13px; color:#9E9B95; line-height:1.7;">
        <li>Apply to warm pulse points — wrists, base of the neck, and behind the ears.</li>
        <li>Avoid rubbing the wrists together to allow the top and heart notes to unfold naturally.</li>
        <li>Store flacons in a cool, dark setting away from direct sunlight for enduring preservation.</li>
      </ul>
    `;

    const html = buildEmailHtml({
      title: 'Your Flacons Have Arrived',
      subtitle: `Delivered: Order ${orderId}`,
      contentHtml,
      orderId,
      actionText: 'Review Your Experience',
      actionUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${orderId.replace('#', '')}`
    });

    return sendEmail({
      to: recipientEmail,
      subject: `Delivered: Your Fragrance Has Arrived (${orderId}) | ROVE & AMBER`,
      html
    });
  },

  // 5. Send Invoice via Email (with Attached Official PDF)
  sendInvoiceEmail: async (order, customRecipient) => {
    const recipientEmail = customRecipient || order.email || (order.user_id && order.user_id.email);
    if (!recipientEmail) return { success: false, message: 'Recipient email missing.' };

    const orderId = order.orderId || `#ORD-${String(order.id || order._id).slice(-4).toUpperCase()}`;
    const invNumber = order.invoice?.invoiceNumber || `INV-${orderId.replace('#', '')}`;

    let pdfBuffer = null;
    try {
      pdfBuffer = await generateInvoiceBuffer(order);
    } catch (e) {
      console.warn('⚠️ [Email Service]: Could not generate PDF attachment, sending email with download link.');
    }

    const contentHtml = `
      <p>Dear ${order.customer_name || 'Valued Client'},</p>
      <p>Please find attached your official tax invoice <strong>${invNumber}</strong> for order <strong>${orderId}</strong>.</p>

      <div class="card">
        <div style="font-size:12px; color:#9E9B95; text-transform:uppercase; margin-bottom:8px;">Invoice Summary</div>
        <div style="font-size:13px; margin:4px 0;">Invoice Number: <strong>${invNumber}</strong></div>
        <div style="font-size:13px; margin:4px 0;">Order Reference: <strong>${orderId}</strong></div>
        <div style="font-size:13px; margin:4px 0;">Total Payable: <strong style="color:#C49A45;">Rs ${(order.total_amount || 0).toLocaleString()}</strong></div>
        <div style="font-size:13px; margin:4px 0;">Payment Status: <span style="color:#1E7E34; font-weight:bold;">${(order.paymentStatus || 'Paid').toUpperCase()}</span></div>
      </div>

      <p style="font-size:13px; color:#9E9B95;">
        A copy of your PDF invoice is attached to this email. You can also view and download invoices directly from your client account at any time.
      </p>
    `;

    const html = buildEmailHtml({
      title: 'Tax Invoice & Receipt',
      subtitle: `Invoice ${invNumber} for Order ${orderId}`,
      contentHtml,
      orderId,
      actionText: 'Download PDF Online',
      actionUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/api/orders/${orderId.replace('#', '')}/invoice/download`
    });

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `${invNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    return sendEmail({
      to: recipientEmail,
      subject: `Tax Invoice: ${invNumber} (${orderId}) | ROVE & AMBER`,
      html,
      attachments
    });
  },

  // 6. Generic Transactional Status Update
  sendTransactionalUpdate: async (order, { subject, stage, message }) => {
    const recipientEmail = order.email || (order.user_id && order.user_id.email);
    if (!recipientEmail) return { success: false, message: 'Customer email missing.' };

    const orderId = order.orderId || `#ORD-${String(order.id || order._id).slice(-4).toUpperCase()}`;

    const contentHtml = `
      <p>Dear ${order.customer_name || 'Valued Client'},</p>
      <p>We are writing to inform you of an update regarding your order <strong>${orderId}</strong>.</p>

      <div class="card" style="border-left: 3px solid #C49A45;">
        <div style="color:#C49A45; font-size:12px; font-weight:bold; text-transform:uppercase;">${stage || order.status || 'Order Update'}</div>
        <div style="font-size:14px; margin-top:8px; color:#FFFFFF;">${message || `Your order status has been updated to "${order.status}".`}</div>
      </div>

      <p style="font-size:13px; color:#9E9B95;">If you have any questions, our concierge team is always available to assist you.</p>
    `;

    const html = buildEmailHtml({
      title: subject || 'Order Update',
      subtitle: `Update on Order ${orderId}`,
      contentHtml,
      orderId,
      actionText: 'View Order Details',
      actionUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${orderId.replace('#', '')}`
    });

    return sendEmail({
      to: recipientEmail,
      subject: `${subject || 'Order Update'}: ${orderId} | ROVE & AMBER`,
      html
    });
  }
};

export default emailService;
