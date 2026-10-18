import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const SortDropdown = ({ currentSort = 'Featured', onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    'Featured',
    'Price: Low to High',
    'Price: High to Low',
    'Newest First',
    'Best Selling',
    'Name: A to Z',
    'Name: Z to A'
  ];

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
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-between space-x-3 px-5 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 min-w-[200px]"
      >
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          Sort: <span className="font-semibold text-black">{currentSort}</span>
        </span>
        <div className="flex items-center space-x-1">
          <div className="w-px h-4 bg-gray-300"></div>
          {isOpen ? (
            <ChevronUp size={16} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
          ) : (
            <ChevronDown size={16} className="text-gray-500 group-hover:text-gray-700 transition-colors" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1 max-h-64 overflow-y-auto">
            {sortOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-5 py-3 text-sm transition-colors duration-150 ${
                  currentSort === option
                    ? 'bg-black text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {currentSort === option && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
