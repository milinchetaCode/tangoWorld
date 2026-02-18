export default function RegistrationSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 animate-pulse">
      <div className="space-y-6">
        {/* Header placeholder */}
        <div className="space-y-3">
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
        
        {/* Capacity info placeholder */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          <div className="h-5 bg-slate-200 rounded w-2/3"></div>
          <div className="h-3 bg-slate-200 rounded-full w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
        
        {/* Pricing options placeholder */}
        <div className="space-y-3">
          <div className="h-5 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
        
        {/* Button placeholder */}
        <div className="h-12 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}
