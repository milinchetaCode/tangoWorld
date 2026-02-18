export default function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200 animate-pulse">
      <div className="relative">
        {/* Image placeholder */}
        <div className="h-48 bg-slate-200"></div>
        {/* Status badge placeholder */}
        <div className="absolute top-3 right-3 h-6 w-20 bg-slate-300 rounded-full"></div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Title placeholder */}
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
        
        {/* Location and date placeholders */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
        
        {/* Capacity bar placeholder */}
        <div className="space-y-2">
          <div className="h-2 bg-slate-200 rounded-full w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
        
        {/* Button placeholder */}
        <div className="h-10 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}
