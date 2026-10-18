"use client";
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, message, Spin, Button, Avatar } from 'antd';
import { 
  ShoppingBag, 
  Layers, 
  PackageCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Plus, 
  ArrowRight,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      totalCategories: 0,
      totalRevenue: 0
    },
    topProducts: [],
    recentOrders: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDashboardStats();
      if (response?.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      message.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Products', 
      value: data.stats.totalProducts, 
      subtext: 'Catalog Inventory', 
      icon: ShoppingBag, 
      trend: 'Live in store',
      color: '#1a1a1a', 
      bg: '#F5F1E9' 
    },
    { 
      title: 'Total Categories', 
      value: data.stats.totalCategories, 
      subtext: 'Curated Collections', 
      icon: Layers, 
      trend: 'Organized',
      color: '#1a1a1a', 
      bg: '#F5F1E9' 
    },
    { 
      title: 'Total Orders', 
      value: data.stats.totalOrders, 
      subtext: 'Completed & Placed', 
      icon: PackageCheck, 
      trend: 'Real-time updates',
      color: '#1a1a1a', 
      bg: '#F5F1E9' 
    },
    { 
      title: 'Total Revenue', 
      value: `₹${(data.stats.totalRevenue || 0).toLocaleString('en-IN')}`, 
      subtext: 'Gross Merchandise Value', 
      icon: TrendingUp, 
      trend: '+18% this month',
      color: '#1a1a1a', 
      bg: '#F5F1E9' 
    },
  ];

  const recentOrdersColumns = [
    { 
      title: 'Order ID', 
      dataIndex: 'orderId', 
      key: 'orderId',
      render: (text) => <span className="font-mono font-bold text-xs bg-gray-100 px-2.5 py-1 rounded-md">{text}</span>
    },
    { 
      title: 'Customer', 
      dataIndex: 'customerName', 
      key: 'customerName',
      render: (name) => (
        <div className="flex items-center space-x-2.5">
          <Avatar size="small" className="bg-[#EFE8DC] text-black text-xs font-bold">
            {name ? name.charAt(0).toUpperCase() : 'C'}
          </Avatar>
          <span className="font-medium text-xs text-black">{name || 'Valued Customer'}</span>
        </div>
      )
    },
    { 
      title: 'Date', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      render: (date) => <span className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</span>
    },
    { 
      title: 'Amount', 
      dataIndex: 'totalPrice', 
      key: 'totalPrice', 
      render: (val) => <span className="font-bold text-black text-xs font-sans">₹{(val || 0).toLocaleString('en-IN')}</span> 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        let color = status === 'Delivered' ? 'green' : status === 'Processing' ? 'orange' : status === 'Shipped' ? 'cyan' : 'blue';
        return <Tag color={color} className="rounded-full px-2.5 py-0.5 border-0 font-medium text-[11px] capitalize">{status}</Tag>;
      }
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Spin size="large" />
        <p className="text-xs uppercase tracking-widest text-[#B86526] font-bold">Loading ROVE & AMBER Insights...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B86526]">Fragrance House Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-black tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-500 text-xs mt-1">Overview of store revenue, real-time inventory counts, and customer orders.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/products/add">
            <button className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all shadow-sm cursor-pointer">
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </Link>
          <Link href="/admin/categories/add">
            <button className="bg-white hover:bg-gray-50 border border-gray-200 text-black px-4 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all shadow-xs cursor-pointer">
              <Layers size={14} />
              <span>Add Category</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <Row gutter={[20, 20]} className="mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="hover:shadow-md transition-all duration-300 border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-2xl bg-white p-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">
                      {stat.title}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-black tracking-tight m-0">
                      {stat.value}
                    </h3>
                  </div>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#F5F1E9] text-black border border-[#EBE4D8] flex-shrink-0">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-[11px]">
                  <span className="text-gray-400 font-light">{stat.subtext}</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {stat.trend}
                  </span>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Main Content Grid: Recent Orders & Top Products */}
      <Row gutter={[20, 20]}>
        {/* Recent Orders Table */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-black m-0">Recent Orders</h3>
                  <p className="text-xs text-gray-400 font-normal m-0 mt-0.5">Latest purchase requests from storefront</p>
                </div>
                <Link href="/admin/orders">
                  <Button type="text" size="small" className="text-xs font-semibold text-black hover:text-gray-600 flex items-center gap-1">
                    <span>View All</span>
                    <ArrowRight size={13} />
                  </Button>
                </Link>
              </div>
            }
            className="border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-2xl h-full bg-white"
            bodyStyle={{ padding: '0 16px 16px 16px' }}
          >
            <Table 
              columns={recentOrdersColumns} 
              dataSource={data.recentOrders} 
              pagination={false}
              rowKey="_id"
              className="mt-1"
            />
          </Card>
        </Col>

        {/* Top Selling Products */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="py-2">
                <h3 className="font-serif text-lg font-bold text-black m-0">Top Products</h3>
                <p className="text-xs text-gray-400 font-normal m-0 mt-0.5">Best sellers by sales & volume</p>
              </div>
            }
            className="border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-2xl h-full bg-white"
            bodyStyle={{ padding: '16px 20px' }}
          >
            <div className="space-y-4">
              {data.topProducts && data.topProducts.length > 0 ? (
                data.topProducts.map((prod, i) => (
                  <div key={i} className="flex items-center space-x-3.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="w-5 font-mono text-xs font-bold text-gray-400">#{i + 1}</span>
                    <div className="w-12 h-14 rounded-xl bg-[#EFE8DC] p-1 flex items-center justify-center flex-shrink-0 border border-gray-100">
                      <img 
                        src={getImageUrl(prod.image)} 
                        alt={prod.name} 
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.src = '/Images/brown.png'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-black truncate m-0">{prod.name}</h4>
                      <p className="text-[11px] text-gray-400 m-0 mt-0.5">{prod.sales || 0} units sold</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-black font-sans">
                        ₹{(prod.revenue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Sparkles size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-serif">No sales recorded yet</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default Dashboard;
