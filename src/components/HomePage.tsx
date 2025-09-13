import React from 'react';

const FeatureIcon1 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M4 20h2"/><path d="M4 14h14"/><path d="M12 8h7"/><path d="M4 8h2"/><path d="M4 4h16"/></svg>;
const FeatureIcon2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M12 12 2 22"/></svg>;
const FeatureIcon3 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>;
const CreateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>;

interface HomePageProps {
    onStart: () => void;
    isDesktop: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ onStart, isDesktop }) => {
    return (
        <div className="p-4 sm:p-8 h-full" style={{ backgroundColor: 'var(--color-surface)', borderRadius: '0.75rem', border: '1px solid var(--color-border)', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
            <div className="text-center">
                <div className="inline-block bg-blue-100 text-primary rounded-full p-3 mb-4" style={{ color: 'var(--color-primary)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z"/></svg>
                </div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-main)' }}>Create Custom Question Papers in Seconds</h2>
                <p className="mt-3 max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                    Your intelligent assistant for generating high-quality papers tailored to the Gujarat State Education Board (GSEB) curriculum. This tool is designed for teachers, students, and parents to effortlessly create practice tests and exam papers.
                </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full mb-3" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
                       <FeatureIcon1 />
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>Fully Customizable</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Select grade, subject, medium, and specific chapters to focus on.</p>
                </div>
                 <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full mb-3" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
                       <FeatureIcon2 />
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>Flexible Paper Structure</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Define the exact number and type of questions—from MCQs to long answers.</p>
                </div>
                 <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full mb-3" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
                      <FeatureIcon3 />
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>Multiple Export Options</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Save as PDF, or export as a DOCX file for easy editing.</p>
                </div>
            </div>

            <div className="mt-12 text-center p-6 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                {isDesktop ? (
                     <p className="text-lg font-medium" style={{ color: 'var(--color-text-main)' }}>
                        Ready to start? Fill out the form on the left to generate your first paper!
                    </p>
                ) : (
                    <button 
                        onClick={onStart} 
                        className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 active:scale-95 transform"
                    >
                        <CreateIcon />
                        <span className="ml-2">Create New Paper</span>
                    </button>
                )}
            </div>
        </div>
    );
};