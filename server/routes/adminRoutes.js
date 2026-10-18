import express from 'express';
import { Product } from '../models/productModel.js';
import { Order } from '../models/orderModel.js';
import { Category } from '../models/categoryModel.js';
import { UserModel } from '../models/userModel.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/admin/stats - Overview metrics for Admin Dashboard
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    const categoriesCount = await Category.countDocuments();
    
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Top products by sales frequency using order items
    const topProductsAgg = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    // If no order items yet, fallback to top products from catalog
    let topProducts = topProductsAgg;
    if (topProducts.length === 0) {
      const sampleProducts = await Product.find().limit(5).lean();
      topProducts = sampleProducts.map(p => ({
        name: p.name,
        sales: 0,
        revenue: 0,
        image: p.image
      }));
    }

    // Recent 5 orders with populated user info
    const recentOrdersRaw = await Order.find()
      .populate('user_id', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentOrders = recentOrdersRaw.map(o => ({
      _id: o._id.toString(),
      id: o._id.toString(),
      orderId: o.orderId || `#ORD-${o._id.toString().slice(-4).toUpperCase()}`,
      customerName: o.customer_name || (o.user_id ? o.user_id.name : 'Valued Customer'),
      createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
      totalPrice: o.total_amount || 0,
      status: o.status === 'placed' ? 'Processing' : o.status
    }));

    return res.json({
      success: true,
      data: {
        stats: {
          totalProducts: productsCount,
          totalOrders: ordersCount,
          totalCategories: categoriesCount,
          totalRevenue: totalRevenue
        },
        topProducts: topProducts.map(p => ({
          name: p.name,
          sales: p.sales || 0,
          revenue: p.revenue || 0,
          image: p.image || ''
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
        _id: String(u.id || u._id),
        userId: `#USR-${String(u.id || u._id).slice(-4).toUpperCase()}`
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

export default router;
