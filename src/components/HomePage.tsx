import React from 'react';

// Icons for features
const CustomizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M4 20h2"/><path d="M4 14h14"/><path d="M12 8h7"/><path d="M4 8h2"/><path d="M4 4h16"/></svg>;
const StructureIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const CreateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>;

interface HomePageProps {
    onStart: () => void;
    isDesktop: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ onStart, isDesktop }) => {
    return (
        <div className="p-4 sm:p-6 h-full bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in-up overflow-y-auto">
            <div className="text-center p-4 sm:p-8 rounded-lg" style={{ background: 'radial-gradient(circle, rgba(239,246,255,1) 0%, rgba(255,255,255,1) 100%)' }}>
                 <div className="inline-block bg-blue-100 text-blue-600 rounded-full p-3 mb-4 ring-8 ring-blue-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z"/></svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">The Ultimate AI Question Paper Generator</h1>
                <p className="mt-3 max-w-2xl mx-auto text-slate-600 text-base md:text-lg">
                    Craft high-quality, customized exam papers for the GSEB curriculum in seconds. Powered by Google's Gemini API for unparalleled accuracy and relevance.
                </p>
                 {!isDesktop && (
                    <button 
                        onClick={onStart} 
                        className="mt-8 w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 active:scale-95 transform"
                    >
                        <CreateIcon />
                        <span className="ml-2">Create Your Paper Now</span>
                    </button>
                )}
            </div>
            
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Why Choose Our Generator?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<CustomizeIcon />}
                        title="Deep Customization"
                        description="Tailor papers by grade, subject, medium, and chapter. Choose between simple question counts or advanced per-chapter configurations."
                    />
                    <FeatureCard
                        icon={<StructureIcon />}
                        title="Diverse Question Types"
                        description="Generate a wide range of questions including MCQs, Short/Long Answers, Match the Following, and even Graph-based questions for Social Science."
                    />
                    <FeatureCard
                        icon={<ExportIcon />}
                        title="Professional Exports"
                        description="Print your paper directly, save as a PDF, or export to a fully-editable DOCX file for further modifications. Complete with answers."
                    />
                </div>
            </div>

            <div className="mt-12 text-center p-6 rounded-lg bg-slate-50 border border-slate-200">
                {isDesktop ? (
                     <p className="text-lg font-medium text-slate-700">
                        Ready to start? Use the form on the left to configure and generate your first paper!
                    </p>
                ) : (
                    <p className="text-lg font-medium text-slate-700">You're all set! Press the button above to begin.</p>
                )}
            </div>
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-4">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-500 mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        <p className="text-sm mt-1 text-slate-600">{description}</p>
    </div>
);