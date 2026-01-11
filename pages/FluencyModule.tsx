
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { SUPPORTED_LANGUAGES } from '../constants';

const SCENARIOS = [
  { id: 'coffee', title: 'Pedindo um Café', description: 'Pratique interações em uma cafeteria local.', icon: '☕' },
  { id: 'interview', title: 'Entrevista de Emprego', description: 'Simulação de entrevista profissional.', icon: '💼' },
  { id: 'airport', title: 'No Aeroporto', description: 'Resolva problemas com sua bagagem ou check-in.', icon: '✈️' },
  { id: 'lost', title: 'Perdido na Cidade', description: 'Peça direções e use referências locais.', icon: '🗺️' },
];

export const FluencyModule: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const langId = searchParams.get('lang') || 'en';
  const language = SUPPORTED_LANGUAGES.find(l => l.id === langId);

  const [activeScenario, setActiveScenario] = useState<typeof SCENARIOS[0] | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [transcription, setTranscription] = useState<{ sender: 'user' | 'ai', text: string }[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Audio helpers
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  const startSession = async () => {
    if (!activeScenario || !language) return;

    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    // Initialize Audio
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextsRef.current = { input: inputCtx, output: outputCtx };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: `Você é um falante nativo de ${language.name}. 
        Cenário: ${activeScenario.title}. 
        Descrição: ${activeScenario.description}. 
        Instrução: Ajude o usuário a praticar fluência. Seja paciente, mas encoraje respostas completas. 
        Mantenha-se no personagem. Se o usuário falar em português, ajude-o gentilmente a retornar para o ${language.name}.`,
      },
      callbacks: {
        onopen: () => {
          setStatus('connected');
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            if (isMuted) return;
            const inputData = e.inputBuffer.getChannelData(0);
            sessionPromise.then(session => session.sendRealtimeInput({ media: createBlob(inputData) }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          // Handle Audio
          const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            const ctx = audioContextsRef.current!.output;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }

          // Handle Transcriptions
          if (msg.serverContent?.inputTranscription) {
            const text = msg.serverContent.inputTranscription.text;
            setTranscription(prev => [...prev, { sender: 'user', text }]);
          }
          if (msg.serverContent?.outputTranscription) {
            const text = msg.serverContent.outputTranscription.text;
            setTranscription(prev => [...prev, { sender: 'ai', text }]);
          }

          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setStatus('idle'),
        onerror: (e) => console.error('Live API Error:', e),
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextsRef.current) {
      audioContextsRef.current.input.close();
      audioContextsRef.current.output.close();
    }
    setStatus('idle');
    setTranscription([]);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Scenarios Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 px-2">Escolha um Cenário</h2>
          {SCENARIOS.map(s => (
            <GlassCard 
              key={s.id}
              className={`p-4 cursor-pointer border-2 transition-all ${
                activeScenario?.id === s.id ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-md' : 'border-transparent hover:bg-white'
              } ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => setActiveScenario(s)}
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{s.icon}</div>
                <div>
                  <h4 className="font-bold text-slate-900">{s.title}</h4>
                  <p className="text-xs text-slate-500">{s.description}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Interaction Area */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <GlassCard className="flex-1 p-6 flex flex-col overflow-hidden relative min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  {status === 'idle' ? 'Aguardando Início' : status === 'connecting' ? 'Conectando...' : 'Conversando ao vivo'}
                </span>
              </div>
              <div className="text-sm font-medium text-slate-400">Fluency Mode: {language?.name}</div>
            </div>

            {/* Chat Transcript */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6 scroll-smooth">
              {transcription.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-10">
                  <div className="text-6xl mb-4 opacity-20">🎙️</div>
                  <h3 className="text-lg font-bold text-slate-800">Pronto para começar?</h3>
                  <p className="text-sm text-slate-500 max-w-xs">Selecione um cenário e clique no botão abaixo para iniciar sua prática de conversação real.</p>
                </div>
              )}
              {transcription.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-6">
              {status === 'idle' ? (
                <button 
                  onClick={startSession}
                  disabled={!activeScenario}
                  className="px-10 py-4 br-gradient text-white rounded-full font-bold text-lg shadow-xl shadow-emerald-200 hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  🚀 Iniciar Conversação
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all ${
                      isMuted ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isMuted ? '🔇' : '🎤'}
                  </button>
                  <button 
                    onClick={stopSession}
                    className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all"
                  >
                    ⏹️ Encerrar Sessão
                  </button>
                </div>
              )}
            </div>
          </GlassCard>

          <div className="flex items-center justify-between px-2">
            <div className="text-xs text-slate-400 italic">Dica: Fale naturalmente. A IA está ouvindo sua entonação e ritmo.</div>
            <div className="flex space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
