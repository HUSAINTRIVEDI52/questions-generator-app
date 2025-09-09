import React, { useState } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { QuestionPaperDisplay } from './components/QuestionPaperDisplay';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { generateQuestionPaper } from './services/geminiService';
import type { FormState, QuestionPaper } from './types';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-700">
      <Header />
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-3 no-print">
          <div className="sticky top-24">
            <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
        </div>
        <div className="lg:col-span-8 xl:col-span-9">
          {isLoading && <Loader />}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
              <p className="font-bold">Generation Failed</p>
              <p>{error}</p>
            </div>
          )}
          {questionPaper && !isLoading && <QuestionPaperDisplay paper={questionPaper} />}
          {!questionPaper && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center min-h-[500px]">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-2xl font-bold text-slate-700">Welcome to the AI Question Paper Generator</h2>
                <p className="text-slate-500 mt-2 max-w-md">
                    Fill out the form on the left to generate a custom question paper for the GSEB curriculum. Select grade, medium, subject, and chapters to get started.
                </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
