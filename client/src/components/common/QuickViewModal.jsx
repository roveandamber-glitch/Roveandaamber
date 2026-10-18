"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, ArrowRight, ShieldCheck, Truck, Droplets } from 'lucide-react';
import { getImageUrl } from '../../utils/imageHelper';
import orderService from '../../services/orderService';
import cartService from '../../services/cartService';
import { message } from 'antd';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('50ml');
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      const sizeMap = product.sizes_stock || {};
      const firstInStockSize = Object.keys(sizeMap).find(s => sizeMap[s] > 0) || product.sizes?.[0] || '50ml';
      setSelectedSize(firstInStockSize);
      
      const initialStock = sizeMap[firstInStockSize] ?? product.stock ?? 1;
      setQuantity(initialStock > 0 ? 1 : 0);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0 
    ? product.images.map(img => getImageUrl(img.url || img))
    : [getImageUrl(product.image || '/images/perfumes/amber_oud_perfume.jpg')];

  const availableSizesMap = product.sizes_stock || {};
  const currentSizeStock = availableSizesMap[selectedSize] ?? product.stock ?? 10;

  const handleSizeSelect = (sz) => {
    const stockForSize = availableSizesMap[sz] ?? product.stock ?? 10;
    if (stockForSize <= 0) return;
    
    setSelectedSize(sz);
    if (quantity > stockForSize) {
      setQuantity(stockForSize);
      message.info(`Quantity adjusted to ${stockForSize} for ${sz}`);
    } else if (quantity < 1 && stockForSize > 0) {
      setQuantity(1);
    }
  };

  const handleQuickOrder = async () => {
    if (currentSizeStock < quantity) {
      message.warning(`Only ${currentSizeStock} available in ${selectedSize}`);
      return;
    }

    setOrdering(true);
    try {
      const response = await orderService.createOrder({
        productId: product._id || product.id,
        size: selectedSize || '50ml',
        quantity,
        customerName: 'Direct Customer',
        phone: 'Contact upon delivery',
        address: 'Direct Express Delivery'
      });

      if (response.success) {
        message.success(`Order placed successfully! Order ID: ${response.data?.orderId || response.data?.id}`);
        onClose();
      } else {
        message.error(response.message || 'Failed to place order.');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Error placing order.');
    } finally {
      setOrdering(false);
    }
  };

  const handleAddToCart = () => {
    if (currentSizeStock <= 0 || quantity <= 0) return;
    cartService.addToCart({
      productId: product._id || product.id,
      name: product.name,
      price: product.price,
      image: images[0] || product.image,
      size: selectedSize,
      quantity: quantity,
      maxStock: currentSizeStock
    });
    message.success(`Added ${product.name} (${selectedSize}) to bag`);
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-[#FBF9F5] rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl z-10 border border-white/40 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white/80 hover:bg-black hover:text-white transition-colors duration-200 text-gray-700 shadow-sm cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
          {/* Media Column */}
          <div className="flex flex-col space-y-4">
            {/* Big Preview */}
            <div className="relative bg-[#EFE8DC] rounded-2xl aspect-[3/4] p-5 flex items-center justify-center overflow-hidden shadow-inner border border-[#E8E2D6]/60">
              <img 
                src={images[selectedImage]} 
                alt={product.name} 
                className="w-full h-full object-cover object-center rounded-xl transition-all duration-300"
                onError={(e) => {
                  e.target.src = '/images/perfumes/amber_oud_perfume.jpg';
                }}
              />
              <div className="absolute bottom-3 left-3 bg-[#3B1D11]/90 backdrop-blur-md text-[#D4AF37] text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full border border-[#D4AF37]/30">
                {product.category || 'Eau de Parfum'}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-[#EFE8DC] flex-shrink-0 cursor-pointer ${
                      selectedImage === idx ? 'border-[#B86526] scale-102 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B86526] font-bold block mb-2">
                {product.category || 'ROVE & AMBER'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-black font-normal mb-2 leading-tight">
                {product.name}
              </h2>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-4 mb-4 pb-4 border-b border-gray-200">
                <span className="text-2xl font-bold text-[#1A1A1A]">
                  ₹{(product.price || 0).toLocaleString('en-IN')}
                </span>
                {currentSizeStock > 0 ? (
                  <span className="text-xs text-emerald-800 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {currentSizeStock} available in {selectedSize}
                  </span>
                ) : (
                  <span className="text-xs text-red-800 font-semibold bg-red-100 px-2.5 py-0.5 rounded-full">
                    Sold Out in {selectedSize}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed font-light mb-6 line-clamp-3">
                {product.description || 'An artisanal Eau de Parfum master-blended with aged amber, noble wood oils, and rare botanicals.'}
              </p>

              {/* Bottle Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Flacon Size</span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {currentSizeStock > 0 ? `${currentSizeStock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => {
                      const stockForSize = availableSizesMap[sz] ?? product.stock ?? 10;
                      const isOutOfStock = stockForSize <= 0;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleSizeSelect(sz)}
                          disabled={isOutOfStock}
                          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                            selectedSize === sz
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                              : isOutOfStock
                              ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through'
                              : 'bg-white text-gray-800 border-gray-200 hover:border-black cursor-pointer'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Counter & Action Buttons */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold transition-colors cursor-pointer"
                      disabled={quantity <= 1 || currentSizeStock <= 0}
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-black">{currentSizeStock <= 0 ? 0 : quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(currentSizeStock, quantity + 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold transition-colors cursor-pointer"
                      disabled={quantity >= currentSizeStock || currentSizeStock <= 0}
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-bold text-black font-sans">
                    Total: ₹{((product.price || 0) * (currentSizeStock <= 0 ? 0 : quantity)).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={currentSizeStock <= 0 || quantity <= 0}
                    className="w-full bg-[#1A1A1A] text-white hover:bg-black disabled:bg-gray-300 py-3 px-4 rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickOrder}
                    disabled={ordering || currentSizeStock <= 0 || quantity <= 0}
                    className="w-full bg-[#FAF8F5] text-black border border-black hover:bg-black hover:text-white disabled:bg-gray-100 disabled:border-gray-200 py-3 px-4 rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{ordering ? 'Ordering...' : 'Buy Now'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Service Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-500 font-medium">
              <div className="flex flex-col items-center gap-1 bg-white/60 p-2 rounded-xl border border-gray-100">
                <Truck size={14} className="text-[#B86526]" />
                <span>Pan-India Express</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-white/60 p-2 rounded-xl border border-gray-100">
                <Droplets size={14} className="text-[#B86526]" />
                <span>Pure Raw Extractions</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-white/60 p-2 rounded-xl border border-gray-100">
                <ShieldCheck size={14} className="text-[#B86526]" />
                <span>Artisanal Perfumery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
