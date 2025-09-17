import React, { useState, useEffect } from 'react';
import { GeneratorForm } from './components/form/GeneratorForm';
import { QuestionPaperDisplay } from './components/display/QuestionPaperDisplay';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { HomePage } from './components/HomePage';
import { Footer } from './components/Footer';
import { generateQuestionPaper, regenerateQuestion } from './services/geminiService';
import type { FormState, QuestionPaper, Question } from './types';

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};


const App: React.FC = () => {
    const [view, setView] = useState<'home' | 'form' | 'display'>('home');
    const [questionPaper, setQuestionPaper] = useState<QuestionPaper | null>(null);
    const [formStateForRegen, setFormStateForRegen] = useState<FormState | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [regenerationError, setRegenerationError] = useState<string | null>(null);
    const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<string | null>(null);

    const isMobile = useIsMobile();
    const isDesktop = !isMobile;

    useEffect(() => {
        if (isDesktop) {
            setView('home'); // On desktop, we can show both form and home/display
        }
    }, [isDesktop]);

    const handleGenerate = async (formData: FormState) => {
        setIsLoading(true);
        setError(null);
        setQuestionPaper(null);
        setFormStateForRegen(formData);
        if (isMobile) setView('display');

        try {
            const paper = await generateQuestionPaper(formData);
            setQuestionPaper(paper);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
            if(isMobile) setView('form'); // Go back to form on error on mobile
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateQuestion = async (questionId: string, sectionIndex: number) => {
        if (!questionPaper || !formStateForRegen) return;
        setRegeneratingQuestionId(questionId);
        setRegenerationError(null);

        const questionToReplace = questionPaper.sections[sectionIndex]?.questions.find(q => q.id === questionId);
        if (!questionToReplace) {
            setRegeneratingQuestionId(null);
            return;
        }

        const chaptersForRegen = formStateForRegen.generationMode === 'simple'
            ? formStateForRegen.chapters
            : formStateForRegen.chapterConfigs.filter(c => c.enabled).map(c => c.chapter);


        try {
            const newQuestionData = await regenerateQuestion(
                questionToReplace,
                {
                    grade: questionPaper.grade,
                    medium: questionPaper.medium,
                    subject: questionPaper.subject,
                    difficulty: questionPaper.difficulty,
                },
                chaptersForRegen
            );

            const newQuestion: Question = { ...newQuestionData, id: crypto.randomUUID() };

            const newQuestionPaper = { ...questionPaper };
            const newSections = [...newQuestionPaper.sections];
            const newQuestions = [...newSections[sectionIndex].questions];
            const questionIndex = newQuestions.findIndex(q => q.id === questionId);

            if (questionIndex !== -1) {
                newQuestions[questionIndex] = newQuestion;
                newSections[sectionIndex] = { ...newSections[sectionIndex], questions: newQuestions };
                newQuestionPaper.sections = newSections;
                setQuestionPaper(newQuestionPaper);
            }
        } catch (err) {
            setRegenerationError(err instanceof Error ? err.message : 'An unknown error occurred while regenerating.');
            console.error(err);
        } finally {
            setRegeneratingQuestionId(null);
        }
    };

    const startNewPaper = () => {
        setQuestionPaper(null);
        setError(null);
        setView(isMobile ? 'form' : 'home');
    }
    
    const renderMainContent = () => {
        if (isLoading) return <Loader />;
        if (questionPaper) {
             return <QuestionPaperDisplay
                        paper={questionPaper}
                        onNewPaper={startNewPaper}
                        onRegenerateQuestion={handleRegenerateQuestion}
                        regeneratingQuestionId={regeneratingQuestionId}
                        error={regenerationError}
                    />;
        }
        if (error) {
            return (
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Generation Failed</p>
                    <p>{error}</p>
                </div>
            );
        }
        return <HomePage onStart={() => setView('form')} isDesktop={isDesktop}/>;
    }

    // Desktop Layout
    if (isDesktop) {
        return (
            <div className="bg-slate-50 min-h-screen text-slate-700 flex flex-col" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-main)' }}>
                <Header isMobile={false} onGoHome={() => {}} showTitle={true} />
                <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24">
                            <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
                        </div>
                    </div>
                    <div className="lg:col-span-8 xl:col-span-9">
                        {renderMainContent()}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Mobile Layout
    return (
        <div className="bg-slate-50 min-h-screen text-slate-700 flex flex-col" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-main)' }}>
            <Header isMobile={true} onGoHome={() => setView('home')} showTitle={view !== 'form'} />
            <main className={`flex-grow p-2 sm:p-4 ${view === 'form' ? 'flex items-center' : ''}`}>
                {view === 'home' && <HomePage onStart={() => setView('form')} isDesktop={isDesktop} />}
                {view === 'form' && <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />}
                {view === 'display' && (
                    <div className="h-full">
                        {renderMainContent()}
                    </div>
                )}
            </main>
            {view !== 'form' && <Footer />}
        </div>
    );
};

export default App;