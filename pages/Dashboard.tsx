
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, CEFR_LEVELS } from '../constants';
import { GlassCard } from '../components/GlassCard';
import { Header } from '../components/Header';
import { generateSyllabus } from '../services/geminiService';

export const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const langId = searchParams.get('lang') || 'en';
  const levelFromParams = searchParams.get('level') || 'A1';
  const language = SUPPORTED_LANGUAGES.find(l => l.id === langId);

  const [activeLevel, setActiveLevel] = useState(levelFromParams);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSyllabus = async () => {
      setLoading(true);
      try {
        const syllabus = await generateSyllabus(language?.name || 'English', activeLevel);
        setTopics(syllabus);
      } catch (err) {
        console.error("Erro ao carregar currículo:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSyllabus();
  }, [language, activeLevel]);

  return (
    <div className="min-h-screen pb-12 bg-slate-50/50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">Trilha de {language?.name}</h2>
                <p className="text-slate-500 font-medium">Progresso Inteligente • {activeLevel}</p>
              </div>
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                {CEFR_LEVELS.map(lvl => (
                  <button 
                    key={lvl}
                    onClick={() => setActiveLevel(lvl)}
                    className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
                      activeLevel === lvl 
                        ? 'br-gradient text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : (
              <div className="relative space-y-4">
                <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-emerald-100 hidden md:block"></div>
                {topics.map((topic, index) => {
                  const isLocked = index > 0;
                  return (
                    <GlassCard 
                      key={topic.id}
                      className={`relative p-6 flex items-center justify-between group transition-all duration-500 ${
                        isLocked ? 'opacity-70 grayscale-[0.5]' : 'hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50 cursor-pointer'
                      } ${topic.isSpecial ? 'border-2 border-amber-200 bg-amber-50/30' : ''}`}
                      onClick={() => !isLocked && navigate(`/lesson?lang=${langId}&level=${activeLevel}&topic=${topic.title}${topic.requiresContext ? '&needsContext=true' : ''}`)}
                    >
                      <div className="flex items-center space-x-6 z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-110 ${
                          topic.isSpecial ? 'bg-amber-100 text-amber-700' : (!isLocked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400')
                        }`}>
                          {topic.isSpecial ? '⭐' : index + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-800 text-lg">{topic.title}</h4>
                            {topic.isSpecial && (
                              <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-tighter">Metodologia Exclusiva</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed max-w-md">{topic.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                         {!isLocked && (
                           <span className="hidden md:inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                             Disponível
                           </span>
                         )}
                         <div className={`text-2xl transition-transform ${!isLocked ? 'group-hover:translate-x-1' : ''}`}>
                          {!isLocked ? '▶️' : '🔒'}
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Progresso de Fluência</h3>
              <div className="space-y-4">
                {[
                  { label: 'Vocabulário', value: 35, color: 'bg-emerald-500' },
                  { label: 'Gramática', value: 20, color: 'bg-amber-500' },
                  { label: 'Fonética', value: 45, color: 'bg-blue-500' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1">
                      <span>{stat.label}</span>
                      <span>{stat.value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${stat.color} h-full transition-all duration-1000`} style={{ width: `${stat.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
            
            <GlassCard className="p-6 bg-emerald-900 text-white">
              <h4 className="font-bold mb-2">Dica do Professor</h4>
              <p className="text-sm text-emerald-100/80 italic">"No Segredo dos Nove, o foco é o padrão rítmico. Não tente memorizar, tente reconhecer a música dos números."</p>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
};
