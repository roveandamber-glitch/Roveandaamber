import { db } from '../config/db.js';
import { ProductModel } from './productModel.js';

export const OrderModel = {
  // Place a new order with verified server-side prices and size-specific stock checks
  createOrder: async ({ userId, customerName, phone, address, items }) => {
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    let calculatedTotal = 0;
    const verifiedItems = [];

    // Step 1: Verify each product, its price, and check size-specific stock availability
    for (const item of items) {
      const pid = parseInt(item.productId, 10);
      const qty = parseInt(item.quantity, 10) || 1;
      const size = (item.size || 'M').toUpperCase();

      const product = await db.get(`SELECT * FROM products WHERE id = ?`, [pid]);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      // Check size-specific stock if size inventory exists
      if (product.sizes) {
        try {
          const sizesMap = JSON.parse(product.sizes);
          if (sizesMap[size] !== undefined && sizesMap[size] < qty) {
            throw new Error(
              `Insufficient stock for "${product.name}" in Size ${size}. Available: ${sizesMap[size]}, Requested: ${qty}`
            );
          }
        } catch (e) {
          // If JSON parse fails, fallback to general stock check
        }
      }

      if (product.stock < qty) {
        throw new Error(
          `Insufficient total stock for "${product.name}". Available: ${product.stock}, Requested: ${qty}`
        );
      }

      const itemTotal = product.price * qty;
      calculatedTotal += itemTotal;

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        size,
        image: product.image
      });
    }

    const effectiveUserId = userId || 1;

    // Step 2: Insert into orders table
    const orderResult = await db.run(
      `INSERT INTO orders (user_id, customer_name, phone, address, total_amount, status) VALUES (?, ?, ?, ?, ?, 'Processing')`,
      [effectiveUserId, customerName || 'Direct Customer', phone || '', address || '', calculatedTotal]
    );
    const orderId = orderResult.lastID;

    // Step 3: Insert order_items and decrement product stock & size-wise stock
    for (const item of verifiedItems) {
      await db.run(
        `INSERT INTO order_items (order_id, product_id, quantity, price, size) VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price, item.size]
      );

      // Decrement size-wise stock and total stock atomically
      await ProductModel.decrementStock(item.productId, item.size, item.quantity);
    }

    return {
      id: orderId,
      _id: String(orderId),
      orderId: `#ORD-${String(orderId).padStart(4, '0')}`,
      user_id: effectiveUserId,
      customer_name: customerName,
      phone,
      address,
      total_amount: calculatedTotal,
      status: 'Processing',
      items: verifiedItems
    };
  },

  findById: async (id) => {
    const order = await db.get(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (!order) return null;
    order.items = await db.all(`
      SELECT oi.*, p.name AS product_name, p.image AS product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order.id]);
    return order;
  },

  // Update order status (Admin)
  updateStatus: async (id, status) => {
    await db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
    return await db.get(`SELECT * FROM orders WHERE id = ?`, [id]);
  },

  // Get orders placed by a specific user
  findByUserId: async (userId) => {
    const orders = await db.all(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC`,
      [userId]
    );

    for (const order of orders) {
      order.items = await db.all(`
        SELECT oi.*, p.name AS product_name, p.image AS product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
    }

    return orders;
  },

  // Admin: Get all orders across all users with buyer details and item breakdown
  findAll: async () => {
    const orders = await db.all(`
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
    `);

    for (const order of orders) {
      order.items = await db.all(`
        SELECT oi.*, p.name AS product_name, p.image AS product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
    }

    return orders;
  }
};

export default OrderModel;
