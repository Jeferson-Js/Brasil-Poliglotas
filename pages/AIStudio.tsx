
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { startVideoGeneration, pollVideoStatus } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";

export const AIStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  const handleGenerateVideo = async () => {
    if (!prompt) return;
    
    // Check for API key selection
    // @ts-ignore
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }

    setGenerating(true);
    setMessages(["Iniciando motores da IA...", "Renderizando pronúncia nativa...", "Sincronizando contextos culturais..."]);
    
    try {
      let operation = await startVideoGeneration(prompt, "English");
      
      const interval = setInterval(async () => {
        operation = await pollVideoStatus(operation);
        if (operation.done) {
          clearInterval(interval);
          const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
          // Re-instantiating or using process.env.API_KEY which is injected
          const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
          const blob = await res.blob();
          setVideoUrl(URL.createObjectURL(blob));
          setGenerating(false);
        }
      }, 10000);
    } catch (err) {
      console.error(err);
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-6">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Brasil Poliglotas AI Studio</h1>
          <p className="text-slate-500">Crie seus próprios cenários de imersão com o poder do Veo e Gemini.</p>
        </div>

        <GlassCard className="p-8 mb-8">
          <label className="block text-sm font-bold text-slate-700 uppercase mb-3 tracking-wider">
            Descreva a cena para o seu vídeo educacional
          </label>
          <div className="relative">
            <textarea 
              className="w-full p-5 border border-slate-200 rounded-2xl bg-white/90 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-40 resize-none shadow-inner text-lg leading-relaxed"
              placeholder="Ex: Uma pessoa pedindo um café em Paris com pronúncia pausada e legendas em português..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-400">
              {prompt.length} caracteres
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-3">
            <button 
              onClick={handleGenerateVideo}
              disabled={generating || !prompt}
              className={`flex-1 py-4 br-gradient text-white rounded-xl font-bold shadow-xl shadow-emerald-200/50 transition-all transform ${generating || !prompt ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-[1.02] hover:shadow-emerald-300 active:scale-95'}`}
            >
              {generating ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Gerando Video...</span>
                </span>
              ) : '🎬 Gerar Vídeo de Imersão'}
            </button>
          </div>
        </GlassCard>

        {generating && (
          <GlassCard className="p-10 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 br-gradient rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg shadow-emerald-200">
               <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Sua imersão está sendo criada</h3>
            <p className="text-slate-500 italic text-lg">
              "{messages[Math.floor(Date.now() / 4000) % messages.length]}"
            </p>
            <p className="mt-6 text-xs text-slate-400 uppercase tracking-widest font-bold">Aguarde alguns minutos</p>
          </GlassCard>
        )}

        {videoUrl && (
          <GlassCard className="p-4 overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
            <div className="relative group">
              <video src={videoUrl} controls className="w-full rounded-2xl shadow-2xl border border-white/20" />
            </div>
            <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="font-extrabold text-xl text-slate-900">Seu Cenário Personalizado</h4>
                <p className="text-slate-500">A tecnologia Veo transformou seu texto em realidade.</p>
              </div>
              <div className="flex space-x-3">
                <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                  Compartilhar
                </button>
                <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  Salvar na Biblioteca
                </button>
              </div>
            </div>
          </GlassCard>
        )}
      </main>
    </div>
  );
};
