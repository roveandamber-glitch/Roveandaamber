import mongoose from 'mongoose';
import { User } from '../../models/userModel.js';
import { OrderModel, Order } from '../../models/orderModel.js';
import { ProductModel } from '../../models/productModel.js';
import { WishlistModel } from '../../models/wishlistModel.js';
import { buildInvoiceData, generateInvoicePDF } from '../../services/invoiceService.js';
import { emailService } from '../../services/emailService.js';

// Helper to resolve user ID safely
const getUserId = (req) => {
  return req.user ? (req.user.id || req.user._id) : null;
};

// ==========================================
// 8.1 Customer Account Access & Summary
// ==========================================

export const getAccountOverview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Customer account not found.' });
    }

    const allOrders = await Order.find({ user_id: userId }).sort({ createdAt: -1 });

    const activeOrders = allOrders.filter(o => ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Return Requested'].includes(o.status));
    const previousOrders = allOrders.filter(o => ['Delivered', 'Cancelled', 'Returned'].includes(o.status));
    const totalSpent = allOrders
      .filter(o => o.paymentStatus === 'Paid' && o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    const defaultAddress = user.addresses?.find(a => a.isDefault) || user.addresses?.[0] || null;

    return res.json({
      success: true,
      data: {
        profile: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          memberSince: user.createdAt
        },
        metrics: {
          totalOrdersCount: allOrders.length,
          activeOrdersCount: activeOrders.length,
          previousOrdersCount: previousOrders.length,
          totalSpent: Math.round(totalSpent)
        },
        defaultDeliveryAddress: defaultAddress,
        recentOrders: allOrders.slice(0, 3).map(o => ({
          orderId: o.orderId || `#ORD-${String(o._id).slice(-4).toUpperCase()}`,
          date: o.createdAt,
          status: o.status,
          totalAmount: o.total_amount,
          itemsCount: (o.items || []).length,
          firstItemName: o.items?.[0]?.name || 'Luxury Perfume',
          firstItemImage: o.items?.[0]?.image || ''
        }))
      }
    });
  } catch (error) {
    console.error('Account overview error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve account overview.' });
  }
};

// ==========================================
// 8.2 Current & Previous Orders
// ==========================================

export const getAccountOrders = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { type, status } = req.query;

    const query = { user_id: userId };

    if (status) {
      query.status = status;
    } else if (type === 'current') {
      query.status = { $in: ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Return Requested'] };
    } else if (type === 'previous') {
      query.status = { $in: ['Delivered', 'Cancelled', 'Returned'] };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    const formattedOrders = orders.map((o) => {
      const ordId = o.orderId || `#ORD-${String(o._id).slice(-4).toUpperCase()}`;
      
      // Calculate cancellation and return eligibility
      const canCancel = ['Pending', 'Processing', 'Confirmed'].includes(o.status);
      const isDelivered = o.status === 'Delivered';
      const deliveryDate = o.tracking?.deliveredAt || o.updatedAt;
      const daysSinceDelivery = deliveryDate ? (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24) : 999;
      const canReturn = isDelivered && daysSinceDelivery <= 7 && !o.returnDetails?.isReturnRequested;

      return {
        id: o._id.toString(),
        orderId: ordId,
        invoiceNumber: o.invoice?.invoiceNumber || `INV-${ordId.replace('#', '')}`,
        createdAt: o.createdAt,
        dateFormatted: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: o.status,
        paymentStatus: o.paymentStatus || 'Pending',
        paymentMethod: o.paymentMethod || 'Razorpay',
        totalAmount: o.total_amount,
        itemsCount: (o.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0),
        items: o.items,
        delivery: {
          courierName: o.tracking?.courierName || 'BlueDart Luxury Express',
          trackingNumber: o.tracking?.trackingNumber || '',
          estimatedDelivery: o.tracking?.estimatedDelivery || null
        },
        eligibility: {
          canCancel,
          canReturn,
          returnWindowDaysRemaining: canReturn ? Math.max(0, Math.ceil(7 - daysSinceDelivery)) : 0
        },
        invoiceDownloadUrl: `/api/orders/${ordId}/invoice/download`
      };
    });

    return res.json({
      success: true,
      data: {
        filter: type || status || 'all',
        totalCount: formattedOrders.length,
        orders: formattedOrders
      }
    });
  } catch (error) {
    console.error('Account orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer orders.' });
  }
};

export const getAccountOrderDetails = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const order = await Order.findOne({
      $and: [
        { user_id: userId },
        {
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
            { orderId: id },
            { orderId: `#${id.replace('#', '')}` }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found in your account.' });
    }

    const ordId = order.orderId || `#ORD-${String(order._id).slice(-4).toUpperCase()}`;
    const canCancel = ['Pending', 'Processing', 'Confirmed'].includes(order.status);
    const isDelivered = order.status === 'Delivered';
    const deliveryDate = order.tracking?.deliveredAt || order.updatedAt;
    const daysSinceDelivery = deliveryDate ? (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24) : 999;
    const canReturn = isDelivered && daysSinceDelivery <= 7 && !order.returnDetails?.isReturnRequested;

    return res.json({
      success: true,
      data: {
        order: {
          ...order.toObject(),
          id: order._id.toString(),
          orderId: ordId
        },
        eligibility: {
          canCancel,
          canReturn,
          returnPolicy: 'Returns eligible within 7 days of delivery for untampered, sealed luxury flacons.',
          returnWindowDaysRemaining: canReturn ? Math.max(0, Math.ceil(7 - daysSinceDelivery)) : 0
        }
      }
    });
  } catch (error) {
    console.error('Order details error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
};

// ==========================================
// 8.3 Delivery Addresses Management
// ==========================================

export const getSavedAddresses = async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId).select('addresses');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      data: {
        count: (user.addresses || []).length,
        addresses: user.addresses || []
      }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve delivery addresses.' });
  }
};

export const addSavedAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      title,
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.addresses) user.addresses = [];

    // If marked as default or it's the first address, reset other addresses
    const shouldBeDefault = isDefault || user.addresses.length === 0;
    if (shouldBeDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    const newAddress = {
      title: title || 'Home',
      name: name.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2 ? addressLine2.trim() : '',
      city: city.trim(),
      state: state ? state.trim() : '',
      postalCode: postalCode.trim(),
      country: country || 'India',
      isDefault: shouldBeDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    const created = user.addresses[user.addresses.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Delivery address saved successfully.',
      data: created
    });
  } catch (error) {
    console.error('Add address error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save delivery address.' });
  }
};

export const updateSavedAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { addressId } = req.params;
    const updateFields = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetAddress = user.addresses?.id(addressId);
    if (!targetAddress) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    if (updateFields.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    ['title', 'name', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country', 'isDefault'].forEach(key => {
      if (updateFields[key] !== undefined) {
        targetAddress[key] = updateFields[key];
      }
    });

    await user.save();

    return res.json({
      success: true,
      message: 'Delivery address updated.',
      data: targetAddress
    });
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
};

export const deleteSavedAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetAddress = user.addresses?.id(addressId);
    if (!targetAddress) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    const wasDefault = targetAddress.isDefault;
    user.addresses.pull(addressId);

    // If deleted address was default, make the first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.json({
      success: true,
      message: 'Delivery address removed.',
      data: { remainingCount: user.addresses.length }
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetAddress = user.addresses?.id(addressId);
    if (!targetAddress) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    user.addresses.forEach(a => { a.isDefault = false; });
    targetAddress.isDefault = true;

    await user.save();

    return res.json({
      success: true,
      message: 'Default delivery address updated.',
      data: targetAddress
    });
  } catch (error) {
    console.error('Set default address error:', error);
    return res.status(500).json({ success: false, message: 'Failed to set default address.' });
  }
};

// ==========================================
// 8.4 Access Wishlist Directly From Account
// ==========================================

export const getAccountWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const wishlist = await WishlistModel.getWishlist({ userId });

    return res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Account wishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve account wishlist.' });
  }
};

// ==========================================
// 8.5 Cancellation & Return Eligibility and Execution
// ==========================================

export const checkOrderEligibility = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const order = await Order.findOne({
      $and: [
        { user_id: userId },
        {
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
            { orderId: id },
            { orderId: `#${id.replace('#', '')}` }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const status = order.status;
    const canCancel = ['Pending', 'Processing', 'Confirmed'].includes(status);
    let cancelBlockReason = '';
    if (!canCancel) {
      if (status === 'Shipped') cancelBlockReason = 'Order has already been dispatched with our courier partner. Cancellation is no longer possible in transit.';
      else if (status === 'Delivered') cancelBlockReason = 'Order has already been delivered. You may initiate an eligible return within 7 days instead.';
      else if (status === 'Cancelled') cancelBlockReason = 'Order is already cancelled.';
      else cancelBlockReason = `Cancellation is unavailable for status "${status}".`;
    }

    const isDelivered = status === 'Delivered';
    const deliveryDate = order.tracking?.deliveredAt || order.updatedAt;
    const daysSinceDelivery = deliveryDate ? (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24) : 999;
    const canReturn = isDelivered && daysSinceDelivery <= 7 && !order.returnDetails?.isReturnRequested;

    let returnBlockReason = '';
    if (!canReturn) {
      if (!isDelivered) returnBlockReason = 'Returns can only be requested after the parcel has been delivered.';
      else if (daysSinceDelivery > 7) returnBlockReason = 'The 7-day return window from delivery has elapsed.';
      else if (order.returnDetails?.isReturnRequested) returnBlockReason = `Return request has already been submitted (Status: ${order.returnDetails.status}).`;
    }

    return res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        cancellation: {
          eligible: canCancel,
          reason: canCancel ? 'Eligible for instant cancellation before dispatch.' : cancelBlockReason,
          refundNotice: order.paymentStatus === 'Paid' ? 'Full refund will be reversed to your original payment method within 3-5 business days.' : 'No charges will be deducted.'
        },
        returnOption: {
          eligible: canReturn,
          reason: canReturn ? 'Eligible for return within the 7-day luxury preservation window.' : returnBlockReason,
          daysRemaining: canReturn ? Math.max(0, Math.ceil(7 - daysSinceDelivery)) : 0,
          policy: 'Flacons must remain sealed, un-sprayed, and housed in original presentation coffrets.'
        }
      }
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify order options.' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
      $and: [
        { user_id: userId },
        {
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
            { orderId: id },
            { orderId: `#${id.replace('#', '')}` }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found in your account.' });
    }

    // Verify cancellation eligibility
    if (!['Pending', 'Processing', 'Confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already "${order.status}". Packages that have dispatched cannot be cancelled in transit.`
      });
    }

    // Restore stock inventory
    for (const item of order.items) {
      if (item.productId) {
        await ProductModel.incrementStock(item.productId, item.size, item.quantity);
      }
    }

    const wasPaid = order.paymentStatus === 'Paid';
    order.status = 'Cancelled';
    order.cancellation = {
      isCancelled: true,
      cancelledAt: new Date(),
      reason: reason || 'Customer requested cancellation',
      refundStatus: wasPaid ? 'Pending' : 'Not Applicable',
      refundAmount: wasPaid ? order.total_amount : 0
    };

    if (!order.tracking) order.tracking = { history: [] };
    order.tracking.history.push({
      stage: 'Cancelled',
      title: 'Order Cancelled by Customer',
      description: `Reason: ${reason || 'Customer cancellation'}. Restock completed.`,
      location: 'Maison System',
      timestamp: new Date()
    });

    await order.save();

    // Trigger cancellation notification email
    emailService.sendTransactionalUpdate(order, {
      subject: `Order Cancelled: ${order.orderId}`,
      stage: 'Cancelled',
      message: `Your order ${order.orderId} has been successfully cancelled. ${wasPaid ? `A refund of Rs ${order.total_amount.toLocaleString()} is being processed back to your original payment method.` : ''}`
    }).catch(e => console.warn(e.message));

    return res.json({
      success: true,
      message: 'Order cancelled successfully. Inventory restored.',
      data: {
        orderId: order.orderId,
        status: order.status,
        cancellation: order.cancellation
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
};

export const requestOrderReturn = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { reason, comment } = req.body;

    const order = await Order.findOne({
      $and: [
        { user_id: userId },
        {
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
            { orderId: id },
            { orderId: `#${id.replace('#', '')}` }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found in your account.' });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Returns can only be requested after the parcel has been confirmed as delivered.'
      });
    }

    if (order.returnDetails?.isReturnRequested) {
      return res.status(400).json({
        success: false,
        message: `A return request has already been logged for this order (Status: ${order.returnDetails.status}).`
      });
    }

    const deliveryDate = order.tracking?.deliveredAt || order.updatedAt;
    const daysSinceDelivery = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceDelivery > 7) {
      return res.status(400).json({
        success: false,
        message: 'Return window expired. Luxury returns must be logged within 7 days of package delivery.'
      });
    }

    order.status = 'Return Requested';
    order.returnDetails = {
      isReturnRequested: true,
      requestedAt: new Date(),
      reason: reason || 'Defective or incorrect item',
      status: 'Pending',
      refundAmount: order.total_amount,
      adminNote: comment || ''
    };

    if (!order.tracking) order.tracking = { history: [] };
    order.tracking.history.push({
      stage: 'Return Requested',
      title: 'Return Request Submitted',
      description: `Customer submitted return request. Reason: ${reason}. Under concierge review.`,
      location: 'Customer Care Desk',
      timestamp: new Date()
    });

    await order.save();

    emailService.sendTransactionalUpdate(order, {
      subject: `Return Request Logged: ${order.orderId}`,
      stage: 'Return Requested',
      message: `We have received your return request for Order ${order.orderId}. Our concierge will review the details within 24 hours to schedule courier pickup.`
    }).catch(e => console.warn(e.message));

    return res.json({
      success: true,
      message: 'Return request submitted successfully. Concierge will contact you within 24 hours.',
      data: {
        orderId: order.orderId,
        status: order.status,
        returnDetails: order.returnDetails
      }
    });
  } catch (error) {
    console.error('Return request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit return request.' });
  }
};

export default {
  getAccountOverview,
  getAccountOrders,
  getAccountOrderDetails,
  getSavedAddresses,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
  getAccountWishlist,
  checkOrderEligibility,
  cancelOrder,
  requestOrderReturn
};
