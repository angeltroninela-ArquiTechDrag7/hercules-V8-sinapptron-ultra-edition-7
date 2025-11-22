

import React, { useState, useCallback } from 'react';
import BioGate from './components/BioGate';
import DataIngestion from './components/DataIngestion';
import VisualTruth from './components/VisualTruth';
import StrategicDossier from './components/StrategicDossier';
import VoiceAssistant from './components/VoiceAssistant';
import NotificationSystem from './components/NotificationSystem';
import VoiceCommander from './components/VoiceCommander';
import TechManifesto from './components/TechManifesto';
import VpnAuditor from './components/VpnAuditor';
import { AppScreen, User, FinancialData, AnalysisResult, SystemNotification } from './types';
import { calculateFinancials } from './utils/mathUtils';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.BIO_GATE);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLiveAssistantOpen, setIsLiveAssistantOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  const addNotification = useCallback((type: 'INFO' | 'WARNING' | 'CRITICAL', title: string, message: string) => {
    const newNote: SystemNotification = {
      id: Date.now().toString() + Math.random(),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [...prev, newNote]);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAuthenticated = (user: User) => {
    setCurrentUser(user);
    setCurrentScreen(AppScreen.DATA_INGESTION);
    addNotification('INFO', 'ACCESO CONCEDIDO', `Bienvenido Arquitecto. Sinapptron Prime en línea.`);
  };

  const handleDataIngested = (data: FinancialData) => {
    setFinancialData(data);
    const result = calculateFinancials(data);
    setAnalysis(result);
    
    // SINAPPTRON SURVEILLANCE LOGIC
    if (result.netFlow < 0) {
      addNotification('WARNING', 'FLUIDO NEGATIVO', 'Detectada hemorragia de capital mensual.');
    }
    if (result.runwayDays < 90) {
      setTimeout(() => {
         addNotification('CRITICAL', 'ZONA DE IMPACTO', `Pista de aterrizaje crítica: ${result.runwayDays} días restantes.`);
      }, 800);
    }

    setCurrentScreen(AppScreen.VISUAL_TRUTH);
  };

  const handleProceedToDossier = () => {
    setCurrentScreen(AppScreen.STRATEGIC_DOSSIER);
    addNotification('INFO', 'GENERANDO HUELLA', 'Calculando Hash SHA-256...');
  };

  const handleReset = () => {
    setFinancialData(null);
    setAnalysis(null);
    setNotifications([]);
    setCurrentScreen(AppScreen.DATA_INGESTION);
  };
  
  const navigateToVpnAuditor = () => {
    setCurrentScreen(AppScreen.VPN_AUDITOR);
  };

  const handleOpenTechSpecs = () => {
    setCurrentScreen(AppScreen.TECH_MANIFESTO);
  };

  // Strict rule: No notifications on Visual Truth screen or Tech Manifesto.
  const showNotifications = currentScreen !== AppScreen.VISUAL_TRUTH && currentScreen !== AppScreen.TECH_MANIFESTO;

  return (
    <div className="min-h-screen text-gold font-sans selection:bg-gold selection:text-black relative overflow-x-hidden">
      
      {currentScreen !== AppScreen.TECH_MANIFESTO && currentScreen !== AppScreen.VPN_AUDITOR && (
        <VoiceCommander screen={currentScreen} analysis={analysis} />
      )}

      {showNotifications && (
        <NotificationSystem 
          notifications={notifications} 
          onDismiss={dismissNotification} 
        />
      )}

      <VoiceAssistant 
        isOpen={isLiveAssistantOpen} 
        onClose={() => setIsLiveAssistantOpen(false)} 
      />

      {currentScreen === AppScreen.BIO_GATE && (
        <BioGate 
            onAuthenticated={handleAuthenticated} 
            onOpenTechSpecs={handleOpenTechSpecs}
        />
      )}

      {currentScreen === AppScreen.TECH_MANIFESTO && (
        <TechManifesto onBack={() => setCurrentScreen(AppScreen.BIO_GATE)} />
      )}

      {currentScreen === AppScreen.DATA_INGESTION && (
        <DataIngestion 
            onComplete={handleDataIngested} 
            onOpenVpnAuditor={navigateToVpnAuditor}
        />
      )}
      
      {currentScreen === AppScreen.VPN_AUDITOR && (
        <VpnAuditor onBack={() => setCurrentScreen(AppScreen.DATA_INGESTION)} />
      )}

      {currentScreen === AppScreen.VISUAL_TRUTH && analysis && (
        <VisualTruth analysis={analysis} onProceed={handleProceedToDossier} />
      )}

      {currentScreen === AppScreen.STRATEGIC_DOSSIER && financialData && analysis && (
        <StrategicDossier 
            data={financialData} 
            analysis={analysis} 
            user={currentUser}
            onOpenLiveAdvisor={() => setIsLiveAssistantOpen(true)}
            onReset={handleReset}
        />
      )}
    </div>
  );
};

export default App;