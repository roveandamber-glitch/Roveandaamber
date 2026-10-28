import adminRouter, { adminRoutes, inventoryRoutes, reportRoutes } from './admin/index.js';
import userRouter, {
  authRoutes,
  userRoutes,
  productRoutes,
  categoryRoutes,
  cartRoutes,
  orderRoutes,
  paymentRoutes,
  wishlistRoutes,
  bannerRoutes
} from './user/index.js';

export {
  adminRouter,
  userRouter,
  adminRoutes,
  inventoryRoutes,
  reportRoutes,
  authRoutes,
  userRoutes,
  productRoutes,
  categoryRoutes,
  cartRoutes,
  orderRoutes,
  paymentRoutes,
  wishlistRoutes,
  bannerRoutes
};

export default {
  admin: adminRouter,
  user: userRouter
};
