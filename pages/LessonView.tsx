
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { generateLessonContent, generateImageForVocabulary } from '../services/geminiService';
import { GlassCard } from '../components/GlassCard';
import { Header } from '../components/Header';
// Fix: Import SUPPORTED_LANGUAGES to resolve language name for display
import { SUPPORTED_LANGUAGES } from '../constants';

const ENVIRONMENTS = [
  { id: 'office', label: 'Escritório/Trabalho', icon: '💼' },
  { id: 'home', label: 'Em Casa/Família', icon: '🏠' },
  { id: 'travel', label: 'Viagem/Turismo', icon: '✈️' },
  { id: 'health', label: 'Saúde/Médico', icon: '🏥' },
  { id: 'study', label: 'Estudo/Acadêmico', icon: '📚' },
  { id: 'general', label: 'Vida Cotidiana', icon: '🚶' },
];

export const LessonView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lang = searchParams.get('lang') || 'en';
  const level = searchParams.get('level') || 'A1';
  const topic = searchParams.get('topic') || 'Intro';
  const needsContext = searchParams.get('needsContext') === 'true';
  // Fix: Resolve language name to fix "Cannot find name 'language'" error
  const language = SUPPORTED_LANGUAGES.find(l => l.id === lang)?.name || lang;

  const progressKey = `bp_progress_${lang}_${level}_${topic}`;

  const [loading, setLoading] = useState(false);
  const [lessonData, setLessonData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0); 
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [exercisesFinished, setExercisesFinished] = useState(false);
  const [vocabImages, setVocabImages] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  const [showEnvSelector, setShowEnvSelector] = useState(needsContext);

  const saveProgress = useCallback((data: any, step: number, userAnswers: any, images: any, exerciseIdx: number) => {
    const progress = {
      lessonData: data,
      currentStep: step,
      currentExerciseIdx: exerciseIdx,
      answers: userAnswers,
      vocabImages: images,
      timestamp: Date.now()
    };
    localStorage.setItem(progressKey, JSON.stringify(progress));
  }, [progressKey]);

  const loadLesson = async (context?: string) => {
    const saved = localStorage.getItem(progressKey);
    if (saved && !context) {
      try {
        const parsed = JSON.parse(saved);
        setLessonData(parsed.lessonData);
        setCurrentStep(parsed.currentStep);
        setCurrentExerciseIdx(parsed.currentExerciseIdx || 0);
        setAnswers(parsed.answers || {});
        setVocabImages(parsed.vocabImages || {});
        setLoading(false);
        setShowEnvSelector(false);
        return;
      } catch (e) {
        console.error("Error parsing progress", e);
      }
    }

    setLoading(true);
    setShowEnvSelector(false);
    try {
      const data = await generateLessonContent(lang, level, topic, context);
      setLessonData(data);
      
      if (data.vocabulary) {
        const imgs: Record<string, string> = {};
        for (let i = 0; i < Math.min(4, data.vocabulary.length); i++) {
          const url = await generateImageForVocabulary(data.vocabulary[i].word);
          if (url) imgs[data.vocabulary[i].word] = url;
        }
        setVocabImages(imgs);
        saveProgress(data, 0, {}, imgs, 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!needsContext) {
      loadLesson();
    }
  }, [lang, level, topic, progressKey]);

  useEffect(() => {
    if (lessonData && !loading) {
      saveProgress(lessonData, currentStep, answers, vocabImages, currentExerciseIdx);
    }
  }, [currentStep, answers, vocabImages, lessonData, loading, currentExerciseIdx, saveProgress]);

  const handleAnswer = (index: number, option: string) => {
    if (answers[index]) return;
    const isCorrect = option === lessonData.exercises[index].answer;
    setAnswers(prev => ({ ...prev, [index]: option }));

    if (isCorrect) {
      setTimeout(() => {
        handleNextExercise();
      }, 1200); 
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIdx < (lessonData?.exercises?.length || 0) - 1) {
      setCurrentExerciseIdx(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setExercisesFinished(true);
    }
  };

  if (showEnvSelector) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 flex flex-col justify-center py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Ambiente de Aprendizado</h2>
            <p className="text-slate-500 italic">Personalizamos os 50 exercícios para este contexto.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ENVIRONMENTS.map(env => (
              <GlassCard 
                key={env.id}
                className="p-6 cursor-pointer text-center hover:border-emerald-500 hover:scale-[1.05] transition-all"
                onClick={() => {
                  setSelectedEnvironment(env.label);
                  loadLesson(env.label);
                }}
              >
                <div className="text-4xl mb-3">{env.icon}</div>
                <div className="font-bold text-slate-800">{env.label}</div>
              </GlassCard>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 max-w-sm">
          <div className="w-20 h-20 br-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
             <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Gerando 50 Exercícios</h3>
          <p className="text-slate-500 italic">"Sincronizando nuances linguísticas de {language}..."</p>
        </div>
      </div>
    );
  }

  const currentEx = lessonData?.exercises?.[currentExerciseIdx];
  const selectedAnswer = answers[currentExerciseIdx];
  const isCorrect = selectedAnswer === currentEx?.answer;

  return (
    <div className="min-h-screen pb-12 bg-slate-50/50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6">
        <div className="mb-10 flex items-center justify-between sticky top-24 z-40 bg-slate-50/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-emerald-600 font-bold flex items-center transition-colors">
            <span className="mr-2">✕</span> Sair
          </button>
          <div className="flex-1 mx-8 h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full br-gradient transition-all duration-700 ease-out" 
              style={{ width: `${((currentStep + 1) / 3) * 100}%` }} 
            />
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Etapa</div>
            <div className="text-lg font-black text-emerald-600 leading-none">{currentStep + 1}/3</div>
          </div>
        </div>

        {currentStep === 0 && (
          <GlassCard className="p-10 border-b-4 border-emerald-500 shadow-2xl">
            <div className="mb-8">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase rounded-full border border-emerald-100">Teoria & Fonética</span>
              <h1 className="text-4xl font-black text-slate-900 mt-4 leading-tight">{lessonData?.title}</h1>
              {selectedEnvironment && <p className="mt-2 text-emerald-600 font-bold text-sm uppercase">Contexto: {selectedEnvironment}</p>}
            </div>
            <div className="prose prose-slate max-w-none text-slate-700 space-y-6" dir="auto">
              {lessonData?.explanation?.split('\n').map((para: string, i: number) => (
                <p key={i} className="text-xl leading-relaxed">{para}</p>
              ))}
            </div>
            <div className="mt-12 p-8 bg-emerald-900 text-white rounded-3xl relative overflow-hidden shadow-xl">
              <h3 className="font-bold text-emerald-400 mb-2 uppercase tracking-widest text-sm">Contexto Cultural</h3>
              <p className="text-emerald-50/90 leading-relaxed italic text-lg">{lessonData?.culturalContext}</p>
            </div>
            <button 
              onClick={() => setCurrentStep(1)}
              className="mt-12 w-full py-5 br-gradient text-white rounded-2xl font-black text-xl hover:shadow-2xl transition-all"
            >
              Fase 2: Vocabulário
            </button>
          </GlassCard>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900">Vocabulário Base</h2>
              <p className="text-slate-500 font-medium">Memorize estes termos (escrita original e pronúncia).</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lessonData?.vocabulary?.map((item: any, idx: number) => (
                <GlassCard key={idx} className="p-6 group hover:border-emerald-200 transition-all">
                  <div className="flex space-x-6">
                    <div className="w-24 h-24 rounded-2xl bg-white shadow-inner flex-shrink-0 overflow-hidden border border-slate-100">
                      {vocabImages[item.word] ? (
                        <img src={vocabImages[item.word]} alt={item.word} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200 text-3xl">🖼️</div>
                      )}
                    </div>
                    <div className="flex-1" dir="auto">
                      <h4 className="text-3xl font-black text-emerald-600 mb-1">{item.word}</h4>
                      <p className="text-slate-400 font-bold text-sm mb-3">{item.translation}</p>
                      <p className="text-md text-slate-600 italic">"{item.example}"</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
            <button 
              onClick={() => setCurrentStep(2)}
              className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-slate-800 shadow-xl"
            >
              Iniciar Super-Fixação (50 Desafios)
            </button>
          </div>
        )}

        {currentStep === 2 && !exercisesFinished && (
          <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="mb-8 flex justify-between items-end">
               <div>
                 <h2 className="text-3xl font-black text-slate-900">Desafios de Fixação</h2>
                 <p className="text-slate-500 font-medium">Questão {currentExerciseIdx + 1} de {lessonData?.exercises?.length || 50}</p>
               </div>
               <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                 <div 
                   className="h-full bg-emerald-500 transition-all duration-500" 
                   style={{ width: `${((currentExerciseIdx + 1) / (lessonData?.exercises?.length || 50)) * 100}%` }}
                 />
               </div>
             </div>
             
             {currentEx && (
               <GlassCard 
                 className={`p-8 transition-all duration-500 border-2 ${
                   selectedAnswer 
                     ? (isCorrect ? 'border-emerald-500 bg-emerald-50/30' : 'border-rose-500 bg-rose-50/30') 
                     : 'border-white hover:border-slate-200'
                 }`}
               >
                 <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-full tracking-widest">Fixação {currentExerciseIdx + 1}</span>
                  {selectedAnswer && (
                    <span className={`font-black text-sm uppercase flex items-center ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCorrect ? '✓ Correto!' : 'Incorreto'}
                    </span>
                  )}
                 </div>
                 <h4 className="text-3xl font-bold text-slate-800 mb-8 leading-tight" dir="auto">{currentEx.question}</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {currentEx.options?.map((opt: string) => {
                     const isThisOptionCorrect = opt === currentEx.answer;
                     const isThisOptionSelected = opt === selectedAnswer;
                     let btnClass = "w-full p-6 text-left border-2 rounded-2xl font-bold transition-all duration-300 text-xl ";
                     if (!selectedAnswer) {
                       btnClass += "border-slate-100 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50";
                     } else {
                       if (isThisOptionCorrect) btnClass += "border-emerald-500 bg-emerald-500 text-white";
                       else if (isThisOptionSelected) btnClass += "border-rose-500 bg-rose-500 text-white";
                       else btnClass += "border-slate-50 text-slate-300 opacity-50";
                     }
                     return (
                       <button key={opt} disabled={!!selectedAnswer} className={btnClass} dir="auto" onClick={() => handleAnswer(currentExerciseIdx, opt)}>{opt}</button>
                     );
                   })}
                 </div>
                 {selectedAnswer && (
                   <div className="mt-8 p-6 rounded-2xl bg-white border border-slate-100 animate-in zoom-in-95 duration-300">
                     <h5 className="font-black text-slate-400 text-[10px] uppercase mb-2">Por que?</h5>
                     <p className="text-slate-700 font-medium text-lg">{currentEx.explanation || `A resposta é: ${currentEx.answer}`}</p>
                     {!isCorrect && (
                       <button onClick={handleNextExercise} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Continuar</button>
                     )}
                   </div>
                 )}
               </GlassCard>
             )}
          </div>
        )}

        {exercisesFinished && (
          <div className="text-center py-20 animate-in zoom-in duration-500">
            <div className="text-8xl mb-6">🌟</div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Mestre em {topic}!</h2>
            <p className="text-xl text-slate-500 mb-10">Você dominou os 50 desafios de fixação em {language}.</p>
            <button 
              onClick={() => {
                localStorage.removeItem(progressKey);
                navigate('/dashboard');
              }}
              className="px-12 py-6 br-gradient text-white rounded-3xl font-black text-2xl shadow-2xl hover:scale-[1.05] transition-all"
            >
              Concluir e Salvar Progresso
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
