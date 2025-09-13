import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-6 w-3/5 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-slate-200 rounded mb-3"></div>
          <div className="h-4 w-2/5 bg-slate-200 rounded"></div>
        </div>
        
        {/* Section Skeleton */}
        <div className="mb-8">
          <div className="h-5 w-1/3 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 w-4/6 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Another Section Skeleton */}
        <div>
          <div className="h-5 w-2/5 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};