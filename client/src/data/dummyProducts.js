export const DUMMY_CATEGORIES = [
  {
    _id: "cat-1",
    id: "cat-1",
    name: "Eau de Parfum",
    slug: "eau-de-parfum",
    description: "Highly concentrated artisanal perfumes crafted for enduring sillage and presence.",
    image: "/images/perfumes/cat_signature.jpg",
    itemCount: 8
  },
  {
    _id: "cat-2",
    id: "cat-2",
    name: "Men's Fragrances",
    slug: "mens-fragrances",
    description: "Bold woody accords, aged amber, rare smoky resins, and precious wild oud.",
    image: "/images/perfumes/cat_men.jpg",
    itemCount: 6
  },
  {
    _id: "cat-3",
    id: "cat-3",
    name: "Women's Fragrances",
    slug: "womens-fragrances",
    description: "Luminous Turkish damask rose, radiant golden saffron, and velvet amber nectar.",
    image: "/images/perfumes/cat_women.jpg",
    itemCount: 6
  },
  {
    _id: "cat-4",
    id: "cat-4",
    name: "Unisex Fragrances",
    slug: "unisex-fragrances",
    description: "Universally captivating harmonizations of crystal ambergris, woods, and musk.",
    image: "/images/perfumes/cat_unisex.jpg",
    itemCount: 7
  },
  {
    _id: "cat-5",
    id: "cat-5",
    name: "Signature Scents",
    slug: "signature-scents",
    description: "Iconic flacons defining the signature olfactory heritage of ROVE & AMBER.",
    image: "/images/perfumes/hero_desert_fragrance.jpg",
    itemCount: 4
  },
  {
    _id: "cat-6",
    id: "cat-6",
    name: "Fragrance Gift Sets",
    slug: "fragrance-gift-sets",
    description: "Bespoke discovery sets and luxury coffrets presented in embossed golden gift boxes.",
    image: "/images/perfumes/signature_collection.jpg",
    itemCount: 3
  }
];

export const DUMMY_PRODUCTS = [
  {
    _id: "prod-1",
    id: "prod-1",
    name: "Amber Oud",
    slug: "amber-oud",
    category: "Eau de Parfum",
    subcategory: "Signature Scents",
    price: 4499,
    originalPrice: 5999,
    rating: 4.9,
    reviewsCount: 38,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    description: "An opulent Eau de Parfum opening with rare smoky Cambodian oud, melting into radiant golden amber and velvety Madagascar vanilla.",
    details: [
      "Top Notes: Italian Bergamot, Pink Peppercorn",
      "Heart Notes: Aged Golden Amber, Damask Rose",
      "Base Notes: Wild Cambodian Oud, Benzoin, Madagascar Vanilla",
      "Concentration: 24% Extrait de Parfum"
    ],
    sizes: ["50ml", "100ml"],
    sizes_stock: { "50ml": 12, "100ml": 8 },
    colors: [
      { name: "Cognac Amber", code: "#B86526" },
      { name: "Aged Oud", code: "#3B1D11" }
    ],
    images: [
      { url: "/images/perfumes/amber_oud_perfume.jpg" },
      { url: "/images/perfumes/velvet_amber.jpg" }
    ],
    inStock: true
  },
  {
    _id: "prod-2",
    id: "prod-2",
    name: "Golden Saffron",
    slug: "golden-saffron",
    category: "Women's Fragrances",
    subcategory: "Eau de Parfum",
    price: 3999,
    originalPrice: 4899,
    rating: 5.0,
    reviewsCount: 52,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    description: "A luminous blend of hand-harvested Kashmiri saffron, crystal ambergris, and sun-drenched orange blossom reminiscent of desert sunlight.",
    details: [
      "Top Notes: Red Kashmiri Saffron, Tunisian Neroli",
      "Heart Notes: White Sambac Jasmine, Dry Golden Amber",
      "Base Notes: Atlas Cedarwood, Warm Ambergris",
      "Concentration: 22% Eau de Parfum"
    ],
    sizes: ["50ml", "100ml"],
    sizes_stock: { "50ml": 10, "100ml": 6 },
    colors: [
      { name: "Golden Honey", code: "#D4AF37" },
      { name: "Sunlit Saffron", code: "#C48B36" }
    ],
    images: [
      { url: "/images/perfumes/golden_saffron.jpg" },
      { url: "/images/perfumes/bloom_elixir.jpg" }
    ],
    inStock: true
  },
  {
    _id: "prod-3",
    id: "prod-3",
    name: "Velvet Musk",
    slug: "velvet-musk",
    category: "Unisex Fragrances",
    subcategory: "Signature Scents",
    price: 3499,
    originalPrice: 4299,
    rating: 4.8,
    reviewsCount: 44,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    description: "Sensual crystalline musk draped in soft Australian sandalwood and warm cashmere wood, offering an intimate, enduring second-skin aura.",
    details: [
      "Top Notes: Sparkling Aldehydes, White Mountain Tea",
      "Heart Notes: Florentine Iris, Powdery Velvet Musk",
      "Base Notes: Mysore Sandalwood, Roasted Tonka Bean",
      "Concentration: 20% Eau de Parfum"
    ],
    sizes: ["50ml", "100ml"],
    sizes_stock: { "50ml": 14, "100ml": 9 },
    colors: [
      { name: "Warm Ivory", code: "#EAE0D5" },
      { name: "Soft Cashmere", code: "#C5B299" }
    ],
    images: [
      { url: "/images/perfumes/white_musk.jpg" },
      { url: "/images/perfumes/velvet_amber_detail.jpg" }
    ],
    inStock: true
  },
  {
    _id: "prod-4",
    id: "prod-4",
    name: "Midnight Amber",
    slug: "midnight-amber",
    category: "Men's Fragrances",
    subcategory: "Eau de Parfum",
    price: 4299,
    originalPrice: 5199,
    rating: 4.9,
    reviewsCount: 41,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    description: "Dark, mysterious, and deeply commanding. Spanish labdanum and smoky birch tar wrapped around rich golden amber resins and dark leather.",
    details: [
      "Top Notes: Black Cardamom, Birch Wood Smoke",
      "Heart Notes: Dark Balsamic Amber, Russian Leather",
      "Base Notes: Indonesian Patchouli, Earthy Oakmoss",
      "Concentration: 25% Extrait de Parfum"
    ],
    sizes: ["50ml", "100ml"],
    sizes_stock: { "50ml": 8, "100ml": 5 },
    colors: [
      { name: "Midnight Cognac", code: "#2C1810" },
      { name: "Smoky Black", code: "#141416" }
    ],
    images: [
      { url: "/images/perfumes/midnight_noir.jpg" },
      { url: "/images/perfumes/noir_intense.jpg" }
    ],
    inStock: true
  },
  {
    _id: "prod-5",
    id: "prod-5",
    name: "Rose Essence",
    slug: "rose-essence",
    category: "Women's Fragrances",
    subcategory: "Eau de Parfum",
    price: 3799,
    originalPrice: 4699,
    rating: 5.0,
    reviewsCount: 31,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    description: "A modern interpretation of Turkish Damascena rose, kissed by morning lychee dew, pink peony, and warm golden amber silk.",
    details: [
      "Top Notes: Pink Lychee, Italian Mandarin Dew",
      "Heart Notes: Isparta Damask Rose Absolu, Peony",
      "Base Notes: Golden Amber Nectar, White Cedar",
      "Concentration: 22% Eau de Parfum"
    ],
    sizes: ["50ml", "100ml"],
    sizes_stock: { "50ml": 11, "100ml": 7 },
    colors: [
      { name: "Rose Amber", code: "#9E4747" },
      { name: "Champagne Gold", code: "#D8C39F" }
    ],
    images: [
      { url: "/images/perfumes/rose_eternelle.jpg" },
      { url: "/images/perfumes/rose_detail.jpg" }
    ],
    inStock: true
  },
  {
    _id: "prod-6",
    id: "prod-6",
    name: "Oud Reserve",
    slug: "oud-reserve",
    category: "Men's Fragrances",
    subcategory: "Signature Scents",
    price: 5499,
    originalPrice: 6999,
    rating: 4.9,
    reviewsCount: 48,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    description: "Vintage Assam oud aged in oak casks, distilled with frankincense, dark spices, and warm golden amber in a heavy solid glass flacon.",
    details: [
      "Top Notes: Grated Nutmeg, Wild Saffron",
      "Heart Notes: Aged Royal Assam Oud Wood, Myrrh",
      "Base Notes: Rich Saddle Leather, Amber Resin, Haitian Vetiver",
      "Concentration: 26% Extrait de Parfum"
    ],
    sizes: ["50ml", "100ml"],
    sizes_stock: { "50ml": 7, "100ml": 4 },
    colors: [
      { name: "Assam Wood", code: "#1C140E" },
      { name: "Burnished Gold", code: "#C49A45" }
    ],
    images: [
      { url: "/images/perfumes/oud_royale.jpg" },
      { url: "/images/perfumes/oud_royale_detail.jpg" }
    ],
    inStock: true
  },
  {
    _id: "prod-7",
    id: "prod-7",
    name: "Citrus Bloom",
    slug: "citrus-bloom",
    category: "Unisex Fragrances",
    subcategory: "Eau de Parfum",
    price: 2999,
    originalPrice: 3799,
    rating: 4.8,
    reviewsCount: 26,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    description: "Bright Calabrian bergamot and bitter petitgrain uplifted by sun-drenched neroli blossoms on a warm, lingering base of sheer amber.",
    details: [
      "Top Notes: Sunlit Bergamot, Bitter Petitgrain",
      "Heart Notes: Orange Blossom Petals, French Jasmine",
      "Base Notes: Sheer Amber, White Vetiver, Driftwood",
      "Concentration: 20% Eau de Parfum"
    ],
    sizes: ["50ml", "100ml"],
    sizes_stock: { "50ml": 15, "100ml": 10 },
    colors: [
      { name: "Sunlit Citrus", code: "#D99B38" },
      { name: "Verdant Gold", code: "#B39E62" }
    ],
    images: [
      { url: "/images/perfumes/azure_mist.jpg" }
    ],
    inStock: true
  },
  {
    _id: "prod-8",
    id: "prod-8",
    name: "Signature No. 01",
    slug: "signature-no-01",
    category: "Signature Scents",
    subcategory: "Fragrance Gift Sets",
    price: 4899,
    originalPrice: 6200,
    rating: 5.0,
    reviewsCount: 65,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    description: "The definitive masterwork of ROVE & AMBER. An unforgettable union of pure amber resin, Kashmiri saffron, and velvet musk.",
    details: [
      "Top Notes: Saffron Stigmas, Royal Bergamot",
      "Heart Notes: Pure Golden Amber, Damask Rose",
      "Base Notes: Precious Wild Oud, Cashmere Musk",
      "Concentration: 25% Extrait de Parfum"
    ],
    sizes: ["50ml", "100ml", "Discovery Set"],
    sizes_stock: { "50ml": 16, "100ml": 12, "Discovery Set": 20 },
    colors: [
      { name: "Signature Amber", code: "#B86526" },
      { name: "Pure Gold", code: "#D4AF37" }
    ],
    images: [
      { url: "/images/perfumes/liquid_gold_perfume.jpg" },
      { url: "/images/perfumes/hero_desert_fragrance.jpg" }
    ],
    inStock: true
  }
];

export const DUMMY_TESTIMONIALS = [
  {
    name: "Alisha Kapur",
    city: "Mumbai",
    rating: 5,
    title: "Signature Sillage That Lasts 14+ Hours",
    text: "Amber Oud is extraordinary. I wore it to an evening gala and received compliments all night. The dry-down to warm resinous amber is masterclass perfumery.",
    scent: "Amber Oud • Eau de Parfum"
  },
  {
    name: "Vikramaditya Roy",
    city: "Bangalore",
    rating: 5,
    title: "The Most Sophisticated Oud in My Collection",
    text: "Oud Reserve strikes that rare balance of royal depth without being overwhelming. The packaging and bottle feel like high-end French niche perfumery.",
    scent: "Oud Reserve • Extrait de Parfum"
  },
  {
    name: "Tarini Mehra",
    city: "New Delhi",
    rating: 5,
    title: "Golden Saffron Is Pure Liquid Gold",
    text: "I was intrigued by ROVE & AMBER on Instagram and ordered immediately. The saffron note is radiant, warm, and comforting. Truly artisanal.",
    scent: "Golden Saffron • Eau de Parfum"
  }
];

export const PRESS_ACCOLADES = [
  { outlet: "VOGUE", quote: "The artisanal Indian fragrance house redefining luxury amber sillage." },
  { outlet: "GQ", quote: "A masterclass in modern, dark oud and warm golden amber." },
  { outlet: "ELLE", quote: "Exquisite flacons that belong on the vanity of true fragrance connoisseurs." },
  { outlet: "HARPER'S", quote: "Signature Eau de Parfum crafted with uncompromising raw oil purity." }
];

export const INSTAGRAM_POSTS = [
  {
    id: 'post-1',
    image: '/images/perfumes/hero_desert_fragrance.jpg',
    likes: '1,420',
    tag: 'Our Brand Story • Desert Golden Hour',
    handle: '@roveandamber'
  },
  {
    id: 'post-2',
    image: '/images/perfumes/amber_oud_perfume.jpg',
    likes: '2,890',
    tag: 'Amber Oud • Signature Scent',
    handle: '@roveandamber'
  },
  {
    id: 'post-3',
    image: '/images/perfumes/rove_amber_logo.jpg',
    likes: '3,140',
    tag: 'Identity • R&A Fine Fragrance Disc',
    handle: '@roveandamber'
  },
  {
    id: 'post-4',
    image: '/images/perfumes/liquid_gold_perfume.jpg',
    likes: '2,210',
    tag: 'Coming Soon • Pure Essentials Bloom',
    handle: '@roveandamber'
  },
  {
    id: 'post-5',
    image: '/images/perfumes/golden_saffron.jpg',
    likes: '1,830',
    tag: 'Golden Saffron • Eau de Parfum',
    handle: '@roveandamber'
  },
  {
    id: 'post-6',
    image: '/images/perfumes/signature_collection.jpg',
    likes: '2,650',
    tag: 'Discovery Coffret • Pan-India Shipping',
    handle: '@roveandamber'
  }
];
