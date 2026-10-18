"use client";
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ArrowRight,
  CheckCircle2,
  Mail,
  Lock,
  Home,
  PackageCheck
} from 'lucide-react';
import { Modal, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '@/services/productService';
import orderService from '@/services/orderService';
import cartService from '@/services/cartService';
import CartDrawer from '@/components/cart/CartDrawer';
import { getImageUrl } from '@/utils/imageHelper';
import { DUMMY_PRODUCTS } from '@/data/dummyProducts';
import Link from 'next/link';

const ProductDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  
  const initialProduct = DUMMY_PRODUCTS.find(p => String(p._id) === String(id) || String(p.id) === String(id) || p.slug === id) || DUMMY_PRODUCTS[0];
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [orderStage, setOrderStage] = useState('confirm'); // 'confirm' | 'placing' | 'success'
  const [placedOrderData, setPlacedOrderData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const handleAddToCart = () => {
    if (currentSizeStock <= 0 || quantity <= 0) return;
    
    cartService.addToCart({
      productId: product._id || product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      size: selectedSize,
      quantity: quantity,
      maxStock: currentSizeStock
    });

    message.success(`Added ${product.name} (Size ${selectedSize}) to cart`);
    router.push('/cart');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductById(id);
        if (response?.success && response.data) {
          const prod = response.data;
          setProduct(prod);

          const sizeMap = prod.sizes_stock || {};
          const firstInStockSize = Object.keys(sizeMap).find(s => sizeMap[s] > 0) || prod.sizes?.[0] || 'M';
          setSelectedSize(firstInStockSize);

          const initialStock = sizeMap[firstInStockSize] ?? prod.stock ?? 1;
          setQuantity(initialStock > 0 ? 1 : 0);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const availableSizesMap = product?.sizes_stock || { 'S': 5, 'M': 10, 'L': 8, 'XL': 4, 'XXL': 2 };
  const availableSizes = Object.keys(availableSizesMap);
  const currentSizeStock = availableSizesMap[selectedSize] ?? product?.stock ?? 0;

  // Handles size switching and dynamically clamps quantity to the newly selected size's stock
  const handleSizeSelect = (newSize) => {
    const stockForNewSize = availableSizesMap[newSize] ?? 0;
    if (stockForNewSize <= 0) {
      message.warning(`Size ${newSize} is currently out of stock`);
      return;
    }

    setSelectedSize(newSize);

    // Auto-clamp quantity if current quantity exceeds new size's available stock
    if (quantity > stockForNewSize) {
      setQuantity(stockForNewSize);
      message.info(`Quantity adjusted to ${stockForNewSize} (maximum stock available for Size ${newSize})`);
    } else if (quantity < 1 && stockForNewSize > 0) {
      setQuantity(1);
    }
  };

  const handleOpenOrderModal = () => {
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('userToken') || localStorage.getItem('adminToken') || localStorage.getItem('token') || localStorage.getItem('adminKey')) 
      : null;
    
    // If not logged in, trigger the elegant Auth Prompt Popup
    if (!token) {
      setIsAuthPromptOpen(true);
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        setCurrentUser({ email: 'Customer Account' });
      }
    } else {
      setCurrentUser({ email: 'Authenticated Customer' });
    }

    setOrderStage('confirm');
    setIsModalOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (currentSizeStock < quantity) {
      message.error(`Only ${currentSizeStock} available in size ${selectedSize}`);
      return;
    }

    if (quantity <= 0) {
      message.error(`Please select a valid quantity`);
      return;
    }

    // Trigger smooth placing animation
    setOrderStage('placing');

    try {
      // Simulate micro-delay for smooth luxury animation experience
      const [response] = await Promise.all([
        orderService.createOrder({
          productId: product.id || product._id,
          size: selectedSize,
          quantity,
          customerName: currentUser?.name || 'Valued Customer',
          phone: currentUser?.email || ''
        }),
        new Promise(resolve => setTimeout(resolve, 1200))
      ]);

      if (response?.success) {
        setPlacedOrderData(response.data);
        setOrderStage('success');
        
        // Atomically decrement size stock and total stock in local UI
        setProduct(prev => {
          const updatedSizesStock = { ...prev.sizes_stock };
          if (updatedSizesStock[selectedSize] !== undefined) {
            updatedSizesStock[selectedSize] = Math.max(0, updatedSizesStock[selectedSize] - quantity);
          }
          return {
            ...prev,
            stock: Math.max(0, (prev.stock || 0) - quantity),
            sizes_stock: updatedSizesStock
          };
        });
      } else {
        setOrderStage('confirm');
        message.error(response?.message || 'Failed to place order.');
      }
    } catch (err) {
      setOrderStage('confirm');
      message.error(err.response?.data?.message || 'Error placing order. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (orderStage === 'success') {
      setQuantity(1);
      setOrderStage('confirm');
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col items-center justify-center pt-24">
        <Navbar />
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm max-w-md">
          <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
          <p className="text-xs text-gray-500 mb-6">The requested product is temporarily unavailable.</p>
          <Link href="/shop" className="px-6 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider">
            Explore All Collections
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images.map(img => getImageUrl(img.url || img))
    : [getImageUrl(product.image)];

  const mainImage = selectedImage || images[0];
  const totalPrice = (product.price || 0) * quantity;

  return (
    <div className="min-h-screen bg-[#F8F7F4] font-sans text-enva-text pt-24 sm:pt-28 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-gray-500 mb-8">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-black font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Grid: Equal Height Stretch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Product Media Showcase */}
          <div className="lg:col-span-6 flex flex-col h-full space-y-4">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#F3EEE6] to-[#E9E2D5] border border-[#E0D8CA] p-8 flex-1 min-h-[480px] lg:min-h-[580px] flex items-center justify-center overflow-hidden shadow-sm group">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full max-h-[520px] object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  e.target.src = '/images/perfumes/amber_oud_perfume.jpg';
                }}
              />

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-white/90 backdrop-blur-md text-[#3B1D11] border border-[#D4AF37]/40 text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full shadow-xs">
                  {product.category || product.category_name || 'Eau de Parfum'}
                </span>
              </div>

              {currentSizeStock > 0 && currentSizeStock <= 5 && (
                <div className="absolute top-6 right-6 bg-[#3B1D11] text-[#D4AF37] text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full">
                  Only {currentSizeStock} Left in {selectedSize}
                </div>
              )}
            </div>

            {/* Multiple image gallery thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-24 rounded-2xl overflow-hidden bg-[#EFE8DC] p-2 transition-all duration-300 border-2 flex-shrink-0 cursor-pointer ${
                      mainImage === img ? 'border-black shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Purchase Panel */}
          <div className="lg:col-span-6 flex flex-col h-full">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex-1 flex flex-col justify-between space-y-6">
              
              <div className="space-y-6">
                {/* Category & Title */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B86526] block mb-2">
                    {product.category || product.category_name || 'ROVE & AMBER'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-black font-normal leading-tight">
                    {product.name}
                  </h1>
                </div>

                {/* Pricing & Stock Status */}
                <div className="flex flex-wrap items-baseline justify-between gap-3 pt-2 pb-4 border-b border-gray-100">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold font-sans text-black">
                      ₹{(product.price || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-400 font-light">
                      (Incl. of all taxes)
                    </span>
                  </div>

                  {currentSizeStock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {currentSizeStock} available in size {selectedSize}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                      Sold Out in size {selectedSize}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
                  {product.description || 'Crafted with aged amber resins, precious wild oud, and rare botanical essences, designed for lasting sillage and signature presence.'}
                </p>

                {/* Olfactory Notes if present */}
                {product.details && product.details.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B86526] block">
                      Olfactory Composition & Notes
                    </span>
                    <ul className="space-y-1.5">
                      {product.details.map((note, idx) => (
                        <li key={idx} className="text-xs text-gray-700 font-light flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B86526]" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Size Selector with Live Stock Availability */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700">Select Flacon Size</label>
                    <span className="text-[10px] font-semibold text-gray-500">
                      {currentSizeStock > 0 ? `${currentSizeStock} In Stock` : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {availableSizes.map((size) => {
                      const stockForSize = availableSizesMap[size] ?? 0;
                      const isOutOfStock = stockForSize <= 0;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeSelect(size)}
                          disabled={isOutOfStock}
                          className={`h-11 min-w-[52px] px-4 rounded-xl text-xs font-bold transition-all duration-200 border flex flex-col items-center justify-center ${
                            selectedSize === size
                              ? 'bg-black text-white border-black shadow-sm scale-102'
                              : isOutOfStock
                              ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                              : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-black cursor-pointer'
                          }`}
                        >
                          <span>{size}</span>
                          <span className={`text-[8px] font-normal mt-0.5 ${selectedSize === size ? 'text-white/80' : 'text-gray-400'}`}>
                            {isOutOfStock ? '0 qty' : `${stockForSize} qty`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity Selector & Summary */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700 block mb-2.5">Quantity</label>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-full p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-gray-700 transition-colors cursor-pointer"
                        disabled={quantity <= 1 || currentSizeStock <= 0}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-black">{currentSizeStock <= 0 ? 0 : quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(currentSizeStock, quantity + 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-gray-700 transition-colors cursor-pointer"
                        disabled={quantity >= currentSizeStock || currentSizeStock <= 0}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Total Amount</span>
                      <span className="text-sm font-bold text-black font-sans">
                        ₹{(currentSizeStock <= 0 ? 0 : totalPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Add to Cart & Buy Now */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={currentSizeStock <= 0 || quantity <= 0}
                    className="flex-1 bg-black hover:bg-[#262626] active:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 px-5 rounded-full flex items-center justify-center gap-2.5 shadow-md transition-all duration-300 transform active:scale-98 cursor-pointer font-bold text-xs uppercase tracking-[0.16em]"
                  >
                    <ShoppingBag size={15} />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenOrderModal}
                    disabled={currentSizeStock <= 0 || quantity <= 0}
                    className="flex-1 bg-[#FAF8F5] hover:bg-black hover:text-white active:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 text-black border-2 border-black disabled:border-gray-200 py-3.5 px-5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-98 cursor-pointer font-bold text-xs uppercase tracking-[0.16em] group"
                  >
                    <span>Buy Now</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Boutique Trust Pillars */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100 text-center mt-auto">
                <div className="flex flex-col items-center space-y-1.5 p-2.5 rounded-xl bg-gray-50/70">
                  <Truck size={16} className="text-[#B86526]" />
                  <span className="text-[10px] font-semibold text-gray-700 leading-tight">Pan-India Express</span>
                  <span className="text-[9px] text-gray-400">2-4 Business Days</span>
                </div>
                <div className="flex flex-col items-center space-y-1.5 p-2.5 rounded-xl bg-gray-50/70">
                  <ShieldCheck size={16} className="text-[#B86526]" />
                  <span className="text-[10px] font-semibold text-gray-700 leading-tight">Pure Perfume Oils</span>
                  <span className="text-[9px] text-gray-400">20-26% Concentration</span>
                </div>
                <div className="flex flex-col items-center space-y-1.5 p-2.5 rounded-xl bg-gray-50/70">
                  <RotateCcw size={16} className="text-[#B86526]" />
                  <span className="text-[10px] font-semibold text-gray-700 leading-tight">Artisanal Packaging</span>
                  <span className="text-[9px] text-gray-400">Signature Box</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* POPUP 1: Auth Required Prompt Modal (Please Login or Continue to Home) */}
      <Modal
        open={isAuthPromptOpen}
        onCancel={() => setIsAuthPromptOpen(false)}
        footer={null}
        centered
        className="font-sans"
        width={420}
      >
        <div className="p-2 text-center">
          {/* Badge Icon */}
          <div className="w-16 h-16 bg-[#F5F1E9] text-black rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E8E2D6]">
            <Lock size={26} strokeWidth={1.75} />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C827A] block mb-1">
            Authentication Required
          </span>
          <h3 className="text-2xl font-serif font-bold text-black mb-2">Please Sign In</h3>
          <p className="text-xs text-gray-500 mb-5 leading-relaxed">
            Please login to place your order and access personalized delivery tracking from ROVE & AMBER.
          </p>

          {/* Selected Item Mini Recap */}
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D6] flex items-center gap-3 mb-6 text-left">
            <div className="w-12 h-14 bg-white rounded-xl p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-xs font-serif font-bold text-black truncate">{product.name}</h5>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-black bg-white px-1.5 py-0.5 rounded border border-gray-200">
                  Size: {selectedSize}
                </span>
                <span className="text-xs font-bold text-black">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setIsAuthPromptOpen(false);
                router.push(`/login?redirect=/product/${id}`);
              }}
              className="w-full bg-black hover:bg-[#262626] active:bg-black text-white h-12 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Lock size={13} />
              <span>Login to Place Order</span>
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAuthPromptOpen(false);
                router.push('/');
              }}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 h-11 rounded-full font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-gray-200 flex items-center justify-center gap-2"
            >
              <Home size={13} />
              <span>Continue to Home Page</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* POPUP 2: Authenticated Order Confirmation Modal with Smooth Animation */}
      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        closable={orderStage !== 'placing'}
        className="font-sans"
        width={460}
      >
        <AnimatePresence mode="wait">
          {orderStage === 'confirm' && (
            <motion.div
              key="confirm-stage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="pt-2 pb-1"
            >
              {/* Modal Header */}
              <div className="text-center mb-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C827A] block mb-1">
                  Atelier Checkout
                </span>
                <h3 className="text-2xl font-serif font-bold text-black">Confirm Order</h3>
              </div>

              {/* Logged in user email banner */}
              <div className="mb-4 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D6] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                  <Mail size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Account Email</span>
                  <span className="text-xs font-bold text-black truncate block font-mono">
                    {currentUser?.email || 'Authenticated User'}
                  </span>
                </div>
              </div>

              {/* Product and Quantity Summary Card */}
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-6 flex items-center gap-4">
                <div className="w-16 h-20 bg-[#EFE8DC] rounded-xl p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                  <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-serif font-bold text-black truncate mb-1">{product.name}</h4>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold bg-black text-white px-2 py-0.5 rounded-md font-mono">
                      Size: {selectedSize}
                    </span>
                    <span className="text-xs text-gray-600 font-medium">
                      Qty: {quantity}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Amount: <span className="font-bold text-black text-sm font-sans">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmOrder}
                className="w-full bg-black hover:bg-[#262626] active:bg-black text-white h-12 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Confirm & Place Order</span>
                <ArrowRight size={14} />
              </motion.button>
            </motion.div>
          )}

          {orderStage === 'placing' && (
            <motion.div
              key="placing-stage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="py-12 flex flex-col items-center justify-center text-center"
            >
              {/* Elegant pulsating rings animation */}
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full bg-black/10"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-2 border-black/20 border-t-black flex items-center justify-center"
                />
                <ShoppingBag size={22} className="text-black absolute" />
              </div>

              <h4 className="text-lg font-serif font-bold text-black mb-1">Securing Your Order</h4>
              <p className="text-xs text-gray-400 font-light max-w-xs">
                Reserving size {selectedSize} inventory from the atelier...
              </p>
            </motion.div>
          )}

          {orderStage === 'success' && (
            <motion.div
              key="success-stage"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="py-6 flex flex-col items-center text-center"
            >
              {/* Animated Pop-in Success Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', damping: 15, stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-4 shadow-sm"
              >
                <CheckCircle2 size={34} strokeWidth={2.2} />
              </motion.div>

              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-600 block mb-1">
                Order Confirmed
              </span>
              <h3 className="text-2xl font-serif font-bold text-black mb-1">Thank You!</h3>
              <p className="text-xs text-gray-500 mb-4 max-w-xs">
                Your order has been recorded and will be prepared by our atelier.
              </p>

              {/* Order Reference Pill */}
              <div className="bg-[#FAF8F5] border border-[#E8E2D6] px-4 py-2 rounded-xl mb-6">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Order Reference</span>
                <span className="font-mono font-bold text-sm text-black">
                  {placedOrderData?.orderId || `#ORD-${placedOrderData?.id}`}
                </span>
              </div>

              {/* Navigation Options */}
              <div className="w-full space-y-2.5">
                <Link href="/orders" className="block w-full">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full bg-black hover:bg-[#262626] text-white h-11 rounded-full font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <PackageCheck size={14} />
                    <span>View in My Orders</span>
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full bg-transparent hover:bg-gray-50 text-gray-600 h-10 rounded-full font-semibold text-xs cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
};

export default ProductDetails;
