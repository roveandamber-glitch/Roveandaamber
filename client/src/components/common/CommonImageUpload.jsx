"use client";
import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Edit3, Trash2, ImageOff, CheckCircle2 } from 'lucide-react';
import { getImageUrl } from '@/utils/imageHelper';

/**
 * Common Luxury Image Upload & Preview Component
 * - Drag and drop & click to upload
 * - Validates file types and sizes
 * - Professional luxury styling matching ROVE & AMBER
 * - Graceful fallback / "No Image" default state
 * - Clean "Change" and "Remove" controls
 */
export default function CommonImageUpload({
  value,
  file,
  onChange,
  onRemove,
  label = 'Category Image',
  required = false,
  aspectRatio = '16/9',
  maxSizeMB = 10,
  placeholderText = 'Click to choose image or drag & drop here',
  subText = 'PNG, JPG, or WEBP up to 10MB',
  disabled = false,
  className = ''
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [localPreview, setLocalPreview] = useState('');

  // Determine current active preview URL
  const activeUrl = localPreview || value || '';

  useEffect(() => {
    setImageError(false);
  }, [value, file]);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate mime type
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    // Validate size
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    setImageError(false);
    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreview(objectUrl);

    if (onChange) {
      onChange(selectedFile, objectUrl);
    }
  };

  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      handleFile(f);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const f = e.dataTransfer.files?.[0];
    if (f) {
      handleFile(f);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setLocalPreview('');
    setImageError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    } else if (onChange) {
      onChange(null, '');
    }
  };

  const triggerSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700 select-none">
            {label} {required && <span className="text-amber-700">*</span>}
          </label>
          {activeUrl && (
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Image Attached</span>
            </span>
          )}
        </div>
      )}

      {/* Hidden Native File Input (never visible on page) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onInputChange}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Main Container */}
      {!activeUrl ? (
        /* Empty / No-Image State: Luxury Dropzone */
        <div
          onClick={triggerSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer text-center select-none ${
            isDragging
              ? 'border-[#D4A64A] bg-[#FAF7F2] scale-[0.99] shadow-sm'
              : 'border-[#E8DFC8] hover:border-[#D4A64A] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-[#D4A64A]/10 text-[#D4A64A] flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
            <UploadCloud size={22} />
          </div>
          <p className="text-xs font-semibold text-[#1B100A]">
            {placeholderText}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            {subText}
          </p>
        </div>
      ) : (
        /* Active Image Preview Card */
        <div className="relative rounded-2xl border border-[#E8DFC8] overflow-hidden bg-[#1B100A] shadow-sm">
          {/* Aspect-ratio image viewport */}
          <div className="relative w-full h-44 bg-[#140C08] overflow-hidden flex items-center justify-center">
            {!imageError ? (
              <img
                src={getImageUrl(activeUrl, '/images/no-image.jpg')}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              /* Fallback: Default No Image artwork */
              <img
                src="/images/no-image.jpg"
                alt="No Image Available"
                className="w-full h-full object-cover"
              />
            )}

            {/* Gradient shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

            {/* Top controls pill */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={triggerSelect}
                title="Change Image"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-medium border border-white/20 transition-all cursor-pointer shadow-sm"
              >
                <Edit3 size={12} />
                <span>Change</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                title="Remove Image"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/70 hover:bg-red-600/90 backdrop-blur-md text-white text-[11px] font-medium border border-red-400/30 transition-all cursor-pointer shadow-sm"
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            </div>

            {/* Bottom info banner */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10 pointer-events-none">
              <div className="min-w-0 pr-2">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#D4A64A] block">
                  {file ? 'New File Selected' : 'Category Banner'}
                </span>
                <p className="text-xs font-medium text-white truncate max-w-[280px]">
                  {file ? file.name : (activeUrl.split('/').pop() || 'category-banner.jpg')}
                </p>
              </div>
              {file && (
                <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md font-mono shrink-0 border border-white/20">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { CommonImageUpload };

