
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SUPPORTED_LANGUAGES } from '../constants';
import { GlassCard } from '../components/GlassCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelect = (langId: string, needsTest: boolean = false) => {
    if (needsTest) {
      navigate(`/placement?lang=${langId}`);
    } else {
      navigate(`/dashboard?lang=${langId}`);
    }
  };

  // Helper to determine badges for modern look
  const getBadge = (langId: string) => {
    if (['en', 'es', 'fr'].includes(langId)) return { text: 'Popular', class: 'bg-blue-100 text-blue-600' };
    if (['sjn', 'dth'].includes(langId)) return { text: 'Fantasia', class: 'bg-purple-100 text-purple-600' };
    if (['xh', 'ar-lb', 'he'].includes(langId)) return { text: 'Exótico', class: 'bg-amber-100 text-amber-600' };
    return { text: 'Novo', class: 'bg-emerald-100 text-emerald-600' };
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-amber-100 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <header className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="text-xs font-black uppercase tracking-[0.2em] br-gradient text-transparent bg-clip-text">
              Educação de Elite • Brasil
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 leading-tight tracking-tight">
            Domine o Mundo, <br/>
            <span className="text-transparent bg-clip-text br-gradient">Um Idioma por Vez.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Metodologia exclusiva de imersão multissensorial acelerada por Inteligência Artificial. 
            Do zero ao avançado com contexto real.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex -space-x-3 overflow-hidden p-1">
              {[1,2,3,4,5].map(i => (
                <img key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-white shadow-sm" src={`https://picsum.photos/seed/${i+10}/100/100`} alt="User" />
              ))}
            </div>
            <div className="flex flex-col items-start justify-center text-left">
              <span className="text-sm font-bold text-slate-800">+15.000 alunos</span>
              <span className="text-xs text-slate-400 font-medium">aprendendo agora mesmo</span>
            </div>
          </div>
        </header>

        {/* Grid de Idiomas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const badge = getBadge(lang.id);
            return (
              <GlassCard 
                key={lang.id}
                className="relative flex flex-col p-0 overflow-hidden group hover:scale-[1.03] hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500 border border-white/40"
              >
                {/* Card Header Background */}
                <div className="h-24 br-gradient opacity-5 transition-opacity group-hover:opacity-10 absolute top-0 left-0 w-full -z-10"></div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl transform group-hover:rotate-6 transition-transform">
                      {lang.flag}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">
                      {lang.name}
                    </h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter italic">
                      {lang.nativeName}
                    </p>
                  </div>

                  <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium line-clamp-2">
                    {lang.description}
                  </p>

                  <div className="mt-auto space-y-3">
                    <button 
                      onClick={() => handleSelect(lang.id, false)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 group-hover:shadow-emerald-200"
                    >
                      Iniciar Jornada
                    </button>
                    <button 
                      onClick={() => handleSelect(lang.id, true)}
                      className="w-full py-3 bg-transparent border border-slate-200 text-slate-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white hover:border-emerald-500 hover:text-emerald-600 transition-all"
                    >
                      Teste de Nivelamento
                    </button>
                  </div>
                </div>

                {/* Decorative Bottom Bar */}
                <div className="h-1 w-0 br-gradient group-hover:w-full transition-all duration-700"></div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Footer / Stats Section */}
      <section className="mt-32 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div className="group">
              <div className="w-16 h-16 br-gradient rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-3xl shadow-xl shadow-emerald-200 group-hover:rotate-12 transition-transform">
                🧠
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-3">Fixação Científica</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                50 exercícios exclusivos por módulo para garantir que o conhecimento saia da memória de curto prazo para a definitiva.
              </p>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-3xl shadow-xl shadow-amber-200 group-hover:-rotate-12 transition-transform">
                🎭
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-3">Contexto Adaptativo</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Escolha onde você vai usar o idioma: trabalho, casa ou viagem. A IA adapta todo o vocabulário para sua realidade.
              </p>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-3xl shadow-xl shadow-slate-300 group-hover:scale-110 transition-transform">
                🌟
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-3">Fluência em Fantasia</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Aprenda desde Inglês Britânico até Sindarin e Dothraki. Somos a plataforma mais diversa do universo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <footer className="bg-slate-950 text-white py-20 px-6 text-center">
         <div className="max-w-2xl mx-auto">
           <h2 className="text-3xl font-black mb-6">Pronto para sua nova identidade?</h2>
           <p className="text-slate-400 mb-10 leading-relaxed">
             Junte-se a milhares de poliglotas brasileiros que transformaram suas carreiras e vidas através da nossa plataforma.
           </p>
           <button 
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
             className="px-12 py-5 br-gradient rounded-full font-black text-lg shadow-2xl hover:scale-110 transition-transform active:scale-95"
           >
             Escolher um Idioma
           </button>
           <div className="mt-12 text-slate-600 font-bold text-[10px] uppercase tracking-widest">
             © 2025 Brasil Poliglotas • Todos os direitos reservados
           </div>
         </div>
      </footer>
    </div>
  );
};
