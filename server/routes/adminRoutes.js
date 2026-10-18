import express from 'express';
import { db } from '../config/db.js';
import { UserModel } from '../models/userModel.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/admin/stats - Overview metrics for Admin Dashboard
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const productsCount = await db.get(`SELECT COUNT(*) as count FROM products`);
    const ordersCount = await db.get(`SELECT COUNT(*) as count FROM orders`);
    const categoriesCount = await db.get(`SELECT COUNT(*) as count FROM categories`);
    const revenueSum = await db.get(`SELECT SUM(total_amount) as total FROM orders`);

    // Top products by order frequency
    const topProducts = await db.all(`
      SELECT 
        p.id,
        p.name,
        p.image,
        COALESCE(SUM(oi.quantity), 0) AS sales,
        COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY sales DESC, p.id ASC
      LIMIT 5
    `);

    // Recent 5 orders with formatted fields
    const recentOrdersRaw = await db.all(`
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
      LIMIT 5
    `);

    const recentOrders = recentOrdersRaw.map(o => ({
      _id: String(o.id),
      orderId: `#ORD-${String(o.id).padStart(4, '0')}`,
      customerName: o.customer_name || o.user_name || 'Valued Customer',
      createdAt: o.created_at || new Date().toISOString(),
      totalPrice: o.total_amount || 0,
      status: o.status === 'placed' ? 'Processing' : o.status
    }));

    return res.json({
      success: true,
      data: {
        stats: {
          totalProducts: productsCount ? productsCount.count : 0,
          totalOrders: ordersCount ? ordersCount.count : 0,
          totalCategories: categoriesCount ? categoriesCount.count : 0,
          totalRevenue: revenueSum && revenueSum.total ? revenueSum.total : 0
        },
        topProducts: topProducts.map(p => ({
          name: p.name,
          sales: p.sales,
          revenue: p.revenue,
          image: p.image
        })),
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
});

// GET /api/admin/users - View all users and accounts
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await UserModel.findAll();
    return res.json({
      success: true,
      data: users.map(u => ({
        ...u,
        _id: String(u.id),
        userId: `#USR-${String(u.id).padStart(4, '0')}`
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

export default router;
