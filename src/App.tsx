import React, { useState, useEffect } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { QuestionPaperDisplay } from './components/QuestionPaperDisplay';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { HomePage } from './components/HomePage';
import { generateQuestionPaper } from './services/geminiService';
import type { FormState, QuestionPaper } from './types';

// Custom hook to detect if the view is desktop
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
    if (!isDesktop) {
      setPage('home'); // Switch to home to show loader/paper
    }
    try {
      const paper = await generateQuestionPaper(formData);
      setQuestionPaper(paper);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNew = () => {
    setQuestionPaper(null);
    setError(null);
    setPage('generator');
  };
  
  const handleGoHome = () => {
      setPage('home');
  }

  const formView = <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />;
  
  const contentView = (
      <>
        {isLoading && <Loader />}
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-fade-in-up" role="alert">
                <p className="font-bold">Generation Failed</p>
                <p>{error}</p>
            </div>
        )}
        {questionPaper && !isLoading && <QuestionPaperDisplay key={questionPaper.title + questionPaper.total_marks} paper={questionPaper} onNewPaper={handleStartNew} />}
        {!questionPaper && !isLoading && !error && (
            <HomePage onStart={handleStartNew} isDesktop={isDesktop} />
        )}
      </>
  );

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <Header isMobile={!isDesktop} onGoHome={handleGoHome} />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {isDesktop ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24">{formView}</div>
            </div>
            <div className="lg:col-span-8 xl:col-span-9">{contentView}</div>
          </div>
        ) : (
           page === 'generator' ? formView : contentView
        )}
      </main>
      <footer className="w-full text-center p-4 mt-8 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          <p className="text-sm">An initiative by <strong className="font-semibold" style={{ color: 'var(--color-primary)'}}>Husain M Trivedi</strong></p>
          <p className="text-sm">Contact: <a href="tel:7698379853" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)'}}>7698379853</a></p>
      </footer>
    </div>
  );
};

export default App;