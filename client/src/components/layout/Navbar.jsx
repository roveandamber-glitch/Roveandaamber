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
  ShoppingBag,
  Heart,
  Home,
  Sparkles,
  Gift,
  Compass,
  MessageSquare
} from 'lucide-react';
import { message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import productService from '../../services/productService';
import cartService from '../../services/cartService';
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path) => pathname === path;
  const isHome = pathname === '/';
  const isGifts = pathname === '/gifts';
  const hasDarkHero = isHome || isGifts;
  const isDarkHero = hasDarkHero && !isScrolled;

  const updateCartCount = () => {
    setCartCount(cartService.getCartCount());
  };

  const updateWishlistCount = () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('rove_amber_wishlist');
      if (stored) {
        const list = JSON.parse(stored);
        setWishlistCount(Array.isArray(list) ? list.length : 0);
      } else {
        setWishlistCount(0);
      }
    } catch (e) {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    updateWishlistCount();
    window.addEventListener('cartChange', updateCartCount);
    window.addEventListener('wishlistChange', updateWishlistCount);
    return () => {
      window.removeEventListener('cartChange', updateCartCount);
      window.removeEventListener('wishlistChange', updateWishlistCount);
    };
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
      const userStr = localStorage.getItem('user');
      const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          // Admin credentials belong solely to /admin and should NEVER appear as a logged-in user on the customer storefront
          if (parsedUser && parsedUser.role === 'admin') {
            setCurrentUser(null);
            return;
          }
          if (userToken && parsedUser) {
            setCurrentUser(parsedUser);
            return;
          }
        } catch (e) {
          console.error('Error parsing customer session:', e);
        }
      } else if (userToken && !localStorage.getItem('adminToken')) {
        setCurrentUser({ name: 'Customer' });
        return;
      }
      
      setCurrentUser(null);
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
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        // keep mobile search unless clicked outside
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

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

    const timer = setTimeout(fetchResults, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchQuery.trim()) {
        setShowDropdown(false);
        setIsMobileSearchOpen(false);
        setIsMenuOpen(false);
        router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleTrendingClick = (term) => {
    setSearchQuery(term);
    setShowDropdown(false);
    setIsMobileSearchOpen(false);
    setIsMenuOpen(false);
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Collections', path: '/shop', icon: Sparkles },
    { name: 'Gifts', path: '/gifts', icon: Gift },
    { name: 'About', path: '/about', icon: Compass },
    { name: 'Contact', path: '/contact', icon: MessageSquare },
  ];

  const drawerLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Collections', path: '/shop', icon: Sparkles },
    { name: 'Shopping Bag', path: '/cart', icon: ShoppingBag, badge: cartCount },
    { name: 'Gifts', path: '/gifts', icon: Gift },
    { name: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    { name: 'My Orders', path: '/orders', icon: Package },
    { name: 'About', path: '/about', icon: Compass },
    { name: 'Contact', path: '/contact', icon: MessageSquare },
  ];

  return (
    <>
      {/* MOBILE FLOATING HEADER (Adaptive Luxury Styling) */}
      <div className="md:hidden fixed top-3 left-3 right-3 z-50">
        <div className={`backdrop-blur-md border rounded-full px-3.5 py-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all ${
          isDarkHero 
            ? 'bg-[#18110D]/75 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.36)]' 
            : 'bg-white/95 border-[#E6DEC7] shadow-md'
        }`}>
          {/* Left: Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
              isDarkHero
                ? 'border border-white/25 bg-white/10 text-white hover:bg-white/20'
                : 'border border-[#E0D8CA] bg-[#FAF8F5] text-[#1A1A1A] hover:bg-[#ECE5D8]'
            }`}
            aria-label="Open menu"
          >
            <Menu size={18} strokeWidth={1.8} />
          </button>

          {/* Center: ROVE & AMBER FINE FRAGRANCE */}
          <Link href="/" className="flex flex-col items-center justify-center text-center">
            <span className="font-serif text-[15px] sm:text-base font-semibold tracking-[0.22em] text-[#E5B869] uppercase leading-tight">
              ROVE & AMBER
            </span>
            <span className={`text-[7.5px] tracking-[0.32em] uppercase font-sans font-medium mt-0.5 ${
              isDarkHero ? 'text-[#F3ECE1]/80' : 'text-[#8C7A6B]'
            }`}>
              FINE FRAGRANCE
            </span>
          </Link>

          {/* Right: Search & Wishlist */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(prev => !prev)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isDarkHero ? 'text-white hover:text-[#E5B869]' : 'text-[#1A1A1A] hover:text-[#B8860B]'
              }`}
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.8} />
            </button>

            <Link
              href="/wishlist"
              prefetch={true}
              className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isDarkHero ? 'text-white hover:text-[#E5B869]' : 'text-[#1A1A1A] hover:text-[#B8860B]'
              }`}
              aria-label="Wishlist"
            >
              <Heart size={19} strokeWidth={1.8} />
              <span className={`absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center leading-none shadow-xs ${
                isDarkHero ? 'bg-[#E5B869] text-[#18110D]' : 'bg-[#B8860B] text-white'
              }`}>
                {wishlistCount || 0}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Slide-down Search Bar */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 8, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border border-white/20 bg-[#18110D]/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl mt-1"
            >
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fragrances, notes, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  autoFocus
                  className="w-full bg-white/10 border border-white/20 focus:border-[#E5B869] rounded-full py-2 pl-9 pr-14 text-xs text-white placeholder-gray-400 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="absolute right-1.5 bg-[#E5B869] hover:bg-[#D4A352] text-[#241306] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full cursor-pointer transition-colors"
                >
                  Go
                </button>
              </div>

              {/* Quick trending suggestions on mobile search */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {TRENDING_SEARCHES.slice(0, 4).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleTrendingClick(term)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#E5B869] border border-white/15 cursor-pointer transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP VIEW HEADER */}
      <nav 
        className={`hidden md:block fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          !isDarkHero 
            ? 'bg-white/95 backdrop-blur-md py-3 shadow-md border-b border-[#ECE7DE] text-[#1A1A1A]' 
            : 'bg-[#120B06]/85 backdrop-blur-md py-3.5 border-b border-white/10 text-white shadow-xl'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between gap-6">
            {/* Desktop Brand Logo */}
            <Link 
              href="/" 
              className="flex flex-col items-center justify-center text-center group py-0.5 flex-shrink-0 cursor-pointer"
            >
              <span className="font-serif text-[15px] lg:text-base font-semibold tracking-[0.22em] text-[#E5B869] uppercase leading-tight group-hover:brightness-110 transition-all">
                ROVE & AMBER
              </span>
              <span className={`text-[7.5px] lg:text-[8px] tracking-[0.32em] uppercase font-sans font-medium mt-0.5 transition-colors ${
                (!isDarkHero) ? 'text-[#8C7A6B]' : 'text-[#F3ECE1]/80'
              }`}>
                FINE FRAGRANCE
              </span>
            </Link>
          
            {/* Desktop Navigation Links with Adaptive Luxury Styling */}
            <div className="flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const IconComponent = link.icon;
                return (
                  <Link 
                    key={link.path}
                    href={link.path} 
                    prefetch={true}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs tracking-wider font-medium transition-all duration-200 ${
                      (!isDarkHero)
                        ? (active 
                            ? 'bg-[#1A1A1A] text-white shadow-xs' 
                            : 'text-[#4A4036] hover:text-black hover:bg-[#FAF8F5]')
                        : (active 
                            ? 'bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#241306] shadow-sm font-semibold' 
                            : 'text-white/80 hover:text-white hover:bg-white/10')
                    }`}
                  >
                    <IconComponent 
                      size={14} 
                      strokeWidth={active ? 2 : 1.7} 
                      className={
                        (!isDarkHero)
                          ? (active ? 'text-[#D4AF37]' : 'text-neutral-400')
                          : (active ? 'text-[#241306]' : 'text-[#E5B869]/80')
                      } 
                    />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Section: Action Icons & Search */}
            <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 flex-shrink-0">
              
              {/* Desktop Search Bar */}
              <div className="relative" ref={searchRef}>
                <div className="relative flex items-center">
                  <Search 
                    size={14} 
                    className={`absolute left-3 pointer-events-none transition-colors ${
                      (!isDarkHero) ? 'text-gray-400' : 'text-white/60'
                    }`} 
                  />
                  <input 
                    type="text" 
                    placeholder="Search fragrances..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleSearch}
                    className={`w-32 lg:w-44 focus:w-44 lg:focus:w-56 rounded-full py-1.5 pl-8 pr-7 text-xs focus:outline-none transition-all duration-300 ${
                      (!isDarkHero)
                        ? 'bg-[#FAF9F7] border border-[#E0D8CA] focus:border-black focus:bg-white text-black placeholder-gray-400'
                        : 'bg-white/10 border border-white/20 focus:border-[#E5B869] focus:bg-white/20 text-white placeholder-white/50'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="absolute right-2.5 text-gray-400 hover:text-black cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Live Search Flyout Dropdown */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-3 w-88 lg:w-96 bg-white rounded-2xl shadow-xl border border-[#E8E2D6] overflow-hidden z-50 p-2 text-[#1A1A1A]"
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
                              Matching Fragrances ({searchResults.length})
                            </span>
                            <span className="text-[10px] text-gray-400">Press ↵ to view all</span>
                          </div>

                          <div className="max-h-72 overflow-y-auto py-1">
                            {searchResults.map((product) => (
                              <Link 
                                key={product._id || product.id} 
                                href={`/product/${product._id || product.id}`}
                                onClick={() => {
                                  setShowDropdown(false);
                                  setSearchQuery('');
                                }}
                                className="flex items-center px-3 py-2 rounded-xl hover:bg-[#FAF8F5] transition-colors group"
                              >
                                <div className="w-10 h-12 bg-[#FAF9F7] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-100">
                                  <img 
                                    src={getImageUrl(product.images?.[0]?.url || product.image)} 
                                    alt={product.name}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                    onError={(e) => { e.target.src = '/images/perfumes/amber_oud_perfume.jpg'; }}
                                  />
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                  <h4 className="text-xs font-serif font-bold text-black truncate group-hover:text-[#B86526]">
                                    {product.name}
                                  </h4>
                                  <span className="text-[10px] text-[#B38738] uppercase block">
                                    {product.category || 'Perfumes'}
                                  </span>
                                  <span className="text-xs font-bold text-black font-sans mt-0.5 block">
                                    ₹{(product.price || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : searchQuery.trim().length >= 2 && searchResults.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-xs font-serif text-black mb-1">No fragrances found for "{searchQuery}"</p>
                          <p className="text-[11px] text-gray-400">Try searching for Amber Oud, Golden Saffron, or Velvet Musk.</p>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-center gap-1.5 mb-2.5 text-[10px] uppercase font-bold tracking-widest text-[#8C827A]">
                            <TrendingUp size={13} />
                            <span>Popular Searches</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {TRENDING_SEARCHES.map((term) => (
                              <button
                                key={term}
                                type="button"
                                onClick={() => handleTrendingClick(term)}
                                className="px-3 py-1 rounded-full bg-[#FAF8F5] hover:bg-black hover:text-white text-gray-700 text-xs font-medium border border-[#E8E2D6] transition-colors cursor-pointer"
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

              {/* Desktop My Orders Icon */}
              <Link
                href="/orders"
                prefetch={true}
                className={`p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer ${
                  (!isDarkHero) 
                    ? 'text-neutral-700 hover:text-black hover:bg-[#FAF8F5]' 
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
                title="My Orders"
                aria-label="My Orders"
              >
                <Package size={18} strokeWidth={1.8} />
              </Link>

              {/* Desktop Wishlist Button */}
              <Link
                href="/wishlist"
                prefetch={true}
                className={`relative p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer ${
                  (!isDarkHero) 
                    ? 'text-neutral-700 hover:text-black hover:bg-[#FAF8F5]' 
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
                title="Saved Wishlist"
                aria-label="Saved Wishlist"
              >
                <Heart 
                  size={18} 
                  strokeWidth={1.8}
                  className={wishlistCount > 0 ? ((!isDarkHero) ? 'fill-[#B8860B] text-[#B8860B]' : 'fill-[#E5B869] text-[#E5B869]') : ''} 
                />
                {wishlistCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs ${
                    (!isDarkHero) ? 'bg-[#B8860B] text-white' : 'bg-[#E5B869] text-[#18110D]'
                  }`}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Desktop Cart Button */}
              <Link
                href="/cart"
                prefetch={true}
                className={`relative p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer ${
                  (!isDarkHero) 
                    ? 'text-neutral-700 hover:text-black hover:bg-[#FAF8F5]' 
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
                title="Shopping Bag"
                aria-label="Shopping Cart"
              >
                <ShoppingBag size={18} strokeWidth={1.8} />
                <span className={`absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs ${
                  (!isDarkHero) ? 'bg-[#B8860B] text-white' : 'bg-[#E5B869] text-[#18110D]'
                }`}>
                  {cartCount}
                </span>
              </Link>

              {/* Desktop User Account Button */}
              {currentUser ? (
                <Link href="/profile" prefetch={true}>
                  <button className={`flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    (!isDarkHero) 
                      ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900' 
                      : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                  }`}>
                    <div className="w-5 h-5 rounded-full bg-[#E5B869] text-[#18110D] flex items-center justify-center text-[10px] font-bold">
                      {currentUser.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[70px] truncate">
                      {currentUser.name ? (currentUser.name.split(' ')[0] || 'Profile') : 'Profile'}
                    </span>
                  </button>
                </Link>
              ) : (
                <Link href="/login" prefetch={true}>
                  <button className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer ${
                    (!isDarkHero)
                      ? 'bg-black hover:bg-[#262626] text-white'
                      : 'bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#281608] hover:brightness-105 font-semibold'
                  }`}>
                    <User size={13} strokeWidth={1.8} />
                    <span>Login</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Navigation Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-0 z-50 md:hidden bg-white flex flex-col justify-between overflow-y-auto"
          >
            {/* Top Bar inside Mobile Drawer */}
            <div className="p-4 sm:p-5 border-b border-[#ECE7DE] flex items-center justify-between bg-white">
              <Link 
                href="/" 
                prefetch={true}
                onClick={() => setIsMenuOpen(false)}
                className="flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <span className="font-serif text-[15px] sm:text-base font-semibold tracking-[0.22em] text-[#E5B869] uppercase leading-tight">
                  ROVE & AMBER
                </span>
                <span className="text-[7.5px] tracking-[0.32em] uppercase font-sans font-medium text-[#8C7A6B] mt-0.5">
                  FINE FRAGRANCE
                </span>
              </Link>
              
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-black hover:text-white text-black flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Middle Content: Navigation Links */}
            <div className="p-5 flex-1 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C827A] px-2 mb-2">
                  Navigation
                </p>
                {drawerLinks.map((link) => {
                  const active = isActive(link.path);
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      prefetch={true}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                        active 
                          ? 'bg-black text-white font-bold' 
                          : 'text-gray-800 hover:bg-[#FAF8F5] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent size={16} strokeWidth={active ? 2 : 1.7} className={active ? 'text-[#D4AF37]' : 'text-neutral-500'} />
                        <span className="text-sm font-serif tracking-wide">{link.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {link.name === 'Wishlist' && wishlistCount > 0 && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            active ? 'bg-white text-black' : 'bg-[#B8860B] text-white'
                          }`}>
                            {wishlistCount}
                          </span>
                        )}
                        <ChevronRight size={15} className={active ? 'text-white' : 'text-gray-400'} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Account & Footer Section */}
            <div className="p-5 bg-[#FAF9F7] border-t border-[#ECE7DE] space-y-3">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#ECE7DE]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-black text-white">
                      {currentUser.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-black truncate">{currentUser.name || 'User Profile'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{currentUser.email || ''}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/profile" prefetch={true} onClick={() => setIsMenuOpen(false)} className="block">
                      <button
                        type="button"
                        className="w-full bg-black text-white py-2 rounded-lg font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <User size={12} />
                        <span>Profile</span>
                      </button>
                    </Link>
                    <Link href="/orders" prefetch={true} onClick={() => setIsMenuOpen(false)} className="block">
                      <button
                        type="button"
                        className="w-full bg-black text-white py-2 rounded-lg font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1 cursor-pointer"
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
                    className="w-full bg-white text-red-600 border border-red-200 py-2 rounded-lg font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <LogOut size={12} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" prefetch={true} onClick={() => setIsMenuOpen(false)} className="block">
                    <button
                      type="button"
                      className="w-full bg-black text-white py-3 rounded-full font-bold uppercase text-xs tracking-widest cursor-pointer flex items-center justify-center gap-2"
                    >
                      <User size={14} />
                      <span>Sign In / Login</span>
                    </button>
                  </Link>
                  <p className="text-center text-[10px] text-gray-500">
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

              <div className="text-center pt-1 text-[9px] uppercase tracking-widest text-gray-400">
                ROVE & AMBER • Fine Fragrance
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
