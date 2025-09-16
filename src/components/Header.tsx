import React from 'react';

interface HeaderProps {
    isMobile: boolean;
    onGoHome: () => void;
    showTitle: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isMobile, onGoHome, showTitle }) => {
  const TitleWrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
      if (isMobile) {
          return <button onClick={onGoHome} className="text-left">{children}</button>
      }
      return <>{children}</>;
  }

  return (
    <header className="bg-white shadow-sm no-print sticky top-0 z-10" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)'}}>
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center">
          <span className="text-4xl mr-3 -mt-1">📝</span>
          {showTitle && (
            <TitleWrapper>
              <h1 className="text-2xl font-bold" style={{color: 'var(--color-text-main)'}}>AI Question Paper Generator</h1>
              <p className="text-sm" style={{color: 'var(--color-text-muted)'}}>Craft perfect GSEB curriculum papers in seconds</p>
            </TitleWrapper>
          )}
        </div>
      </div>
    </header>
  );
};