/**
 * Default categories and perfume catalogue data for database seeding
 */

export const luxuryCategories = [
  {
    name: 'Eau de Parfum',
    slug: 'eau-de-parfum',
    description: 'Highly concentrated artisanal perfumes crafted for enduring sillage and presence.',
    image: '/images/perfumes/cat_signature.jpg'
  },
  {
    name: "Men's Fragrances",
    slug: 'mens-fragrances',
    description: 'Bold woody accords, aged amber, rare smoky resins, and precious wild oud.',
    image: '/images/perfumes/cat_men.jpg'
  },
  {
    name: "Women's Fragrances",
    slug: 'womens-fragrances',
    description: 'Luminous Turkish damask rose, radiant golden saffron, and velvet amber nectar.',
    image: '/images/perfumes/cat_women.jpg'
  },
  {
    name: 'Unisex Fragrances',
    slug: 'unisex-fragrances',
    description: 'Universally captivating harmonizations of crystal ambergris, woods, and musk.',
    image: '/images/perfumes/cat_unisex.jpg'
  },
  {
    name: 'Signature Scents',
    slug: 'signature-scents',
    description: 'Iconic flacons defining the signature olfactory heritage of ROVE & AMBER.',
    image: '/images/perfumes/hero_desert_fragrance.jpg'
  },
  {
    name: 'Fragrance Gift Sets',
    slug: 'fragrance-gift-sets',
    description: 'Bespoke discovery sets and luxury coffrets presented in embossed golden gift boxes.',
    image: '/images/perfumes/signature_collection.jpg'
  }
];

export const initialPerfumes = [
  {
    name: 'Amber Oud',
    slug: 'amber-oud',
    categoryName: 'Eau de Parfum',
    subcategory: 'Signature Scents',
    price: 4499,
    originalPrice: 5999,
    stock: 20,
    rating: 4.9,
    reviewsCount: 38,
    popularity: 95,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    gender: 'him',
    fragranceFamily: 'Woody & Smoky Amber',
    description: 'An opulent Eau de Parfum opening with rare smoky Cambodian oud, melting into radiant golden amber and velvety Madagascar vanilla.',
    details: [
      'Top Notes: Italian Bergamot, Pink Peppercorn',
      'Heart Notes: Aged Golden Amber, Damask Rose',
      'Base Notes: Wild Cambodian Oud, Benzoin, Madagascar Vanilla',
      'Concentration: 24% Extrait de Parfum'
    ],
    sizes: JSON.stringify({ '50ml': 12, '100ml': 8 }),
    colors: [
      { name: 'Cognac Amber', code: '#B86526' },
      { name: 'Aged Oud', code: '#3B1D11' }
    ],
    image: '/images/perfumes/amber_oud_perfume.jpg',
    images: [
      { url: '/images/perfumes/amber_oud_perfume.jpg', alt: 'Amber Oud Front Bottle View' },
      { url: '/images/perfumes/velvet_amber.jpg', alt: 'Amber Oud Luxury Presentation' },
      { url: '/images/perfumes/signature_collection.jpg', alt: 'Amber Oud Gift Packaging' }
    ],
    video: '/images/perfumes/amber_oud_showcase.mp4',
    giftOccasions: ['Anniversary', 'Special Occasions', 'Luxury Celebrations'],
    isGiftEligible: true
  },
  {
    name: 'Golden Saffron',
    slug: 'golden-saffron',
    categoryName: "Women's Fragrances",
    subcategory: 'Eau de Parfum',
    price: 3999,
    originalPrice: 4899,
    stock: 16,
    rating: 5.0,
    reviewsCount: 52,
    popularity: 98,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    gender: 'her',
    fragranceFamily: 'Amber & Saffron Nectar',
    description: 'A luminous blend of hand-harvested Kashmiri saffron, crystal ambergris, and sun-drenched orange blossom reminiscent of desert sunlight.',
    details: [
      'Top Notes: Red Kashmiri Saffron, Tunisian Neroli',
      'Heart Notes: White Sambac Jasmine, Dry Golden Amber',
      'Base Notes: Atlas Cedarwood, Warm Ambergris',
      'Concentration: 22% Eau de Parfum'
    ],
    sizes: JSON.stringify({ '50ml': 10, '100ml': 6 }),
    colors: [
      { name: 'Golden Honey', code: '#D4AF37' },
      { name: 'Sunlit Saffron', code: '#C48B36' }
    ],
    image: '/images/perfumes/golden_saffron.jpg',
    images: [
      { url: '/images/perfumes/golden_saffron.jpg', alt: 'Golden Saffron Flacon' },
      { url: '/images/perfumes/bloom_elixir.jpg', alt: 'Golden Saffron Detail' }
    ],
    video: '/images/perfumes/golden_saffron_showcase.mp4',
    giftOccasions: ['Birthday', 'Anniversary', 'Special Occasions'],
    isGiftEligible: true
  },
  {
    name: 'Velvet Musk',
    slug: 'velvet-musk',
    categoryName: 'Unisex Fragrances',
    subcategory: 'Signature Scents',
    price: 3499,
    originalPrice: 4299,
    stock: 23,
    rating: 4.8,
    reviewsCount: 44,
    popularity: 88,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    gender: 'unisex',
    fragranceFamily: 'Velvet Musk & Sandalwood',
    description: 'Sensual crystalline musk draped in soft Australian sandalwood and warm cashmere wood, offering an intimate, enduring second-skin aura.',
    details: [
      'Top Notes: Sparkling Aldehydes, White Mountain Tea',
      'Heart Notes: Florentine Iris, Powdery Velvet Musk',
      'Base Notes: Mysore Sandalwood, Roasted Tonka Bean',
      'Concentration: 20% Eau de Parfum'
    ],
    sizes: JSON.stringify({ '50ml': 14, '100ml': 9 }),
    colors: [
      { name: 'Warm Ivory', code: '#EAE0D5' },
      { name: 'Soft Cashmere', code: '#C5B299' }
    ],
    image: '/images/perfumes/white_musk.jpg',
    images: [
      { url: '/images/perfumes/white_musk.jpg', alt: 'Velvet Musk Flacon' },
      { url: '/images/perfumes/velvet_amber_detail.jpg', alt: 'Velvet Musk Packaging Visual' }
    ],
    giftOccasions: ['Birthday', 'Anniversary', 'Romantic'],
    isGiftEligible: true
  },
  {
    name: 'Midnight Amber',
    slug: 'midnight-amber',
    categoryName: "Men's Fragrances",
    subcategory: 'Eau de Parfum',
    price: 4299,
    originalPrice: 5199,
    stock: 13,
    rating: 4.9,
    reviewsCount: 41,
    popularity: 90,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    gender: 'him',
    fragranceFamily: 'Dark Labdanum & Leather',
    description: 'Dark, mysterious, and deeply commanding. Spanish labdanum and smoky birch tar wrapped around rich golden amber resins and dark leather.',
    details: [
      'Top Notes: Black Cardamom, Birch Wood Smoke',
      'Heart Notes: Dark Balsamic Amber, Russian Leather',
      'Base Notes: Indonesian Patchouli, Earthy Oakmoss',
      'Concentration: 25% Extrait de Parfum'
    ],
    sizes: JSON.stringify({ '50ml': 8, '100ml': 5 }),
    colors: [
      { name: 'Midnight Cognac', code: '#2C1810' },
      { name: 'Smoky Black', code: '#141416' }
    ],
    image: '/images/perfumes/midnight_noir.jpg',
    images: [
      { url: '/images/perfumes/midnight_noir.jpg', alt: 'Midnight Amber Flacon' },
      { url: '/images/perfumes/noir_intense.jpg', alt: 'Midnight Amber Noir Edition' }
    ],
    giftOccasions: ['Anniversary', 'Special Occasions', 'Birthday'],
    isGiftEligible: true
  },
  {
    name: 'Rose Essence',
    slug: 'rose-essence',
    categoryName: "Women's Fragrances",
    subcategory: 'Eau de Parfum',
    price: 3799,
    originalPrice: 4699,
    stock: 18,
    rating: 5.0,
    reviewsCount: 31,
    popularity: 85,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    gender: 'her',
    fragranceFamily: 'Turkish Damask Rose & Amber',
    description: 'A modern interpretation of Turkish Damascena rose, kissed by morning lychee dew, pink peony, and warm golden amber silk.',
    details: [
      'Top Notes: Pink Lychee, Italian Mandarin Dew',
      'Heart Notes: Isparta Damask Rose Absolu, Peony',
      'Base Notes: Golden Amber Nectar, White Cedar',
      'Concentration: 22% Eau de Parfum'
    ],
    sizes: JSON.stringify({ '50ml': 11, '100ml': 7 }),
    colors: [
      { name: 'Rose Amber', code: '#9E4747' },
      { name: 'Champagne Gold', code: '#D8C39F' }
    ],
    image: '/images/perfumes/rose_eternelle.jpg',
    images: [
      { url: '/images/perfumes/rose_eternelle.jpg', alt: 'Rose Essence Flacon' },
      { url: '/images/perfumes/rose_detail.jpg', alt: 'Rose Essence Detail' }
    ],
    giftOccasions: ['Birthday', 'Anniversary', 'Romantic'],
    isGiftEligible: true
  },
  {
    name: 'Oud Reserve',
    slug: 'oud-reserve',
    categoryName: "Men's Fragrances",
    subcategory: 'Signature Scents',
    price: 5499,
    originalPrice: 6999,
    stock: 11,
    rating: 4.9,
    reviewsCount: 48,
    popularity: 92,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    gender: 'him',
    fragranceFamily: 'Royal Assam Oud & Myrrh',
    description: 'Vintage Assam oud aged in oak casks, distilled with frankincense, dark spices, and warm golden amber in a heavy solid glass flacon.',
    details: [
      'Top Notes: Grated Nutmeg, Wild Saffron',
      'Heart Notes: Aged Royal Assam Oud Wood, Myrrh',
      'Base Notes: Rich Saddle Leather, Amber Resin, Haitian Vetiver',
      'Concentration: 26% Extrait de Parfum'
    ],
    sizes: JSON.stringify({ '50ml': 7, '100ml': 4 }),
    colors: [
      { name: 'Assam Wood', code: '#1C140E' },
      { name: 'Burnished Gold', code: '#C49A45' }
    ],
    image: '/images/perfumes/oud_royale.jpg',
    images: [
      { url: '/images/perfumes/oud_royale.jpg', alt: 'Oud Reserve Flacon' },
      { url: '/images/perfumes/oud_royale_detail.jpg', alt: 'Oud Reserve Packaging' }
    ],
    giftOccasions: ['Anniversary', 'Luxury Corporate', 'Special Occasions'],
    isGiftEligible: true
  },
  {
    name: 'Citrus Bloom',
    slug: 'citrus-bloom',
    categoryName: 'Unisex Fragrances',
    subcategory: 'Eau de Parfum',
    price: 2999,
    originalPrice: 3799,
    stock: 25,
    rating: 4.8,
    reviewsCount: 26,
    popularity: 79,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    gender: 'unisex',
    fragranceFamily: 'Calabrian Bergamot & Sheer Amber',
    description: 'Bright Calabrian bergamot and bitter petitgrain uplifted by sun-drenched neroli blossoms on a warm, lingering base of sheer amber.',
    details: [
      'Top Notes: Sunlit Bergamot, Bitter Petitgrain',
      'Heart Notes: Orange Blossom Petals, French Jasmine',
      'Base Notes: Sheer Amber, White Vetiver, Driftwood',
      'Concentration: 20% Eau de Parfum'
    ],
    sizes: JSON.stringify({ '50ml': 15, '100ml': 10 }),
    colors: [
      { name: 'Sunlit Citrus', code: '#D99B38' },
      { name: 'Verdant Gold', code: '#B39E62' }
    ],
    image: '/images/perfumes/azure_mist.jpg',
    images: [
      { url: '/images/perfumes/azure_mist.jpg', alt: 'Citrus Bloom Flacon' }
    ],
    giftOccasions: ['Birthday', 'Celebration', 'Summer Gift'],
    isGiftEligible: true
  },
  {
    name: 'Signature No. 01 Coffret',
    slug: 'signature-no-01',
    categoryName: 'Signature Scents',
    subcategory: 'Fragrance Gift Sets',
    price: 4899,
    originalPrice: 6200,
    stock: 48,
    rating: 5.0,
    reviewsCount: 65,
    popularity: 100,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    gender: 'unisex',
    fragranceFamily: 'Imperial Amber & Kashmiri Saffron',
    description: 'The definitive masterwork of ROVE & AMBER. An unforgettable union of pure amber resin, Kashmiri saffron, and velvet musk.',
    details: [
      'Top Notes: Saffron Stigmas, Royal Bergamot',
      'Heart Notes: Pure Golden Amber, Damask Rose',
      'Base Notes: Precious Wild Oud, Cashmere Musk',
      'Concentration: 25% Extrait de Parfum'
    ],
    sizes: JSON.stringify({ '50ml': 16, '100ml': 12, 'Discovery Set': 20 }),
    colors: [
      { name: 'Signature Amber', code: '#B86526' },
      { name: 'Pure Gold', code: '#D4AF37' }
    ],
    image: '/images/perfumes/liquid_gold_perfume.jpg',
    images: [
      { url: '/images/perfumes/liquid_gold_perfume.jpg', alt: 'Signature No. 01 Liquid Gold' },
      { url: '/images/perfumes/hero_desert_fragrance.jpg', alt: 'Signature No. 01 Hero View' },
      { url: '/images/perfumes/signature_collection.jpg', alt: 'Embossed Gift Box Coffret' }
    ],
    video: '/images/perfumes/signature_showcase.mp4',
    giftOccasions: ['Birthday', 'Anniversary', 'Special Occasions', 'Wedding'],
    isGiftEligible: true
  },
  {
    name: "L'Honneur Pour Homme Gift Coffret",
    slug: 'lhonneur-pour-homme-gift-set',
    categoryName: 'Fragrance Gift Sets',
    subcategory: "Men's Fragrances",
    price: 5999,
    originalPrice: 7500,
    stock: 20,
    rating: 4.9,
    reviewsCount: 34,
    popularity: 94,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    gender: 'him',
    fragranceFamily: 'Royal Oud & Smoky Woods',
    description: 'Exclusive luxury gift box curated for Him containing Amber Oud, Midnight Amber, and Oud Reserve in 30ml travel decanters.',
    details: [
      'Includes: Amber Oud (30ml), Midnight Amber (30ml), Oud Reserve (30ml)',
      'Packaging: Velvet-lined embossed magnetic presentation box',
      'Personalized Gift Card and satin ribbon included'
    ],
    sizes: JSON.stringify({ 'Discovery Coffret (3x30ml)': 20 }),
    colors: [
      { name: 'Midnight Gold', code: '#1E1B18' },
      { name: 'Amber Glow', code: '#B86526' }
    ],
    image: '/images/perfumes/signature_collection.jpg',
    images: [
      { url: '/images/perfumes/signature_collection.jpg', alt: 'Gift Coffret for Him Packaging' },
      { url: '/images/perfumes/cat_men.jpg', alt: 'Decanters Presentation' }
    ],
    giftOccasions: ['Birthday', 'Anniversary', 'Special Occasions'],
    isGiftEligible: true
  },
  {
    name: 'La Reine Pour Femme Gift Coffret',
    slug: 'la-reine-pour-femme-gift-set',
    categoryName: 'Fragrance Gift Sets',
    subcategory: "Women's Fragrances",
    price: 5999,
    originalPrice: 7500,
    stock: 22,
    rating: 5.0,
    reviewsCount: 42,
    popularity: 96,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    gender: 'her',
    fragranceFamily: 'Golden Saffron & Damask Rose',
    description: 'Prestigious luxury gift set for Her featuring Golden Saffron, Rose Essence, and Velvet Musk in 30ml crystal glass flacons.',
    details: [
      'Includes: Golden Saffron (30ml), Rose Essence (30ml), Velvet Musk (30ml)',
      'Packaging: Ivory and gold embossed coffret with botanical floral motif',
      'Personalized embossed gift letter and wax seal included'
    ],
    sizes: JSON.stringify({ 'Discovery Coffret (3x30ml)': 22 }),
    colors: [
      { name: 'Rose Gold', code: '#C48B36' },
      { name: 'Champagne Ivory', code: '#F4ECE1' }
    ],
    image: '/images/perfumes/cat_women.jpg',
    images: [
      { url: '/images/perfumes/cat_women.jpg', alt: 'Gift Coffret for Her Packaging' },
      { url: '/images/perfumes/bloom_elixir.jpg', alt: 'Fragrance Elixirs for Her' }
    ],
    giftOccasions: ['Birthday', 'Anniversary', 'Special Occasions', 'Wedding'],
    isGiftEligible: true
  }
];
