import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isOpen, onClose }) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(false);

  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const stopSession = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setConnected(false);
  }, []);

  const startSession = async () => {
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = inputAudioContext;
      
      const inputNode = inputAudioContext.createMediaStreamSource(stream);
      const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                setConnected(true);
                scriptProcessor.onaudioprocess = (e) => {
                    if (isMuted) return;
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                inputNode.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio && outputAudioContextRef.current) {
                    const ctx = outputAudioContextRef.current;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(ctx.destination);
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                }
            },
            onclose: () => setConnected(false),
            onerror: (e) => {
                console.error("Live Session Error", e);
                setError("Connection Error");
                setConnected(false);
            }
        },
        config: {
            generationConfig: { temperature: 0.0 }, // DETERMINISTIC ENFORCEMENT
            responseModalities: [Modality.AUDIO],
            systemInstruction: "Eres SINAPPTRON PRIME, un asistente financiero de IA. Habla de forma concisa, profesional, dura y utiliza terminología financiera. Estás hablando con el Director Financiero (CFO). IDIOMA: ESPAÑOL. No inventes datos.",
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
            }
        }
      });
      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error("Failed to start live session", err);
      setError("Acceso al micrófono denegado o fallo de API.");
    }
  };

  useEffect(() => {
    if (isOpen) {
        startSession();
    } else {
        stopSession();
    }
    return () => stopSession();
  }, [isOpen, stopSession]);

  // Helpers
  function createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  }
  function encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  function decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }
  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
     const dataInt16 = new Int16Array(data.buffer);
     const frameCount = dataInt16.length / numChannels;
     const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
     for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
     }
     return buffer;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/90 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-md bg-brand-surface border border-brand-primary/30 p-8 rounded-lg shadow-[0_0_50px_rgba(0,229,255,0.15)] text-center relative cyber-panel">
            <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-dim hover:text-brand-secondary">X</button>
            
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-brand-primary mb-2">ENLACE DE VOZ HÉRCULES</h2>
                <div className="text-xs text-brand-text uppercase tracking-widest">Canal de Asesoramiento en Tiempo Real</div>
            </div>

            <div className="flex justify-center items-center h-32 mb-8">
                 {connected ? (
                     <div className="relative w-24 h-24 flex items-center justify-center">
                         <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-ping"></div>
                         <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center text-brand-bg font-bold text-2xl">AI</div>
                     </div>
                 ) : (
                     <div className="text-danger animate-pulse">CONECTANDO...</div>
                 )}
            </div>

            {error && <div className="text-danger text-sm mb-4">{error}</div>}

            <div className="flex justify-center gap-4">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`px-6 py-3 border ${isMuted ? 'border-danger text-danger' : 'border-brand-line text-brand-text'} hover:bg-brand-line/50 uppercase text-xs`}
                >
                    {isMuted ? 'ACTIVAR MIC' : 'SILENCIAR MIC'}
                </button>
                <button 
                    onClick={onClose}
                    className="px-6 py-3 bg-brand-primary text-brand-bg font-bold uppercase text-xs hover:bg-brand-secondary"
                >
                    TERMINAR SESIÓN
                </button>
            </div>
        </div>
    </div>
  );
};

export default VoiceAssistant;