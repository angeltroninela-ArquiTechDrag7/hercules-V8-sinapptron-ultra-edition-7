import React, { useState, useEffect } from 'react';
import { User } from '../types';
import AppLogo from './AppLogo';
import { setRuntimeKey } from '../services/geminiService';

interface BioGateProps {
  onAuthenticated: (user: User) => void;
  onOpenTechSpecs: () => void;
}

const USERS: User[] = [
  { id: '001', name: 'RICHARD FELIPE URBINA', pin: '7788' },
  { id: '002', name: 'EDGAR GABRIEL MORA C.', pin: '2025' },
];

const BioGate: React.FC<BioGateProps> = ({ onAuthenticated, onOpenTechSpecs }) => {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'DENIED' | 'GRANTED'>('IDLE');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [manualKey, setManualKey] = useState('');

  useEffect(() => {
    // Check if key exists in session
    const existingKey = sessionStorage.getItem('SINAPPTRON_RUNTIME_KEY');
    if (existingKey) setManualKey(existingKey);
  }, []);

  const handlePinChange = (val: string) => {
    if (val.length > 4) return;
    const newPin = val;
    setPin(newPin);

    if (newPin.length === 4) {
      const user = USERS.find(u => u.pin === newPin);
      if (user) {
        setStatus('GRANTED');
        setTimeout(() => onAuthenticated(user), 1500);
      } else {
        setStatus('DENIED');
        setTimeout(() => { setPin(''); setStatus('IDLE'); }, 1000);
      }
    }
  };

  const saveApiKey = () => {
      if (manualKey.length > 10) {
          setRuntimeKey(manualKey);
          setShowApiKeyInput(false);
          alert("LLAVE MAESTRA ACEPTADA. NÚCLEO NEURONAL EN LÍNEA.");
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full font-mono relative animate-fade-in overflow-hidden">
      
      {/* API KEY CONFIG (Top Right) */}
      <div className="absolute top-6 right-6 z-50">
          <button 
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="text-[10px] text-brand-text-dim hover:text-brand-primary uppercase tracking-widest flex items-center gap-2 border border-brand-line hover:border-brand-primary px-3 py-2 rounded bg-brand-surface/50 backdrop-blur"
          >
              ⚙️ LLAVE MAESTRA
          </button>
          
          {showApiKeyInput && (
              <div className="absolute top-12 right-0 w-80 bg-brand-surface border border-brand-primary/50 p-4 shadow-2xl rounded z-50 cyber-panel">
                  <div className="text-[10px] text-brand-primary mb-2 uppercase tracking-widest">Pegar Google Gemini API Key</div>
                  <input 
                    type="password" 
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full bg-brand-bg border border-brand-line text-brand-secondary text-xs p-2 mb-3 focus:border-brand-primary outline-none"
                  />
                  <button 
                    onClick={saveApiKey}
                    className="w-full bg-brand-primary text-brand-bg text-xs font-bold py-2 uppercase tracking-widest hover:bg-brand-secondary"
                  >
                      ACTIVAR NÚCLEO
                  </button>
              </div>
          )}
      </div>

      <div className="z-10 flex flex-col items-center space-y-10 w-full max-w-2xl">
        
        {/* Logo & Title Section */}
        <div className="text-center flex flex-col items-center">
            <AppLogo className="w-32 h-32 md:w-40 md:h-40 mb-6 drop-shadow-[0_0_20px_rgba(0,229,255,0.2)]" />
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-brand-secondary drop-shadow-[0_0_15px_rgba(226,232,240,0.3)]">
              BIO-GATE
            </h1>
            <div className="text-xs text-brand-primary tracking-[0.5em] animate-pulse mt-4">
              SINAPPTRON PRIME V8.0
            </div>
        </div>

        {/* Input Section */}
        <div className="relative w-80 group pt-8 flex flex-col items-center">
            <div className="relative w-72 h-20 p-2 border border-brand-line bg-brand-bg/50">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-brand-primary animate-pulse"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-brand-primary animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-brand-primary animate-pulse"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-brand-primary animate-pulse"></div>
                <input 
                    type="password" 
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    className="w-full h-full bg-transparent text-center text-5xl tracking-[1em] focus:outline-none text-brand-secondary placeholder-transparent"
                    placeholder="0000"
                    maxLength={4}
                    autoFocus
                />
            </div>
            <div className="w-full text-center mt-6">
                <span className="text-[10px] text-brand-text-dim uppercase tracking-widest group-focus-within:text-brand-primary transition-colors">
                    Introducir Clave de Arquitecto
                </span>
            </div>
        </div>
        
        {/* Feedback Status */}
        <div className="h-8">
            {status === 'DENIED' && (
                <span className="text-danger font-bold text-sm tracking-widest animate-bounce block">ACCESO DENEGADO</span>
            )}
            {status === 'GRANTED' && (
                <span className="text-brand-primary font-bold text-sm tracking-widest animate-pulse block">IDENTIDAD VERIFICADA</span>
            )}
        </div>
      </div>

      {/* Tech Access Footer */}
      <div className="absolute bottom-8 z-20">
        <button 
            onClick={onOpenTechSpecs}
            className="text-[10px] text-brand-text-dim hover:text-brand-secondary uppercase tracking-[0.2em] transition-colors flex items-center gap-2 border border-transparent hover:border-brand-line/50 px-4 py-2 rounded"
        >
            <span className="w-1 h-1 bg-brand-primary rounded-full animate-pulse"></span>
            Acceso Técnico / Investor Relations
        </button>
      </div>
    </div>
  );
};

export default BioGate;