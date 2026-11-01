"use client";
import React from 'react';
import { Modal } from 'antd';
import { Trash2, AlertTriangle } from 'lucide-react';

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
  itemType = 'item',
  description,
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  loading = false
}) {
  const defaultDescription = `Are you sure you want to permanently delete this ${itemType}? This action cannot be reversed and all associated records will be purged from the atelier database.`;

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      centered
      width={480}
      closable={!loading}
      className="luxury-delete-modal"
    >
      <div className="pt-2 pb-1 text-left">
        <div className="flex items-start gap-4">
          {/* Danger / Trash Badge Icon */}
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center shrink-0 shadow-xs">
            <Trash2 size={22} className="text-rose-600" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Modal Title */}
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#18110D] tracking-tight">
              {title}
            </h3>

            {/* Target Item Highlight */}
            {itemName && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs font-semibold text-[#18110D] max-w-full truncate">
                <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-wider shrink-0">
                  Target:
                </span>
                <span className="truncate">"{itemName}"</span>
              </div>
            )}

            {/* Description Warning Message */}
            <p className="mt-2.5 text-xs text-gray-500 leading-relaxed font-light">
              {description || defaultDescription}
            </p>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-rose-600 font-medium">
              <AlertTriangle size={13} className="shrink-0" />
              <span>Warning: This operation cannot be undone.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-[#F0EAE1] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-[#E8DFC8] hover:bg-[#FAF7F2] hover:border-[#D4A64A] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Removing...</span>
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

/**
 * Imperative Professional Luxury Delete Modal
 * Can be called directly from table actions and event handlers without
 * managing local modal state!
 */
export const showLuxuryDeleteModal = ({
  title = 'Delete Item',
  itemName = '',
  itemType = 'item',
  description = '',
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  onConfirm
}) => {
  const defaultDescription = `Are you sure you want to permanently delete this ${itemType}? This action cannot be reversed and all associated records will be purged from the atelier database.`;

  return Modal.confirm({
    title: null,
    icon: null,
    centered: true,
    width: 480,
    className: 'luxury-delete-confirm-modal',
    content: (
      <div className="pt-2 text-left">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center shrink-0 shadow-xs">
            <Trash2 size={22} className="text-rose-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#18110D] tracking-tight">
              {title}
            </h3>

            {itemName && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs font-semibold text-[#18110D] max-w-full truncate">
                <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-wider shrink-0">
                  Target:
                </span>
                <span className="truncate">"{itemName}"</span>
              </div>
            )}

            <p className="mt-2.5 text-xs text-gray-500 leading-relaxed font-light">
              {description || defaultDescription}
            </p>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-rose-600 font-medium">
              <AlertTriangle size={13} className="shrink-0" />
              <span>Warning: This operation cannot be undone.</span>
            </div>
          </div>
        </div>
      </div>
    ),
    okText: confirmText,
    cancelText: cancelText,
    okButtonProps: {
      className: '!bg-gradient-to-r !from-rose-600 !to-red-700 hover:!from-rose-700 hover:!to-red-800 !text-white !rounded-xl !h-9 !px-4 !text-xs !font-semibold !shadow-sm !border-none cursor-pointer'
    },
    cancelButtonProps: {
      className: '!bg-white hover:!bg-[#FAF7F2] !border-[#E8DFC8] hover:!border-[#D4A64A] !text-gray-700 !rounded-xl !h-9 !px-4 !text-xs !font-semibold cursor-pointer'
    },
    onOk: async () => {
      if (onConfirm) {
        await onConfirm();
      }
    }
  });
};

export { CommonDelete };
