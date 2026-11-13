"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { Heart, Star, ShoppingBag, Sparkles } from 'lucide-react';
import { getImageUrl } from '../../utils/imageHelper';
import { cartService } from '../../services/cartService';
import authService from '../../services/authService';

const ProductCard = ({ product, onQuickView }) => {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const productId = product ? (product._id || product.id) : null;

  // Check wishlist state from localStorage and listen to wishlistChange
  useEffect(() => {
    if (!productId) return;
    const checkWishlist = () => {
      if (typeof window !== 'undefined' && !authService.isAuthenticated()) {
        setIsWishlisted(false);
        return;
      }
      try {
        const stored = localStorage.getItem('rove_amber_wishlist');
        if (stored) {
          const list = JSON.parse(stored);
          setIsWishlisted(list.includes(productId));
        } else {
          setIsWishlisted(false);
        }
      } catch (err) {
        console.warn('Could not read wishlist', err);
      }
    };

    checkWishlist();
    window.addEventListener('wishlistChange', checkWishlist);
    window.addEventListener('authChange', checkWishlist);
    return () => {
      window.removeEventListener('wishlistChange', checkWishlist);
      window.removeEventListener('authChange', checkWishlist);
    };
  }, [productId]);

  // Check if item is in cart and listen to cartChange and authChange
  useEffect(() => {
    if (!productId) return;
    const checkCartState = () => {
      setIsInCart(cartService.isInCart(productId));
    };

    checkCartState();
    window.addEventListener('cartChange', checkCartState);
    window.addEventListener('authChange', checkCartState);
    return () => {
      window.removeEventListener('cartChange', checkCartState);
      window.removeEventListener('authChange', checkCartState);
    };
  }, [productId]);

  if (!product) return null;

  // Identify stock status without inventing numbers
  const stock = product.stock !== undefined ? product.stock : (product.countInStock !== undefined ? product.countInStock : null);
  const isOutOfStock = stock === 0 || product.inStock === false || product.status === 'Out of Stock';
  const isLowStock = stock !== null && stock > 0 && stock <= 5;

  // Pricing
  const price = Number(product.price) || 0;
  const originalPrice = product.originalPrice && Number(product.originalPrice) > price ? Number(product.originalPrice) : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

  // Product Display Names & Images
  const displayName = product.name || 'Signature Fragrance';
  const displayCategory = product.category_name || product.category || 'Eau de Parfum';

  const images = product.images && product.images.length > 0 
    ? product.images.map(img => getImageUrl(img.url || img)).filter(u => Boolean(u) && !u.includes('no-image'))
    : (product.image ? [getImageUrl(product.image)] : []);

  const imageUrl = images[0] || null;

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authService.isAuthenticated()) {
      message.info('Please sign in to save fragrances to your wishlist.');
      router.push(`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/wishlist')}`);
      return;
    }

    try {
      const stored = localStorage.getItem('rove_amber_wishlist');
      let list = stored ? JSON.parse(stored) : [];

      if (list.includes(productId)) {
        list = list.filter(item => item !== productId);
        setIsWishlisted(false);
        message.info(`Removed ${displayName} from wishlist`);
      } else {
        list.push(productId);
        setIsWishlisted(true);
        message.success(`Saved ${displayName} to wishlist`);
      }
      localStorage.setItem('rove_amber_wishlist', JSON.stringify(list));
      window.dispatchEvent(new Event('wishlistChange'));
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (!authService.isAuthenticated()) {
      message.info('Please sign in to add fragrances to your shopping bag.');
      router.push('/login?redirect=/cart');
      return;
    }

    setIsAdding(true);
    try {
      cartService.addToCart({
        id: productId,
        productId: productId,
        name: displayName,
        price: price,
        image: imageUrl,
        size: product.sizes?.[0] || '50ml',
        quantity: 1,
        maxStock: stock !== null ? stock : 99
      });
      setIsInCart(true);
      message.success(`${displayName} added to your shopping bag`);
    } catch (err) {
      console.error('Add to cart error:', err);
      message.error('Could not add to cart');
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white border border-[#F0EBE1] hover:border-[#D4AF37]/50 hover:shadow-md transition-all duration-300 p-2.5 sm:p-4 text-center rounded-sm">
      
      {/* Top Action Badge & Wishlist Heart */}
      <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between z-10 pointer-events-none">
        {/* Discount Badge (only if actual discount exists) */}
        {discountPercent ? (
          <span className="bg-[#B8860B] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs pointer-events-auto">
            Save {discountPercent}%
          </span>
        ) : isLowStock ? (
          <span className="bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] text-[9px] font-semibold tracking-wider px-2 py-0.5 rounded-full pointer-events-auto">
            Only {stock} left
          </span>
        ) : <div />}

        {/* Wishlist Action Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-2xs pointer-events-auto cursor-pointer ${
            isWishlisted 
              ? 'bg-red-50 text-red-600 border border-red-200' 
              : 'bg-white/90 text-gray-500 hover:text-black hover:bg-white border border-[#EFECE6]'
          }`}
        >
          <Heart 
            size={14} 
            className={isWishlisted ? 'fill-red-600 text-red-600' : 'text-gray-500'} 
          />
        </button>
      </div>

      {/* Top Clickable Area: Image, Category, Title, Rating, Price */}
      <Link 
        href={`/product/${productId}`} 
        className="flex flex-col items-center cursor-pointer flex-1"
      >
        {/* Product Image Container */}
        <div className="relative w-full aspect-square bg-[#FAF9F7] flex items-center justify-center p-3 sm:p-6 overflow-hidden transition-all duration-300 group-hover:bg-[#F5F2EB] rounded-xs">
          {!imageError && imageUrl ? (
            <img 
              src={imageUrl} 
              alt={displayName} 
              className="w-full h-full object-contain object-center drop-shadow-md transition-transform duration-500 ease-out group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-[#FAF8F5] via-[#FFFDF9] to-[#F5ECE0] select-none">
              <div className="w-12 h-12 rounded-xl bg-[#FAF3E0] border border-[#E0D0A5] flex items-center justify-center mb-2 shadow-2xs">
                <Sparkles size={18} strokeWidth={1.5} className="text-[#B8860B]" />
              </div>
              <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-[#8C6D1F]">
                ROVE & AMBER
              </span>
              <span className="font-serif text-xs text-black font-normal mt-0.5 line-clamp-1">
                {displayName}
              </span>
            </div>
          )}
        </div>

        {/* Product Metadata */}
        <div className="w-full flex flex-col items-center mt-2.5 sm:mt-3 px-1">
          {/* Category Label in Gold Serif */}
          <span className="text-[11px] sm:text-xs font-serif text-[#B38738] tracking-wider uppercase line-clamp-1">
            {displayCategory}
          </span>

          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-serif font-bold text-[#1A1A1A] group-hover:text-[#B86526] transition-colors mt-0.5 line-clamp-1">
            {displayName}
          </h3>

          {/* Rating (only when actual rating data exists) */}
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] text-[#8C827A]">
              <div className="flex items-center text-amber-500">
                <Star size={11} className="fill-amber-400 text-amber-400" />
              </div>
              <span className="font-semibold text-gray-800">{product.rating}</span>
              {product.reviewsCount !== undefined && (
                <span className="text-gray-400">({product.reviewsCount})</span>
              )}
            </div>
          )}

          {/* Pricing Row */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs sm:text-sm font-sans font-bold text-[#1A1A1A]">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {originalPrice && (
              <span className="text-[11px] sm:text-xs font-sans text-gray-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Button: ADD TO CART or OUT OF STOCK */}
      <div className="w-full mt-3 pt-1">
        {isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full py-2 sm:py-2.5 px-2 text-[10px] sm:text-xs font-serif uppercase tracking-widest text-gray-400 border border-gray-200 bg-gray-50 cursor-not-allowed rounded-none"
          >
            Out of Stock
          </button>
        ) : isInCart ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push('/cart');
            }}
            className="w-full py-2 sm:py-2.5 px-2 text-[10px] sm:text-xs font-serif uppercase tracking-widest text-[#ECC880] border border-[#18110D] bg-[#18110D] hover:bg-black hover:border-black active:scale-[0.98] transition-all cursor-pointer rounded-none flex items-center justify-center gap-1.5 shadow-xs"
          >
            <ShoppingBag size={13} className="text-[#ECC880]" />
            <span>View Cart</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full py-2 sm:py-2.5 px-2 text-[10px] sm:text-xs font-serif uppercase tracking-widest text-black border border-black hover:bg-black hover:text-white active:scale-[0.98] transition-all cursor-pointer bg-white rounded-none flex items-center justify-center gap-1.5"
          >
            <ShoppingBag size={13} />
            <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
