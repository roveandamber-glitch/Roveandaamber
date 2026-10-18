"use client";
import React, { Suspense, useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import SortDropdown from '@/components/SortDropdown';
import { 
  ChevronRight, 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  Check, 
  RotateCcw 
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Slider, Modal } from 'antd';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import { DUMMY_PRODUCTS, DUMMY_CATEGORIES } from '@/data/dummyProducts';

const SORT_OPTIONS = [
  'Featured',
  'Price: Low to High',
  'Price: High to Low',
  'Name: A to Z',
  'Name: Z to A'
];

const ShopContent = () => {
  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(DUMMY_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(DUMMY_CATEGORIES);
  const [currentSort, setCurrentSort] = useState('Featured');
  
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams ? searchParams.get('search') || '' : '');
  
  // Mobile Popup States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  
  // Available filter options extracted from products
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getAllCategories()
        ]);
        
        let allProducts = DUMMY_PRODUCTS;
        if (productRes.success && productRes.data.products?.length > 0) {
          allProducts = productRes.data.products;
        } else if (productRes.success && Array.isArray(productRes.data)) {
          allProducts = productRes.data;
        }
        
        if (allProducts.length > 0) {
          setProducts(allProducts);
          setFilteredProducts(allProducts);
          
          const colors = new Map();
          const sizes = new Set();
          let maxP = 0;
          
          allProducts.forEach(p => {
            if (p.price > maxP) maxP = p.price;
            if (p.colors) p.colors.forEach(c => colors.set(c.code, c.name));
            if (p.sizes) p.sizes.forEach(s => sizes.add(s));
            if (p.sizes_stock) {
              Object.keys(p.sizes_stock).forEach(s => sizes.add(s));
            }
          });
          
          const finalMaxPrice = Math.max(maxP, 10000);
          setMaxPrice(finalMaxPrice);
          setPriceRange([0, finalMaxPrice]);
          
          setAvailableColors(Array.from(colors, ([code, name]) => ({ code, name })));
          setAvailableSizes(Array.from(sizes));
        }
        
        if (categoryRes.success && categoryRes.data?.length > 0) {
          setCategories(categoryRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProductsAndCategories();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = [...products];
    
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category) || selectedCategories.includes(p.subcategory) || selectedCategories.includes(p.category_name));
    }
    
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    if (selectedColors.length > 0) {
      result = result.filter(p => p.colors && p.colors.some(c => selectedColors.includes(c.code)));
    }
    
    if (selectedSizes.length > 0) {
      result = result.filter(p => {
        const prodSizes = p.sizes || (p.sizes_stock ? Object.keys(p.sizes_stock) : []);
        return prodSizes.some(s => selectedSizes.includes(s));
      });
    }
    
    // Text search filter
    if (searchText.trim() !== '') {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(lowerSearch)) || 
        (p.description && p.description.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Apply sorting
    switch (currentSort) {
      case 'Price: Low to High':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'Name: A to Z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Name: Z to A':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'Featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
    
    setFilteredProducts(result);
  }, [selectedCategories, priceRange, selectedColors, selectedSizes, currentSort, searchText, products]);

  const toggleCategory = (catName) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const toggleColor = (colorCode) => {
    if (selectedColors.includes(colorCode)) {
      setSelectedColors(selectedColors.filter(c => c !== colorCode));
    } else {
      setSelectedColors([...selectedColors, colorCode]);
    }
  };

  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  const activeFiltersCount = selectedCategories.length + selectedColors.length + selectedSizes.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F9F6F0] font-sans text-enva-text pt-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <div className="text-[10px] uppercase tracking-widest text-gray-500 flex items-center space-x-2 mb-6 sm:mb-8">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-black font-semibold">Collections</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Desktop Sidebar Filters (Hidden on Mobile) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            {/* Category Filter */}
            <div className="mb-10">
              <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-[#1A1A1A]">Fragrance Family</h3>
              <div className="space-y-3">
                {categories.map((cat, idx) => (
                  <label key={cat._id || idx} className="flex items-center space-x-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => toggleCategory(cat.name)}
                      className="w-4 h-4 rounded border-gray-400 text-black focus:ring-black accent-black cursor-pointer" 
                    />
                    <span className="text-sm text-gray-700 group-hover:text-black capitalize">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-10">
              <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-[#1A1A1A]">Price</h3>
              <div className="px-2">
                <Slider 
                  range 
                  min={0} 
                  max={maxPrice} 
                  value={priceRange} 
                  onChange={(val) => setPriceRange(val)} 
                  trackStyle={[{ backgroundColor: '#1A1A1A' }]}
                  handleStyle={[{ borderColor: '#1A1A1A', backgroundColor: '#1A1A1A' }, { borderColor: '#1A1A1A', backgroundColor: '#1A1A1A' }]}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                <span>₹{priceRange[1] === maxPrice ? `${priceRange[1].toLocaleString('en-IN')}+` : priceRange[1].toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Color Filter */}
            {availableColors.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-[#1A1A1A]">Olfactory Note</h3>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map(color => (
                    <button 
                      key={color.code}
                      onClick={() => toggleColor(color.code)}
                      className={`w-6 h-6 rounded-full border border-gray-300 ring-1 ring-offset-2 transition-all cursor-pointer ${selectedColors.includes(color.code) ? 'ring-black scale-110' : 'ring-transparent'}`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Filter */}
            {availableSizes.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs font-bold tracking-widest uppercase mb-4 text-[#1A1A1A]">Flacon Size</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`w-10 h-10 flex items-center justify-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        selectedSizes.includes(size) 
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs' 
                          : 'bg-[#EFE8DC] text-gray-800 border-[#E5DEC8] hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-full py-2.5 bg-[#EFE8DC] hover:bg-black hover:text-white text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw size={13} />
                <span>Reset Filters ({activeFiltersCount})</span>
              </button>
            )}
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            
            {/* Header with Title and Desktop Sort */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-8 pb-4 sm:pb-6 border-b border-[#E8E2D6] gap-3">
              <div>
                <h1 className="text-2xl sm:text-4xl font-serif text-[#1A1A1A] mb-1">Fine Fragrance Collections</h1>
                <p className="text-xs text-gray-500">Displaying {filteredProducts.length} signature creations from ROVE & AMBER</p>
              </div>

              {/* Desktop Sort Dropdown (Hidden on Mobile) */}
              <div className="hidden sm:block">
                <SortDropdown currentSort={currentSort} onSortChange={setCurrentSort} />
              </div>
            </div>

            {/* Mobile Dual Popup Buttons: [ Filter ] and [ Sort ] */}
            <div className="grid grid-cols-2 gap-2.5 mb-5 sm:hidden">
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer ${
                  activeFiltersCount > 0
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-[#E8E2D6] hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>Filter {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSortModalOpen(true)}
                className="py-3 px-4 rounded-2xl bg-white border border-[#E8E2D6] text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <ArrowUpDown size={14} />
                <span className="truncate">Sort: {currentSort.split(':')[0]}</span>
              </button>
            </div>

            {/* 2 Products per row on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-3.5 sm:gap-x-8 gap-y-6 sm:gap-y-12">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-gray-500 bg-white rounded-3xl p-8 border border-gray-100">
                  <p className="text-sm font-serif text-black mb-2">No fragrances found matching your criteria</p>
                  <p className="text-xs text-gray-400 mb-6">Try adjusting your fragrance notes or price range.</p>
                  <button 
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 bg-black text-white hover:bg-[#262626] transition-colors text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer shadow-xs"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* POPUP 1: Mobile Filter Modal / Drawer */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-6">
            <span className="font-serif text-lg font-bold text-black">Filter Fragrance Collections</span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-bold text-black hover:underline uppercase tracking-wider cursor-pointer"
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
        className="font-sans"
        width={420}
      >
        <div className="py-2 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Category */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">Fragrance Families</h4>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat, idx) => {
                const selected = selectedCategories.includes(cat.name);
                return (
                  <button
                    key={cat._id || idx}
                    type="button"
                    onClick={() => toggleCategory(cat.name)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      selected 
                        ? 'bg-black text-white border-black font-bold' 
                        : 'bg-[#FAF8F5] text-gray-700 border-[#E8E2D6] hover:border-black'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {selected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black">Price Range</h4>
              <span className="text-xs font-bold font-mono text-black">
                ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
              </span>
            </div>
            <div className="px-2">
              <Slider 
                range 
                min={0} 
                max={maxPrice} 
                value={priceRange} 
                onChange={(val) => setPriceRange(val)} 
                trackStyle={[{ backgroundColor: '#1A1A1A' }]}
                handleStyle={[{ borderColor: '#1A1A1A', backgroundColor: '#1A1A1A' }, { borderColor: '#1A1A1A', backgroundColor: '#1A1A1A' }]}
              />
            </div>
          </div>

          {/* Size Filter */}
          {availableSizes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">Flacon Size</h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => {
                  const selected = selectedSizes.includes(size);
                  return (
                    <button 
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`w-11 h-11 flex items-center justify-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        selected 
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs' 
                          : 'bg-[#FAF8F5] text-gray-800 border-[#E8E2D6] hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Filter */}
          {availableColors.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">Olfactory Palette</h4>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map(color => (
                  <button 
                    key={color.code}
                    onClick={() => toggleColor(color.code)}
                    className={`w-7 h-7 rounded-full border border-gray-300 ring-1 ring-offset-2 transition-all cursor-pointer ${selectedColors.includes(color.code) ? 'ring-black scale-110' : 'ring-transparent'}`}
                    style={{ backgroundColor: color.code }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 mt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(false)}
            className="w-full bg-black hover:bg-[#262626] text-white h-12 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>View {filteredProducts.length} Results</span>
          </button>
        </div>
      </Modal>

      {/* POPUP 2: Mobile Sort Modal */}
      <Modal
        title={<span className="font-serif text-lg font-bold text-black">Sort Pieces By</span>}
        open={isSortModalOpen}
        onCancel={() => setIsSortModalOpen(false)}
        footer={null}
        centered
        className="font-sans"
        width={380}
      >
        <div className="py-2 space-y-2">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = currentSort === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setCurrentSort(opt);
                  setIsSortModalOpen(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-black text-white border-black font-bold' 
                    : 'bg-[#FAF8F5] text-gray-800 border-[#E8E2D6] hover:bg-gray-50'
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

const Shop = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9F6F0]" />}>
      <ShopContent />
    </Suspense>
  );
};

export default Shop;
