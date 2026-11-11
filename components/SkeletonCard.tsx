export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[4/5] bg-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
      </div>

      {/* Content Skeleton */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between space-y-2">
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-4/5" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded w-1/2" />
          <div className="h-8 w-8 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center animate-pulse min-w-[130px] sm:min-w-[170px]">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 relative overflow-hidden mb-2">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
      </div>
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-1" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="w-full aspect-[16/9] sm:aspect-[16/7] lg:aspect-[2.4/1] bg-slate-200 rounded-xl sm:rounded-2xl overflow-hidden relative animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
    </div>
  );
}
