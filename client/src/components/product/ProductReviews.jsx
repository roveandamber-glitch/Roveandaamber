"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { 
  Star, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Filter, 
  X, 
  Send,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import productService from '@/services/productService';
import authService from '@/services/authService';

const RATING_LABELS = {
  1: 'Subtle / Disappointing',
  2: 'Fair / Mild Projection',
  3: 'Pleasant & Balanced',
  4: 'Very Good / High Sillage',
  5: 'Exceptional Masterpiece'
};

export default function ProductReviews({
  productId,
  productName = 'Fragrance',
  initialRating = 5.0,
  initialReviewsCount = 0,
  onRatingUpdate
}) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [starFilter, setStarFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Review Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(null);

  // Sync current user
  useEffect(() => {
    const syncUser = () => {
      const u = authService.getUser();
      setCurrentUser(u);
      if (u) {
        setCustomerName(prev => prev || u.name || '');
        setCustomerEmail(prev => prev || u.email || '');
      }
    };

    syncUser();
    window.addEventListener('authChange', syncUser);
    return () => window.removeEventListener('authChange', syncUser);
  }, []);

  // Fetch reviews from live server
  const loadReviews = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const params = {};
      if (starFilter !== 'ALL') {
        params.rating = starFilter;
      }
      if (sortBy) {
        params.sort = sortBy;
      }

      const res = await productService.getProductReviews(productId, params);
      if (res?.success) {
        setReviews(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId, starFilter, sortBy]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Overall metrics
  const totalCount = stats?.totalReviews ?? initialReviewsCount ?? reviews.length;
  const avgRating = stats?.averageRating ?? initialRating ?? 5.0;
  const ratingCounts = stats?.ratingCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const ratingPercentages = stats?.ratingPercentages || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const recommendPercent = stats?.recommendPercentage ?? 100;

  // Handle Review Submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      message.warning('Please select a star rating between 1 and 5');
      return;
    }

    if (!comment || comment.trim().length < 3) {
      message.warning('Please provide at least a few words describing your experience');
      return;
    }

    const finalName = customerName.trim() || currentUser?.name || 'Valued Patron';

    setSubmitting(true);
    try {
      const payload = {
        productId,
        rating: Number(rating),
        title: title.trim(),
        comment: comment.trim(),
        customerName: finalName,
        customerEmail: customerEmail.trim() || currentUser?.email || ''
      };

      const res = await productService.submitReview(payload);
      if (res?.success) {
        message.success('Thank you! Your fragrance review has been published.');
        
        // Reset form
        setTitle('');
        setComment('');
        setRating(5);
        setHoverRating(0);
        setShowForm(false);

        // Reload reviews & notify parent of updated metrics
        await loadReviews();

        if (res.updatedProduct && typeof onRatingUpdate === 'function') {
          onRatingUpdate(res.updatedProduct.rating, res.updatedProduct.reviewsCount);
        }
      } else {
        message.error(res?.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Unable to submit review';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you wish to delete this review?')) return;

    try {
      const res = await productService.deleteReview(reviewId);
      if (res?.success) {
        message.success('Review removed successfully');
        await loadReviews();
        if (res.updatedProduct && typeof onRatingUpdate === 'function') {
          onRatingUpdate(res.updatedProduct.rating, res.updatedProduct.reviewsCount);
        }
      } else {
        message.error(res?.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to delete review';
      message.error(errMsg);
    }
  };

  const currentUserId = currentUser ? String(currentUser._id || currentUser.id) : null;

  return (
    <div className="space-y-8">
      
      {/* 1. TOP SUMMARY CARD */}
      <div className="bg-[#FAF9F7] rounded-2xl p-5 sm:p-7 border border-[#ECE7DE]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Average Rating Score */}
          <div className="md:col-span-4 text-center md:text-left md:pr-6 md:border-r border-[#E5E0D5]">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B8860B] block mb-1">
              Patron Assessment
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-2 mb-1.5">
              <span className="text-4xl sm:text-5xl font-sans font-bold text-black leading-none">
                {avgRating}
              </span>
              <span className="text-sm text-gray-500 font-light">/ 5.0</span>
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={s <= Math.round(avgRating) ? 'fill-[#B8860B] text-[#B8860B]' : 'text-gray-300'}
                />
              ))}
            </div>

            <p className="text-xs text-gray-600 m-0">
              {totalCount > 0 ? (
                <>Based on <strong className="text-black font-semibold">{totalCount}</strong> verified patron {totalCount === 1 ? 'review' : 'reviews'}</>
              ) : (
                'No reviews recorded yet'
              )}
            </p>

            {totalCount > 0 && (
              <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                ★ {recommendPercent}% recommend this flacon
              </span>
            )}
          </div>

          {/* Star Rating Breakdown Bars */}
          <div className="md:col-span-5 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const percent = ratingPercentages[star] || 0;
              const isSelected = starFilter === String(star);

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarFilter(isSelected ? 'ALL' : String(star))}
                  className={`w-full flex items-center gap-2.5 text-xs py-1 px-2 rounded-lg transition-colors cursor-pointer group ${
                    isSelected ? 'bg-amber-100/70 font-bold' : 'hover:bg-black/5'
                  }`}
                >
                  <span className="w-7 text-right text-gray-700 font-medium shrink-0 flex items-center justify-end gap-0.5">
                    {star} <Star size={11} className="fill-[#B8860B] text-[#B8860B]" />
                  </span>
                  
                  {/* Progress Bar Container */}
                  <div className="flex-1 h-2 bg-[#E9E4DC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-8 text-[11px] text-gray-500 text-right shrink-0">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action: Write a Review Button */}
          <div className="md:col-span-3 flex flex-col items-center justify-center text-center">
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-stone-800 text-white rounded-full text-xs font-serif uppercase tracking-widest transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {showForm ? (
                <>
                  <X size={14} />
                  <span>Close Form</span>
                </>
              ) : (
                <>
                  <Edit3 size={14} className="text-[#D4AF37]" />
                  <span>Write a Review</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 mt-2 m-0">
              Share your fragrance notes & wear time
            </p>
          </div>
        </div>
      </div>

      {/* 2. COLLAPSIBLE WRITE REVIEW FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white rounded-2xl p-5 sm:p-7 border-2 border-[#B8860B]/40 shadow-md space-y-5 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#B8860B]">
                Your Olfactory Experience
              </span>
              <h3 className="text-base sm:text-lg font-serif font-normal text-black m-0">
                Reviewing {productName}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Interactive Star Rating Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 rounded transition-transform hover:scale-110 cursor-pointer focus:outline-hidden"
                      aria-label={`Rate ${star} star`}
                    >
                      <Star
                        size={26}
                        className={`transition-colors ${
                          active
                            ? 'fill-[#B8860B] text-[#B8860B] drop-shadow-xs'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-serif font-bold text-[#B8860B] ml-2">
                {RATING_LABELS[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
              Review Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Exquisite Amber and Lasting Sillage"
              maxLength={120}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black transition-all bg-[#FAF9F7]"
            />
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
              Your Review & Impressions <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the scent evolution, top notes, projection, and wear time..."
              required
              minLength={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black transition-all bg-[#FAF9F7]"
            />
          </div>

          {/* Reviewer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Alistair Vance"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black transition-all bg-[#FAF9F7]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5">
                Email Address <span className="text-gray-400 font-normal">(Will remain private)</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. alistair@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black transition-all bg-[#FAF9F7]"
              />
            </div>
          </div>

          {/* Signed-in badge hint */}
          {currentUser && (
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Signed in as <strong>{currentUser.name}</strong> ({currentUser.email})</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={submitting}
              className="px-5 py-2.5 rounded-full border border-gray-200 text-xs uppercase tracking-wider font-semibold text-gray-600 hover:text-black hover:border-black transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-serif uppercase tracking-widest transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Send size={13} className="text-[#D4AF37]" />
              <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. FILTER & SORT CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-b border-gray-100 pb-3">
        {/* Star Rating Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 max-w-full">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1 whitespace-nowrap shrink-0">
            <Filter size={11} /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setStarFilter('ALL')}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              starFilter === 'ALL'
                ? 'bg-black text-white shadow-2xs'
                : 'bg-[#FAF9F7] text-gray-600 hover:text-black border border-[#E8E2D6]'
            }`}
          >
            <span>All</span>
            <span className={starFilter === 'ALL' ? 'text-white/80' : 'text-gray-400'}>({totalCount})</span>
          </button>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = ratingCounts[s] || 0;
            const active = starFilter === String(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStarFilter(active ? 'ALL' : String(s))}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#B8860B] text-white shadow-2xs'
                    : 'bg-[#FAF9F7] text-gray-600 hover:text-black border border-[#E8E2D6]'
                }`}
              >
                <span>{s}</span>
                <Star size={10} className={active ? 'fill-white text-white' : 'fill-[#B8860B] text-[#B8860B]'} />
                <span className={active ? 'text-white/80 text-[10px]' : 'text-gray-400 text-[10px]'}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#FAF9F7] border border-[#E0D8C8] rounded-xl px-3 py-1 text-xs text-gray-800 font-medium focus:outline-hidden focus:border-black cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* 4. REVIEWS LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-400 space-y-2 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-black animate-spin mx-auto" />
            <p className="text-xs">Loading patron reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((r) => {
            const isOwner = currentUserId && (String(r.userId || r.user_id) === currentUserId);
            const initial = (r.customerName || 'P').charAt(0).toUpperCase();
            const dateStr = r.createdAt 
              ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Verified Purchase';

            return (
              <div
                key={r.id || r._id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ECE7DE] shadow-2xs space-y-2.5 transition-all hover:border-[#D8C7A5]"
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Customer Avatar & Meta */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1F1813] to-[#3B2C1E] text-[#E8C88B] border border-[#E0D0A5] flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-2xs">
                      {initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-serif font-bold text-black">
                          {r.customerName || 'Fragrance Enthusiast'}
                        </span>
                        {r.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                            <CheckCircle2 size={10} className="text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars & Owner Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 text-[#B8860B]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={s <= r.rating ? 'fill-[#B8860B] text-[#B8860B]' : 'text-gray-200'}
                        />
                      ))}
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(r.id || r._id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded-full transition-colors cursor-pointer"
                        title="Delete your review"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Review Title */}
                {r.title && (
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-black m-0 pt-0.5">
                    {r.title}
                  </h4>
                )}

                {/* Review Comment Body */}
                <p className="text-xs text-stone-700 leading-relaxed font-light m-0 whitespace-pre-line">
                  {r.comment}
                </p>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="py-12 px-4 rounded-2xl bg-[#FAF9F7] border border-dashed border-[#DCD6C8] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF3E0] text-[#B8860B] border border-[#E0D0A5] flex items-center justify-center mx-auto">
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="text-sm font-serif font-bold text-black mb-1">
                {starFilter !== 'ALL' 
                  ? `No ${starFilter}-star reviews found`
                  : `Be the first to review ${productName}`}
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto font-light leading-relaxed">
                {starFilter !== 'ALL'
                  ? 'Try clearing the star filter to view all patron assessments.'
                  : 'Experience the bespoke sillage and share your impressions with our community of fragrance connoisseurs.'}
              </p>
            </div>
            
            {starFilter !== 'ALL' ? (
              <button
                type="button"
                onClick={() => setStarFilter('ALL')}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-black text-black hover:bg-black hover:text-white text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
              >
                Clear Star Filter
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-stone-800 text-white rounded-full text-xs font-serif uppercase tracking-widest transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Edit3 size={13} className="text-[#D4AF37]" />
                <span>Write the First Review</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
