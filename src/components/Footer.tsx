import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full text-center p-4 mt-auto no-print" style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
            <p className="text-sm font-medium">An initiative by <span className="font-bold text-blue-700">Husain M Trivedi</span></p>
            <p className="text-sm">Contact: <a href="tel:7698379853" className="font-semibold hover:underline">7698379853</a></p>
        </footer>
    );
};
