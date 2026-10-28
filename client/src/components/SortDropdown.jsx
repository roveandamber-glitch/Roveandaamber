"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

export const SORT_OPTIONS = [
  'Featured',
  'Price: Low to High',
  'Price: High to Low',
  'Newest First',
  'Name: A to Z',
  'Name: Z to A'
];

const SortDropdown = ({ currentSort = 'Featured', onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (onSortChange) {
      onSortChange(option);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-between space-x-3 px-4 py-2.5 bg-white border border-[#E0D8CA] rounded-full shadow-2xs hover:border-black transition-all duration-200 min-w-[200px] cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-xs font-serif tracking-wider text-gray-600">
          Sort: <span className="font-bold text-black font-sans">{currentSort}</span>
        </span>
        <div className="flex items-center space-x-1.5 pl-2 border-l border-gray-200">
          {isOpen ? (
            <ChevronUp size={14} className="text-black transition-colors" />
          ) : (
            <ChevronDown size={14} className="text-gray-500 group-hover:text-black transition-colors" />
          )}
        </div>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-56 bg-white border border-[#E8E2D6] rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          {SORT_OPTIONS.map((option) => {
            const isSelected = currentSort === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2.5 text-xs transition-colors duration-150 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white font-bold'
                    : 'text-gray-700 hover:bg-[#FAF8F5] hover:text-black font-medium'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <span>{option}</span>
                {isSelected && <Check size={13} className="text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
