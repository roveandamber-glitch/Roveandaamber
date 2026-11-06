"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { message } from 'antd';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart, 
  Star, 
  ChevronRight, 
  Check, 
  ArrowLeft,
  PackageOpen,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import ProductReviews from '@/components/product/ProductReviews';
import ReturnPolicyModal from '@/components/product/ReturnPolicyModal';
import productService from '@/services/productService';
import cartService from '@/services/cartService';
import authService from '@/services/authService';
import { getImageUrl } from '@/utils/imageHelper';


const ProductDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  // Primary Product State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Gallery State
  const [selectedImage, setSelectedImage] = useState(null);
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = useCallback((imgUrl) => {
    if (!imgUrl) return;
    setFailedImages(prev => ({ ...prev, [imgUrl]: true }));
  }, []);

  // Variant & Purchase State
  const [selectedSize, setSelectedSize] = useState(null);
  const [comboSelection, setComboSelection] = useState('combo'); // 'combo' (50ml + 2ml) | 'bottle' (50ml) | 'sample' (2ml)
  const [showReturnPolicyModal, setShowReturnPolicyModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  // Related Products State
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Active Tab
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'details' | 'shipping' | 'reviews'

  // Hash anchor listener (e.g. #reviews)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkHash = () => {
        if (window.location.hash === '#reviews') {
          setActiveTab('reviews');
          setTimeout(() => {
            const el = document.getElementById('reviews');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 350);
        }
      };
      checkHash();
      window.addEventListener('hashchange', checkHash);
      return () => window.removeEventListener('hashchange', checkHash);
    }
  }, [id]);

  // Track if this item or size is in cart
  useEffect(() => {
    const prodId = product?._id || product?.id || id;
    if (!prodId) return;
    const checkCartState = () => {
      setIsInCart(cartService.isInCart(prodId));
    };

    checkCartState();
    window.addEventListener('cartChange', checkCartState);
    window.addEventListener('authChange', checkCartState);
    return () => {
      window.removeEventListener('cartChange', checkCartState);
      window.removeEventListener('authChange', checkCartState);
    };
  }, [product, id, selectedSize]);

  // Fetch product strictly by ID from live backend database
  const fetchProductData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await productService.getProductById(id).catch(err => {
        throw err;
      });

      let foundProduct = null;
      if (response?.success && response.data) {
        foundProduct = response.data;
      } else if (response && !response.success && response.data) {
        foundProduct = response.data;
      }

      if (foundProduct) {
        setProduct(foundProduct);
        initializeProductVariants(foundProduct);
        fetchRelated(foundProduct);
      } else {
        setProduct(null);
        setError('Fragrance formulation not found.');
      }
    } catch (err) {
      console.error('API error fetching product by ID:', err);
      setProduct(null);
      setError('Unable to load fragrance details from the atelier server.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const initializeProductVariants = (prod) => {
    // Determine sizes if product supports variants
    let sizes = [];
    if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
      sizes = prod.sizes;
    } else if (prod.sizes_stock && typeof prod.sizes_stock === 'object') {
      sizes = Object.keys(prod.sizes_stock);
    }

    if (sizes.length > 0) {
      // Pick first in-stock size or first size
      const sizeMap = prod.sizes_stock || {};
      const firstAvailable = sizes.find(s => (sizeMap[s] ?? 1) > 0) || sizes[0];
      setSelectedSize(firstAvailable);
    } else {
      setSelectedSize(null);
    }

    setSelectedImage(null);
    setQuantity(1);
  };

  // Fetch related products strictly from live backend database
  const fetchRelated = async (currentProd) => {
    try {
      const response = await productService.getAllProducts().catch(() => null);
      let all = [];
      if (response?.success && Array.isArray(response.data?.products)) {
        all = response.data.products;
      } else if (response?.success && Array.isArray(response.data)) {
        all = response.data;
      } else if (Array.isArray(response)) {
        all = response;
      }

      const currentCategory = (currentProd.categoryName || currentProd.category_name || currentProd.category || '').toLowerCase();
      const currentId = String(currentProd._id || currentProd.id);

      // Filter out current product
      const others = all.filter(p => String(p._id || p.id) !== currentId);

      // Prefer products from same category
      const sameCategory = others.filter(p => 
        (p.categoryName || p.category_name || p.category || '').toLowerCase() === currentCategory
      );

      if (sameCategory.length >= 2) {
        setRelatedProducts(sameCategory.slice(0, 4));
      } else {
        setRelatedProducts(others.slice(0, 4));
      }
    } catch (e) {
      setRelatedProducts([]);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProductData();
  }, [fetchProductData]);

  // Wishlist state synchronization
  useEffect(() => {
    if (!product) return;
    const prodId = product._id || product.id;

    const checkWishlist = () => {
      try {
        const stored = localStorage.getItem('rove_amber_wishlist');
        if (stored) {
          const list = JSON.parse(stored);
          setIsWishlisted(list.includes(prodId));
        } else {
          setIsWishlisted(false);
        }
      } catch (e) {
        setIsWishlisted(false);
      }
    };

    checkWishlist();
    window.addEventListener('wishlistChange', checkWishlist);
    return () => window.removeEventListener('wishlistChange', checkWishlist);
  }, [product]);

  const toggleWishlist = () => {
    if (!product) return;
    const prodId = product._id || product.id;
    const displayName = product.name || 'Fragrance';

    try {
      const stored = localStorage.getItem('rove_amber_wishlist');
      let list = stored ? JSON.parse(stored) : [];

      if (list.includes(prodId)) {
        list = list.filter(item => item !== prodId);
        setIsWishlisted(false);
        message.info(`Removed ${displayName} from wishlist`);
      } else {
        list.push(prodId);
        setIsWishlisted(true);
        message.success(`Saved ${displayName} to wishlist`);
      }
      localStorage.setItem('rove_amber_wishlist', JSON.stringify(list));
      window.dispatchEvent(new Event('wishlistChange'));
    } catch (e) {
      console.error('Error toggling wishlist:', e);
    }
  };

  // Image Gallery Processing - Strictly no fake/wrong substitute bottles
  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images
        .map(img => getImageUrl(img.url || img))
        .filter(url => Boolean(url) && !url.includes('no-image'));
    }
    if (product.image) {
      const single = getImageUrl(product.image);
      return single && !single.includes('no-image') ? [single] : [];
    }
    return [];
  }, [product]);

  const validImages = useMemo(() => {
    return images.filter(img => !failedImages[img]);
  }, [images, failedImages]);

  const currentMainImage = (selectedImage && !failedImages[selectedImage])
    ? selectedImage
    : (validImages[0] || null);

  // Stock and Availability Logic
  const availableSizesMap = useMemo(() => {
    if (!product) return {};
    if (product.sizes_stock && typeof product.sizes_stock === 'object') {
      return product.sizes_stock;
    }
    return {};
  }, [product]);

  const supportedSizes = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    if (Object.keys(availableSizesMap).length > 0) {
      return Object.keys(availableSizesMap);
    }
    return [];
  }, [product, availableSizesMap]);

  const baseBottleSize = useMemo(() => {
    if (!product) return '50ML';
    const found = supportedSizes.find(s => !s.toLowerCase().includes('sample') && !s.toLowerCase().includes('2ml'));
    return (found || '50ML').toUpperCase();
  }, [product, supportedSizes]);

  // Stock for the base bottle
  const bottleStock = useMemo(() => {
    if (!product) return 0;
    if (availableSizesMap[baseBottleSize] !== undefined) return Number(availableSizesMap[baseBottleSize]);
    if (availableSizesMap['50ML'] !== undefined) return Number(availableSizesMap['50ML']);
    if (product.stock !== undefined) return Number(product.stock);
    return 99;
  }, [product, baseBottleSize, availableSizesMap]);

  // Stock for 2ml sample
  const sampleStock = useMemo(() => {
    if (!product) return 0;
    if (availableSizesMap['2ML'] !== undefined) return Number(availableSizesMap['2ML']);
    if (availableSizesMap['2ML SAMPLE'] !== undefined) return Number(availableSizesMap['2ML SAMPLE']);
    return 99;
  }, [product, availableSizesMap]);

  const maxStockForSize = useMemo(() => {
    if (comboSelection === 'sample') return sampleStock;
    return bottleStock;
  }, [comboSelection, sampleStock, bottleStock]);

  const isOutOfStock = maxStockForSize === 0 || product?.inStock === false || product?.status === 'Out of Stock';

  // Pricing calculations
  const samplePrice = product?.samplePrice !== undefined && product?.samplePrice !== null ? Number(product.samplePrice) : 199;
  const basePrice = Number(product?.price) || 0;

  const currentUnitPrice = useMemo(() => {
    if (comboSelection === 'sample') return samplePrice;
    if (comboSelection === 'combo') return basePrice + samplePrice;
    return basePrice;
  }, [comboSelection, basePrice, samplePrice]);

  const originalUnitPrice = useMemo(() => {
    if (!product?.originalPrice) return null;
    const orig = Number(product.originalPrice);
    if (!orig || isNaN(orig)) return null;
    if (comboSelection === 'sample') return null;
    if (comboSelection === 'combo') {
      const origCombo = orig + samplePrice;
      const currentCombo = basePrice + samplePrice;
      return origCombo > currentCombo ? origCombo : null;
    }
    return orig > basePrice ? orig : null;
  }, [comboSelection, product, basePrice, samplePrice]);

  const discountPercent = originalUnitPrice && originalUnitPrice > currentUnitPrice
    ? Math.round(((originalUnitPrice - currentUnitPrice) / originalUnitPrice) * 100)
    : null;

  const totalPrice = currentUnitPrice * quantity;

  // Add to cart handler
  const handleAddToCart = async (redirectToCart = false) => {
    if (!product || isOutOfStock || isAddingToCart) return;

    if (!authService.isAuthenticated()) {
      message.info('Please sign in to add fragrances to your shopping bag.');
      router.push(`/login?redirect=${encodeURIComponent(redirectToCart ? '/cart' : window.location.pathname)}`);
      return;
    }

    setIsAddingToCart(true);
    try {
      let targetSize = baseBottleSize;
      let hasGuaranteeSample = false;
      let itemPrice = basePrice;
      let itemName = product.name;

      if (comboSelection === 'combo') {
        targetSize = `${baseBottleSize} + 2ML COMBO`;
        hasGuaranteeSample = true;
        itemPrice = basePrice + samplePrice;
      } else if (comboSelection === 'sample') {
        targetSize = '2ML SAMPLE';
        hasGuaranteeSample = false;
        itemPrice = samplePrice;
        itemName = `${product.name} (2ml Discovery Sample)`;
      } else {
        targetSize = baseBottleSize;
        hasGuaranteeSample = false;
        itemPrice = basePrice;
      }

      await cartService.addToCart({
        id: product._id || product.id,
        productId: product._id || product.id,
        name: itemName,
        price: itemPrice,
        image: currentMainImage,
        size: targetSize,
        quantity: quantity,
        maxStock: maxStockForSize,
        hasSample: hasGuaranteeSample
      });

      setIsInCart(true);
      message.success(`${product.name} added to your shopping bag`);

      if (redirectToCart) {
        router.push('/cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      message.error('Could not add product to cart');
    } finally {
      setTimeout(() => setIsAddingToCart(false), 400);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] font-sans pt-20 sm:pt-22 pb-12">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="h-4 w-48 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-6 space-y-4">
              <div className="w-full aspect-square bg-gray-200 rounded-3xl" />
              <div className="flex gap-3">
                {[1, 2, 3].map(n => (
                  <div key={n} className="w-20 h-20 bg-gray-200 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-6 space-y-6">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-6 w-36 bg-gray-200 rounded" />
              <div className="h-20 w-full bg-gray-200 rounded" />
              <div className="h-12 w-full bg-gray-200 rounded-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not Found State (never silent fallbacks)
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex flex-col justify-between pt-24 sm:pt-28">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#FAF3E0] text-[#B8860B] border border-[#E0D0A5] flex items-center justify-center mb-5">
            <PackageOpen size={28} />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C827A] mb-2 block">
            Atelier Archives
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-black mb-2">
            Fragrance Not Found
          </h1>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed max-w-sm">
            The requested creation does not exist in our catalog or may have been archived. Please explore our signature flacons.
          </p>
          <Link 
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-colors shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Return to Collections</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-sans text-[#1A1A1A] pt-20 sm:pt-24 pb-20 md:pb-12 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 w-full flex-1">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-stone-500 mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} className="text-stone-400" />
          <Link href="/shop" className="hover:text-black transition-colors">Collections</Link>
          <ChevronRight size={10} className="text-stone-400" />
          <span className="text-[#1A120B] font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Hero Product Showcase Grid - Spacious, Airy, Luxury Boutique Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* LEFT: Image Gallery Showcase (Spacious Museum-Quality Portrait Canvas) */}
          <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-28 space-y-4">
            
            {/* Primary Main Image Container */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#FDFBF9] via-[#FAF7F2] to-[#F5ECE0] border border-[#ECE7DE] p-6 sm:p-10 aspect-[4/5] sm:aspect-square flex items-center justify-center overflow-hidden shadow-xs group">
              {currentMainImage ? (
                <img
                  src={currentMainImage}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-xl transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                  onError={() => handleImageError(currentMainImage)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center select-none">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#FAF3E0] border border-[#E0D0A5] flex items-center justify-center mb-4 shadow-sm">
                    <Sparkles size={32} strokeWidth={1.5} className="text-[#B8860B]" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.28em] text-[#8C6D1F] mb-1.5">
                    ROVE & AMBER • ATELIER
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#1A120B] font-normal max-w-xs leading-tight">
                    {product.name}
                  </h3>
                  <span className="text-xs text-stone-500 font-light mt-1.5">
                    {product.category || product.category_name || 'Fine Fragrance Extrait'}
                  </span>
                </div>
              )}

              {/* Category / Concentration Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/95 backdrop-blur-md text-[#8C6D1F] border border-[#E0D8CA] text-[10px] uppercase font-bold tracking-[0.2em] px-3.5 py-1 rounded-full shadow-2xs">
                  {product.category || product.category_name || 'Eau de Parfum'}
                </span>
              </div>

              {/* Wishlist Button on Main Image */}
              <button
                type="button"
                onClick={toggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                  isWishlisted 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'bg-white/95 text-stone-600 hover:text-black hover:scale-105 border border-[#EFECE6]'
                }`}
              >
                <Heart size={16} className={isWishlisted ? 'fill-red-600 text-red-600' : 'text-stone-600'} />
              </button>

              {/* Low Stock Badge */}
              {!isOutOfStock && maxStockForSize <= 5 && maxStockForSize > 0 && (
                <div className="absolute bottom-4 left-4 bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-xs">
                  Only {maxStockForSize} flacons remaining in atelier
                </div>
              )}
            </div>

            {/* Thumbnail Navigation Row */}
            {validImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-white p-1.5 transition-all duration-300 border-2 shrink-0 cursor-pointer ${
                      currentMainImage === img ? 'border-[#B8860B] ring-2 ring-[#B8860B]/30 shadow-xs' : 'border-[#ECE7DE] opacity-70 hover:opacity-100 hover:border-stone-400'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} view ${idx + 1}`} 
                      className="w-full h-full object-contain"
                      onError={() => handleImageError(img)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Purchasing Information - Unboxed, Airy, Breathing Luxury Layout */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-7">
            
            {/* 1. Header: Brand, Title, Rating, Stock */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#A67C38] flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-[#A67C38]" />
                  <span>ROVE & AMBER • HAUTE PARFUMERIE</span>
                </span>

                {/* Stock Indicator */}
                {isOutOfStock ? (
                  <span className="text-[11px] font-semibold px-3 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                    Currently Unavailable
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>In Stock • Dispatched within 24h</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif text-[#170E08] font-normal leading-[1.12] tracking-tight m-0">
                {product.name}
              </h1>

              {/* Reviews & Star Rating */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('reviews');
                    setTimeout(() => {
                      const el = document.getElementById('reviews');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="inline-flex items-center gap-2 text-xs bg-transparent border-0 p-0 cursor-pointer hover:opacity-85 transition-opacity group"
                  title="View reviews or write a review"
                >
                  <div className="flex items-center text-[#B8860B]">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={13} 
                        className={star <= Math.round(product.rating || 5) ? 'fill-[#B8860B] text-[#B8860B]' : 'text-gray-300'} 
                      />
                    ))}
                  </div>
                  <span className="font-bold text-[#170E08] text-xs">{product.rating || 5.0}</span>
                  <span className="text-stone-400 text-xs">({product.reviewsCount || 0} reviews)</span>
                  <span className="text-[11px] text-[#A67C38] underline font-medium ml-1 group-hover:text-black transition-colors">
                    {product.reviewsCount > 0 ? 'Read reviews' : 'Write review'}
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Price Row */}
            <div className="py-3.5 border-y border-[#ECE7DE] flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#140D07] tracking-tight">
                  ₹{currentUnitPrice.toLocaleString('en-IN')}
                </span>
                {originalUnitPrice && discountPercent && discountPercent > 0 && (
                  <>
                    <span className="text-sm font-sans text-stone-400 line-through">
                      ₹{originalUnitPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-[#8C6D1F] bg-[#FAF3E0] border border-[#E0D0A5] px-2.5 py-0.5 rounded-full">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
                <span className="text-xs text-stone-500 font-light block">
                  (Incl. of all taxes)
                </span>
              </div>

              <div className="text-[11px] text-stone-500 font-medium">
                Complimentary White-Glove Courier Included
              </div>
            </div>

            {/* 3. Description & Olfactory Notes */}
            <div className="space-y-3">
              <p className="text-sm text-stone-600 leading-relaxed font-light m-0">
                {product.description || 'An artisanal fine fragrance slow-macerated with rare golden amber, precious oud accords, and noble botanicals, crafted for lasting presence and distinguished sillage.'}
              </p>
            </div>

            {/* 4. Select Flacon & Trial Pack Options */}
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#170E08]">
                  Select Flacon & Trial Format
                </label>
                <button
                  type="button"
                  onClick={() => setShowReturnPolicyModal(true)}
                  className="text-xs text-[#A67C38] hover:text-black hover:underline font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ShieldCheck size={13} className="text-[#A67C38]" />
                  <span>Return Policy Details ↗</span>
                </button>
              </div>

              {/* 3 Spacious Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. COMBO: 50ml + 2ml (Recommended) */}
                <button
                  type="button"
                  onClick={() => setComboSelection('combo')}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    comboSelection === 'combo'
                      ? 'bg-[#FCF9F3] border-[#B8860B] shadow-sm ring-1 ring-[#B8860B]/40'
                      : 'bg-white border-[#E8DFC9] hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="bg-[#1C120C] text-[#ECC880] text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-[#D4AF37]/50 shadow-2xs">
                      ★ Recommended
                    </span>
                    <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      7-Day Trial
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-serif font-bold text-[#140D07] block leading-snug">
                      {baseBottleSize} + 2ml Sample
                    </span>
                    <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                      Flacon & Companion Vial
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-amber-200/50 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-[#B8860B] font-sans">
                      ₹{(basePrice + samplePrice).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Full Refund Guarantee
                    </span>
                  </div>
                </button>

                {/* 2. Standalone 50ml (Bottle Only) */}
                <button
                  type="button"
                  onClick={() => setComboSelection('bottle')}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    comboSelection === 'bottle'
                      ? 'bg-white border-black shadow-sm ring-1 ring-black/20'
                      : 'bg-white border-[#E8DFC9] hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400">
                      Standard
                    </span>
                    <span className="text-[9.5px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                      Final Sale
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-serif font-bold text-[#140D07] block leading-snug">
                      {baseBottleSize} Flacon
                    </span>
                    <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                      Standalone Fragrance Flacon
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-200 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-[#140D07] font-sans">
                      ₹{basePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Non-Returnable
                    </span>
                  </div>
                </button>

                {/* 3. 2ml Sample (Sample Only) */}
                <button
                  type="button"
                  onClick={() => setComboSelection('sample')}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    comboSelection === 'sample'
                      ? 'bg-white border-black shadow-sm ring-1 ring-black/20'
                      : 'bg-white border-[#E8DFC9] hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400">
                      Trial Wear
                    </span>
                    <span className="text-[9.5px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                      2ml Vial
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-serif font-bold text-[#140D07] block leading-snug">
                      2ml Discovery
                    </span>
                    <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                      Personal Trial Vial
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-200 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-[#140D07] font-sans">
                      ₹{samplePrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Trial Vial
                    </span>
                  </div>
                </button>
              </div>

              {/* 5. Clear, Reassuring Guarantee Callout */}
              <div className="pt-1">
                {comboSelection === 'combo' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F2F8F4] to-[#FAF8F5] border border-emerald-200 shadow-2xs transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                        <span>7-Day At-Home Experience Guarantee Included</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowReturnPolicyModal(true)}
                        className="text-[11px] text-emerald-900 underline font-semibold hover:text-black cursor-pointer shrink-0"
                      >
                        Policy Details
                      </button>
                    </div>
                    <p className="text-xs text-emerald-900/90 leading-relaxed font-light m-0 mt-1.5">
                      Spray and test the companion <strong>2ml sample vial</strong> at home first. If the scent does not harmonize with your skin chemistry, simply return the <strong>unopened 50ml flacon within 7 days for a 100% full refund</strong> — keep the 2ml sample with our compliments.
                    </p>
                  </div>
                )}

                {comboSelection === 'bottle' && (
                  <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E0D0A5] transition-all space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#8C6D1F] flex items-center gap-2">
                        <AlertCircle size={15} className="text-[#8C6D1F] shrink-0" />
                        <span>Final Sale • Hygiene Sealed Flacon</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowReturnPolicyModal(true)}
                        className="text-[11px] text-[#8C6D1F] underline font-semibold hover:text-black cursor-pointer shrink-0"
                      >
                        Policy Details
                      </button>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-light m-0">
                      In accordance with luxury cosmetics safety guidelines, standalone flacons cannot be returned once unsealed.
                    </p>
                    <div className="pt-1 flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="text-stone-500 font-light">Would you prefer to test risk-free at home first?</span>
                      <button
                        type="button"
                        onClick={() => setComboSelection('combo')}
                        className="text-[#8C6D1F] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Upgrade to 50ml + 2ml (+₹{samplePrice})</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {comboSelection === 'sample' && (
                  <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E0D0A5] transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#8C6D1F] flex items-center gap-2">
                        <AlertCircle size={15} className="text-[#8C6D1F] shrink-0" />
                        <span>Discovery Sample Vial</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowReturnPolicyModal(true)}
                        className="text-[11px] text-[#8C6D1F] underline font-semibold hover:text-black cursor-pointer shrink-0"
                      >
                        Policy Details
                      </button>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed font-light m-0 mt-1">
                      Individual 2ml discovery vials are intimate trial formats made for personal testing and are final sale.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 6. Quantity Selector & Action Buttons */}
            <div className="pt-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Quantity:</span>
                  <div className="inline-flex items-center bg-[#FAF9F7] border border-[#E0D8CA] rounded-full p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      aria-label="Decrease quantity"
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-[#140D07] font-sans">
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(maxStockForSize, quantity + 1))}
                      disabled={quantity >= maxStockForSize || isOutOfStock}
                      aria-label="Increase quantity"
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest block font-medium">Total Amount</span>
                  <span className="text-lg sm:text-xl font-serif font-bold text-[#140D07]">
                    ₹{(isOutOfStock ? 0 : totalPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add to Bag and Instant Checkout */}
              <div className="flex flex-col sm:flex-row gap-3">
                {isInCart ? (
                  <button
                    type="button"
                    onClick={() => router.push('/cart')}
                    className="flex-1 bg-[#1C120C] hover:bg-black text-[#ECC880] border border-[#1C120C] py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.99] cursor-pointer font-serif uppercase tracking-widest text-xs font-bold"
                  >
                    <ShoppingBag size={15} className="text-[#ECC880]" />
                    <span>View Shopping Bag</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddToCart(false)}
                    disabled={isOutOfStock || isAddingToCart}
                    className="flex-1 bg-[#1C120C] hover:bg-black disabled:bg-stone-200 disabled:text-stone-400 text-[#ECC880] py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.99] cursor-pointer font-serif uppercase tracking-widest text-xs font-bold group"
                  >
                    <ShoppingBag size={15} className="text-[#ECC880] group-hover:scale-110 transition-transform" />
                    <span>{isAddingToCart ? 'Adding to Bag...' : 'Add to Shopping Bag'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock || isAddingToCart}
                  className="flex-1 bg-white hover:bg-stone-900 hover:text-white disabled:bg-stone-100 disabled:text-stone-400 text-[#1C120C] border border-[#1C120C] py-3.5 px-6 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer font-serif uppercase tracking-widest text-xs font-bold shadow-2xs"
                >
                  <span>Instant Checkout</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* 7. Luxury Guarantees Banner */}
            <div className="pt-4 border-t border-[#ECE7DE] grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center p-3 rounded-2xl bg-white border border-[#ECE7DE] shadow-2xs">
                <Truck size={16} className="text-[#B8860B] mb-1" />
                <span className="text-[11px] font-bold text-stone-800">Express Delivery</span>
                <span className="text-[10px] text-stone-400 font-light">Complimentary Pan-India</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-white border border-[#ECE7DE] shadow-2xs">
                <ShieldCheck size={16} className="text-[#B8860B] mb-1" />
                <span className="text-[11px] font-bold text-stone-800">100% Authentic</span>
                <span className="text-[10px] text-stone-400 font-light">Artisanal Extrait</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-2xl bg-white border border-[#ECE7DE] shadow-2xs">
                <Sparkles size={16} className="text-[#B8860B] mb-1" />
                <span className="text-[11px] font-bold text-stone-800">Luxury Coffret</span>
                <span className="text-[10px] text-stone-400 font-light">Gold Foil Packaging</span>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: Detailed Accordion / Tabs (Notes, Details, Specifications, Reviews) */}
        <section id="reviews" className="mt-12 sm:mt-16 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-[#ECE7DE] shadow-2xs">
          
          {/* Tab Navigation */}
          <div className="flex items-center space-x-6 sm:space-x-8 border-b border-gray-100 pb-3 overflow-x-auto scrollbar-none text-xs uppercase tracking-widest font-serif">
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'notes' ? 'border-black text-black font-bold' : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              Olfactory Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'details' ? 'border-black text-black font-bold' : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              Artisanal Craft
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'shipping' ? 'border-black text-black font-bold' : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              Shipping & Flacon
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'reviews' ? 'border-black text-black font-bold' : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              Reviews {product.reviewsCount ? `(${product.reviewsCount})` : ''}
            </button>
          </div>

          {/* Tab Contents */}
          <div className="pt-6">
            
            {/* 1. Olfactory Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="text-lg font-serif font-normal text-black">
                  Olfactory Pyramid & Composition
                </h3>
                {product.details && product.details.length > 0 ? (
                  <ul className="space-y-2.5">
                    {product.details.map((note, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-center gap-2.5 font-light">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] shrink-0" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-600 leading-relaxed font-light">
                    Formulated with aged natural amber, smoky agarwood resins, luminous Damask rose, and velvet musk accords for an intimate and radiant olfactory aura.
                  </p>
                )}
              </div>
            )}

            {/* 2. Artisanal Craft & Description */}
            {activeTab === 'details' && (
              <div className="space-y-3 max-w-2xl text-xs text-gray-600 leading-relaxed font-light">
                <h3 className="text-lg font-serif font-normal text-black">
                  Slow-Macerated In Glass Demijohns
                </h3>
                <p>
                  Every flacon by ROVE & AMBER is matured over weeks in dark glass demijohns, allowing the organic botanicals and aged resins to marry seamlessly into a silky, complex fragrance.
                </p>
                <p>
                  Free from parabens, phthalates, and unnecessary additives. Crafted using organic grain spirit and ethically harvested wild botanicals.
                </p>
              </div>
            )}

            {/* 3. Shipping & Specifications */}
            {activeTab === 'shipping' && (
              <div className="space-y-3 max-w-2xl text-xs text-gray-600 leading-relaxed font-light">
                <h3 className="text-lg font-serif font-normal text-black">
                  Packaging & Pan-India Dispatch
                </h3>
                <p>
                  Your flacon is cushioned inside our signature golden embossed presentation box, accompanied by a certificate of authenticity.
                </p>
                <ul className="space-y-1.5 pt-2">
                  <li className="flex items-center gap-2">
                    <Check size={12} className="text-[#B8860B]" />
                    <span>Complimentary express delivery across India.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={12} className="text-[#B8860B]" />
                    <span>Dispatched in tamper-evident, temperature-controlled packaging.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* 4. Customer Reviews */}
            {activeTab === 'reviews' && (
              <ProductReviews
                productId={product._id || product.id || id}
                productName={product.name}
                initialRating={product.rating}
                initialReviewsCount={product.reviewsCount}
                onRatingUpdate={(newRating, newCount) => {
                  setProduct(prev => prev ? {
                    ...prev,
                    rating: newRating,
                    reviewsCount: newCount
                  } : prev);
                }}
              />
            )}
          </div>
        </section>

        {/* SECTION 3: Related Creations */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 sm:mt-20 border-t border-[#ECE7DE] pt-10 sm:pt-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#B8860B] block mb-1">
                  Atelier Curation
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-black font-normal">
                  You May Also Admire
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-serif uppercase tracking-widest text-black border-b border-black pb-0.5 hover:text-[#B8860B] hover:border-[#B8860B] transition-colors mt-3 sm:mt-0 inline-block self-start sm:self-auto"
              >
                View Full Catalog
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {relatedProducts.map(rel => (
                <ProductCard key={rel._id || rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Luxury Return Policy & Home Trial Guarantee Modal */}
      <ReturnPolicyModal
        open={showReturnPolicyModal}
        onClose={() => setShowReturnPolicyModal(false)}
      />

      <Footer />
    </div>
  );
};

export default ProductDetails;
