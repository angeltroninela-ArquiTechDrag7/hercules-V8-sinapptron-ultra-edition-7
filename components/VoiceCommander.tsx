import React, { useEffect, useState, useRef } from 'react';
import { AppScreen, AnalysisResult } from '../types';
import { generateSpeech } from '../services/geminiService';

interface VoiceCommanderProps {
  screen: AppScreen;
  analysis: AnalysisResult | null;
}

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

const VoiceCommander: React.FC<VoiceCommanderProps> = ({ screen, analysis }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  const hasSpokenRef = useRef<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragOffset.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      setPosition({ x: clientX - dragOffset.current.x, y: clientY - dragOffset.current.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
          window.addEventListener('touchmove', handleMouseMove, { passive: false });
          window.addEventListener('touchend', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
          window.removeEventListener('touchmove', handleMouseMove);
          window.removeEventListener('touchend', handleMouseUp);
      };
  }, [isDragging]);

  const getMessageForScreen = (scr: AppScreen, ana: AnalysisResult | null) => {
    switch (scr) {
        case AppScreen.BIO_GATE: return "Identidad requerida. Arquitecto Urbina, se requiere autenticación biométrica inmediata para acceder al núcleo financiero.";
        case AppScreen.DATA_INGESTION: return "Protocolo de Ingestión iniciado. Ingrese las métricas financieras con precisión absoluta. El margen de error es cero. Proceda.";
        case AppScreen.VISUAL_TRUTH:
          if (ana) return ana.netFlow >= 0 ? "Proyección determinista calculada. La trayectoria es óptima. El capital muestra crecimiento estructural. Mantenga el rumbo, Arquitecto." : "Alerta de Integridad Financiera. Detecto una hemorragia de capital crítica en la proyección a seis meses. Se requieren medidas correctivas inmediatas.";
          return "";
        case AppScreen.STRATEGIC_DOSSIER: return "Auditoría Forense finalizada. El Informe Estratégico ha sido generado y sellado criptográficamente. Extraiga los datos para la ejecución del plan quirúrgico.";
        default: return "";
    }
  };

  const stopAudio = () => {
    if (currentSourceRef.current) {
        try { currentSourceRef.current.stop(); } catch (e) {}
        currentSourceRef.current = null;
    }
    setIsSpeaking(false);
    setLoadingAudio(false);
  };

  const playAudio = async (text: string, force: boolean = false) => {
    if (!force && hasSpokenRef.current === text) return;
    stopAudio();
    hasSpokenRef.current = text;
    setLoadingAudio(true);
    try {
        const audioData = await generateSpeech(text);
        if (audioData) {
            if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const ctx = audioContextRef.current;
            const pcm16 = new Int16Array(audioData);
            const audioBuffer = ctx.createBuffer(1, pcm16.length, 24000);
            const channelData = audioBuffer.getChannelData(0);
            for (let i = 0; i < pcm16.length; i++) channelData[i] = pcm16[i] / 32768.0;
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => { setIsSpeaking(false); currentSourceRef.current = null; };
            currentSourceRef.current = source;
            setLoadingAudio(false);
            setIsSpeaking(true);
            source.start(0);
        } else setLoadingAudio(false);
    } catch (e) {
        console.error("Playback error", e);
        setLoadingAudio(false);
        setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Módulo de voz no soportado.");
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.onstart = () => { setIsListening(true); setRecognizedText("ESCUCHANDO..."); };
    recognition.onend = () => { setIsListening(false); setTimeout(() => { if (!isSpeaking) setRecognizedText(null); }, 2000); };
    recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setRecognizedText(`> "${command.toUpperCase()}"`);
        if (command.includes('repetir') || command.includes('informe')) playAudio(getMessageForScreen(screen, analysis), true);
        else if (command.includes('silencio') || command.includes('parar')) stopAudio();
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        const msg = getMessageForScreen(screen, analysis);
        if (msg) playAudio(msg, false);
    }, 800); 
    return () => clearTimeout(timer);
  }, [screen, analysis]);

  return (
    <div 
        className="fixed z-[110] flex flex-col items-center pointer-events-auto cursor-move touch-none"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
    >
      <div className={`mb-4 bg-brand-surface/90 border border-brand-primary/40 backdrop-blur-md px-6 py-4 rounded-sm text-brand-primary text-xs font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all duration-500 transform w-64 text-center pointer-events-none ${(isSpeaking || loadingAudio || recognizedText) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
          {recognizedText ? recognizedText : loadingAudio ? 'PROCESANDO...' : 'COMANDO CENTRAL'}
          {loadingAudio && (<div className="w-full h-0.5 bg-brand-line mt-3 overflow-hidden"><div className="h-full bg-brand-primary animate-progress-indeterminate"></div></div>)}
      </div>

      <div className={`relative w-20 h-20 rounded-full bg-brand-bg border border-brand-line flex items-center justify-center transition-all duration-500 mb-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] ${isSpeaking || loadingAudio ? 'shadow-[0_0_50px_rgba(0,229,255,0.4)] border-brand-primary' : ''} ${isListening ? 'shadow-[0_0_50px_rgba(0,229,255,0.4)] border-brand-primary' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}>
          <div className={`absolute inset-1 rounded-full border border-dashed border-brand-text-dim animate-spin-slow ${isListening ? 'border-brand-primary' : ''}`}></div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-b from-brand-surface to-brand-bg border border-brand-line flex items-center justify-center relative overflow-hidden">
             {(isSpeaking || isListening) && (<div className="absolute inset-0 bg-brand-primary/10 animate-pulse"></div>)}
             <svg className={`w-6 h-6 ${isListening || isSpeaking ? 'text-brand-primary' : 'text-brand-text-dim'} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V4m0 16v-2M8 8l1.414-1.414M14.586 14.586L16 16m-7.172 0l-1.414-1.414M16 8l-1.414-1.414M12 18a6 6 0 100-12 6 6 0 000 12z" />
             </svg>
          </div>
      </div>

      <div className="flex gap-3 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          <button onClick={toggleListening} disabled={loadingAudio || isSpeaking} className={`group relative overflow-hidden rounded-full w-10 h-10 flex items-center justify-center border transition-all duration-300 ${isListening ? 'border-brand-primary bg-brand-primary/20 text-brand-primary animate-pulse' : 'border-brand-line bg-brand-bg text-brand-text hover:border-brand-primary hover:text-brand-primary'}`} title="Activar Comandos de Voz">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          </button>
          <button onClick={() => playAudio(getMessageForScreen(screen, analysis), true)} disabled={loadingAudio || isSpeaking} className={`group relative overflow-hidden rounded-full w-10 h-10 flex items-center justify-center border transition-all duration-300 ${isSpeaking ? 'border-brand-line bg-brand-bg text-brand-text-dim' : 'border-brand-line bg-brand-bg text-brand-primary hover:border-brand-primary'}`} title="Reiterar Informe">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button onClick={stopAudio} disabled={!isSpeaking && !loadingAudio} className={`group relative overflow-hidden rounded-full w-10 h-10 flex items-center justify-center border transition-all duration-300 ${(!isSpeaking && !loadingAudio) ? 'border-brand-line bg-brand-bg text-brand-text-dim' : 'border-danger/50 bg-brand-bg text-danger hover:border-danger'}`} title="Silenciar">
              <div className="w-3 h-3 bg-current rounded-sm"></div>
          </button>
      </div>
      <style>{`.animate-progress-indeterminate { animation: progress-indeterminate 1.5s infinite linear; width: 50%; } @keyframes progress-indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-spin-slow { animation: spin 8s linear infinite; }`}</style>
    </div>
  );
};

export default VoiceCommander;