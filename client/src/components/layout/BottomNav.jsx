"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Gift, User, ShoppingBag } from 'lucide-react';
import cartService from '@/services/cartService';

const BottomNav = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isVisible, setIsVisible] = useState(pathname !== '/');

  useEffect(() => {
    if (pathname !== '/') {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      // On homepage, hide bottom nav while at hero top to display unobstructed luxury visual
      if (typeof window !== 'undefined' && window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const updateCartCount = () => {
    setCartCount(cartService.getCartCount());
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cartChange', updateCartCount);
    return () => window.removeEventListener('cartChange', updateCartCount);
  }, []);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          // Admin credentials should never appear as customer profile in mobile bottom navigation
          if (parsedUser && parsedUser.role === 'admin') {
            setCurrentUser(null);
            return;
          }
          if (userToken && parsedUser) {
            setCurrentUser(parsedUser);
            return;
          }
        } catch (e) {}
      } else if (userToken && !localStorage.getItem('adminToken')) {
        setCurrentUser({ name: 'Account' });
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

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: (path) => path === '/'
    },
    {
      label: 'Fragrances',
      href: '/shop',
      icon: Sparkles,
      isActive: (path) => path.startsWith('/shop') || path.startsWith('/product')
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingBag,
      badge: cartCount,
      isActive: (path) => path === '/cart'
    },
    {
      label: 'Gifts',
      href: '/gifts',
      icon: Gift,
      isActive: (path) => path.startsWith('/gifts')
    },
    {
      label: currentUser ? (currentUser.name?.split(' ')[0] || 'Profile') : 'Account',
      href: currentUser ? '/profile' : '/login',
      icon: User,
      isActive: (path) => path === '/login' || path === '/profile'
    }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className={`md:hidden fixed bottom-3 left-4 right-4 z-50 max-w-sm mx-auto pointer-events-auto transition-all duration-300 ${
        isVisible 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <div className="bg-[#F5EFE6]/95 backdrop-blur-md border border-[#E6DDD0] rounded-full px-3 py-1.5 shadow-[0_10px_35px_rgba(0,0,0,0.22)] flex items-center justify-around">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          const IconComponent = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
                active 
                  ? 'bg-[#E5D7C2] text-[#2C1810] px-3.5 py-2 rounded-full shadow-inner' 
                  : 'text-[#6E6359] hover:text-[#2C1810] px-2.5 py-2'
              }`}
              aria-label={item.label}
            >
              <IconComponent 
                size={20} 
                strokeWidth={active ? 2.1 : 1.7} 
                className={`transition-transform duration-200 ${
                  active ? 'scale-105' : 'hover:scale-110'
                }`}
              />
              {item.badge > 0 && (
                <span className="absolute -top-0.5 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-[#B86526] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
