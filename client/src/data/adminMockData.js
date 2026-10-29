// ROVE & AMBER — Fine Fragrance
// Complete Mock Data Store for Admin Dashboard
// Used when backend APIs are offline or for preview mode

export const MOCK_ADMIN_STATS = {
  totalOrders: 284,
  totalRevenue: 328450,
  totalCustomers: 1842,
  totalProducts: 126,
  ordersDelta: '+12%',
  revenueDelta: '+18%',
  customersDelta: '+10%',
  productsDelta: '+5%',
  ordersByStatus: {
    Delivered: 119,   // 42%
    Processing: 80,   // 28%
    Shipped: 51,      // 18%
    Pending: 23,      // 8%
    Cancelled: 11     // 4%
  },
  rewards: {
    totalMembers: 1284,
    pointsIssued: 45680,
    rewardsRedeemed: 320,
    tierMembers: 215,
    membersDelta: '+12%',
    pointsDelta: '+18%',
    redeemedDelta: '+25%',
    tierDelta: '+10%'
  }
};

export const MOCK_RECENT_ORDERS = [
  {
    id: 'ord-1001',
    orderNumber: '#1001',
    customer: {
      name: 'Anjali Nair',
      email: 'anjali@gmail.com',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      tier: 'Gold'
    },
    items: [
      {
        name: 'Royal Elegance Eau de Parfum',
        quantity: 2,
        price: 2475,
        size: '100ml',
        image: '/images/perfumes/gemini_amber_royal.jpg'
      }
    ],
    productSummary: 'Royal Elegance (2)',
    total: 4950,
    subtotal: 4950,
    discount: 0,
    shippingFee: 0,
    paymentMethod: 'Prepaid (UPI / Card)',
    paymentStatus: 'Paid',
    status: 'Processing',
    date: '29 Oct 2026',
    createdAt: '2026-10-29T08:30:00.000Z',
    shippingAddress: {
      addressLine1: '402, Signature Palms, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400050',
      country: 'India'
    },
    trackingNumber: 'DEL-2026-9812'
  },
  {
    id: 'ord-1000',
    orderNumber: '#1000',
    customer: {
      name: 'Rahul Mehta',
      email: 'rahul@gmail.com',
      phone: '+91 98200 12345',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      tier: 'Platinum'
    },
    items: [
      {
        name: 'Oud Mystery Extrait',
        quantity: 1,
        price: 7800,
        size: '100ml',
        image: '/images/perfumes/gemini_oud_noir.jpg'
      }
    ],
    productSummary: 'Oud Mystery',
    total: 7800,
    subtotal: 7800,
    discount: 0,
    shippingFee: 0,
    paymentMethod: 'Net Banking (HDFC)',
    paymentStatus: 'Paid',
    status: 'Shipped',
    date: '29 Oct 2026',
    createdAt: '2026-10-29T06:15:00.000Z',
    shippingAddress: {
      addressLine1: 'Villa 14, Prestige Golfshire, Nandi Hills',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '562164',
      country: 'India'
    },
    trackingNumber: 'BLR-EXP-4401'
  },
  {
    id: 'ord-0999',
    orderNumber: '#0999',
    customer: {
      name: 'Sneha Thomas',
      email: 'sneha@gmail.com',
      phone: '+91 97455 88990',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      tier: 'Silver'
    },
    items: [
      {
        name: 'Velvet Rose Eau de Parfum',
        quantity: 1,
        price: 2650,
        size: '50ml',
        image: '/images/perfumes/gemini_rose_elixir.jpg'
      }
    ],
    productSummary: 'Velvet Rose',
    total: 2650,
    subtotal: 2650,
    discount: 0,
    shippingFee: 0,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'COD',
    status: 'Pending',
    date: '28 Oct 2026',
    createdAt: '2026-10-28T19:40:00.000Z',
    shippingAddress: {
      addressLine1: 'Flat 3B, Emerald Heights, Panampilly Nagar',
      city: 'Kochi',
      state: 'Kerala',
      postalCode: '682036',
      country: 'India'
    },
    trackingNumber: 'COK-COD-1190'
  },
  {
    id: 'ord-0998',
    orderNumber: '#0998',
    customer: {
      name: 'Arjun S',
      email: 'arjun@gmail.com',
      phone: '+91 99001 77223',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      tier: 'Gold'
    },
    items: [
      {
        name: 'Signature No.5 Grand Reserve',
        quantity: 1,
        price: 6250,
        size: '100ml',
        image: '/images/perfumes/gemini_cat_perfumes.jpg'
      }
    ],
    productSummary: 'Signature No.5',
    total: 6250,
    subtotal: 6250,
    discount: 0,
    shippingFee: 0,
    paymentMethod: 'Prepaid (Card)',
    paymentStatus: 'Paid',
    status: 'Delivered',
    date: '28 Oct 2026',
    createdAt: '2026-10-28T14:10:00.000Z',
    shippingAddress: {
      addressLine1: 'B-12, Sector 44, Golf Course Road',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122003',
      country: 'India'
    },
    trackingNumber: 'DEL-EXP-7729'
  },
  {
    id: 'ord-0997',
    orderNumber: '#0997',
    customer: {
      name: 'Priya K',
      email: 'priya@gmail.com',
      phone: '+91 98112 33445',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      tier: 'Silver'
    },
    items: [
      {
        name: 'Amber Bliss Extrait',
        quantity: 2,
        price: 2725,
        size: '50ml',
        image: '/images/perfumes/gemini_amber_royal.jpg'
      }
    ],
    productSummary: 'Amber Bliss (2)',
    total: 5450,
    subtotal: 5450,
    discount: 0,
    shippingFee: 0,
    paymentMethod: 'Prepaid (UPI)',
    paymentStatus: 'Paid',
    status: 'Processing',
    date: '27 Oct 2026',
    createdAt: '2026-10-27T11:20:00.000Z',
    shippingAddress: {
      addressLine1: '18/2, Jubilee Hills, Road No. 36',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500033',
      country: 'India'
    },
    trackingNumber: 'HYD-STD-5501'
  }
];

export const MOCK_TOP_PRODUCTS = [
  {
    id: 'prod-royal-elegance',
    rank: 1,
    name: 'Royal Elegance Eau de Parfum',
    sku: 'RE-001',
    category: "Women's Perfumes",
    image: '/images/perfumes/gemini_amber_royal.jpg',
    sales: 120,
    revenue: 594000,
    percentage: 28,
    stock: 24,
    price: 4950
  },
  {
    id: 'prod-oud-mystery',
    rank: 2,
    name: 'Oud Mystery Extrait',
    sku: 'RM-001',
    category: 'Oud Collection',
    image: '/images/perfumes/gemini_oud_noir.jpg',
    sales: 98,
    revenue: 450800,
    percentage: 23,
    stock: 5,
    price: 4600
  },
  {
    id: 'prod-amber-bliss',
    rank: 3,
    name: 'Amber Bliss Fragrance',
    sku: 'AB-002',
    category: 'Amber Collection',
    image: '/images/perfumes/gemini_amber_royal.jpg',
    sales: 76,
    revenue: 342000,
    percentage: 18,
    stock: 4,
    price: 4500
  },
  {
    id: 'prod-velvet-rose',
    rank: 4,
    name: 'Velvet Rose Eau de Parfum',
    sku: 'VR-003',
    category: "Women's Perfumes",
    image: '/images/perfumes/gemini_rose_elixir.jpg',
    sales: 64,
    revenue: 288000,
    percentage: 15,
    stock: 3,
    price: 4500
  },
  {
    id: 'prod-signature-no5',
    rank: 5,
    name: 'Signature No.5 Grand Flacon',
    sku: 'SN-005',
    category: 'Unisex Perfumes',
    image: '/images/perfumes/gemini_cat_perfumes.jpg',
    sales: 52,
    revenue: 234000,
    percentage: 12,
    stock: 2,
    price: 4500
  }
];

export const MOCK_LOW_STOCK = [
  {
    id: 'prod-oud-mystery',
    name: 'Oud Mystery Extrait',
    sku: 'RM-001',
    category: 'Oud Collection',
    stock: 5,
    threshold: 15,
    price: 4600,
    image: '/images/perfumes/gemini_oud_noir.jpg',
    status: 'Low Stock'
  },
  {
    id: 'prod-velvet-rose',
    name: 'Velvet Rose Eau de Parfum',
    sku: 'VR-003',
    category: "Women's Perfumes",
    stock: 3,
    threshold: 12,
    price: 4500,
    image: '/images/perfumes/gemini_rose_elixir.jpg',
    status: 'Critical'
  },
  {
    id: 'prod-amber-bliss',
    name: 'Amber Bliss Fragrance',
    sku: 'AB-002',
    category: 'Amber Collection',
    stock: 4,
    threshold: 10,
    price: 4500,
    image: '/images/perfumes/gemini_amber_royal.jpg',
    status: 'Low Stock'
  },
  {
    id: 'prod-signature-no5',
    name: 'Signature No.5 Grand Flacon',
    sku: 'SN-005',
    category: 'Unisex Perfumes',
    stock: 2,
    threshold: 10,
    price: 4500,
    image: '/images/perfumes/gemini_cat_perfumes.jpg',
    status: 'Critical'
  }
];

export const MOCK_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'Anjali Nair',
    email: 'anjali@gmail.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    city: 'Mumbai, Maharashtra',
    joinedDate: '29 Oct 2026',
    ordersCount: 4,
    totalSpent: 19800,
    rewardPoints: 1980,
    tier: 'Gold',
    status: 'Active'
  },
  {
    id: 'cust-2',
    name: 'Rahul Mehta',
    email: 'rahul@gmail.com',
    phone: '+91 98200 12345',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    city: 'Bengaluru, Karnataka',
    joinedDate: '28 Oct 2026',
    ordersCount: 7,
    totalSpent: 42500,
    rewardPoints: 4250,
    tier: 'Platinum',
    status: 'Active'
  },
  {
    id: 'cust-3',
    name: 'Sneha Thomas',
    email: 'sneha@gmail.com',
    phone: '+91 97455 88990',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    city: 'Kochi, Kerala',
    joinedDate: '28 Oct 2026',
    ordersCount: 2,
    totalSpent: 5300,
    rewardPoints: 530,
    tier: 'Silver',
    status: 'Active'
  },
  {
    id: 'cust-4',
    name: 'Arjun S',
    email: 'arjun@gmail.com',
    phone: '+91 99001 77223',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    city: 'Gurugram, Haryana',
    joinedDate: '27 Oct 2026',
    ordersCount: 5,
    totalSpent: 28900,
    rewardPoints: 2890,
    tier: 'Gold',
    status: 'Active'
  },
  {
    id: 'cust-5',
    name: 'Priya K',
    email: 'priya@gmail.com',
    phone: '+91 98112 33445',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    city: 'Hyderabad, Telangana',
    joinedDate: '26 Oct 2026',
    ordersCount: 3,
    totalSpent: 14200,
    rewardPoints: 1420,
    tier: 'Silver',
    status: 'Active'
  }
];

export const MOCK_SALES_CHART = [
  { date: 'Oct 1', day: '1', sales: 18400 },
  { date: 'Oct 3', day: '3', sales: 12500 },
  { date: 'Oct 5', day: '5', sales: 22800 },
  { date: 'Oct 7', day: '7', sales: 14200 },
  { date: 'Oct 9', day: '9', sales: 9800 },
  { date: 'Oct 10', day: '10', sales: 16500 },
  { date: 'Oct 12', day: '12', sales: 19400 },
  { date: 'Oct 14', day: '14', sales: 24500 },
  { date: 'Oct 15', day: '15', sales: 28900 },
  { date: 'Oct 17', day: '17', sales: 17200 },
  { date: 'Oct 19', day: '19', sales: 21800 },
  { date: 'Oct 20', day: '20', sales: 25600 },
  { date: 'Oct 22', day: '22', sales: 19800 },
  { date: 'Oct 24', day: '24', sales: 31200 },
  { date: 'Oct 25', day: '25', sales: 27400 },
  { date: 'Oct 27', day: '27', sales: 34500 },
  { date: 'Oct 28', day: '28', sales: 38200 },
  { date: 'Oct 29', day: '29', sales: 42500 },
];

export const MOCK_CATEGORIES = [
  {
    id: 'cat-1',
    name: "Men's Perfumes",
    slug: 'mens-perfumes',
    description: 'Smoked agarwood, royal cardamom, noble leather and magnetic woods.',
    image: '/images/perfumes/gemini_col_men_luxury.jpg',
    itemCount: 28,
    status: 'Active'
  },
  {
    id: 'cat-2',
    name: "Women's Perfumes",
    slug: 'womens-perfumes',
    description: 'French florals, Bulgarian rose, rare saffron and warm golden amber.',
    image: '/images/perfumes/gemini_col_women_luxury.jpg',
    itemCount: 34,
    status: 'Active'
  },
  {
    id: 'cat-3',
    name: 'Unisex Perfumes',
    slug: 'unisex-perfumes',
    description: 'Harmonious artisanal compositions bridging masculine strength and floral grace.',
    image: '/images/perfumes/gemini_cat_perfumes.jpg',
    itemCount: 22,
    status: 'Active'
  },
  {
    id: 'cat-4',
    name: 'Oud Collection',
    slug: 'oud-collection',
    description: 'Rare aged Cambodian, Assam, and Trat agarwood distilled to royal potency.',
    image: '/images/perfumes/gemini_cat_oud.jpg',
    itemCount: 16,
    status: 'Active'
  },
  {
    id: 'cat-5',
    name: 'Amber Collection',
    slug: 'amber-collection',
    description: 'Golden fossil resin, vanilla absolute, and benzoin harvested with devotion.',
    image: '/images/perfumes/gemini_amber_royal.jpg',
    itemCount: 14,
    status: 'Active'
  },
  {
    id: 'cat-6',
    name: 'Luxury Gift Sets',
    slug: 'gift-sets',
    description: 'Curated coffrets, duo flacons, and personalized bespoke fragrance boxes.',
    image: '/images/perfumes/gemini_cat_gifts.jpg',
    itemCount: 12,
    status: 'Active'
  }
];

export const MOCK_REWARDS_DATA = {
  overview: {
    totalMembers: 1284,
    pointsIssued: 45680,
    pointsRedeemed: 18450,
    outstandingPoints: 27230,
    avgPointsPerMember: 35.5
  },
  tiers: [
    { name: 'Bronze', threshold: '₹0 - ₹9,999', multiplier: '1x Points', membersCount: 780, color: '#CD7F32' },
    { name: 'Silver', threshold: '₹10,000 - ₹24,999', multiplier: '1.25x Points + Free Samples', membersCount: 320, color: '#A0A0A0' },
    { name: 'Gold', threshold: '₹25,000 - ₹49,999', multiplier: '1.5x Points + Priority Dispatch', membersCount: 142, color: '#D4AF37' },
    { name: 'Platinum', threshold: '₹50,000+', multiplier: '2x Points + VIP Concierge & Atelier Access', membersCount: 42, color: '#E5E4E2' }
  ],
  rules: {
    pointsPerRupee: 0.1, // 1 point per ₹10 spent
    redemptionRate: 1.0, // 100 points = ₹100 discount
    birthdayBonus: 500, // 500 bonus points on birthday
    welcomeBonus: 200, // 200 points upon registration
    expiryMonths: 12
  },
  transactions: [
    {
      id: 'tx-1',
      customer: 'Anjali Nair',
      type: 'Earned',
      points: '+495',
      orderId: '#1001',
      date: '29 Oct 2026, 02:00 PM',
      status: 'Credited'
    },
    {
      id: 'tx-2',
      customer: 'Rahul Mehta',
      type: 'Redeemed',
      points: '-1,500',
      orderId: '#1000',
      date: '29 Oct 2026, 11:45 AM',
      status: 'Applied'
    },
    {
      id: 'tx-3',
      customer: 'Sneha Thomas',
      type: 'Earned',
      points: '+265',
      orderId: '#0999',
      date: '28 Oct 2026, 07:15 PM',
      status: 'Pending'
    },
    {
      id: 'tx-4',
      customer: 'Arjun S',
      type: 'Bonus (Birthday)',
      points: '+500',
      orderId: 'Manual Bonus',
      date: '28 Oct 2026, 10:00 AM',
      status: 'Credited'
    },
    {
      id: 'tx-5',
      customer: 'Priya K',
      type: 'Earned',
      points: '+545',
      orderId: '#0997',
      date: '27 Oct 2026, 04:30 PM',
      status: 'Credited'
    }
  ]
};

export const MOCK_COUPONS = [
  {
    id: 'coup-1',
    code: 'ROYAL20',
    description: 'Festive 20% privilege on orders above ₹5,000',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 5000,
    maxDiscountAmount: 2000,
    usageLimit: 500,
    usedCount: 142,
    expiryDate: '2026-11-15',
    isActive: true
  },
  {
    id: 'coup-2',
    code: 'AMBER10',
    description: 'Flat 10% privilege on all Amber & Oud flacons',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 2500,
    maxDiscountAmount: 1000,
    usageLimit: 1000,
    usedCount: 388,
    expiryDate: '2026-12-31',
    isActive: true
  },
  {
    id: 'coup-3',
    code: 'WELCOME500',
    description: 'Flat ₹500 off on first order above ₹3,000',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 3000,
    maxDiscountAmount: 500,
    usageLimit: 2000,
    usedCount: 924,
    expiryDate: '2026-12-31',
    isActive: true
  },
  {
    id: 'coup-4',
    code: 'FESTIVE15',
    description: 'Limited 15% luxury discount on gift sets',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 4000,
    maxDiscountAmount: 1500,
    usageLimit: 300,
    usedCount: 300,
    expiryDate: '2026-10-25',
    isActive: false
  }
];

export const MOCK_REVIEWS = [
  {
    id: 'rev-1',
    product: {
      name: 'Royal Elegance Eau de Parfum',
      image: '/images/perfumes/gemini_amber_royal.jpg'
    },
    customer: 'Anjali Nair',
    rating: 5,
    title: 'An unforgettable olfactory journey',
    comment: 'The amber dry-down lasts over 12 hours on skin. The presentation box with the gold emblem feels like haute joaillerie.',
    date: '28 Oct 2026',
    status: 'Approved'
  },
  {
    id: 'rev-2',
    product: {
      name: 'Oud Mystery Extrait',
      image: '/images/perfumes/gemini_oud_noir.jpg'
    },
    customer: 'Rahul Mehta',
    rating: 5,
    title: 'Commanding and smoky',
    comment: 'Real agarwood depth without medicinal harshness. The smoked birch and cardamom blend is masterfully balanced.',
    date: '27 Oct 2026',
    status: 'Approved'
  },
  {
    id: 'rev-3',
    product: {
      name: 'Velvet Rose Eau de Parfum',
      image: '/images/perfumes/gemini_rose_elixir.jpg'
    },
    customer: 'Sneha Thomas',
    rating: 4,
    title: 'Ethereal and romantic',
    comment: 'The Bulgarian rose opening is dewy and realistic. Highly recommend for evening dinners.',
    date: '26 Oct 2026',
    status: 'Approved'
  },
  {
    id: 'rev-4',
    product: {
      name: 'Signature No.5 Grand Flacon',
      image: '/images/perfumes/gemini_cat_perfumes.jpg'
    },
    customer: 'Vikas Sharma',
    rating: 5,
    title: 'Compliment magnet',
    comment: 'Every time I wear this into a meeting people ask what fragrance it is. Pure luxury.',
    date: '25 Oct 2026',
    status: 'Pending'
  }
];

export const MOCK_GIFTS_DATA = [
  {
    id: 'gift-1',
    name: 'Royal Elegance Gift Set',
    price: 5850,
    originalPrice: 7200,
    image: '/images/perfumes/gift_set_royal_elegance.jpg',
    description: 'Amber Royal (100ml) & Bulgarian Rose travel flacon (15ml) in a gilded coffret.',
    ordersCount: 48,
    stock: 14,
    status: 'Active'
  },
  {
    id: 'gift-2',
    name: 'Oud Luxury Gift Set',
    price: 6250,
    originalPrice: 8200,
    image: '/images/perfumes/gift_set_oud_luxury.jpg',
    description: 'Cambodian Oud (100ml) paired with Smoked Birch incense cones.',
    ordersCount: 62,
    stock: 8,
    status: 'Active'
  },
  {
    id: 'gift-3',
    name: 'Velvet Romance Set',
    price: 4950,
    originalPrice: 6500,
    image: '/images/perfumes/gift_set_velvet_romance.jpg',
    description: 'Velvet Musk (50ml) & Damask Rose atomizer presented with pink silk ribbons.',
    ordersCount: 39,
    stock: 18,
    status: 'Active'
  },
  {
    id: 'gift-4',
    name: 'Signature Collection Duo',
    price: 7450,
    originalPrice: 9200,
    image: '/images/perfumes/gift_set_signature_coffret.jpg',
    description: 'Amber Royal & Oud Noir (100ml each) in heavy embossed gold foil chest.',
    ordersCount: 27,
    stock: 6,
    status: 'Active'
  }
];

