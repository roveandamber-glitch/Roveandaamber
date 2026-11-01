"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import categoryService from '../../services/categoryService';
import { getImageUrl } from '../../utils/imageHelper';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Mouse drag-to-scroll support
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getAllCategories();
        let list = [];
        if (res?.success && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        }
        setCategories(list);
      } catch (err) {
        console.error('Failed to load categories from database:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const overflowing = scrollWidth > clientWidth + 4;
      setIsOverflowing(overflowing);
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    
    // Check after a brief delay in case fonts/images alter layout dimensions
    const timer = setTimeout(updateScrollButtons, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [categories]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = Math.max(scrollRef.current.clientWidth * 0.65, 260);
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 6) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
    updateScrollButtons();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section className="pt-2 pb-10 sm:py-14 lg:py-16 px-4 sm:px-6 max-w-7xl mx-auto relative group">
      {/* Subtle Luxury Eyebrow */}
      <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8 select-none">
        <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#C5A880]/70" />
        <span className="text-[10px] sm:text-xs font-serif tracking-[0.28em] uppercase text-[#8C6D1F] font-medium">
          Curated Fragrance Families
        </span>
        <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#C5A880]/70" />
      </div>

      {/* Horizontal Scroll Wrapper */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Previous categories"
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-[#E5B869] shadow-md hover:shadow-xl border border-[#E5DFD5] flex items-center justify-center transition-all duration-300 backdrop-blur-sm -translate-x-1 sm:-translate-x-3 ${
            canScrollLeft ? 'opacity-100 visible cursor-pointer' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Next categories"
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-[#E5B869] shadow-md hover:shadow-xl border border-[#E5DFD5] flex items-center justify-center transition-all duration-300 backdrop-blur-sm translate-x-1 sm:translate-x-3 ${
            canScrollRight ? 'opacity-100 visible cursor-pointer' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto scroll-smooth py-4 px-2 select-none touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          } ${isOverflowing ? 'justify-start' : 'justify-start md:justify-center'}`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {categories.map((item) => {
            const catId = item._id || item.id || item.name;
            const img = getImageUrl(item.image);
            return (
              <Link
                key={catId}
                href={`/shop?category=${encodeURIComponent(item.name)}`}
                onClick={(e) => {
                  if (hasMoved) {
                    e.preventDefault();
                  }
                }}
                className="group/item shrink-0 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 w-24 sm:w-32 md:w-36 text-center"
              >
                {/* Circular Thumbnail with Polished Gold Border */}
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden p-0.5 sm:p-1 bg-gradient-to-b from-[#E5B869] to-[#C49444] shadow-md group-hover/item:shadow-2xl group-hover/item:shadow-amber-900/25 transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#241710]">
                    <img
                      src={img}
                      alt={item.name}
                      draggable={false}
                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500 ease-out pointer-events-none"
                      onError={(e) => {
                        e.target.src = '/images/perfumes/signature_collection.jpg';
                      }}
                    />
                  </div>
                </div>

                {/* Label */}
                <span className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-serif font-medium text-[#1A1A1A] group-hover/item:text-[#B86526] transition-colors tracking-wide text-center line-clamp-1 w-full px-1">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
