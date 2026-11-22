import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center bg-white rounded-xl border border-cream-border card-shadow max-w-lg mx-auto mt-12">
      <div className="w-14 h-14 rounded-full bg-cream-dark flex items-center justify-center text-forest mb-4">
        <FileQuestion className="w-7 h-7" />
      </div>

      <h2 className="text-2xl font-bold text-textColor-primary mb-2">
        Page Not Found
      </h2>

      <p className="text-sm text-textColor-secondary mb-6 leading-relaxed">
        The page or record you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
