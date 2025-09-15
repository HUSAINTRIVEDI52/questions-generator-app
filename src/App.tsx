import React, { useState, useEffect } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { QuestionPaperDisplay } from './components/QuestionPaperDisplay';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { generateQuestionPaper } from './services/geminiService';
import type { FormState, QuestionPaper } from './types';
import { Analytics } from '@vercel/analytics/react';
import { HomePage } from './components/HomePage';

const App: React.FC = () => {
  const [questionPaper, setQuestionPaper] = useState<QuestionPaper | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileView, setMobileView] = useState<'home' | 'form' | 'result'>('home');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGenerate = async (formData: FormState) => {
    setIsLoading(true);
    setError(null);
    setQuestionPaper(null);
    if (isMobile) {
      setMobileView('result');
    }
    try {
      const paper = await generateQuestionPaper(formData);
      setQuestionPaper(paper);
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
    if (isMobile) {
        setMobileView('form');
    }
  }

  const handleGoHome = () => {
    setQuestionPaper(null);
    setError(null);
    setIsLoading(false);
    if (isMobile) {
        setMobileView('home');
    }
  };
  
  const renderResults = () => {
    if (isLoading) return <Loader />;
    if (error) {
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md animate-fade-in-up" role="alert">
          <p className="font-bold">Generation Failed</p>
          <p>{error}</p>
          <button onClick={handleNewPaper} className="mt-2 bg-red-500 text-white font-bold py-1 px-3 rounded hover:bg-red-600">Try Again</button>
        </div>
      );
    }
    if (questionPaper) return <QuestionPaperDisplay key={Date.now()} paper={questionPaper} onNewPaper={handleNewPaper} />;
    return null;
  };

  const showResults = isLoading || error || questionPaper;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-background)'}}>
      <Header isMobile={isMobile} onGoHome={handleGoHome} />
      <main className="container mx-auto p-2 sm:p-4 md:p-8 flex-grow w-full">
        {isMobile ? (
          <>
            {mobileView === 'home' && <HomePage onStart={() => setMobileView('form')} isDesktop={false} />}
            {mobileView === 'form' && <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />}
            {mobileView === 'result' && renderResults()}
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-24">
                <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
              </div>
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
              {showResults ? renderResults() : <HomePage onStart={() => {}} isDesktop={true} />}
            </div>
          </div>
        )}
      </main>
      <footer className="w-full text-center p-4 mt-8 no-print" style={{ color: 'var(--color-text-muted)' }}>
        <p className="text-sm font-medium">An initiative by <span className="font-bold text-blue-700">Husain M Trivedi</span></p>
        <p className="text-sm">Contact: <a href="tel:7698379853" className="font-semibold hover:underline">7698379853</a></p>
      </footer>
      <Analytics />
    </div>
  );
};

export default App;