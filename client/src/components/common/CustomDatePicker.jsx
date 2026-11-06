"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Format Date to YYYY-MM-DD
 */
export const formatDateToISO = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format ISO string to readable display (e.g., "31 Dec 2026")
 */
export const formatDisplayDate = (isoStr) => {
  if (!isoStr) return '';
  const parts = String(isoStr).split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m < 12) {
      return `${d} ${SHORT_MONTHS[m]} ${y}`;
    }
  }
  const d = new Date(isoStr);
  if (!isNaN(d.getTime())) {
    return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
  return String(isoStr);
};

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Select date (YYYY-MM-DD)',
  disabled = false,
  disablePast = false,
  className = '',
  placement = 'auto', // 'auto' | 'top' | 'bottom'
  id
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const [dropdownAlign, setDropdownAlign] = useState('left');

  // Parse initial selected date
  const parsedDate = value ? new Date(value) : null;
  const validParsed = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null;

  // View state: current month & year in calendar popup
  const [viewYear, setViewYear] = useState(() => (validParsed ? validParsed.getFullYear() : new Date().getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (validParsed ? validParsed.getMonth() : new Date().getMonth()));

  // Keep view in sync when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Auto-calculate smart placement (top vs bottom, left vs right) to avoid viewport/modal cutoff
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const calculatePlacement = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const neededHeight = 350; // approximate height of calendar popup

      if (placement === 'top') {
        setDropdownPosition('top');
      } else if (placement === 'bottom') {
        setDropdownPosition('bottom');
      } else {
        // In 'auto' mode: if not enough space below, open upward
        if (spaceBelow < neededHeight && spaceAbove >= spaceBelow) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }

      // Horizontal boundary check (ensure popover doesn't overflow right edge)
      const neededWidth = 320;
      if (rect.left + neededWidth > window.innerWidth - 16) {
        setDropdownAlign('right');
      } else {
        setDropdownAlign('left');
      }
    };

    calculatePlacement();
    window.addEventListener('resize', calculatePlacement);
    window.addEventListener('scroll', calculatePlacement, true);
    return () => {
      window.removeEventListener('resize', calculatePlacement);
      window.removeEventListener('scroll', calculatePlacement, true);
    };
  }, [isOpen, placement]);

  // Click-outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const today = new Date();
  const todayStr = formatDateToISO(today);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const isPrevMonthDisabled = disablePast && (
    viewYear < currentYear || (viewYear === currentYear && viewMonth <= currentMonth)
  );

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (isPrevMonthDisabled) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (dayNum, isCurrentMonth = true) => {
    if (!isCurrentMonth) return;
    const selected = new Date(viewYear, viewMonth, dayNum);
    const isoString = formatDateToISO(selected);
    if (disablePast && isoString < todayStr) return;
    if (onChange) {
      onChange(isoString);
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange('');
    }
  };

  // Build Calendar grid
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const selectedStr = value ? formatDateToISO(new Date(value)) : '';

  // Generate day cells
  const dayCells = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    dayCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isDisabled: true
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(viewYear, viewMonth, d);
    const cellIso = formatDateToISO(cellDate);
    const isPast = disablePast && cellIso < todayStr;
    const isSelected = selectedStr === cellIso;
    const isToday = todayStr === cellIso;

    dayCells.push({
      day: d,
      isCurrentMonth: true,
      isDisabled: isPast,
      isSelected,
      isToday
    });
  }

  // 3. Next month leading days (fill row to complete grid)
  const remainingCells = 42 - dayCells.length; // 6 rows * 7 cols
  for (let d = 1; d <= (remainingCells % 7); d++) {
    dayCells.push({
      day: d,
      isCurrentMonth: false,
      isDisabled: true
    });
  }

  // Year options for dropdown: if disablePast, start from currentYear, else past 5 years
  const startYear = disablePast ? currentYear : currentYear - 5;
  const yearOptions = [];
  for (let y = startYear; y <= currentYear + 10; y++) {
    yearOptions.push(y);
  }

  return (
    <div ref={containerRef} className={`relative inline-block w-full text-xs ${className}`}>
      {/* Trigger Button / Input */}
      <div 
        id={id}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !disabled && setIsOpen(!isOpen);
          }
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-xl transition-all select-none ${
          disabled 
            ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
            : isOpen 
            ? 'border-[#B8860B] ring-2 ring-[#B8860B]/15 shadow-sm cursor-pointer' 
            : 'border-[#E8DFC8] hover:border-[#D4A64A] cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon size={15} className="text-[#B8860B] shrink-0" />
          {value ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 font-mono text-xs">
                {value}
              </span>
              <span className="text-[11px] text-[#B8860B] font-medium hidden sm:inline">
                ({formatDisplayDate(value)})
              </span>
            </div>
          ) : (
            <span className="text-gray-400 text-xs font-light">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
              title="Clear date"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Luxury Custom Calendar Popover with Smart Boundary Awareness */}
      {isOpen && (
        <div 
          ref={popoverRef}
          className={`absolute z-50 w-72 sm:w-80 bg-white border border-[#EAE3D6] rounded-2xl shadow-[0_16px_40px_rgba(24,17,13,0.18)] p-4 text-[#18110D] animate-in fade-in zoom-in-95 duration-150 ${
            dropdownAlign === 'right' ? 'right-0' : 'left-0'
          } ${
            dropdownPosition === 'top' 
              ? 'bottom-[calc(100%+8px)]' 
              : 'top-[calc(100%+8px)]'
          } max-h-[min(420px,calc(100vh-60px))] overflow-y-auto`}
        >
          {/* Header: Navigation & Month/Year Selectors */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <button
              type="button"
              disabled={isPrevMonthDisabled}
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg transition-colors ${
                isPrevMonthDisabled 
                  ? 'text-gray-300 opacity-40 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-[#B8860B] hover:bg-[#FAF7F2] cursor-pointer'
              }`}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 font-serif font-bold text-sm">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-transparent font-serif font-bold text-sm text-[#18110D] focus:outline-none cursor-pointer hover:text-[#B8860B]"
              >
                {MONTH_NAMES.map((m, idx) => {
                  const isMonthPast = disablePast && viewYear === currentYear && idx < currentMonth;
                  return (
                    <option key={m} value={idx} disabled={isMonthPast} className="font-sans text-xs">
                      {m}
                    </option>
                  );
                })}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-transparent font-serif font-bold text-sm text-[#18110D] focus:outline-none cursor-pointer hover:text-[#B8860B]"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="font-sans text-xs">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-600 hover:text-[#B8860B] hover:bg-[#FAF7F2] transition-colors"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mt-3 text-center">
            {DAYS_OF_WEEK.map((dw) => (
              <span key={dw} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-1">
                {dw}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 mt-1 text-center">
            {dayCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div key={idx} className="py-2 text-[11px] text-gray-300 select-none">
                    {cell.day}
                  </div>
                );
              }

              if (cell.isDisabled) {
                return (
                  <div key={idx} className="py-2 text-[11px] text-gray-300 line-through opacity-50 cursor-not-allowed select-none">
                    {cell.day}
                  </div>
                );
              }

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectDay(cell.day, true)}
                  className={`py-2 text-xs font-medium rounded-xl transition-all cursor-pointer relative ${
                    cell.isSelected
                      ? 'bg-[#18110D] text-white font-bold shadow-sm'
                      : cell.isToday
                      ? 'text-[#B8860B] font-bold ring-1 ring-[#B8860B] hover:bg-[#FAF7F2]'
                      : 'text-gray-700 hover:bg-[#FAF7F2] hover:text-[#B8860B]'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer Buttons */}
          <div className="mt-3 pt-2.5 border-t border-[#F0EAE1] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-[#18110D] hover:bg-[#2D231C] text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

