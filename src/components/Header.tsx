import React from 'react';

interface HeaderProps {
    onGoHome: () => void;
    isMobile: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, isMobile }) => {
  const HeaderContent = () => (
    <div className="flex items-center">
      <span className="text-4xl mr-4 -mt-1">📝</span>
      <div>
        <h1 className="text-2xl font-bold text-center sm:text-left" style={{ color: 'var(--color-text-main)' }}>AI Question Paper Generator</h1>
        <p className="text-sm text-center sm:text-left" style={{ color: 'var(--color-text-muted)' }}>Craft perfect GSEB curriculum papers in seconds</p>
      </div>
    </div>
  );

  return (
    <header className="no-print sticky top-0 z-10" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {isMobile ? (
          <button onClick={onGoHome} className="text-left">
            <HeaderContent />
          </button>
        ) : (
          <HeaderContent />
        )}
        
        <div className="text-center sm:text-right">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>An initiative by</p>
            <p className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>Husain M Trivedi</p>
        </div>
      </div>
    </header>
  );
};
