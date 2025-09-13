import React, { useState, useEffect } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { QuestionPaperDisplay } from './components/QuestionPaperDisplay';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { HomePage } from './components/HomePage';
import { generateQuestionPaper } from './services/geminiService';
import type { FormState, QuestionPaper } from './types';

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isDesktop;
};

const App: React.FC = () => {
  const [questionPaper, setQuestionPaper] = useState<QuestionPaper | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<'home' | 'generator'>('home');
  const isDesktop = useIsDesktop();

  const handleGenerate = async (formData: FormState) => {
    setIsLoading(true);
    setError(null);
    setQuestionPaper(null);
    try {
      const paper = await generateQuestionPaper(formData);
      setQuestionPaper(paper);
      if (!isDesktop) {
        window.scrollTo(0, 0); // Scroll to top on mobile to see the new paper
      }
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
  
  const goToHome = () => {
      handleNewPaper();
      setPage('home');
  }

  const renderDesktop = () => (
    <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
      <div className="lg:col-span-4 xl:col-span-3 no-print">
        <div className="sticky top-24">
          <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        {isLoading && <Loader />}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm" role="alert" style={{ backgroundColor: 'rgba(254, 226, 226, 0.5)'}}>
            <p className="font-bold">Generation Failed</p>
            <p>{error}</p>
          </div>
        )}
        {questionPaper && !isLoading && <QuestionPaperDisplay key={questionPaper.title + questionPaper.total_marks} paper={questionPaper} onNewPaper={handleNewPaper} />}
        {!questionPaper && !isLoading && !error && <HomePage onStart={() => {}} isDesktop={true} />}
      </div>
    </main>
  );

  const renderMobile = () => (
    <main className="container mx-auto p-4 md:p-8 flex-grow">
      {page === 'home' && <HomePage onStart={() => setPage('generator')} isDesktop={false} />}
      {page === 'generator' && (
        <div>
          <div className={questionPaper || isLoading || error ? 'hidden' : 'block'}>
            <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          {isLoading && <Loader />}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm" role="alert" style={{ backgroundColor: 'rgba(254, 226, 226, 0.5)'}}>
              <p className="font-bold">Generation Failed</p>
              <p>{error}</p>
            </div>
          )}
          {questionPaper && !isLoading && <QuestionPaperDisplay key={questionPaper.title + questionPaper.total_marks} paper={questionPaper} onNewPaper={handleNewPaper} />}
        </div>
      )}
    </main>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-main)' }}>
      <Header onGoHome={goToHome} isMobile={!isDesktop} />
      {isDesktop ? renderDesktop() : renderMobile()}
      <footer className="text-center p-4 border-t border-slate-200 no-print" style={{ backgroundColor: 'var(--color-surface)' }}>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          For support or inquiries, contact Husain M Trivedi at <a href="tel:7698379853" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>7698379853</a>.
        </p>
      </footer>
    </div>
  );
};

export default App;