"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Gift, User } from 'lucide-react';

const BottomNav = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);

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
          setCurrentUser({ name: 'Account' });
        }
      } else if (token) {
        setCurrentUser({ name: 'Account' });
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
      className="md:hidden fixed bottom-3 left-4 right-4 z-50 max-w-sm mx-auto pointer-events-auto"
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
              className={`flex items-center justify-center transition-all duration-200 cursor-pointer ${
                active 
                  ? 'bg-[#E5D7C2] text-[#2C1810] px-4 py-2 rounded-full shadow-inner' 
                  : 'text-[#6E6359] hover:text-[#2C1810] px-3 py-2'
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
