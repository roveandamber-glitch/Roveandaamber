"use client";
import React, { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Slider, Modal } from 'antd';
import { 
  ChevronRight, 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  Check, 
  RotateCcw, 
  Search, 
  AlertCircle, 
  RefreshCw, 
  PackageOpen
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import SortDropdown, { SORT_OPTIONS } from '@/components/SortDropdown';
import QuickViewModal from '@/components/common/QuickViewModal';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import { DUMMY_PRODUCTS, DUMMY_CATEGORIES } from '@/data/dummyProducts';

const ShopContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Primary Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Filter States
  const initialSearch = searchParams ? searchParams.get('search') || '' : '';
  const initialCategory = searchParams ? searchParams.get('category') || '' : '';
  const [searchText, setSearchText] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : []);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentSort, setCurrentSort] = useState('Featured');

  // Modal / Drawer States for Mobile
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Synchronize with URL search params changes
  useEffect(() => {
    const urlSearch = searchParams?.get('search') || '';
    const urlCategory = searchParams?.get('category') || '';
    if (urlSearch) {
      setSearchText(urlSearch);
    }
    if (urlCategory) {
      setSelectedCategories([urlCategory]);
    }
  }, [searchParams]);

  const initializePriceAndSizes = (items) => {
    let highestPrice = 0;
    items.forEach(p => {
      const pPrice = Number(p.price) || 0;
      if (pPrice > highestPrice) highestPrice = pPrice;
    });

    const calculatedMax = Math.max(highestPrice, 10000);
    setMaxPrice(calculatedMax);
    setPriceRange([0, calculatedMax]);
  };

  // Load products and categories from backend API with fallback support
  const loadData = useCallback(async (allowFallback = true) => {
    setLoading(true);
    setError(null);
    try {
      const [productRes, categoryRes] = await Promise.all([
        productService.getAllProducts().catch(err => {
          throw err;
        }),
        categoryService.getAllCategories().catch(err => {
          console.warn('Categories API warning:', err);
          return { success: false, data: [] };
        })
      ]);

      let loadedProducts = [];
      if (productRes?.success && Array.isArray(productRes.data?.products) && productRes.data.products.length > 0) {
        loadedProducts = productRes.data.products;
      } else if (productRes?.success && Array.isArray(productRes.data) && productRes.data.length > 0) {
        loadedProducts = productRes.data;
      } else if (Array.isArray(productRes) && productRes.length > 0) {
        loadedProducts = productRes;
      }

      let loadedCategories = [];
      if (categoryRes?.success && Array.isArray(categoryRes.data) && categoryRes.data.length > 0) {
        loadedCategories = categoryRes.data;
      }

      if (loadedProducts.length > 0) {
        setProducts(loadedProducts);
        setCategories(loadedCategories.length > 0 ? loadedCategories : DUMMY_CATEGORIES);
        setIsUsingFallback(false);
        initializePriceAndSizes(loadedProducts);
      } else {
        if (allowFallback) {
          setProducts(DUMMY_PRODUCTS);
          setCategories(DUMMY_CATEGORIES);
          setIsUsingFallback(true);
          initializePriceAndSizes(DUMMY_PRODUCTS);
        } else {
          setProducts([]);
          setIsUsingFallback(false);
        }
      }
    } catch (err) {
      console.error('Failed to load shop data from API:', err);
      setError('Unable to reach the live store API. The backend server may be offline or unreachable.');
      
      if (allowFallback) {
        setProducts(DUMMY_PRODUCTS);
        setCategories(DUMMY_CATEGORIES);
        setIsUsingFallback(true);
        initializePriceAndSizes(DUMMY_PRODUCTS);
      } else {
        setProducts([]);
        setIsUsingFallback(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Extract available sizes dynamically from product catalog
  const availableSizes = useMemo(() => {
    const sizeSet = new Set();
    products.forEach(p => {
      if (Array.isArray(p.sizes)) {
        p.sizes.forEach(s => sizeSet.add(s));
      } else if (p.sizes_stock && typeof p.sizes_stock === 'object') {
        Object.keys(p.sizes_stock).forEach(s => sizeSet.add(s));
      }
    });
    return Array.from(sizeSet).filter(Boolean);
  }, [products]);

  // Extract available categories dynamically
  const availableCategoryList = useMemo(() => {
    if (categories.length > 0) {
      return categories.map(c => ({
        id: c._id || c.id || c.name,
        name: c.name
      }));
    }
    const catSet = new Set();
    products.forEach(p => {
      if (p.category_name) catSet.add(p.category_name);
      else if (p.category) catSet.add(p.category);
    });
    return Array.from(catSet).map(name => ({ id: name, name }));
  }, [categories, products]);

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Text Search Filter (Name, Category, Description, Notes)
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      result = result.filter(p => {
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const catMatch = (p.category_name || p.category || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const subMatch = (p.subcategory || '').toLowerCase().includes(q);
        const notesMatch = Array.isArray(p.details) && p.details.some(d => d.toLowerCase().includes(q));
        return nameMatch || catMatch || descMatch || subMatch || notesMatch;
      });
    }

    // 2. Category / Fragrance Family Filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => {
        const pCat = p.category_name || p.category || '';
        const pSub = p.subcategory || '';
        return selectedCategories.some(c => 
          c.toLowerCase() === pCat.toLowerCase() || 
          c.toLowerCase() === pSub.toLowerCase()
        );
      });
    }

    // 3. Price Range Filter
    result = result.filter(p => {
      const pPrice = Number(p.price) || 0;
      return pPrice >= priceRange[0] && pPrice <= priceRange[1];
    });

    // 4. Size Filter (when data supports it)
    if (selectedSizes.length > 0) {
      result = result.filter(p => {
        const prodSizes = p.sizes || (p.sizes_stock ? Object.keys(p.sizes_stock) : []);
        return prodSizes.some(s => selectedSizes.includes(s));
      });
    }

    // 5. In-Stock Only Filter
    if (inStockOnly) {
      result = result.filter(p => {
        const stock = p.stock !== undefined ? p.stock : (p.countInStock !== undefined ? p.countInStock : null);
        return stock === null || stock > 0;
      });
    }

    // 6. Unified Sorting
    switch (currentSort) {
      case 'Price: Low to High':
        result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'Price: High to Low':
        result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'Newest First':
        result.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return (Number(b.id || b._id) || 0) - (Number(a.id || a._id) || 0);
        });
        break;
      case 'Name: A to Z':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'Name: Z to A':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'Featured':
      default:
        result.sort((a, b) => {
          const featA = a.isFeatured ? 1 : 0;
          const featB = b.isFeatured ? 1 : 0;
          return featB - featA;
        });
        break;
    }

    return result;
  }, [products, searchText, selectedCategories, priceRange, selectedSizes, inStockOnly, currentSort]);

  // Toggle helpers
  const toggleCategory = (catName) => {
    setSelectedCategories(prev => 
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSearchText('');
    setSelectedCategories([]);
    setSelectedSizes([]);
    setInStockOnly(false);
    setPriceRange([0, maxPrice]);
    setCurrentSort('Featured');
    router.replace('/shop', { scroll: false });
  };

  const activeFiltersCount = 
    (searchText ? 1 : 0) +
    selectedCategories.length + 
    selectedSizes.length + 
    (inStockOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-sans text-[#1A1A1A] pt-20 sm:pt-24 pb-20 md:pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-widest text-gray-500 flex items-center space-x-2 mb-4 sm:mb-6">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} className="text-gray-400" />
          <span className="text-black font-semibold">Collections</span>
          {selectedCategories.length === 1 && (
            <>
              <ChevronRight size={10} className="text-gray-400" />
              <span className="text-[#B8860B] font-semibold">{selectedCategories[0]}</span>
            </>
          )}
        </nav>

        {/* Fallback Notice Banner (shown only when API fails and showcase catalogue is displayed) */}
        {error && isUsingFallback && (
          <div className="mb-6 p-4 rounded-xl bg-[#FFFDF5] border border-[#E8DCC0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start gap-2.5 text-[#8C6D1F]">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#B8860B]" />
              <div>
                <p className="font-semibold text-black">Live API Connection Notice</p>
                <p className="text-gray-600 font-light mt-0.5">
                  Currently viewing the signature ROVE & AMBER showcase catalogue. Live backend connection can be retried anytime.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => loadData(false)}
              className="px-3.5 py-1.5 rounded-full bg-black text-white hover:bg-gray-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              <RefreshCw size={12} />
              <span>Retry Live API</span>
            </button>
          </div>
        )}

        {/* Severe API Error State (when fallback is disabled and API call fails completely) */}
        {error && !isUsingFallback && !loading && (
          <div className="my-12 p-8 max-w-xl mx-auto rounded-3xl bg-white border border-red-100 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-xl font-serif font-bold text-black mb-2">Connection to Inventory API Failed</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              We encountered an issue communicating with the store backend. You can retry the connection or view the signature showroom catalogue.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => loadData(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Retry Connection
              </button>
              <button
                type="button"
                onClick={() => loadData(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#FAF8F5] border border-[#E0D8CA] text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                Explore Showroom Catalogue
              </button>
            </div>
          </div>
        )}

        {(!error || isUsingFallback || loading) && (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* DESKTOP SIDEBAR FILTERS */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-28 space-y-8 bg-white p-6 rounded-2xl border border-[#ECE7DE] shadow-2xs">
                
                {/* Search in catalogue */}
                <div>
                  <h3 className="text-xs font-bold tracking-widest uppercase mb-3 text-[#1A1A1A]">Search Fragrances</h3>
                  <div className="relative flex items-center">
                    <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
                    <input 
                      type="text"
                      placeholder="Name, notes, amber..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 text-xs bg-[#FAF9F7] border border-[#E0D8C8] rounded-full focus:outline-none focus:border-black text-black placeholder-gray-400"
                    />
                    {searchText && (
                      <button 
                        type="button" 
                        onClick={() => setSearchText('')}
                        className="absolute right-2.5 text-gray-400 hover:text-black cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Fragrance Families / Categories */}
                {availableCategoryList.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold tracking-widest uppercase mb-3 text-[#1A1A1A]">Fragrance Family</h3>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {availableCategoryList.map(cat => {
                        const isChecked = selectedCategories.includes(cat.name);
                        return (
                          <label key={cat.id} className="flex items-center space-x-2.5 cursor-pointer group select-none">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => toggleCategory(cat.name)}
                              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                            />
                            <span className={`text-xs transition-colors ${isChecked ? 'text-black font-bold' : 'text-gray-600 group-hover:text-black'}`}>
                              {cat.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Range Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">Price Range</h3>
                    <span className="text-[11px] font-mono font-bold text-[#B8860B]">
                      ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1] === maxPrice ? `${priceRange[1].toLocaleString('en-IN')}+` : priceRange[1].toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="px-1">
                    <Slider 
                      range 
                      min={0} 
                      max={maxPrice} 
                      value={priceRange} 
                      onChange={(val) => setPriceRange(val)} 
                      trackStyle={[{ backgroundColor: '#1A1A1A' }]}
                      handleStyle={[
                        { borderColor: '#1A1A1A', backgroundColor: '#1A1A1A' },
                        { borderColor: '#1A1A1A', backgroundColor: '#1A1A1A' }
                      ]}
                    />
                  </div>
                </div>

                {/* Flacon Size Filter (only if size data exists in catalog) */}
                {availableSizes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold tracking-widest uppercase mb-3 text-[#1A1A1A]">Flacon Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map(size => {
                        const isSelected = selectedSizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-white shadow-2xs'
                                : 'bg-[#FAF9F7] text-gray-700 border border-[#E8E2D6] hover:border-black'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Availability Toggle */}
                <div>
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="text-xs font-bold tracking-widest uppercase text-[#1A1A1A]">In-Stock Only</span>
                    <input 
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                    />
                  </label>
                </div>

                {/* Reset Filters Action */}
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full py-2.5 bg-[#FAF8F5] hover:bg-black hover:text-white text-black border border-[#E0D8CA] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={12} />
                    <span>Reset Filters ({activeFiltersCount})</span>
                  </button>
                )}
              </div>
            </aside>

            {/* PRODUCT GRID MAIN AREA */}
            <div className="flex-1 min-w-0">
              
              {/* Top Bar: Title, Count, and Desktop Sort Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#ECE7DE] gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[#1A1A1A] font-normal leading-tight">
                    Fine Fragrance Collections
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Displaying {loading ? '...' : filteredProducts.length} signature creations from ROVE & AMBER
                  </p>
                </div>

                {/* Desktop Sort Dropdown */}
                <div className="hidden sm:block shrink-0">
                  <SortDropdown currentSort={currentSort} onSortChange={setCurrentSort} />
                </div>
              </div>

              {/* Mobile Filter & Sort Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4 sm:hidden">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(true)}
                  className={`py-2.5 px-3 rounded-full border text-xs font-serif uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    activeFiltersCount > 0 
                      ? 'bg-black text-white border-black font-bold' 
                      : 'bg-white text-black border-[#E0D8CA]'
                  }`}
                >
                  <SlidersHorizontal size={13} />
                  <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSortModalOpen(true)}
                  className="py-2.5 px-3 rounded-full bg-white border border-[#E0D8CA] text-black text-xs font-serif uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowUpDown size={13} />
                  <span className="truncate">Sort: {currentSort.split(':')[0]}</span>
                </button>
              </div>

              {/* Active Filter Chips Bar */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-5 p-2.5 bg-white rounded-xl border border-[#ECE7DE]">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 pl-1">
                    Active:
                  </span>
                  
                  {/* Search query chip */}
                  {searchText && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E0D8CA] text-xs text-black">
                      <span>"{searchText}"</span>
                      <button type="button" onClick={() => setSearchText('')} className="hover:text-red-500 cursor-pointer">
                        <X size={11} />
                      </button>
                    </span>
                  )}

                  {/* Category chips */}
                  {selectedCategories.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E0D8CA] text-xs text-black">
                      <span>{cat}</span>
                      <button type="button" onClick={() => toggleCategory(cat)} className="hover:text-red-500 cursor-pointer">
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  {/* Size chips */}
                  {selectedSizes.map(size => (
                    <span key={size} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E0D8CA] text-xs text-black">
                      <span>{size}</span>
                      <button type="button" onClick={() => toggleSize(size)} className="hover:text-red-500 cursor-pointer">
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  {/* In-stock chip */}
                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E0D8CA] text-xs text-black">
                      <span>In-Stock Only</span>
                      <button type="button" onClick={() => setInStockOnly(false)} className="hover:text-red-500 cursor-pointer">
                        <X size={11} />
                      </button>
                    </span>
                  )}

                  {/* Price chip */}
                  {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E0D8CA] text-xs text-black font-mono">
                      <span>₹{priceRange[0]} - ₹{priceRange[1]}</span>
                      <button type="button" onClick={() => setPriceRange([0, maxPrice])} className="hover:text-red-500 cursor-pointer font-sans">
                        <X size={11} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="ml-auto text-[11px] font-bold uppercase tracking-wider text-[#B8860B] hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* SKELETON LOADING GRID */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className="bg-white border border-[#ECE7DE] p-4 rounded-sm animate-pulse space-y-3">
                      <div className="w-full aspect-square bg-gray-100 rounded-sm" />
                      <div className="h-3 w-1/3 bg-gray-100 mx-auto rounded" />
                      <div className="h-4 w-3/4 bg-gray-100 mx-auto rounded" />
                      <div className="h-4 w-1/4 bg-gray-100 mx-auto rounded" />
                      <div className="h-9 w-full bg-gray-100 rounded mt-2" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                /* PRODUCT GRID: 2 columns on mobile, 2 on tablet, 3 on desktop */
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product._id || product.id} 
                      product={product} 
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>
              ) : (
                /* EMPTY STATE */
                <div className="py-16 px-6 text-center bg-white rounded-2xl border border-[#ECE7DE] max-w-xl mx-auto my-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FAF9F7] border border-[#E0D8CA] flex items-center justify-center text-gray-400">
                    <PackageOpen size={28} />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-black mb-1">
                    No Fragrances Found
                  </h3>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                    No creations matched your chosen fragrance notes, price range, or search criteria.
                  </p>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-serif uppercase tracking-widest transition-colors cursor-pointer shadow-xs"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* POPUP 1: Mobile Filter Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-6 font-serif">
            <span className="text-base font-bold text-black">Filter Fragrance Collections</span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-sans font-bold text-[#B8860B] uppercase tracking-wider cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>
        }
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        footer={null}
        centered
        width={390}
        className="font-sans"
      >
        <div className="py-2 space-y-6 max-h-[68vh] overflow-y-auto pr-1">
          {/* Mobile Text Search */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2">Search</h4>
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-gray-400" />
              <input 
                type="text"
                placeholder="Search by perfume name or notes..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs bg-[#FAF9F7] border border-[#E0D8C8] rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Fragrance Families */}
          {availableCategoryList.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2.5">Fragrance Families</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableCategoryList.map(cat => {
                  const isSelected = selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`p-2.5 rounded-xl text-xs text-left flex items-center justify-between border transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-black text-white border-black font-bold' 
                          : 'bg-[#FAF9F7] text-gray-700 border-[#E8E2D6]'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isSelected && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Price Range</h4>
              <span className="text-xs font-mono font-bold text-black">
                ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
              </span>
            </div>
            <div className="px-1">
              <Slider 
                range 
                min={0} 
                max={maxPrice} 
                value={priceRange} 
                onChange={(val) => setPriceRange(val)} 
                trackStyle={[{ backgroundColor: '#1A1A1A' }]}
                handleStyle={[
                  { borderColor: '#1A1A1A', backgroundColor: '#1A1A1A' },
                  { borderColor: '#1A1A1A', backgroundColor: '#1A1A1A' }
                ]}
              />
            </div>
          </div>

          {/* Flacon Sizes */}
          {availableSizes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-2">Flacon Size</h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-[#FAF9F7] text-gray-700 border-[#E8E2D6]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-wider text-black">In-Stock Only</span>
              <input 
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black accent-black cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 mt-2">
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-full font-serif uppercase tracking-widest text-xs cursor-pointer shadow-xs"
          >
            Show {filteredProducts.length} Results
          </button>
        </div>
      </Modal>

      {/* POPUP 2: Mobile Sort Modal */}
      <Modal
        title={<span className="font-serif text-base font-bold text-black">Sort Fragrances</span>}
        open={isSortModalOpen}
        onCancel={() => setIsSortModalOpen(false)}
        footer={null}
        centered
        width={350}
        className="font-sans"
      >
        <div className="py-2 space-y-2">
          {SORT_OPTIONS.map(opt => {
            const isSelected = currentSort === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setCurrentSort(opt);
                  setIsSortModalOpen(false);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-black text-white border-black font-bold' 
                    : 'bg-[#FAF9F7] text-gray-700 border-[#E8E2D6]'
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct} 
        isOpen={Boolean(quickViewProduct)} 
        onClose={() => setQuickViewProduct(null)} 
      />

      <Footer />
    </div>
  );
};

const Shop = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F7]" />}>
      <ShopContent />
    </Suspense>
  );
};

export default Shop;
