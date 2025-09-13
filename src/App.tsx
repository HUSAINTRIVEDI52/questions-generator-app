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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
                <div className="text-center">
                    <div className="inline-block bg-blue-100 text-blue-600 rounded-full p-3 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z"/></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">Create Custom Question Papers in Seconds</h2>
                    <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
                        Your intelligent assistant for generating high-quality papers tailored to the Gujarat State Education Board (GSEB) curriculum. This tool is designed for teachers, students, and parents to effortlessly create practice tests and exam papers.
                    </p>
                </div>
                
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-600 mb-3">
                           <FeatureIcon1 />
                        </div>
                        <h3 className="font-bold text-lg text-slate-700">Fully Customizable</h3>
                        <p className="text-sm text-slate-500 mt-1">Select grade, subject, medium, and specific chapters to focus on.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-600 mb-3">
                           <FeatureIcon2 />
                        </div>
                        <h3 className="font-bold text-lg text-slate-700">Flexible Paper Structure</h3>
                        <p className="text-sm text-slate-500 mt-1">Define the exact number and type of questions—from MCQs to long answers.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-600 mb-3">
                          <FeatureIcon3 />
                        </div>
                        <h3 className="font-bold text-lg text-slate-700">Multiple Export Options</h3>
                        <p className="text-sm text-slate-500 mt-1">Print directly, save as PDF, or export as a DOCX file for easy editing.</p>
                    </div>
                </div>

                <div className="mt-12 text-center bg-slate-50 p-6 rounded-lg">
                    <p className="text-lg font-medium text-slate-800">
                        Ready to start? Fill out the form on the left to generate your first paper!
                    </p>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;