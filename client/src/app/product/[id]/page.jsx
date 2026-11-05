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
  PackageOpen
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import ProductReviews from '@/components/product/ProductReviews';
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

  // Variant & Purchase State
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [includeSampleBottle, setIncludeSampleBottle] = useState(true);
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

  // Image Gallery Processing
  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map(img => getImageUrl(img.url || img));
    }
    if (product.image) {
      return [getImageUrl(product.image)];
    }
    return ['/images/perfumes/amber_oud_perfume.jpg'];
  }, [product]);

  const currentMainImage = selectedImage || images[0] || '/images/perfumes/amber_oud_perfume.jpg';

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

  // Max available stock for currently selected size
  const maxStockForSize = useMemo(() => {
    if (!product) return 0;
    if (selectedSize && availableSizesMap[selectedSize] !== undefined) {
      return Number(availableSizesMap[selectedSize]) || 0;
    }
    if (product.stock !== undefined) {
      return Number(product.stock) || 0;
    }
    if (product.countInStock !== undefined) {
      return Number(product.countInStock) || 0;
    }
    return 99;
  }, [product, selectedSize, availableSizesMap]);

  const isOutOfStock = maxStockForSize === 0 || product?.inStock === false || product?.status === 'Out of Stock';

  // Pricing calculations
  const isSelectedSizeSample = Boolean(selectedSize && (selectedSize.toLowerCase().includes('2ml') || selectedSize.toLowerCase().includes('sample')));
  const samplePrice = product?.samplePrice !== undefined && product?.samplePrice !== null ? Number(product.samplePrice) : 199;
  const price = isSelectedSizeSample ? samplePrice : (Number(product?.price) || 0);
  const originalPrice = product?.originalPrice && Number(product.originalPrice) > price ? Number(product.originalPrice) : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;
  const totalPrice = price * quantity;

  // Size switch handler
  const handleSizeSelect = (sz) => {
    const stockForSz = availableSizesMap[sz] !== undefined ? availableSizesMap[sz] : 99;
    if (stockForSz <= 0) {
      message.warning(`Size ${sz} is currently out of stock`);
      return;
    }
    setSelectedSize(sz);
    if (quantity > stockForSz) {
      setQuantity(Math.max(1, stockForSz));
    }
  };

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
      const isSizeSample = Boolean(selectedSize && (selectedSize.toLowerCase().includes('2ml') || selectedSize.toLowerCase().includes('sample')));
      const hasGuaranteeSample = includeSampleBottle || isSizeSample;

      cartService.addToCart({
        id: product._id || product.id,
        productId: product._id || product.id,
        name: product.name,
        price: price,
        image: currentMainImage,
        size: selectedSize || '50ml',
        quantity: quantity,
        maxStock: maxStockForSize,
        hasSample: hasGuaranteeSample
      });

      if (includeSampleBottle && !isSizeSample) {
        cartService.addToCart({
          id: `${product._id || product.id}_sample_2ml`,
          productId: product._id || product.id,
          name: `${product.name} (2 ml Companion Sample Bottle)`,
          price: samplePrice,
          image: currentMainImage,
          size: '2ML',
          quantity: 1,
          hasSample: true
        });
      }

      setIsInCart(true);
      message.success(`Added ${product.name}${selectedSize ? ` (${selectedSize})` : ''}${hasGuaranteeSample ? ' with 2 ml sample guarantee' : ''} to cart`);

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full flex-1">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-gray-500 mb-3.5">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} className="text-gray-400" />
          <Link href="/shop" className="hover:text-black transition-colors">Collections</Link>
          <ChevronRight size={10} className="text-gray-400" />
          <span className="text-black font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Hero Product Showcase Grid - Single Window Screen Viewport Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
          
          {/* LEFT: Image Gallery Showcase (Compact Portrait Flacon) */}
          <div className="lg:col-span-5 space-y-2.5">
            
            {/* Primary Main Image Container */}
            <div className="relative rounded-2xl bg-white border border-[#ECE7DE] p-4 sm:p-6 max-h-[360px] lg:max-h-[390px] aspect-[4/3] sm:aspect-square flex items-center justify-center overflow-hidden shadow-2xs group">
              <img
                src={currentMainImage}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-md transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/images/perfumes/amber_oud_perfume.jpg';
                }}
              />

              {/* Category / Concentration Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-[#FAF9F7]/95 backdrop-blur-md text-[#B8860B] border border-[#E0D8CA] text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full shadow-2xs">
                  {product.category || product.category_name || 'Eau de Parfum'}
                </span>
              </div>

              {/* Wishlist Button on Main Image */}
              <button
                type="button"
                onClick={toggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-2xs cursor-pointer ${
                  isWishlisted 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'bg-white/90 text-gray-500 hover:text-black hover:bg-white border border-[#EFECE6]'
                }`}
              >
                <Heart size={15} className={isWishlisted ? 'fill-red-600 text-red-600' : 'text-gray-500'} />
              </button>

              {/* Low Stock Badge */}
              {!isOutOfStock && maxStockForSize <= 5 && maxStockForSize > 0 && (
                <div className="absolute bottom-3 left-3 bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full">
                  Only {maxStockForSize} flacons remaining
                </div>
              )}
            </div>

            {/* Thumbnail Navigation Row (Compact) */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-white p-1 transition-all duration-200 border-2 shrink-0 cursor-pointer ${
                      currentMainImage === img ? 'border-black shadow-xs' : 'border-[#ECE7DE] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Purchasing Information - Highly Compact & Single Window Screen Ready */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 lg:p-5 border border-[#ECE7DE] shadow-2xs space-y-2.5 sm:space-y-3">
            
            {/* Header: Brand, Title, Rating */}
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#B8860B] block mb-0.5">
                ROVE & AMBER • Fine Fragrance
              </span>
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-serif text-black font-normal leading-tight m-0">
                  {product.name}
                </h1>
                {/* Rating and Reviews clickable shortcut */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('reviews');
                    setTimeout(() => {
                      const el = document.getElementById('reviews');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs bg-transparent border-0 p-0 cursor-pointer hover:opacity-85 transition-opacity group"
                  title="View reviews or write a review"
                >
                  <div className="flex items-center text-[#B8860B]">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={12} 
                        className={star <= Math.round(product.rating || 5) ? 'fill-[#B8860B] text-[#B8860B]' : 'text-gray-300'} 
                      />
                    ))}
                  </div>
                  <span className="font-bold text-gray-800 text-[11px]">{product.rating || 5.0}</span>
                  <span className="text-gray-400 text-[11px]">({product.reviewsCount || 0})</span>
                  <span className="text-[10px] text-[#B8860B] underline font-medium ml-0.5 group-hover:text-black transition-colors">
                    {product.reviewsCount > 0 ? 'See reviews' : 'Write review'}
                  </span>
                </button>
              </div>
            </div>

            {/* Price & Stock Badge */}
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2.5 border-b border-gray-100">
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl sm:text-2xl font-bold font-sans text-black">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {originalPrice && (
                  <>
                    <span className="text-xs sm:text-sm font-sans text-gray-400 line-through">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-[#B8860B] bg-[#FFF8EB] border border-[#E8DCC0] px-2 py-0.2 rounded-full">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
                <span className="text-[10px] text-gray-400 font-light block">
                  (Incl. of all taxes)
                </span>
              </div>

              {/* Live Stock Pill */}
              {isOutOfStock ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>In Stock</span>
                </span>
              )}
            </div>

            {/* Description (Concise 2 Lines) */}
            <p className="text-xs text-stone-600 leading-snug font-light line-clamp-2 m-0">
              {product.description || 'An artisanal fine fragrance slow-macerated with rare golden amber, precious oud accords, and noble botanicals, crafted for lasting presence and distinguished sillage.'}
            </p>

            {/* Variant Size Selector */}
            {supportedSizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700">
                    Select Flacon Size
                  </label>
                  {selectedSize && availableSizesMap[selectedSize] !== undefined && (
                    <span className="text-[9px] text-gray-400">
                      {availableSizesMap[selectedSize] > 0 ? `${availableSizesMap[selectedSize]} flacons left` : 'Sold out'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {supportedSizes.map(size => {
                    const stockForSize = availableSizesMap[size] !== undefined ? availableSizesMap[size] : 99;
                    const isSoldOut = stockForSize <= 0;
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeSelect(size)}
                        disabled={isSoldOut}
                        className={`h-9 min-w-[58px] px-3 rounded-xl text-xs font-bold uppercase transition-all duration-200 border flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-xs scale-[1.02]'
                            : isSoldOut
                            ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                            : 'bg-[#FAF9F7] text-gray-800 border-[#E8E2D6] hover:border-black'
                        }`}
                      >
                        <span className="leading-tight">{size}</span>
                        {availableSizesMap[size] !== undefined && (
                          <span className={`text-[7px] font-normal leading-none mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                            {isSoldOut ? '0 left' : `${stockForSize} qty`}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Total Amount */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Qty:</span>
                <div className="inline-flex items-center bg-[#FAF9F7] border border-[#E0D8C8] rounded-full p-0.5">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white text-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-black">
                    {isOutOfStock ? 0 : quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxStockForSize, quantity + 1))}
                    disabled={quantity >= maxStockForSize || isOutOfStock}
                    aria-label="Increase quantity"
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white text-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Total Amount</span>
                <span className="text-sm sm:text-base font-bold text-black font-sans">
                  ₹{(isOutOfStock ? 0 : totalPrice).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* 2 ml Sample Companion Add-on: Compact, Luxury, User-Friendly with Small 2ml Thumbnail */}
            {!isSelectedSizeSample && (
              <div className={`p-2.5 rounded-xl border transition-all ${
                includeSampleBottle 
                  ? 'bg-[#FAF7F2] border-[#B3874B] ring-1 ring-[#B3874B]/30' 
                  : 'bg-white border-[#EAE3D6] hover:border-[#D8C7A5]'
              }`}>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSampleBottle}
                    onChange={(e) => setIncludeSampleBottle(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B3874B] focus:ring-[#B3874B] border-stone-300 cursor-pointer accent-[#B3874B] shrink-0"
                  />
                  
                  {/* Small 2ml Sample Image Thumbnail */}
                  <div className="relative w-10 h-10 rounded-lg bg-gradient-to-b from-[#FAF7F2] to-[#F2EADB] border border-[#DFCBB0] flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <img
                      src={getImageUrl(currentMainImage)}
                      alt="2ml Sample Vial"
                      className="w-full h-full object-contain p-0.5"
                      onError={(e) => { e.currentTarget.src = '/images/perfumes/signature_collection.jpg'; }}
                    />
                    <span className="absolute bottom-0 right-0 bg-[#1B100A] text-[#FAF7F2] text-[7px] font-mono font-bold px-1 rounded-tl">
                      2ml
                    </span>
                  </div>

                  {/* Professional & Concise Copy */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className="text-xs font-serif font-bold text-[#1B100A] flex items-center gap-1.5">
                        <span>Add Companion 2ml Sample</span>
                        <span className="text-[11px] font-mono font-bold text-[#B3874B]">
                          +₹{samplePrice.toLocaleString('en-IN')}
                        </span>
                      </span>
                      <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full shrink-0">
                        ★ 7-Day Return Guarantee
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 m-0 leading-tight mt-0.5">
                      {includeSampleBottle 
                        ? 'Test scent at home first • Keep main bottle sealed for 100% full refund'
                        : 'Enables 7-day return guarantee & dispatch cancellation'}
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Action Buttons: Add to Cart and Buy Now */}
            <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
              {isInCart ? (
                <button
                  type="button"
                  onClick={() => router.push('/cart')}
                  className="flex-1 bg-[#18110D] hover:bg-black text-[#ECC880] border border-[#18110D] py-2.5 sm:py-3 px-5 rounded-full flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer font-serif uppercase tracking-widest text-xs"
                >
                  <ShoppingBag size={14} className="text-[#ECC880]" />
                  <span>View Cart</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={isOutOfStock || isAddingToCart}
                  className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white py-2.5 sm:py-3 px-5 rounded-full flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer font-serif uppercase tracking-widest text-xs"
                >
                  <ShoppingBag size={14} />
                  <span>{isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={isOutOfStock || isAddingToCart}
                className="flex-1 bg-[#FAF8F5] hover:bg-black hover:text-white disabled:bg-gray-100 disabled:text-gray-400 text-black border border-black py-2.5 sm:py-3 px-5 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer font-serif uppercase tracking-widest text-xs"
              >
                <span>Instant Checkout</span>
              </button>
            </div>

            {/* Trust Badges - Ultra Compact */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
              <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-[#FAF9F7]">
                <Truck size={13} className="text-[#B8860B] shrink-0" />
                <span className="text-[10px] font-semibold text-gray-700">Express Delivery</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-[#FAF9F7]">
                <ShieldCheck size={13} className="text-[#B8860B] shrink-0" />
                <span className="text-[10px] font-semibold text-gray-700">Artisanal Extract</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-xl bg-[#FAF9F7]">
                <RotateCcw size={13} className="text-[#B8860B] shrink-0" />
                <span className="text-[10px] font-semibold text-gray-700">Luxury Coffret</span>
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

      <Footer />
    </div>
  );
};

export default ProductDetails;
