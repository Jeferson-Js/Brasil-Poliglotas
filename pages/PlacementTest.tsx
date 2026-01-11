
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { generatePlacementTest } from '../services/geminiService';
import { GlassCard } from '../components/GlassCard';
import { Header } from '../components/Header';
import { SUPPORTED_LANGUAGES } from '../constants';

export const PlacementTest: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const langId = searchParams.get('lang') || 'en';
  const language = SUPPORTED_LANGUAGES.find(l => l.id === langId);

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userScore, setUserScore] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const loadTest = async () => {
      try {
        const data = await generatePlacementTest(language?.name || 'English');
        setQuestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTest();
  }, [language]);

  const handleOptionClick = (opt: string) => {
    if (selectedOption) return;
    setSelectedOption(opt);
    const isCorrect = opt === questions[currentIdx].answer;
    setUserScore(prev => ({ ...prev, [questions[currentIdx].level]: isCorrect }));

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setFinished(true);
      }
    }, 2000);
  };

  const calculateLevel = () => {
    const passedLevels = Object.entries(userScore)
      .filter(([_, correct]) => correct)
      .map(([lvl]) => lvl);
    
    if (passedLevels.length === 0) return 'A1';
    // Returns the highest level passed
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    let highest = 'A1';
    levels.forEach(l => {
      if (passedLevels.includes(l)) highest = l;
    });
    return highest;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium italic">Preparando seu desafio personalizado em {language?.name}...</p>
        </div>
      </div>
    );
  }

  if (finished) {
    const finalLevel = calculateLevel();
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <GlassCard className="max-w-md w-full p-10 text-center">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Resultado do Teste</h2>
            <p className="text-slate-500 mb-8">Baseado no seu desempenho, seu nível sugerido é:</p>
            <div className="text-6xl font-black text-emerald-600 mb-8 br-gradient text-transparent bg-clip-text">
              {finalLevel}
            </div>
            <button 
              onClick={() => navigate(`/dashboard?lang=${langId}&level=${finalLevel}`)}
              className="w-full py-4 br-gradient text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
            >
              Começar minha jornada
            </button>
          </GlassCard>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Teste de Nivelamento</span>
              <h1 className="text-2xl font-bold text-slate-800">Questão {currentIdx + 1} de {questions.length}</h1>
            </div>
            <span className="text-sm font-medium text-slate-400">Foco: Nível {currentQ.level}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <GlassCard className="p-10 shadow-xl">
          <h2 className="text-2xl font-medium text-slate-900 mb-8 leading-relaxed">
            {currentQ.question}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {currentQ.options.map((opt: string) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.answer;
              
              let btnStyle = "w-full p-5 text-left rounded-2xl border-2 font-medium transition-all duration-300 flex justify-between items-center ";
              
              if (!selectedOption) {
                btnStyle += "border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700";
              } else if (isSelected) {
                btnStyle += isCorrect ? "border-emerald-500 bg-emerald-500 text-white shadow-lg scale-[1.02]" : "border-rose-500 bg-rose-500 text-white";
              } else if (isCorrect) {
                btnStyle += "border-emerald-500 bg-emerald-50 text-emerald-700 opacity-80";
              } else {
                btnStyle += "border-slate-50 text-slate-300 opacity-40";
              }

              return (
                <button 
                  key={opt}
                  disabled={!!selectedOption}
                  onClick={() => handleOptionClick(opt)}
                  className={btnStyle}
                >
                  <span>{opt}</span>
                  {selectedOption && isCorrect && <span>✓</span>}
                  {selectedOption && isSelected && !isCorrect && <span>✕</span>}
                </button>
              );
            })}
          </div>

          {selectedOption && (
            <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <p className="text-sm text-slate-600 italic">
                 {currentQ.explanation}
               </p>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
};
