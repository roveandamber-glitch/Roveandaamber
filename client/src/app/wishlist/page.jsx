"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  ShoppingBag, 
  ArrowRight, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  AlertCircle, 
  RefreshCw
} from 'lucide-react';
import { message, Modal } from 'antd';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import QuickViewModal from '@/components/common/QuickViewModal';
import productService from '@/services/productService';
import { cartService } from '@/services/cartService';
import { DUMMY_PRODUCTS } from '@/data/dummyProducts';

export default function WishlistPage() {
  const [savedIds, setSavedIds] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [unavailableCount, setUnavailableCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = 'Your Wishlist | ROVE & AMBER Fine Fragrance';
  }, []);

  // Read saved IDs safely from localStorage
  const getStoredWishlistIds = useCallback(() => {
    if (typeof window === 'undefined') return [];
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

  // Resolve saved IDs against live API or fallback catalog
  const loadWishlistItems = useCallback(async () => {
    const ids = getStoredWishlistIds();
    setSavedIds(ids);

    if (ids.length === 0) {
      setWishlistProducts([]);
      setUnavailableCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let allCatalogProducts = [];
    let isFallback = false;

    try {
      const res = await productService.getAllProducts();
      if (res?.success && Array.isArray(res.data?.products) && res.data.products.length > 0) {
        allCatalogProducts = res.data.products;
      } else if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        allCatalogProducts = res.data;
      } else if (Array.isArray(res) && res.length > 0) {
        allCatalogProducts = res;
      } else {
        // Fallback to offline catalog if response is empty
        allCatalogProducts = DUMMY_PRODUCTS;
        isFallback = true;
      }
    } catch (apiErr) {
      console.warn('Live API unavailable for wishlist resolution, using showcase catalog:', apiErr);
      allCatalogProducts = DUMMY_PRODUCTS;
      isFallback = true;
      setError('Live atelier catalog is currently offline. Showing saved fragrances from local showcase archive.');
    }

    setIsUsingFallback(isFallback);

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

  // Synchronize with external wishlist changes and load on mount
  useEffect(() => {
    loadWishlistItems();

    const handleWishlistChange = () => {
      loadWishlistItems();
    };

    window.addEventListener('wishlistChange', handleWishlistChange);
    return () => {
      window.removeEventListener('wishlistChange', handleWishlistChange);
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
    Modal.confirm({
      title: 'Clear your wishlist?',
      content: 'Are you sure you want to remove all saved fragrances from your atelier wishlist?',
      okText: 'Clear Wishlist',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk() {
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

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col justify-between selection:bg-[#B8860B] selection:text-white">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 md:pt-32 pb-24 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-gray-400 mb-6 sm:mb-8 uppercase tracking-widest">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-black font-semibold">Wishlist</span>
          </nav>

          {/* Luxury Header Banner */}
          <div className="border-b border-[#ECE7DE] pb-6 sm:pb-8 mb-8 sm:mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3E0] text-[#8C6D1F] border border-[#E0D0A5] text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles size={11} />
                    Personal Atelier
                  </span>
                  <span className="text-xs text-gray-400">
                    {!loading ? `${savedIds.length} ${savedIds.length === 1 ? 'saved item' : 'saved items'}` : 'Loading atelier...'}
                  </span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-black tracking-tight">
                  Your Wishlist
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 max-w-2xl font-light leading-relaxed">
                  Curated selections from your private fragrance atelier. Review your preserved signature scents, move favorites directly to your shopping bag, or continue discovering new olfactory creations.
                </p>
              </div>

              {/* Top Quick Actions (only visible when wishlist has items) */}
              {wishlistProducts.length > 0 && (
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-black bg-white border border-[#E0D8CA] hover:border-black transition-all shadow-2xs"
                  >
                    Continue Shopping
                  </Link>

                  <button
                    type="button"
                    onClick={handleAddAllToCart}
                    disabled={isAddingAll}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-[#262626] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingBag size={14} />
                    {isAddingAll ? 'Adding...' : 'Add All to Bag'}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearWishlist}
                    className="p-2.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 border border-[#E0D8CA] hover:border-red-200 transition-colors cursor-pointer"
                    aria-label="Clear all wishlist items"
                    title="Clear Wishlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Atelier Offline / Showcase Notice */}
          {(isUsingFallback || error) && (
            <div className="mb-6 p-4 rounded-xl bg-[#FAF6ED] border border-[#E8DFC9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#6B5738]">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={16} className="text-[#B8860B] flex-shrink-0" />
                <span>
                  <strong>Atelier Showcase Mode:</strong> {error || 'Displaying saved creations from the local showcase archive while the live store server is offline.'}
                </span>
              </div>
              <button
                type="button"
                onClick={loadWishlistItems}
                className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#B8860B] hover:text-black transition-colors cursor-pointer self-end sm:self-auto"
              >
                <RefreshCw size={12} />
                Retry Live Store
              </button>
            </div>
          )}

          {/* Unavailable Items Notice */}
          {unavailableCount > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-[#FFF9F5] border border-[#F5D5C6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8A4224]">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={16} className="text-[#C85A32] flex-shrink-0" />
                <span>
                  <strong>Archive Notice:</strong> {unavailableCount} {unavailableCount === 1 ? 'fragrance' : 'fragrances'} previously saved to your wishlist is no longer available in the active collection.
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveUnavailable}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#E8C2B0] text-[11px] font-bold text-[#8A4224] hover:bg-[#8A4224] hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                <Trash2 size={12} />
                Clean Up Unavailable Items
              </button>
            </div>
          )}

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
            /* Empty State */
            <div className="py-16 sm:py-24 text-center max-w-xl mx-auto flex flex-col items-center">
              {/* Elegant Ring Icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FAF3E0] border border-[#E0D0A5] flex items-center justify-center text-[#B8860B] shadow-sm">
                  <Heart size={36} strokeWidth={1.4} className="fill-[#FAF3E0]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-[#E8DFC9] flex items-center justify-center text-[#B8860B] shadow-2xs">
                  <Sparkles size={15} />
                </div>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6D1F] mb-2">
                Atelier Collection
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-black font-normal tracking-tight mb-3">
                Your wishlist is waiting.
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md font-light leading-relaxed mb-8">
                You haven&apos;t saved any signature fragrances to your atelier wishlist yet. Explore our handcrafted olfactory creations and tap the heart icon on any bottle to curate your personal wardrobe.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-black text-white text-xs uppercase font-bold tracking-widest hover:bg-[#262626] transition-all shadow-md cursor-pointer group"
                >
                  <span>Explore Fragrances</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/shop?category=Eau%20de%20Parfum"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white text-black border border-[#E0D8CA] text-xs uppercase font-semibold tracking-wider hover:border-black transition-all shadow-2xs"
                >
                  Signature Scents
                </Link>
              </div>

              {/* Luxury Guarantee Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-12 mt-12 border-t border-[#ECE7DE] w-full text-center">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-black">Artisanal Sillage</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">High Extrait Concentration</p>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-black">Complimentary Samples</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Included with every order</p>
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-black">Bespoke Gifting</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Signature Gold Foil Box</p>
                </div>
              </div>
            </div>
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
