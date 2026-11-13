"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { message } from 'antd';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/common/QuickViewModal';
import { showLuxuryDeleteModal } from '@/components/common';
import productService from '@/services/productService';
import { cartService } from '@/services/cartService';
import authService from '@/services/authService';

import WishlistAuthGate from './components/WishlistAuthGate';
import WishlistHeader from './components/WishlistHeader';
import WishlistEmptyState from './components/WishlistEmptyState';

export default function WishlistPage() {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [unavailableCount, setUnavailableCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  useEffect(() => {
    document.title = 'Your Wishlist | ROVE & AMBER Fine Fragrance';
  }, []);

  // Read saved IDs safely from localStorage
  const getStoredWishlistIds = useCallback(() => {
    if (typeof window === 'undefined') return [];
    if (!authService.isAuthenticated()) return [];
    try {
      const stored = localStorage.getItem('rove_amber_wishlist');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (e) {
      console.warn('Could not read wishlist from localStorage', e);
      return [];
    }
  }, []);

  // Resolve saved IDs strictly against live API catalog
  const loadWishlistItems = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setWishlistProducts([]);
      setSavedIds([]);
      setUnavailableCount(0);
      setLoading(false);
      return;
    }

    const ids = getStoredWishlistIds();
    setSavedIds(ids);

    if (ids.length === 0) {
      setWishlistProducts([]);
      setUnavailableCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    let allCatalogProducts = [];

    try {
      const res = await productService.getAllProducts();
      if (res?.success && Array.isArray(res.data?.products) && res.data.products.length > 0) {
        allCatalogProducts = res.data.products;
      } else if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        allCatalogProducts = res.data;
      } else if (Array.isArray(res) && res.length > 0) {
        allCatalogProducts = res;
      } else {
        allCatalogProducts = [];
      }
    } catch (apiErr) {
      console.warn('Live API unavailable for wishlist resolution:', apiErr);
      allCatalogProducts = [];
    }

    // Resolve IDs against the catalog with deduplication
    const matched = [];
    const missing = [];

    ids.forEach((id) => {
      const found = allCatalogProducts.find(
        (p) => String(p._id || p.id) === String(id)
      );
      if (found) {
        const prodKey = String(found._id || found.id);
        if (!matched.some((m) => String(m._id || m.id) === prodKey)) {
          matched.push(found);
        }
      } else {
        missing.push(id);
      }
    });

    setWishlistProducts(matched);
    setUnavailableCount(missing.length);
    setLoading(false);
  }, [getStoredWishlistIds]);

  // Synchronize with external wishlist changes and verify authentication
  useEffect(() => {
    const verifyAuth = () => {
      if (!authService.isAuthenticated()) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        setIsAuthPromptOpen(true);
        setLoading(false);
        return false;
      }
      setIsAuthenticated(true);
      setIsCheckingAuth(false);
      setIsAuthPromptOpen(false);
      return true;
    };

    if (verifyAuth()) {
      loadWishlistItems();
    }

    const handleWishlistChange = () => {
      if (authService.isAuthenticated()) {
        loadWishlistItems();
      } else {
        setWishlistProducts([]);
        setSavedIds([]);
      }
    };

    const handleAuthChange = () => {
      verifyAuth();
      if (authService.isAuthenticated()) {
        loadWishlistItems();
      } else {
        setWishlistProducts([]);
        setSavedIds([]);
      }
    };

    window.addEventListener('wishlistChange', handleWishlistChange);
    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('wishlistChange', handleWishlistChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [loadWishlistItems]);

  // Clean up any unavailable product IDs from localStorage
  const handleRemoveUnavailable = () => {
    if (typeof window === 'undefined') return;
    try {
      const currentStored = getStoredWishlistIds();
      const validIds = wishlistProducts.map((p) => String(p._id || p.id));
      const cleaned = currentStored.filter((id) => validIds.includes(String(id)));
      
      localStorage.setItem('rove_amber_wishlist', JSON.stringify(cleaned));
      window.dispatchEvent(new Event('wishlistChange'));
      message.success('Unavailable fragrances removed from wishlist');
    } catch (e) {
      console.error('Error cleaning up wishlist:', e);
    }
  };

  // Add all in-stock wishlist items to shopping cart
  const handleAddAllToCart = () => {
    if (!authService.isAuthenticated()) {
      message.info('Please sign in to move fragrances to your shopping bag.');
      router.push('/login?redirect=/cart');
      return;
    }
    const inStockItems = wishlistProducts.filter((p) => {
      const stock = p.stock !== undefined ? p.stock : (p.countInStock !== undefined ? p.countInStock : 99);
      return stock > 0 && p.inStock !== false && p.status !== 'Out of Stock';
    });

    if (inStockItems.length === 0) {
      message.warning('All saved fragrances are currently out of stock.');
      return;
    }

    setIsAddingAll(true);
    let addedCount = 0;

    try {
      inStockItems.forEach((product) => {
        const productId = product._id || product.id;
        const displayName = product.name || 'Signature Fragrance';
        const price = Number(product.price) || 0;
        const imageUrl = product.images?.[0]?.url || product.image || '/images/perfumes/amber_oud_perfume.jpg';
        const defaultSize = product.sizes?.[0] || '50ML';
        const stock = product.stock !== undefined ? product.stock : 99;

        cartService.addToCart({
          id: productId,
          productId: productId,
          name: displayName,
          price: price,
          image: imageUrl,
          size: defaultSize,
          quantity: 1,
          maxStock: stock
        });
        addedCount += 1;
      });

      message.success(`Added ${addedCount} saved ${addedCount === 1 ? 'fragrance' : 'fragrances'} to your shopping bag.`);
    } catch (err) {
      console.error('Add all to cart error:', err);
      message.error('Could not add some items to the cart');
    } finally {
      setTimeout(() => setIsAddingAll(false), 500);
    }
  };

  // Clear all items from wishlist
  const handleClearWishlist = () => {
    showLuxuryDeleteModal({
      title: 'Clear Saved Fragrances',
      itemType: 'all items in your wishlist',
      description: 'Are you sure you want to remove all saved fragrances from your private atelier wishlist?',
      confirmText: 'Clear Wishlist',
      cancelText: 'Keep Wishlist',
      onConfirm: () => {
        try {
          localStorage.setItem('rove_amber_wishlist', JSON.stringify([]));
          window.dispatchEvent(new Event('wishlistChange'));
          message.info('Your wishlist has been cleared');
        } catch (e) {
          console.error('Clear wishlist error:', e);
        }
      }
    });
  };

  // -------------------------------------------------------------
  // RENDER: STRICT AUTHENTICATION GATE (UNAUTHENTICATED PATRON)
  // -------------------------------------------------------------
  if (isCheckingAuth || !isAuthenticated) {
    return (
      <WishlistAuthGate
        isOpen={isAuthPromptOpen}
        onOpenModal={() => setIsAuthPromptOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col justify-between selection:bg-[#B8860B] selection:text-white">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 md:pt-32 pb-24 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <WishlistHeader
            savedCount={savedIds.length}
            loading={loading}
            hasItems={wishlistProducts.length > 0}
            onAddAll={handleAddAllToCart}
            isAddingAll={isAddingAll}
            onClear={handleClearWishlist}
            unavailableCount={unavailableCount}
            onRemoveUnavailable={handleRemoveUnavailable}
          />

          {/* Main Content Area */}
          {loading ? (
            /* Loading Skeleton Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="bg-white border border-[#F0EBE1] p-4 rounded-sm animate-pulse flex flex-col items-center space-y-4"
                >
                  <div className="w-full aspect-[4/5] bg-[#F3EDE2] rounded-xs" />
                  <div className="w-16 h-3 bg-[#E8DFC9] rounded" />
                  <div className="w-32 h-4 bg-[#E8DFC9] rounded" />
                  <div className="w-20 h-4 bg-[#E8DFC9] rounded" />
                  <div className="w-full h-9 bg-[#F3EDE2] rounded mt-2" />
                </div>
              ))}
            </div>
          ) : wishlistProducts.length > 0 ? (
            /* Saved Products Grid */
            <div>
              <div className="flex items-center justify-between mb-4 text-xs text-gray-500 uppercase tracking-widest font-medium">
                <span>Displaying {wishlistProducts.length} Saved {wishlistProducts.length === 1 ? 'Fragrance' : 'Fragrances'}</span>
                <span>Click the heart to remove</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {wishlistProducts.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>

              {/* Bottom Continue Exploring Banner */}
              <div className="mt-14 sm:mt-20 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#F5EFE6] via-[#FAF7F2] to-[#F5EFE6] border border-[#E8DFC9] text-center flex flex-col items-center max-w-3xl mx-auto shadow-xs">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C6D1F] font-bold mb-2">
                  Atelier Discovery
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-black font-normal mb-3">
                  Expand Your Fragrance Wardrobe
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 max-w-lg mb-6 leading-relaxed font-light">
                  Discover rare extraits de parfum, artisanal woody ambers, and seasonal editions crafted by our master perfumers.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs uppercase font-bold tracking-widest hover:bg-[#262626] transition-all shadow-xs"
                >
                  <span>Explore All Fragrances</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <WishlistEmptyState />
          )}

        </div>
      </main>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer />
    </div>
  );
}
