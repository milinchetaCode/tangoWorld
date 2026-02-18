export default function ApplicationListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3">
              {/* Name placeholder */}
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              {/* Email placeholder */}
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              {/* Details placeholder */}
              <div className="flex gap-4">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
                <div className="h-4 bg-slate-200 rounded w-24"></div>
              </div>
            </div>
            {/* Actions placeholder */}
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
              <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
              <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
