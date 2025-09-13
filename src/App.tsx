import React, { useState } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { QuestionPaperDisplay } from './components/QuestionPaperDisplay';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { generateQuestionPaper } from './services/geminiService';
import type { FormState, QuestionPaper } from './types';

const FeatureIcon1 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M4 20h2"/><path d="M4 14h14"/><path d="M12 8h7"/><path d="M4 8h2"/><path d="M4 4h16"/></svg>;
const FeatureIcon2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M12 12 2 22"/></svg>;
const FeatureIcon3 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>;

const App: React.FC = () => {
  const [questionPaper, setQuestionPaper] = useState<QuestionPaper | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (formData: FormState) => {
    setIsLoading(true);
    setError(null);
    setQuestionPaper(null);
    try {
      const paper = await generateQuestionPaper(formData);
      setQuestionPaper(paper);
      window.scrollTo(0, 0); // Scroll to top on mobile to see the new paper
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPaper = () => {
    setQuestionPaper(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-main)' }}>
      <Header />
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        <div className={`lg:col-span-4 xl:col-span-3 no-print ${questionPaper ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-24">
            <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
        </div>
        <div className={questionPaper ? 'col-span-12' : 'lg:col-span-8 xl:col-span-9'}>
          {isLoading && <Loader />}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm" role="alert" style={{ backgroundColor: 'rgba(254, 226, 226, 0.5)'}}>
              <p className="font-bold">Generation Failed</p>
              <p>{error}</p>
            </div>
          )}
          {questionPaper && !isLoading && <QuestionPaperDisplay paper={questionPaper} onNewPaper={handleNewPaper} />}
          {!questionPaper && !isLoading && !error && (
            <div className="p-8 min-h-[500px]" style={{ backgroundColor: 'var(--color-surface)', borderRadius: '0.75rem', border: '1px solid var(--color-border)', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <div className="text-center">
                    <div className="inline-block bg-blue-100 text-primary rounded-full p-3 mb-4">
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
                    <p className="text-lg font-medium" style={{ color: 'var(--color-text-main)' }}>
                        Ready to start? Fill out the form on the left to generate your first paper!
                    </p>
                </div>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center p-4 border-t border-slate-200 no-print" style={{ backgroundColor: 'var(--color-surface)' }}>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          For support or inquiries, contact Husain M Trivedi at <a href="tel:7698379853" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>7698379853</a>.
        </p>
      </footer>
    </div>
  );
};

export default App;