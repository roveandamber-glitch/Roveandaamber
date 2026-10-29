"use client";
import React from 'react';
import { Modal } from 'antd';
import { Trash2 } from 'lucide-react';

/**
 * Common Luxury Delete Confirmation Dialog
 * Replaces default raw browser or popconfirm dialogs with an
 * elegant, branded, centered confirmation modal.
 */
export default function CommonDelete({
  open,
  onCancel,
  onConfirm,
  title = 'Delete Item',
  itemName = '',
  itemType = 'category',
  description,
  confirmText = 'Delete Category',
  cancelText = 'Cancel',
  loading = false
}) {
  const defaultDescription = `Are you sure you want to delete this ${itemType}? Any products or items associated with it will become uncategorized. This action cannot be undone.`;

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      centered
      width={460}
      closable={!loading}
      className="luxury-delete-modal"
    >
      <div className="pt-2 pb-1 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Danger/Warning Badge Icon */}
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0 shadow-xs">
            <Trash2 size={22} className="text-red-600" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Modal Title */}
            <h3 className="text-lg font-serif font-medium text-[#1B100A] tracking-tight">
              {title}
            </h3>

            {/* Target Item Highlight */}
            {itemName && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#E8DFC8] text-xs font-semibold text-[#1B100A] max-w-full truncate">
                <span className="text-[10px] uppercase font-bold text-[#D4A64A] tracking-wider">
                  Target:
                </span>
                <span className="truncate">"{itemName}"</span>
              </div>
            )}

            {/* Description Warning Message */}
            <p className="mt-2.5 text-xs text-gray-500 leading-relaxed">
              {description || defaultDescription}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-[#E8DFC8]/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-[#E8DFC8] hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export { CommonDelete };

