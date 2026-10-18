import { OrderModel } from '../models/orderModel.js';

export const createOrder = async (req, res) => {
  try {
    let { items, productId, quantity, size, customerName, name, phone, address } = req.body;

    // Support single product format or array of items
    if (!items && productId) {
      items = [{ 
        productId: parseInt(productId, 10), 
        quantity: parseInt(quantity, 10) || 1,
        size: (size || req.body.size || 'M').toUpperCase()
      }];
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item with productId and quantity.'
      });
    }

    const userId = req.user ? req.user.id : 1;
    const finalCustomerName = customerName || name || (req.user ? req.user.name : 'Valued Customer');
    const finalPhone = phone || (req.user ? req.user.email : '');
    const finalAddress = address || 'Standard Delivery';

    const order = await OrderModel.createOrder({
      userId,
      customerName: finalCustomerName,
      phone: finalPhone,
      address: finalAddress,
      items
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to place order.'
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = await OrderModel.updateStatus(id, status);
    const ordId = updated.orderId || `#ORD-${String(updated.id || updated._id).slice(-4).toUpperCase()}`;
    return res.json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: {
        ...updated,
        id: String(updated.id || updated._id),
        _id: String(updated.id || updated._id),
        orderId: ordId
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await OrderModel.findByUserId(req.user.id || req.user._id);
    return res.json({
      success: true,
      data: orders.map(o => ({
        ...o,
        id: String(o.id || o._id),
        _id: String(o.id || o._id),
        orderId: o.orderId || `#ORD-${String(o.id || o._id).slice(-4).toUpperCase()}`
      }))
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch your orders.' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.findAll();

    const formattedOrders = orders.map(o => {
      const firstItem = o.items && o.items[0];
      const ordId = o.orderId || `#ORD-${String(o.id || o._id).slice(-4).toUpperCase()}`;
      return {
        ...o,
        id: String(o.id || o._id),
        _id: String(o.id || o._id),
        orderId: ordId,
        customerName: o.customer_name || o.user_name || 'Valued Customer',
        phone: o.phone || o.user_email || 'N/A',
        address: o.address || 'Standard Delivery',
        productName: firstItem ? ((firstItem.name || firstItem.product_name) + (o.items.length > 1 ? ` (+${o.items.length - 1} more)` : '')) : 'Fashion Item',
        productImage: firstItem ? (firstItem.image || firstItem.product_image) : '',
        quantity: firstItem ? firstItem.quantity : 1,
        size: firstItem ? (firstItem.size || 'M') : 'M',
        status: o.status,
        date: new Date(o.createdAt || o.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: o.createdAt || o.created_at
      };
    });

    return res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};
