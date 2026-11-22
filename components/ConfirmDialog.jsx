"use client";

import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isDanger = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-cream-border p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-md text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isDanger
                ? "bg-terracotta-light text-terracotta"
                : "bg-warning-light text-warning"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-textColor-primary">{title}</h3>
            <p className="text-sm text-textColor-secondary mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-cream-border text-textColor-primary bg-white hover:bg-cream-dark transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors flex items-center gap-2 ${
              isDanger
                ? "bg-terracotta hover:bg-terracotta-dark"
                : "bg-forest hover:bg-forest-light"
            } ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isLoading && (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
