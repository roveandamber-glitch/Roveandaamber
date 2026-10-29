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
import adminService from '@/services/adminService';

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    products: false,
    content: false
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
      icon: LayoutDashboard
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
      name: 'Content Studio',
      path: '/admin/content',
      icon: FileEdit
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
          <Link href="/" target="_blank" className="flex items-center gap-2 text-xs py-1 text-gray-700 hover:text-[#D4A64A]">
            <Store size={14} className="text-[#D4A64A]" />
            <span>View Public Storefront</span>
            <ExternalLink size={12} className="ml-auto text-gray-400" />
          </Link>
        )
      },
      {
        key: 'settings',
        label: (
          <Link href="/admin/settings" className="flex items-center gap-2 text-xs py-1 text-gray-700 hover:text-[#D4A64A]">
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

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-[#1B100A] text-white font-sans select-none overflow-hidden">
      {/* Brand Header */}
      <div className={`shrink-0 p-5 flex items-center ${collapsed && !isMobile ? 'justify-center' : 'justify-between'} border-b border-[#2A1B12]`}>
        {!collapsed || isMobile ? (
          <Link 
            href="/admin" 
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className="flex flex-col group"
          >
            <span className="font-serif tracking-[0.22em] text-[#D4A64A] text-sm sm:text-base font-medium group-hover:text-white transition-colors">
              ROVE & AMBER
            </span>
            <span className="text-[8px] tracking-[0.34em] font-medium uppercase text-[#D4A64A]/70">
              FINE FRAGRANCE
            </span>
          </Link>
        ) : (
          <Link href="/admin" className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4A64A] to-[#B38728] flex items-center justify-center text-[#1B100A] font-serif font-bold text-sm shadow-md">
            RA
          </Link>
        )}

        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1 admin-sidebar-scroll">
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
                  className={`w-full flex items-center ${collapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#D4A64A]/20 text-white font-semibold border-l-4 border-[#D4A64A] shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-[#D4A64A]' : 'text-gray-400'} />
                    {(!collapsed || isMobile) && <span className="truncate">{item.name}</span>}
                  </div>
                  {(!collapsed || isMobile) && (
                    <span className="text-gray-400 transition-transform">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  href={item.path}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                  className={`flex items-center ${collapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#D4A64A]/20 text-white font-semibold border-l-4 border-[#D4A64A] shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? 'text-[#D4A64A]' : 'text-gray-400'} />
                    {(!collapsed || isMobile) && <span className="truncate">{item.name}</span>}
                  </div>
                  {(!collapsed || isMobile) && item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4A64A] to-[#B38728] text-[#1B100A] shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}

              {/* Submenu */}
              {hasSubmenu && isExpanded && (!collapsed || isMobile) && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                  {item.subItems.map((sub) => {
                    const isSubActive = pathname === sub.path;
                    return (
                      <Link
                        key={sub.name}
                        href={sub.path}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                        className={`block py-1.5 px-3 rounded-lg text-[11px] transition-colors ${
                          isSubActive
                            ? 'text-[#D4A64A] font-semibold bg-white/[0.06]'
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

      {/* Admin User Chip & Collapse Button */}
      <div className="shrink-0 p-3 border-t border-[#2A1B12] bg-[#140C08]">
        <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'justify-between'} gap-2.5`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4A64A] to-[#B38728] text-[#1B100A] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              A
            </div>
            {(!collapsed || isMobile) && (
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-white truncate">Admin</p>
                <p className="text-[10px] text-gray-400 truncate">Super Admin</p>
              </div>
            )}
          </div>

          {!isMobile && (
            !collapsed ? (
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
            ) : (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                title="Expand Sidebar"
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            )
          )}

          {isMobile && (
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F4ED] font-sans text-[#1B100A] antialiased">
      {/* DESKTOP SIDEBAR - FIXED TO VIEWPORT */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 h-screen transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } bg-[#1B100A] border-r border-[#2A1B12] shadow-xl`}
      >
        <SidebarContent />
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-72 max-w-[85vw] h-full shadow-2xl bg-[#1B100A]"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER - Offset by fixed sidebar width */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* TOP ADMINISTRATIVE HEADER */}
        <header className="sticky top-0 z-30 bg-[#F8F4ED]/95 backdrop-blur-md border-b border-[#E8DFC8] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile Menu Toggle & Global Search */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-white border border-[#E8DFC8] flex items-center justify-center text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer"
            >
              <Menu size={18} />
            </button>

            <div className="relative w-full max-w-md hidden sm:block">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, orders, customers..."
                className="w-full bg-white border border-[#E8DFC8] focus:border-[#D4A64A] rounded-full py-2 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:outline-none shadow-xs transition-all"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Status Indicator */}
            <Tooltip title={backendLive ? 'Backend API connected' : 'Preview Mode Active'}>
              <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border shadow-2xs ${
                backendLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${backendLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{backendLive ? 'Live API Connected' : 'Preview Mode'}</span>
              </div>
            </Tooltip>

            {/* Storefront Link */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#1B100A] bg-white border border-[#E8DFC8] hover:border-[#D4A64A] shadow-2xs transition-all"
            >
              <Store size={13} className="text-[#D4A64A]" />
              <span>Storefront</span>
            </Link>

            {/* Notification Bell */}
            <div className="relative cursor-pointer">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-white border border-[#E8DFC8] flex items-center justify-center text-gray-700 hover:text-black hover:border-gray-400 shadow-2xs transition-all"
              >
                <Bell size={16} />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E53E3E] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                3
              </span>
            </div>

            {/* Admin Profile Dropdown */}
            <Dropdown menu={adminMenu} trigger={['click']} placement="bottomRight">
              <button 
                type="button" 
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white border border-[#E8DFC8] hover:border-[#D4A64A] shadow-2xs transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4A64A] to-[#B38728] text-[#1B100A] font-bold text-xs flex items-center justify-center shadow-xs">
                  A
                </div>
                <span className="text-xs font-semibold text-gray-800 hidden sm:inline">Admin</span>
                <ChevronDown size={13} className="text-gray-400" />
              </button>
            </Dropdown>
          </div>
        </header>

        {/* MAIN PAGE CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
