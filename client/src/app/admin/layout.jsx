"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  PackagePlus, 
  FolderPlus, 
  ClipboardList, 
  LogOut, 
  Search, 
  Bell, 
  Store, 
  ChevronRight, 
  Menu, 
  X, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ConfigProvider, Input, Badge, Dropdown } from 'antd';

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    const token = localStorage.getItem('adminToken') || localStorage.getItem('adminKey');
    const userStr = localStorage.getItem('user');
    let userRole = null;
    if (userStr) {
      try {
        userRole = JSON.parse(userStr)?.role;
      } catch (e) {}
    }

    if (!token || userRole !== 'admin') {
      router.replace('/login?redirect=/admin');
    }
  }, [isLoginPage, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminKey');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
    router.push('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Users List',
      path: '/admin/users',
      icon: Users,
    },
    {
      name: 'Products List',
      path: '/admin/products',
      icon: ShoppingBag,
    },
    {
      name: 'Add Product',
      path: '/admin/products/add',
      icon: PackagePlus,
    },
    {
      name: 'Add Category',
      path: '/admin/categories/add',
      icon: FolderPlus,
    },
    {
      name: 'Orders List',
      path: '/admin/orders',
      icon: ClipboardList,
    },
  ];

  if (isLoginPage) {
    return children;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-[#E8E2D6] font-sans">
      {/* Brand Header */}
      <div className="shrink-0 p-5 border-b border-[#EAE4D8] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D4AF37]/60 shadow-sm bg-[#3B1D11] flex-shrink-0">
            <img src="/images/perfumes/rove_amber_logo.jpg" alt="R&A" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-serif text-base font-bold tracking-[0.2em] text-black block leading-none">
              ROVE & AMBER
            </span>
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#B86526] block mt-1">
              Fine Fragrance Admin
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E0D8CA] text-emerald-800 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Navigation Menu (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-gray-400 px-3 mb-2">
            Management Portal
          </p>
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-black text-white shadow-xs font-bold'
                      : 'text-gray-700 hover:bg-[#FAF8F5] hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-white/15 text-[#FAF8F5] shadow-xs'
                        : 'bg-[#F4EFE6] border border-[#E5DDD0] text-black group-hover:bg-[#EFE8DC]'
                    }`}>
                      <Icon size={15} />
                    </div>
                    <span className="tracking-wide">{item.name}</span>
                  </div>

                  <ChevronRight 
                    size={14} 
                    className={`transition-transform duration-200 ${
                      isActive 
                        ? 'text-white translate-x-0.5' 
                        : 'text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5'
                    }`} 
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin User Footer Card (Fixed at Bottom & Always Visible) */}
      <div className="shrink-0 p-4 border-t border-[#EAE4D8] bg-[#FAF8F5] space-y-2.5">
        <div className="flex items-center justify-between p-2 bg-white rounded-2xl border border-[#E8E2D6]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
              <ShieldCheck size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-black truncate leading-tight">Admin User</p>
              <p className="text-[10px] text-gray-500 truncate font-mono">admin@roveandamber.com</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/80 transition-colors cursor-pointer"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex font-sans">
      
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 z-30 shadow-xs">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar with Prominent Sign Out */}
        <header className="h-20 bg-white border-b border-[#E8E2D6] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-gray-50 hover:bg-black hover:text-white text-gray-700 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <div className="relative hidden sm:block w-72">
              <input
                type="text"
                placeholder="Search products, orders, categories..."
                className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-[#FAF8F5] border border-[#E0D8CA] focus:outline-none focus:border-black text-black placeholder-gray-400"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-black block leading-none">Admin User</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mt-0.5">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Page Content */}
        <main className="p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
