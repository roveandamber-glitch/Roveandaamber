"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  Sparkles, 
  Gift, 
  ClipboardList, 
  Users, 
  Trophy, 
  Tag, 
  Star, 
  FileEdit, 
  Warehouse, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Store, 
  ChevronRight, 
  ChevronDown, 
  Menu, 
  X, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Dropdown, Badge, Tooltip } from 'antd';
import adminService, { isBackendConnected } from '@/services/adminService';

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    products: false,
    content: false,
    settings: false
  });
  const [backendLive, setBackendLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // Authentication & Demo Admin Auto-Session Init
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('adminKey');
      const userStr = localStorage.getItem('user');
      let userRole = null;
      if (userStr) {
        try {
          userRole = JSON.parse(userStr)?.role;
        } catch (e) {}
      }

      // If no admin session exists, initialize a preview administrator session
      if (!token || userRole !== 'admin') {
        localStorage.setItem('adminToken', 'preview_admin_session_token');
        localStorage.setItem('adminKey', 'preview_admin_session_token');
        localStorage.setItem('user', JSON.stringify({
          id: 'admin-1',
          name: 'Admin',
          email: 'admin@roveamber.com',
          role: 'admin',
          designation: 'Super Admin'
        }));
      }

      // Check backend API connectivity
      adminService.checkHealth().then((status) => {
        setBackendLive(status);
      });
    }
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminKey');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authChange'));
    }
    router.push('/login');
  };

  const toggleSubmenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: Package,
      submenuKey: 'products',
      subItems: [
        { name: 'All Perfumes', path: '/admin/products' },
        { name: 'Add Perfume', path: '/admin/products/add' }
      ]
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: FolderTree
    },
    {
      name: 'Collections',
      path: '/admin/collections',
      icon: Sparkles
    },
    {
      name: 'Gift Sets',
      path: '/admin/gifts',
      icon: Gift
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ClipboardList
    },
    {
      name: 'Customers',
      path: '/admin/customers',
      icon: Users
    },
    {
      name: 'Rewards',
      path: '/admin/rewards',
      icon: Trophy,
      badge: 'New'
    },
    {
      name: 'Coupons & Offers',
      path: '/admin/coupons',
      icon: Tag
    },
    {
      name: 'Reviews',
      path: '/admin/reviews',
      icon: Star
    },
    {
      name: 'Content',
      path: '/admin/content',
      icon: FileEdit,
      submenuKey: 'content',
      subItems: [
        { name: 'Banners', path: '/admin/content?tab=banners' },
        { name: 'Homepage', path: '/admin/content?tab=homepage' }
      ]
    },
    {
      name: 'Inventory',
      path: '/admin/inventory',
      icon: Warehouse
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: BarChart3
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  const adminMenu = {
    items: [
      {
        key: 'store',
        label: (
          <Link href="/" target="_blank" className="flex items-center gap-2 text-xs py-1">
            <Store size={14} className="text-[#DEB368]" />
            <span>View Public Storefront</span>
            <ExternalLink size={12} className="ml-auto text-gray-400" />
          </Link>
        )
      },
      {
        key: 'settings',
        label: (
          <Link href="/admin/settings" className="flex items-center gap-2 text-xs py-1">
            <Settings size={14} className="text-gray-500" />
            <span>Store Settings</span>
          </Link>
        )
      },
      {
        type: 'divider'
      },
      {
        key: 'logout',
        danger: true,
        label: (
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs w-full py-1 text-left text-red-600">
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        )
      }
    ]
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#140C08] text-white font-sans relative overflow-hidden select-none border-r border-[#261710]">
      {/* Decorative Golden Botanical Watermark in lower left */}
      <div 
        className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none opacity-[0.07] bg-no-repeat bg-contain bg-bottom-left"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath fill='%23ECC880' d='M40,160 C30,120 70,80 110,60 C90,100 80,140 40,160 Z'/%3E%3Cpath fill='%23ECC880' d='M90,170 C100,130 140,100 170,80 C150,120 130,150 90,170 Z'/%3E%3Cpath fill='%23ECC880' d='M60,180 C80,160 110,150 140,160 C120,180 90,190 60,180 Z'/%3E%3C/svg%3E")`
        }}
      />

      {/* Brand Header */}
      <div className={`p-5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} border-b border-[#24150D]/90 transition-all`}>
        {!collapsed && (
          <Link href="/admin" className="flex flex-col group">
            <span className="font-serif tracking-[0.22em] text-[#ECC880] text-sm sm:text-base font-medium group-hover:text-white transition-colors">
              ROVE & AMBER
            </span>
            <span className="text-[8px] tracking-[0.34em] font-medium uppercase text-[#C5A880]/70">
              FINE FRAGRANCE
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ECC880] to-[#C09048] flex items-center justify-center text-[#160E09] font-serif font-bold text-sm shadow-md">
            RA
          </Link>
        )}
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-[#2C1A11] scrollbar-track-transparent">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
          const hasSubmenu = Boolean(item.subItems);
          const isExpanded = expandedMenus[item.submenuKey];

          return (
            <div key={item.name} className="flex flex-col">
              {hasSubmenu ? (
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.submenuKey)}
                  className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37]/25 to-[#D4AF37]/10 text-white font-semibold border-l-2 border-[#DEB368] shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-[#ECC880]' : 'text-gray-400 group-hover:text-gray-200'} />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  {!collapsed && (
                    <span className="text-gray-400 transition-transform">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href={item.path}
                  className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37]/25 to-[#D4AF37]/10 text-white font-semibold border-l-2 border-[#DEB368] shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-[#ECC880]' : 'text-gray-400'} />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#ECC880] to-[#C99042] text-[#241306] shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}

              {/* Collapsible Submenu */}
              {hasSubmenu && isExpanded && !collapsed && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                  {item.subItems.map((sub) => {
                    const isSubActive = pathname === sub.path;
                    return (
                      <Link
                        key={sub.name}
                        href={sub.path}
                        className={`block py-1.5 px-3 rounded-lg text-[11px] transition-colors ${
                          isSubActive
                            ? 'text-[#ECC880] font-semibold bg-white/[0.06]'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin User Chip & Sidebar Collapse Footer */}
      <div className="p-3 border-t border-[#24150D]/90 bg-[#100906]/70 relative z-10">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2.5`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ECC880] to-[#B8860B] text-[#1E1108] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              A
            </div>
            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-white truncate">Admin</p>
                <p className="text-[10px] text-gray-400 truncate">Super Admin</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                title="Collapse Sidebar"
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={13} className="rotate-180" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>
          )}
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="Expand Sidebar"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer mt-1"
            >
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-row font-sans text-[#1A1A1A] antialiased">
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} h-screen sticky top-0 z-30`}>
        <SidebarContent />
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-72 max-w-[85vw] h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* TOP ADMINISTRATIVE HEADER (Matching Reference Design) */}
        <header className="sticky top-0 z-20 bg-[#F9F6F0]/95 backdrop-blur-md border-b border-[#EBE4D8] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile Menu Button & Search */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-white border border-[#E6DEC7] flex items-center justify-center text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer"
            >
              <Menu size={18} />
            </button>

            {/* Global Search Bar (Matching Reference) */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, orders, customers..."
                className="w-full bg-white border border-[#E6DEC7] focus:border-[#DEB368] rounded-full py-2 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:outline-none shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all"
              />
            </div>
          </div>

          {/* Right Header Badges & Profile Chip */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Backend Connectivity Status Pill */}
            <Tooltip title={backendLive ? 'Connected to live Express / MongoDB API at :5000' : 'Running in Interactive Preview Mode (Backend offline). All UI features & mocks active.'}>
              <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border shadow-xs ${
                backendLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${backendLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{backendLive ? 'Live API Connected' : 'Preview Mode'}</span>
              </div>
            </Tooltip>

            {/* View Customer Storefront Shortcut */}
            <Link
              href="/"
              target="_blank"
              title="Open Customer Storefront in new tab"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#4A3828] bg-white border border-[#E6DEC7] hover:border-[#DEB368] hover:text-[#160E09] shadow-2xs transition-all"
            >
              <Store size={13} className="text-[#DEB368]" />
              <span>Storefront</span>
            </Link>

            {/* Notification Bell (Badge matching reference red circle) */}
            <div className="relative cursor-pointer">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-white border border-[#E6DEC7] flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-400 shadow-2xs transition-all"
              >
                <Bell size={16} />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E53E3E] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                3
              </span>
            </div>

            {/* Admin Profile Dropdown Chip */}
            <Dropdown menu={adminMenu} trigger={['click']} placement="bottomRight">
              <button 
                type="button" 
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white border border-[#E6DEC7] hover:border-[#DEB368] shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ECC880] to-[#B8860B] text-[#1E1108] font-bold text-xs flex items-center justify-center shadow-xs">
                  A
                </div>
                <span className="text-xs font-semibold text-gray-800 hidden sm:inline">Admin</span>
                <ChevronDown size={13} className="text-gray-400" />
              </button>
            </Dropdown>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
