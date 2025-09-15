import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm no-print sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side: Logo and Title */}
        <div className="flex items-center">
          <span className="text-4xl mr-4 -mt-1">📝</span>
          <div>
            <h1 className="text-2xl font-bold text-slate-700 text-center sm:text-left">AI Question Paper Generator</h1>
            <p className="text-sm text-slate-500 text-center sm:text-left">Craft perfect GSEB curriculum papers in seconds</p>
          </div>
        </div>
        
        {/* Right side: Initiative credit */}
        <div className="text-center sm:text-right">
            <p className="text-sm font-medium text-slate-500">An initiative by</p>
            <p className="text-base font-bold text-blue-700">Mustafasir Son</p>
        </div>
      </div>
    </header>
  );
};