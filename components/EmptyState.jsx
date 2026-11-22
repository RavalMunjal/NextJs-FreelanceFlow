import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = "No records found",
  description = "Get started by creating your first entry.",
  actionText,
  actionHref,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-xl border border-dashed border-cream-border my-4">
      <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-forest mb-3">
        <Icon className="w-6 h-6 text-forest" />
      </div>

      <h3 className="text-base font-semibold text-textColor-primary mb-1">
        {title}
      </h3>

      <p className="text-sm text-textColor-secondary max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-copper-light" />
          <span>{actionText}</span>
        </Link>
      )}

      {actionText && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-copper-light" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
