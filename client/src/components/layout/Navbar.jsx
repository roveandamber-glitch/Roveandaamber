"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Loader2, 
  X, 
  Menu, 
  User, 
  LogOut, 
  Package, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { Dropdown, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../../services/productService';
import cartService from '../../services/cartService';
import CartDrawer from '../cart/CartDrawer';
import { getImageUrl } from '../../utils/imageHelper';

const TRENDING_SEARCHES = [
  'Amber Oud',
  'Eau de Parfum',
  'Golden Saffron',
  'Velvet Musk',
  'Signature Scents',
  'Oud Reserve'
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const searchRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path) => pathname === path;

  const updateCartCount = () => {
    setCartCount(cartService.getCartCount());
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cartChange', updateCartCount);
    return () => window.removeEventListener('cartChange', updateCartCount);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = 
        localStorage.getItem('userToken') || 
        localStorage.getItem('adminToken') || 
        localStorage.getItem('token') || 
        localStorage.getItem('adminKey');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {
          setCurrentUser({ name: 'Customer' });
        }
      } else if (token) {
        setCurrentUser({ name: 'Customer' });
      } else {
        setCurrentUser(null);
      }
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminKey');
    setCurrentUser(null);
    window.dispatchEvent(new Event('authChange'));
    message.success('Logged out successfully');
    router.push('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await productService.searchProducts(searchQuery.trim());
        if (response?.success) {
          setSearchResults(response.data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(fetchResults, 200);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim() !== '') {
        router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
        setIsMenuOpen(false);
        setShowDropdown(false);
      }
    }
  };

  const handleTrendingClick = (term) => {
    setSearchQuery(term);
    router.push(`/shop?search=${encodeURIComponent(term)}`);
    setShowDropdown(false);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/shop' },
    { name: 'My Orders', path: '/orders' },
    { name: 'About Atelier', path: '/about' },
    { name: 'Contact Concierge', path: '/contact' },
  ];

  const userMenuItems = {
    items: [
      {
        key: 'profile_info',
        label: (
          <div className="px-2 py-1">
            <p className="text-[10px] uppercase font-bold text-gray-400">
              {currentUser?.role === 'admin' ? 'Administrator' : 'Signed In As'}
            </p>
            <p className="text-xs font-semibold text-black truncate max-w-[140px]">{currentUser?.email || currentUser?.name || 'Customer'}</p>
          </div>
        ),
        disabled: true,
      },
      ...(currentUser?.role === 'admin' ? [
        {
          key: 'admin_dashboard',
          icon: <ShieldCheck size={14} className="text-purple-600" />,
          label: <Link href="/admin" className="font-bold text-xs text-purple-700">Admin Dashboard</Link>,
        }
      ] : []),
      {
        key: 'profile',
        icon: <User size={14} />,
        label: <Link href="/profile" className="font-medium text-xs">My Profile</Link>,
      },
      {
        key: 'orders',
        icon: <Package size={14} />,
        label: <Link href="/orders" className="font-medium text-xs">My Orders</Link>,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogOut size={14} className="text-red-500" />,
        label: <span onClick={handleLogout} className="text-xs text-red-500 font-medium cursor-pointer">Sign Out</span>,
      },
    ]
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#F9F6F0]/95 backdrop-blur-md py-3.5 sm:py-4 shadow-sm border-b border-[#E8E2D6]' 
            : 'bg-[#F9F6F0]/80 backdrop-blur-sm py-4 sm:py-5 border-b border-black/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2.5 sm:gap-3 group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-sm border border-[#D4AF37]/60 flex-shrink-0 bg-[#3B1D11]">
              <img 
                src="/images/perfumes/rove_amber_logo.jpg" 
                alt="ROVE & AMBER" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-serif tracking-[0.2em] font-bold text-black leading-tight">
                ROVE & AMBER
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-[#8C827A] font-medium leading-none hidden sm:block">
                Fine Fragrance
              </span>
            </div>
          </Link>
        
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-10 text-xs uppercase tracking-[0.2em] font-medium">
            <Link 
              href="/" 
              prefetch={true}
              className={`transition-colors ${
                isActive('/') 
                  ? 'border-b border-black pb-1 text-black font-bold' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/shop" 
              prefetch={true}
              className={`transition-colors ${
                isActive('/shop') 
                  ? 'border-b border-black pb-1 text-black font-bold' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Collections
            </Link>
            <Link 
              href="/orders" 
              prefetch={true}
              className={`transition-colors ${
                isActive('/orders') 
                  ? 'border-b border-black pb-1 text-black font-bold' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              My Orders
            </Link>
            <Link 
              href="/about" 
              prefetch={true}
              className={`transition-colors ${
                isActive('/about') 
                  ? 'border-b border-black pb-1 text-black font-bold' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              prefetch={true}
              className={`transition-colors ${
                isActive('/contact') 
                  ? 'border-b border-black pb-1 text-black font-bold' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Right Section: Interactive Search & Auth Button */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Redesigned Luxury Desktop Search Bar */}
            <div className="relative hidden md:block" ref={searchRef}>
              <div className="relative flex items-center">
                <Search 
                  size={14} 
                  className="absolute left-3.5 text-gray-500 pointer-events-none" 
                />
                <input 
                  type="text" 
                  placeholder="Search collections..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleSearch}
                  className="w-48 lg:w-64 focus:w-60 lg:focus:w-80 rounded-full py-2 pl-9 pr-8 text-xs bg-white border border-[#E0D8CA] focus:border-black focus:ring-2 focus:ring-black/5 text-black placeholder-gray-400 focus:outline-none transition-all duration-300 shadow-2xs"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3 text-gray-400 hover:text-black cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                ) : (
                  <div className="absolute right-3 text-[10px] text-gray-400 font-mono pointer-events-none hidden lg:block">
                    ↵
                  </div>
                )}
              </div>

              {/* Rich Live Search Flyout Dropdown */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-3 w-88 lg:w-96 bg-white rounded-3xl shadow-xl border border-[#E8E2D6] overflow-hidden z-50 p-2"
                  >
                    {isSearching ? (
                      <div className="p-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-black" />
                        <span className="text-xs font-light">Searching atelier archives...</span>
                      </div>
                    ) : searchQuery.trim().length >= 2 && searchResults.length > 0 ? (
                      <div>
                        <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C827A]">
                            Matching Pieces ({searchResults.length})
                          </span>
                          <span className="text-[10px] text-gray-400">Press ↵ to view all</span>
                        </div>

                        <div className="max-h-80 overflow-y-auto py-1">
                          {searchResults.map((product) => (
                            <Link 
                              key={product._id || product.id} 
                              href={`/product/${product._id || product.id}`}
                              onClick={() => {
                                setShowDropdown(false);
                                setSearchQuery('');
                              }}
                              className="flex items-center px-3 py-2.5 rounded-2xl hover:bg-[#FAF8F5] transition-colors group"
                            >
                              <div className="w-12 h-14 bg-[#EFE8DC] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-100">
                                <img 
                                  src={getImageUrl(product.images?.[0]?.url || product.image)} 
                                  alt={product.name}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                  onError={(e) => { e.target.src = '/Images/brown.png'; }}
                                />
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <h4 className="text-xs font-serif font-bold text-black truncate group-hover:text-gray-700">
                                  {product.name}
                                </h4>
                                <span className="text-[10px] text-gray-400 capitalize block">
                                  {product.category || product.category_name || 'Atelier'}
                                </span>
                                <span className="text-xs font-bold text-black font-sans mt-0.5 block">
                                  ₹{(product.price || 0).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <ChevronRight size={14} className="text-gray-300 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                            </Link>
                          ))}
                        </div>

                        <div className="p-2 border-t border-gray-100 mt-1">
                          <button
                            type="button"
                            onClick={handleSearch}
                            className="w-full bg-black hover:bg-[#262626] text-white py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                          >
                            <span>View All Results for "{searchQuery}"</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    ) : searchQuery.trim().length >= 2 && searchResults.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-xs font-serif text-black mb-1">No fragrances found for "{searchQuery}"</p>
                        <p className="text-[11px] text-gray-400">Try searching for Amber Oud, Golden Saffron, or Discovery Sets.</p>
                      </div>
                    ) : (
                      /* Trending Searches Default Screen */
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-3 text-[10px] uppercase font-bold tracking-widest text-[#8C827A]">
                          <TrendingUp size={13} />
                          <span>Popular Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {TRENDING_SEARCHES.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => handleTrendingClick(term)}
                              className="px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-black hover:text-white text-gray-700 text-xs font-medium border border-[#E8E2D6] transition-colors cursor-pointer"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop User Account / Profile Button */}
            <div className="hidden md:block">
              {currentUser ? (
                <Link href="/profile" prefetch={true}>
                  <button className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#262626] hover:shadow-md transition-all cursor-pointer shadow-xs active:scale-95">
                    <User size={13} />
                    <span className="max-w-[110px] truncate">
                      {currentUser.name ? (currentUser.name.split(' ')[0] || 'Profile') : 'Profile'}
                    </span>
                  </button>
                </Link>
              ) : (
                <Link href="/login" prefetch={true}>
                  <button className="bg-black hover:bg-[#262626] text-white px-5 py-2 rounded-full text-xs uppercase font-bold tracking-widest transition-all shadow-xs cursor-pointer active:scale-95">
                    Login
                  </button>
                </Link>
              )}
            </div>

            {/* Direct Cart Page Link */}
            <Link
              href="/cart"
              prefetch={true}
              className="relative p-2.5 rounded-full bg-white hover:bg-black hover:text-white text-black border border-[#E0D8CA] transition-all shadow-2xs flex items-center justify-center group active:scale-95 cursor-pointer"
              aria-label="Shopping Cart"
              title="Shopping Cart"
            >
              <ShoppingBag size={15} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white group-hover:bg-white group-hover:text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#F9F6F0] transition-colors">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Trigger Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-full bg-[#EAE4D6] hover:bg-black hover:text-white transition-colors flex items-center justify-center text-black cursor-pointer shadow-2xs"
              aria-label="Open mobile navigation"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Professional Mobile Full-Screen Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 md:hidden bg-[#FAF7F2] flex flex-col justify-between overflow-y-auto"
          >
            {/* Top Bar inside Mobile Drawer */}
            <div className="p-5 sm:p-6 border-b border-[#E8E2D6] flex items-center justify-between bg-[#FAF7F2]">
              <Link 
                href="/" 
                prefetch={true}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-[#D4AF37]/60 flex-shrink-0 bg-[#3B1D11]">
                  <img 
                    src="/images/perfumes/rove_amber_logo.jpg" 
                    alt="ROVE & AMBER" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-serif tracking-[0.2em] font-bold text-black leading-tight">
                    ROVE & AMBER
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.2em] text-[#8C827A] font-medium">
                    Fine Fragrance
                  </span>
                </div>
              </Link>
              
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-[#EFE8DC] hover:bg-black hover:text-white text-black flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Middle Content: Search + Navigation Links */}
            <div className="p-5 sm:p-6 flex-1 space-y-6">
              
              {/* Mobile Search Bar */}
              <div className="space-y-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search perfumes, signature notes, eau de parfum..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="w-full rounded-2xl py-3 pl-4 pr-11 text-xs bg-white border border-[#E0D8C8] focus:border-black text-black placeholder-gray-400 focus:outline-none shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center cursor-pointer"
                  >
                    <Search size={13} />
                  </button>
                </div>

                {/* Mobile Trending Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {TRENDING_SEARCHES.slice(0, 4).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleTrendingClick(term)}
                      className="px-2.5 py-1 rounded-full bg-white text-gray-700 text-[10px] font-medium border border-[#E0D8C8] cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation List */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C827A] px-2 mb-2">
                  Atelier Navigation
                </p>
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      prefetch={true}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all ${
                        active 
                          ? 'bg-black text-white font-bold shadow-xs' 
                          : 'text-gray-800 hover:bg-[#EFE8DC] font-medium'
                      }`}
                    >
                      <span className="text-sm font-serif tracking-wide">{link.name}</span>
                      <ChevronRight size={15} className={active ? 'text-white' : 'text-gray-400'} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Account & Footer Section */}
            <div className="p-5 sm:p-6 bg-white border-t border-[#E8E2D6] space-y-4">
              {currentUser ? (
                <div className="space-y-3">
                  <Link 
                    href="/profile" 
                    prefetch={true} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="block"
                  >
                    <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] hover:bg-gray-100 rounded-2xl border border-[#E8E2D6] transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs bg-black text-white">
                        {currentUser.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-black truncate">{currentUser.name || 'User Profile'}</p>
                        <p className="text-[11px] text-gray-500 truncate">{currentUser.email || ''}</p>
                      </div>
                    </div>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/profile" prefetch={true} onClick={() => setIsMenuOpen(false)} className="block">
                      <button
                        type="button"
                        className="w-full bg-black hover:bg-[#262626] text-white py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <User size={12} />
                        <span>Profile</span>
                      </button>
                    </Link>
                    <Link href="/orders" prefetch={true} onClick={() => setIsMenuOpen(false)} className="block">
                      <button
                        type="button"
                        className="w-full bg-black hover:bg-[#262626] text-white py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Package size={12} />
                        <span>Orders</span>
                      </button>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gray-50 hover:bg-red-50 text-red-600 border border-gray-200 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <LogOut size={12} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <Link href="/login" prefetch={true} onClick={() => setIsMenuOpen(false)} className="block">
                    <button
                      type="button"
                      className="w-full bg-black hover:bg-[#262626] text-white py-3.5 rounded-full font-bold uppercase text-xs tracking-widest transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <User size={14} />
                      <span>Sign In / Login</span>
                    </button>
                  </Link>
                  <p className="text-center text-[11px] text-gray-500">
                    New to ROVE & AMBER?{' '}
                    <Link 
                      href="/login?tab=register" 
                      prefetch={true}
                      onClick={() => setIsMenuOpen(false)} 
                      className="text-black font-bold underline cursor-pointer"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>
              )}

              {/* Minimal Brand Tagline */}
              <div className="text-center pt-2 text-[10px] uppercase tracking-widest text-gray-400 font-light">
                ROVE & AMBER • Fine Fragrance & Artisanal Perfumery
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
