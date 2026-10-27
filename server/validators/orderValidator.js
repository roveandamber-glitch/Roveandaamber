import mongoose from 'mongoose';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

/**
 * Validates Order Placement Payload
 */
export const validateCreateOrderInput = (data = {}) => {
  const errors = [];
  const { items, productId, quantity, customerName, name, phone, email, address, isGift, giftRecipient } = data;

  // Validate items
  let orderItems = items;
  if (!orderItems && productId) {
    orderItems = [{ productId, quantity: quantity || 1 }];
  }

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    errors.push({ field: 'items', message: 'Order must contain at least one fragrance item.' });
  } else {
    orderItems.forEach((item, index) => {
      const pid = item.productId || item.product_id;
      if (!pid) {
        errors.push({ field: `items[${index}].productId`, message: 'Product ID is required for each item.' });
      }
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty < 1) {
        errors.push({ field: `items[${index}].quantity`, message: 'Quantity must be at least 1.' });
      }
    });
  }

  // Customer contact validations
  const finalName = customerName || name;
  if (finalName && typeof finalName === 'string' && finalName.trim().length < 2) {
    errors.push({ field: 'customerName', message: 'Customer name must be at least 2 characters.' });
  }

  if (email && typeof email === 'string' && email.trim().length > 0) {
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      errors.push({ field: 'email', message: 'Please provide a valid email address.' });
    }
  }

  if (phone && typeof phone === 'string' && phone.trim().length > 0) {
    if (!PHONE_REGEX.test(phone.trim())) {
      errors.push({ field: 'phone', message: 'Please provide a valid contact phone number.' });
    }
  }

  // Gift recipient validations if isGift is enabled
  if (isGift && giftRecipient) {
    if (giftRecipient.email && !EMAIL_REGEX.test(giftRecipient.email.trim().toLowerCase())) {
      errors.push({ field: 'giftRecipient.email', message: 'Please provide a valid recipient email address.' });
    }
    if (giftRecipient.phone && !PHONE_REGEX.test(giftRecipient.phone.trim())) {
      errors.push({ field: 'giftRecipient.phone', message: 'Please provide a valid recipient phone number.' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Express Middleware for Order Creation
 */
export const validateCreateOrder = (req, res, next) => {
  const { isValid, errors } = validateCreateOrderInput(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors
    });
  }
  next();
};

export default {
  validateCreateOrderInput,
  validateCreateOrder
};
