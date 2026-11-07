"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import categoryService from '../../services/categoryService';
import { getImageUrl } from '../../utils/imageHelper';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedCategoryIds, setFailedCategoryIds] = useState({});
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
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);
    
    // Check after brief delays for font/images to settle layout dimensions
    const timer1 = setTimeout(updateScrollButtons, 150);
    const timer2 = setTimeout(updateScrollButtons, 400);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [categories]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = Math.max(scrollRef.current.clientWidth * 0.65, 280);
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(updateScrollButtons, 350);
    }
  };

  // Enable mouse wheel horizontal scrolling when content overflows
  const handleWheel = (e) => {
    if (!scrollRef.current || !isOverflowing) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const canScrollRightNow = e.deltaY > 0 && scrollLeft < scrollWidth - clientWidth - 2;
      const canScrollLeftNow = e.deltaY < 0 && scrollLeft > 2;
      if (canScrollRightNow || canScrollLeftNow) {
        e.preventDefault();
        scrollRef.current.scrollLeft += e.deltaY * 0.85;
        updateScrollButtons();
      }
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
        <span className="hidden sm:block w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-[#C5A880]/70" />
        <span className="text-[10px] sm:text-xs font-serif tracking-[0.28em] uppercase text-[#8C6D1F] font-medium">
          Curated Fragrance Families
        </span>
        <span className="hidden sm:block w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-[#C5A880]/70" />
      </div>

      {/* Horizontal Scroll Wrapper */}
      <div className="relative">
        {/* Subtle Luxury Gradient Edge Indicators */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-r from-[#FAF9F7] via-[#FAF9F7]/80 to-transparent z-10 transition-opacity duration-300" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-l from-[#FAF9F7] via-[#FAF9F7]/80 to-transparent z-10 transition-opacity duration-300" />
        )}

        {/* Left Scroll Button */}
        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Scroll left to view previous categories"
          className={`absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#18110B] hover:bg-[#B8860B] text-[#ECC880] hover:text-white shadow-xl border border-[#ECC880]/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
            canScrollLeft ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} />
        </button>

        {/* Right Scroll Button */}
        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Scroll right to view more categories"
          className={`absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#18110B] hover:bg-[#B8860B] text-[#ECC880] hover:text-white shadow-xl border border-[#ECC880]/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
            canScrollRight ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} />
        </button>

        {/* Scrollable Category Track */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-start gap-5 sm:gap-7 md:gap-9 overflow-x-auto scroll-smooth py-4 px-3 select-none touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
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
                className="group/item shrink-0 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 w-28 sm:w-36 md:w-40 lg:w-44 text-center"
              >
                {/* Circular Thumbnail with Polished Gold Border */}
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden p-0.5 sm:p-1 bg-gradient-to-b from-[#E5B869] to-[#C49444] shadow-md group-hover/item:shadow-2xl group-hover/item:shadow-amber-900/25 transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#241710] flex items-center justify-center">
                    {!failedCategoryIds[catId] && img && !img.includes('no-image') ? (
                      <img
                        src={img}
                        alt={item.name}
                        draggable={false}
                        className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500 ease-out pointer-events-none"
                        onError={() => setFailedCategoryIds(prev => ({ ...prev, [catId]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2D1B11] via-[#1A0F0A] to-[#120A06] text-[#E5B869] select-none p-2">
                        <span className="font-serif text-2xl sm:text-3xl font-light tracking-widest text-[#E5B869] drop-shadow-sm">
                          {item.name ? item.name.charAt(0).toUpperCase() : 'R'}
                        </span>
                        <span className="text-[7.5px] uppercase tracking-[0.25em] text-[#E5B869]/70 mt-0.5">
                          Atelier
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Full Unclipped Label */}
                <span className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-serif font-medium text-[#1A1A1A] group-hover/item:text-[#B86526] transition-colors tracking-wide text-center whitespace-normal max-w-full px-1">
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
