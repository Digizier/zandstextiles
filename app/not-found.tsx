import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
        <span className="text-4xl sm:text-6xl font-black text-brand-gold block">
          404
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-brand-navy">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          The textile collection or page you requested could not be located.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/shop/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-5 rounded-xl transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
