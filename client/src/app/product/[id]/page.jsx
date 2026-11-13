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
  ChevronDown,
  Check, 
  ArrowLeft,
  PackageOpen,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Maximize2,
  Zap,
  Leaf,
  Gem,
  FlaskConical,
  Gift,
  X
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import ProductReviews from '@/components/product/ProductReviews';
import ReturnPolicyModal from '@/components/product/ReturnPolicyModal';
import FlaconFormatSelector from '@/components/product/FlaconFormatSelector';
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
  const [isZoomOpen, setIsZoomOpen] = useState(false);

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
      if (typeof window !== 'undefined' && !authService.isAuthenticated()) {
        setIsWishlisted(false);
        return;
      }
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
    window.addEventListener('authChange', checkWishlist);
    return () => {
      window.removeEventListener('wishlistChange', checkWishlist);
      window.removeEventListener('authChange', checkWishlist);
    };
  }, [product]);

  const toggleWishlist = () => {
    if (!product) return;

    if (!authService.isAuthenticated()) {
      message.info('Please sign in to save fragrances to your wishlist.');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

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

  const displayThumbnails = useMemo(() => {
    if (validImages.length > 0) return validImages;
    if (currentMainImage) return [currentMainImage];
    return [];
  }, [validImages, currentMainImage]);

  const handleNextThumbnail = () => {
    if (displayThumbnails.length <= 1) return;
    const currentIdx = displayThumbnails.indexOf(currentMainImage);
    const nextIdx = (currentIdx + 1) % displayThumbnails.length;
    setSelectedImage(displayThumbnails[nextIdx]);
  };

  const scentNotesText = useMemo(() => {
    if (!product) return 'Top notes: Bergamot, Pink Pepper | Heart: Damask Rose | Base: Oud, Ambergris';
    if (product.topNotes || product.heartNotes || product.baseNotes) {
      const parts = [];
      if (product.topNotes) parts.push(`Top notes: ${product.topNotes}`);
      if (product.heartNotes) parts.push(`Heart: ${product.heartNotes}`);
      if (product.baseNotes) parts.push(`Base: ${product.baseNotes}`);
      return parts.join(' | ');
    }
    if (product.fragranceFamily) {
      return `Top notes: Bergamot, Pink Pepper | Heart: ${product.fragranceFamily} | Base: Oud, Ambergris`;
    }
    if (Array.isArray(product.details) && product.details.length > 0) {
      return product.details.slice(0, 3).join(' | ');
    }
    return 'Top notes: Bergamot, Pink Pepper | Heart: Damask Rose | Base: Oud, Ambergris';
  }, [product]);

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

  const sizePricesMap = useMemo(() => {
    if (!product) return {};
    if (product.size_prices && typeof product.size_prices === 'object') {
      return product.size_prices;
    }
    return {};
  }, [product]);

  const sizeOriginalPricesMap = useMemo(() => {
    if (!product) return {};
    if (product.size_original_prices && typeof product.size_original_prices === 'object') {
      return product.size_original_prices;
    }
    return {};
  }, [product]);

  const nonSampleSizes = useMemo(() => {
    return supportedSizes.filter(s => !s.toLowerCase().includes('sample') && !s.toLowerCase().includes('2ml'));
  }, [supportedSizes]);

  const baseBottleSize = useMemo(() => {
    if (selectedSize && !selectedSize.toLowerCase().includes('sample') && !selectedSize.toLowerCase().includes('2ml')) {
      return selectedSize.toUpperCase();
    }
    if (!product) return '50ML';
    const found = nonSampleSizes[0];
    return (found || '50ML').toUpperCase();
  }, [product, nonSampleSizes, selectedSize]);

  // Stock for the base bottle
  const bottleStock = useMemo(() => {
    if (!product) return 0;
    const sizeKeys = Object.keys(availableSizesMap);
    const nonSampleKeys = sizeKeys.filter(k => !k.toLowerCase().includes('sample') && !k.toLowerCase().includes('2ml'));
    const matchingKey = nonSampleKeys.find(k => k.toUpperCase() === baseBottleSize.toUpperCase()) || nonSampleKeys[0];
    if (matchingKey && availableSizesMap[matchingKey] !== undefined) {
      const qty = Number(availableSizesMap[matchingKey]);
      if (qty > 0 || nonSampleKeys.length === 1) return qty;
    }
    if (product.stock !== undefined && product.stock !== null) return Number(product.stock);
    return 99;
  }, [product, baseBottleSize, availableSizesMap]);

  // Stock for 2ml sample
  const sampleStock = useMemo(() => {
    if (!product) return 0;
    const sizeKeys = Object.keys(availableSizesMap);
    const sampleKey = sizeKeys.find(k => k.toLowerCase().includes('sample') || k.toLowerCase().includes('2ml'));
    if (sampleKey && availableSizesMap[sampleKey] !== undefined) {
      return Number(availableSizesMap[sampleKey]);
    }
    if (product.stock !== undefined && product.stock !== null) return Number(product.stock);
    return 99;
  }, [product, availableSizesMap]);

  const maxStockForSize = useMemo(() => {
    if (comboSelection === 'sample') return sampleStock;
    return bottleStock;
  }, [comboSelection, sampleStock, bottleStock]);

  const isOutOfStock = maxStockForSize === 0 || product?.inStock === false || product?.status === 'Out of Stock';

  const isProductOutOfStock = product?.inStock === false || product?.status === 'Out of Stock' || (bottleStock <= 0 && sampleStock <= 0);
  const isBottleOutOfStock = isProductOutOfStock || bottleStock <= 0;
  const isSampleOutOfStock = isProductOutOfStock || sampleStock <= 0;
  const isComboOutOfStock = isBottleOutOfStock || isSampleOutOfStock;

  // Pricing calculations based on bottle size / quantity
  const samplePrice = product?.samplePrice !== undefined && product?.samplePrice !== null ? Number(product.samplePrice) : 199;
  
  const basePrice = useMemo(() => {
    if (!product) return 0;
    if (selectedSize && sizePricesMap[selectedSize] !== undefined) {
      return Number(sizePricesMap[selectedSize]);
    }
    if (selectedSize) {
      const match = Object.keys(sizePricesMap).find(k => k.toLowerCase() === selectedSize.toLowerCase());
      if (match && sizePricesMap[match] !== undefined) {
        return Number(sizePricesMap[match]);
      }
    }
    return Number(product.price) || 0;
  }, [product, selectedSize, sizePricesMap]);

  const currentUnitPrice = useMemo(() => {
    if (comboSelection === 'sample') return samplePrice;
    if (comboSelection === 'combo') return basePrice + samplePrice;
    return basePrice;
  }, [comboSelection, basePrice, samplePrice]);

  const originalUnitPrice = useMemo(() => {
    let orig = null;
    if (selectedSize && sizeOriginalPricesMap[selectedSize] !== undefined) {
      orig = Number(sizeOriginalPricesMap[selectedSize]);
    } else if (product?.originalPrice) {
      orig = Number(product.originalPrice);
    }
    if (!orig || isNaN(orig)) return null;
    if (comboSelection === 'sample') return null;
    if (comboSelection === 'combo') {
      const origCombo = orig + samplePrice;
      const currentCombo = basePrice + samplePrice;
      return origCombo > currentCombo ? origCombo : null;
    }
    return orig > basePrice ? orig : null;
  }, [comboSelection, product, selectedSize, sizeOriginalPricesMap, basePrice, samplePrice]);

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
      <div className="min-h-screen bg-[#FAF9F7] font-sans pt-20 sm:pt-22">
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
    <div className="min-h-screen bg-[#FAF9F7] font-sans text-[#1A1A1A] pt-20 sm:pt-24 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[11px] text-stone-500 mb-3 sm:mb-4">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} className="text-stone-400" />
          <Link href="/shop" className="hover:text-black transition-colors">Collections</Link>
          <ChevronRight size={10} className="text-stone-400" />
          <span className="text-[#1A120B] font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Hero Product Showcase Grid - Single-Window Compact Atelier Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT: Image Gallery Showcase & Feature Badges */}
          <div className="lg:col-span-6 xl:col-span-6">
            
            {/* Gallery: Responsive Layout (Full-width Main Image + Horizontal Thumbnails on Mobile, Vertical Strip on Desktop) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3.5 items-start">
              
              {/* Thumbnail Strip: Only show if there are 2 or more angles/images */}
              {displayThumbnails.length > 1 && (
                <div className="order-2 sm:order-1 flex flex-row sm:flex-col gap-2 sm:gap-2.5 w-full sm:w-16 shrink-0 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 justify-center sm:justify-start custom-scrollbar">
                  {displayThumbnails.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white p-1 transition-all duration-200 border-2 shrink-0 cursor-pointer ${
                        currentMainImage === img ? 'border-[#B8860B] ring-1 ring-[#B8860B]/40 shadow-xs' : 'border-[#ECE7DE] hover:border-stone-400 opacity-80 hover:opacity-100'
                      }`}
                      title={`View angle ${idx + 1}`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} thumbnail ${idx + 1}`} 
                        className="w-full h-full object-contain"
                        onError={() => handleImageError(img)}
                      />
                    </button>
                  ))}

                  {/* Down Chevron / Next image scroll button (desktop only) */}
                  {displayThumbnails.length > 1 && (
                    <button
                      type="button"
                      onClick={handleNextThumbnail}
                      className="hidden sm:flex w-14 h-7 sm:w-16 sm:h-7 rounded-lg border border-[#E8DFC9] bg-white hover:bg-stone-50 items-center justify-center text-stone-500 hover:text-stone-900 transition-colors cursor-pointer shadow-2xs"
                      title="Next view"
                      aria-label="Next view"
                    >
                      <ChevronDown size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Primary Main Image Container - Full width on mobile */}
              <div className="order-1 sm:order-2 relative w-full flex-1 rounded-2xl sm:rounded-3xl bg-[#F6F2EA] border border-[#E8DFC9] h-[320px] sm:h-[420px] lg:h-[440px] flex items-center justify-center overflow-hidden shadow-2xs group">
                {currentMainImage ? (
                  <img
                    src={currentMainImage}
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-md p-3 sm:p-4 select-none transition-transform duration-500 group-hover:scale-105"
                    onError={() => handleImageError(currentMainImage)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none">
                    <div className="w-16 h-16 rounded-2xl bg-[#FAF3E0] border border-[#E0D0A5] flex items-center justify-center mb-3 shadow-2xs">
                      <Sparkles size={26} strokeWidth={1.5} className="text-[#B8860B]" />
                    </div>
                    <span className="text-[9.5px] uppercase font-bold tracking-[0.24em] text-[#8C6D1F] mb-1">
                      ROVE & AMBER • ATELIER
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl text-[#1A120B] font-normal max-w-xs leading-snug">
                      {product.name}
                    </h3>
                    <span className="text-xs text-stone-500 font-light mt-1">
                      {product.category || product.category_name || 'Fine Fragrance Extrait'}
                    </span>
                  </div>
                )}

                {/* Category / Concentration Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="bg-white/95 backdrop-blur-md text-[#8C6D1F] border border-[#E0D8CA] text-[9.5px] uppercase font-bold tracking-[0.16em] px-3 py-0.5 rounded-full shadow-2xs">
                    {product.category || product.category_name || 'Eau de Parfum'}
                  </span>
                </div>

                {/* Wishlist Button on Main Image */}
                <button
                  type="button"
                  onClick={toggleWishlist}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                    isWishlisted 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'bg-white text-stone-600 hover:text-black hover:scale-105 border border-[#EFECE6]'
                  }`}
                >
                  <Heart size={15} className={isWishlisted ? 'fill-red-600 text-red-600' : 'text-stone-600'} />
                </button>

                {/* Zoom / Fullscreen Button on Main Image */}
                {currentMainImage && (
                  <button
                    type="button"
                    onClick={() => setIsZoomOpen(true)}
                    aria-label="Enlarge image"
                    className="absolute bottom-3.5 right-3.5 z-10 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-black border border-[#EFECE6] flex items-center justify-center transition-all shadow-xs cursor-pointer hover:scale-105"
                  >
                    <Maximize2 size={13} />
                  </button>
                )}

                {/* Low Stock Indicator */}
                {!isOutOfStock && maxStockForSize <= 5 && maxStockForSize > 0 && (
                  <div className="absolute bottom-3.5 left-3.5 bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                    Only {maxStockForSize} flacons remaining
                  </div>
                )}
              </div>
            </div>

            {/* 4 Feature Badges Underneath Image (2x2 on mobile, 4 columns on desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 pt-3 border-t border-stone-200/60 mt-3 text-stone-700">
              <div className="flex items-center gap-2">
                <Leaf size={16} strokeWidth={1.5} className="text-[#8C6D1F] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block text-stone-800">Long-Lasting</span>
                  <span className="text-stone-400 font-normal">(8–10 Hours)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gem size={16} strokeWidth={1.5} className="text-[#8C6D1F] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block text-stone-800">Premium</span>
                  <span className="text-stone-400 font-normal">Ingredients</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FlaskConical size={16} strokeWidth={1.5} className="text-[#8C6D1F] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block text-stone-800">IFRA</span>
                  <span className="text-stone-400 font-normal">Compliant</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gift size={16} strokeWidth={1.5} className="text-[#8C6D1F] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block text-stone-800">Complimentary</span>
                  <span className="text-stone-400 font-normal">Sample</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Purchasing Information - Compact, Breathing Luxury Layout */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-3 lg:space-y-3.5">
            
            {/* 1. Brand Tagline & Stock Status Badge */}
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A67C38] flex items-center gap-1.5 min-w-0">
                <span className="w-3.5 h-[1px] bg-[#A67C38] shrink-0" />
                <span className="truncate">ROVE & AMBER • HAUTE PARFUMERIE</span>
              </span>

              {/* Stock Indicator */}
              {isOutOfStock ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 shrink-0 whitespace-nowrap">
                  Currently Unavailable
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>In Stock • Dispatched within 24h</span>
                </span>
              )}
            </div>

            {/* 2. Flacon Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-serif text-[#170E08] font-normal leading-tight tracking-tight m-0">
              {product.name}
            </h1>

            {/* 3. Star Rating & Review Link */}
            <div className="flex items-center gap-2">
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
                <span className="font-bold text-[#170E08] text-xs font-sans">{product.rating || 4.8}</span>
                <span className="text-stone-400 text-xs font-sans">({product.reviewsCount || 0} reviews)</span>
                <span className="text-[11px] text-[#A67C38] underline font-medium ml-1 group-hover:text-black transition-colors">
                  {product.reviewsCount > 0 ? 'Read reviews' : 'Write a review'}
                </span>
              </button>
            </div>

            {/* 4. Price & Courier Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap py-0.5 border-y border-[#ECE7DE]/80">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl lg:text-[28px] font-sans font-bold text-[#140D07] tracking-tight">
                  ₹{currentUnitPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-500 font-light">
                  (Incl. of all taxes)
                </span>
                {originalUnitPrice && discountPercent && discountPercent > 0 && (
                  <span className="text-[10px] font-bold text-[#8C6D1F] bg-[#FAF3E0] border border-[#E0D0A5] px-2 py-0.5 rounded-full font-sans">
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-600 font-medium">
                <Truck size={14} className="text-stone-500 shrink-0" />
                <span className="hidden sm:inline">Complimentary White-Glove Courier Included</span>
                <span className="sm:hidden">Complimentary Courier Included</span>
              </div>
            </div>

            {/* 5. Olfactory Notes Single-Line */}
            <div className="flex items-center gap-2 text-xs text-stone-600 py-0.5">
              <Leaf size={14} className="text-[#8C6D1F] shrink-0" />
              <span className="line-clamp-2 sm:line-clamp-1">
                {scentNotesText}
              </span>
            </div>

            {/* 5b. Flacon Size / Quantity Variants (if multiple bottle sizes exist) */}
            {nonSampleSizes.length > 1 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#170E08]">
                    Select Bottle Size / Quantity
                  </span>
                  <span className="text-[11px] font-mono text-[#8C6D1F] font-semibold">
                    ₹{basePrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {nonSampleSizes.map((s) => {
                    const isSelected = (selectedSize || nonSampleSizes[0] || '').toLowerCase() === s.toLowerCase();
                    const sizeStock = availableSizesMap[s] !== undefined ? Number(availableSizesMap[s]) : 10;
                    const sPrice = sizePricesMap[s] !== undefined ? Number(sizePricesMap[s]) : (Number(product.price) || 0);
                    const isSoldOut = sizeStock <= 0;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-sans transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected 
                            ? 'bg-[#1C120C] text-[#ECC880] border-[#1C120C] font-bold shadow-xs' 
                            : isSoldOut 
                              ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed line-through' 
                              : 'bg-white text-stone-700 border-[#ECE7DE] hover:border-stone-400 font-medium'
                        }`}
                      >
                        <span>{s}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-[#ECC880]/80' : 'text-stone-400'}`}>
                          ₹{sPrice.toLocaleString('en-IN')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Select Flacon & Trial Format Selector */}
            <FlaconFormatSelector
              comboSelection={comboSelection}
              setComboSelection={setComboSelection}
              basePrice={basePrice}
              samplePrice={samplePrice}
              baseBottleSize={baseBottleSize}
              onOpenReturnPolicy={() => setShowReturnPolicyModal(true)}
              isOutOfStock={isOutOfStock}
              isProductOutOfStock={isProductOutOfStock}
              isComboOutOfStock={isComboOutOfStock}
              isBottleOutOfStock={isBottleOutOfStock}
              isSampleOutOfStock={isSampleOutOfStock}
            />

            {/* 8. Action Row (Above the Fold): Stepper + Add to Cart / Out of Stock + Wishlist */}
            <div className="pt-1.5 flex items-center gap-2 sm:gap-3">
              {/* Stepper */}
              <div className={`inline-flex items-center border rounded-xl h-11 px-1 sm:px-1.5 shrink-0 transition-opacity ${
                isOutOfStock ? 'bg-[#ECE7DE]/50 border-stone-200 opacity-60 cursor-not-allowed' : 'bg-[#F5F2EB] border-[#E0D8CA]'
              }`}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center hover:bg-white text-stone-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus size={12} />
                </button>
                <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-bold text-[#140D07] font-sans">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxStockForSize, quantity + 1))}
                  disabled={quantity >= maxStockForSize || isOutOfStock}
                  aria-label="Increase quantity"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center hover:bg-white text-stone-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Primary CTA: Add to Cart / Out of Stock */}
              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="flex-1 h-11 bg-[#ECE7DE] text-stone-400 border border-[#DDD5C7] rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-none cursor-not-allowed uppercase tracking-wider text-[11px] sm:text-xs font-bold font-sans px-2 select-none"
                >
                  <ShoppingBag size={14} className="text-stone-400 shrink-0 opacity-60" />
                  <span>Out of Stock</span>
                </button>
              ) : isInCart ? (
                <button
                  type="button"
                  onClick={() => router.push('/cart')}
                  className="flex-1 h-11 bg-[#1C120C] hover:bg-black text-[#ECC880] rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer uppercase tracking-wider text-[11px] sm:text-xs font-bold font-sans px-2"
                >
                  <ShoppingBag size={14} className="text-[#ECC880] shrink-0" />
                  <span>View in Bag</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={isAddingToCart}
                  className="flex-1 h-11 bg-[#1C120C] hover:bg-black disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer uppercase tracking-wider text-[11px] sm:text-xs font-bold font-sans group px-2"
                >
                  <ShoppingBag size={14} className="text-white group-hover:scale-110 transition-transform shrink-0" />
                  <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>
              )}

              {/* Secondary CTA: Wishlist */}
              <button
                type="button"
                onClick={toggleWishlist}
                className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-[0.99] cursor-pointer uppercase tracking-wider text-[11px] sm:text-xs font-bold font-sans shadow-2xs px-2 border ${
                  isWishlisted
                    ? 'bg-[#FAF3E0] border-[#B8860B] text-[#8C6D1F]'
                    : 'bg-white hover:bg-stone-50 border-[#1C120C] text-[#1C120C]'
                }`}
                title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart
                  size={14}
                  className={`shrink-0 transition-colors ${
                    isWishlisted ? 'fill-red-600 text-red-600' : 'text-current'
                  }`}
                />
                <span>{isWishlisted ? 'In Wishlist' : 'Wishlist'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Fullscreen Image Preview Lightbox */}
        {isZoomOpen && currentMainImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsZoomOpen(false)}
          >
            <div 
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-4 sm:p-6 overflow-hidden flex flex-col items-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close image preview"
              >
                <X size={18} />
              </button>
              <img
                src={currentMainImage}
                alt={product.name}
                className="max-h-[75vh] w-auto object-contain select-none"
              />
              <div className="mt-3 text-center">
                <h4 className="font-serif text-lg text-stone-900">{product.name}</h4>
                <span className="text-xs text-stone-500 font-sans">{product.category || 'Fine Fragrance Extrait'}</span>
              </div>
            </div>
          </div>
        )}

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
