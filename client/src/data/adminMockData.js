// ROVE & AMBER — Fine Fragrance
// All static mock data removed. All boutique catalog, orders, and patron analytics query MongoDB in real-time.

export const MOCK_ADMIN_STATS = {
  totalOrders: 0,
  totalRevenue: 0,
  totalCustomers: 0,
  totalProducts: 0,
  ordersDelta: '+0%',
  revenueDelta: '+0%',
  customersDelta: '+0%',
  productsDelta: '+0%',
  ordersByStatus: {
    Delivered: 0,
    Processing: 0,
    Shipped: 0,
    Pending: 0,
    Cancelled: 0
  },
  rewards: {
    totalMembers: 0,
    pointsIssued: 0,
    rewardsRedeemed: 0,
    tierMembers: 0,
    membersDelta: '+0%',
    pointsDelta: '+0%',
    redeemedDelta: '+0%',
    tierDelta: '+0%'
  }
};

export const MOCK_RECENT_ORDERS = [];
export const MOCK_TOP_PRODUCTS = [];
export const MOCK_LOW_STOCK = [];
export const MOCK_CUSTOMERS = [];
export const MOCK_CATEGORIES = [];
export const MOCK_REWARDS_DATA = {
  stats: {
    totalMembers: 0,
    pointsIssued: 0,
    rewardsRedeemed: 0,
    tierMembers: 0
  },
  rules: [],
  members: []
};
export const MOCK_COUPONS = [];
export const MOCK_REVIEWS = [];
export const MOCK_GIFTS_DATA = [];
export const MOCK_SALES_CHART = [];
