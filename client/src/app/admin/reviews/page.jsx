"use client";
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  message, 
  Popconfirm, 
  Rate,
  Tooltip 
} from 'antd';
import { 
  Star, 
  CheckCircle2, 
  EyeOff, 
  Trash2, 
  Search, 
  Filter, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import adminService from '@/services/adminService';
import { getImageUrl } from '@/utils/imageHelper';

const { Option } = Select;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReviews();
      const list = Array.isArray(res?.data) 
        ? res.data 
        : (Array.isArray(res?.data?.reviews) ? res.data.reviews : []);
      setReviews(list);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      message.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminService.moderateReview(id, { status: newStatus });
      setReviews(prev => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.map(r => (r.id === id ? { ...r, status: newStatus } : r));
      });
      message.success(`Review ${newStatus.toLowerCase()} successfully`);
    } catch (err) {
      message.error('Failed to moderate review');
    }
  };

  const handleDelete = (id) => {
    setReviews(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.filter(r => r.id !== id);
    });
    message.success('Review deleted');
  };

  const reviewList = Array.isArray(reviews) ? reviews : [];
  const filteredReviews = reviewList.filter(r => {
    const customer = (r.customer || r.customerName || '').toLowerCase();
    const title = (r.title || '').toLowerCase();
    const comment = (r.comment || '').toLowerCase();
    const productName = (r.product?.name || '').toLowerCase();
    const search = searchText.toLowerCase();

    const matchesSearch = 
      customer.includes(search) ||
      title.includes(search) ||
      comment.includes(search) ||
      productName.includes(search);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Perfume Product',
      key: 'product',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-12 rounded-lg bg-[#FAF7F2] border border-[#E8DFC8] overflow-hidden shrink-0 flex items-center justify-center p-1">
            <img 
              src={getImageUrl(record.product?.image)} 
              alt={record.product?.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = '/images/no-image.jpg'; }}
            />
          </div>
          <span className="font-serif font-medium text-xs text-[#1B100A] truncate max-w-[140px]">
            {record.product?.name}
          </span>
        </div>
      )
    },
    {
      title: 'Customer',
      key: 'customer',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-xs text-[#1B100A] flex items-center gap-1.5">
            <span className="truncate max-w-[100px]">{record.customer}</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
              <ShieldCheck size={10} /> Verified
            </span>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">{record.date || '28 Oct 2026'}</div>
        </div>
      )
    },
    {
      title: 'Rating & Feedback',
      key: 'review',
      width: 280,
      render: (_, record) => (
        <div className="py-1">
          <div className="flex items-center gap-2 mb-1">
            <Rate disabled defaultValue={record.rating} className="!text-[#D4A64A] !text-xs" />
            <span className="text-xs font-semibold text-[#1B100A] truncate max-w-[150px]">{record.title}</span>
          </div>
          <p className="text-xs text-[#555] leading-relaxed line-clamp-2">
            &ldquo;{record.comment}&rdquo;
          </p>
        </div>
      )
    },
    {
      title: 'Moderation Status',
      key: 'status',
      width: 140,
      render: (_, record) => {
        const isApproved = record.status === 'Approved';
        const isPending = record.status === 'Pending';
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${
            isApproved 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : isPending 
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
            {record.status}
          </span>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 110,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1.5">
          {record.status !== 'Approved' && (
            <Tooltip title="Approve & Publish Review">
              <button
                onClick={() => handleStatusChange(record.id, 'Approved')}
                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
              >
                <CheckCircle2 size={15} />
              </button>
            </Tooltip>
          )}

          {record.status !== 'Hidden' && (
            <Tooltip title="Hide from Public View">
              <button
                onClick={() => handleStatusChange(record.id, 'Hidden')}
                className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200 cursor-pointer"
              >
                <EyeOff size={15} />
              </button>
            </Tooltip>
          )}

          <Popconfirm
            title="Delete Review"
            description="Permanently remove this customer testimonial?"
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
              <Trash2 size={15} />
            </button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Customer Testimonials & Reviews
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              Verified Fragrance Connoisseurs
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Moderate olfactory reviews, verify purchases, and showcase authentic client feedback.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews by customer, perfume, or keyword..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl focus:outline-none focus:border-[#D4A64A] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Status:</span>
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-36 text-xs"
          >
            <Option value="ALL">All Statuses</Option>
            <Option value="Approved">Approved</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Hidden">Hidden</Option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <Table 
          columns={columns}
          dataSource={filteredReviews.map((r, idx) => ({ ...r, key: r.id || idx }))}
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{ pageSize: 8, className: "!px-4 !mb-4 text-xs" }}
          className="admin-luxury-table"
        />
      </div>
    </div>
  );
}

