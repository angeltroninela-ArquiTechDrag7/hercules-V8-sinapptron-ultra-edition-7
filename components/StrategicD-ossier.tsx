

import React, { useEffect, useState, useRef } from 'react';
import { FinancialData, AnalysisResult, DiagnosisReport, User } from '../types';
import { analyzeFinancialHealth } from '../services/geminiService';
import { formatCurrency } from '../utils/mathUtils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import * as ReactToPrintPkg from 'react-to-print';

interface StrategicDossierProps {
  data: FinancialData;
  analysis: AnalysisResult;
  user: User | null;
  onOpenLiveAdvisor: () => void;
  onReset: () => void;
}

const LOADING_PHASES = [
  "INICIANDO MOTOR FORENSE...",
  "DISECCIONANDO TEJIDO FINANCIERO...",
  "DETECTANDO PATOLOGÍAS DE FLUJO...",
  "SIMULANDO VECTORES DE QUIEBRA...",
  "REDACTANDO AUTOPSIA CLÍNICA...",
  "ENCRIPTANDO HASH SHA-256..."
];

const StrategicDossier: React.FC<StrategicDossierProps> = ({ data, analysis, user, onReset }) => {
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [loadingPhaseIndex, setLoadingPhaseIndex] = useState(0);
  const [quantumHash, setQuantumHash] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'VISUAL' | 'TEXT'>('VISUAL');
  
  // Print Reference
  const contentRef = useRef<HTMLDivElement>(null);

  // Robustly resolve the hook from the namespace object
  // Handles cases where it's a named export or attached to default
  const pkg = ReactToPrintPkg as any;
  const usePrintHook = pkg.useReactToPrint || pkg.default?.useReactToPrint;

  const handlePrint = usePrintHook ? usePrintHook({
    content: () => contentRef.current,
    documentTitle: `SINAPPTRON_DOSSIER_${quantumHash.substring(0, 8)}`,
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 10mm;
      }
      @media print {
        body {
          background-color: #000000 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-hide {
          display: none !important;
        }
        .print-container {
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
        }
      }
    `
  }) : () => { 
    console.error("Print hook not found in module exports:", pkg); 
    alert("Error: El módulo de impresión no se cargó correctamente.");
  };

  useEffect(() => {
    const generateHash = async () => {
        const timestamp = new Date().toISOString();
        const rawString = `SINAPPTRON|${data.income}|${data.expenses}|${data.debt}|${data.cash}|${timestamp}`;
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(rawString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setQuantumHash(hashHex);
    };
    generateHash();
  }, [data]);

  useEffect(() => {
    let isMounted = true;
    
    // Cycle through loading phases while waiting
    const phaseInterval = setInterval(() => {
      setLoadingPhaseIndex(prev => (prev + 1) % LOADING_PHASES.length);
    }, 1200);

    const generate = async () => {
      try {
        const result = await analyzeFinancialHealth(data, analysis);
        if (isMounted) {
          setReport(result);
        }
      } catch (error) {
        console.error("Error in analysis generation", error);
      } finally {
        clearInterval(phaseInterval);
      }
    };
    
    generate();

    return () => {
      isMounted = false;
      clearInterval(phaseInterval);
    };
  }, [data, analysis]);

  const isCritical = analysis.status === 'CRITICAL';
  const statusColor = isCritical ? '#FF4444' : '#D4AF37'; 
  const statusLabel = isCritical ? 'CRÍTICO' : 'ÓPTIMO';

  // Heatmap Logic
  const getIntensityColor = (val: number, type: 'flow' | 'runway' | 'solvency') => {
      if (type === 'flow') return val >= 0 ? 'bg-green-900/20 text-green-400 border-green-500/50' : 'bg-red-900/20 text-red-500 border-red-500/50';
      if (type === 'runway') return val > 90 ? 'bg-blue-900/20 text-blue-400 border-blue-500/50' : val > 30 ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/50' : 'bg-red-900/20 text-red-500 border-red-500/50';
      if (type === 'solvency') return val > 50 ? 'bg-green-900/20 text-green-400 border-green-500/50' : 'bg-orange-900/20 text-orange-400 border-orange-500/50';
      return 'bg-gray-800';
  };

  // Plain Text Generation - Strict Format
  const generatePlainText = () => {
      const diagnosisText = report?.diagnosis || "ANALIZANDO...";
      const scenarioInertia = report?.scenarios.inertia || "PENDIENTE";
      const scenarioCut = report?.scenarios.cut || "PENDIENTE";
      const scenarioExp = report?.scenarios.expansion || "PENDIENTE";

      return `
🏛️ REPORTE DE AUDITORÍA SINAPPTRON
ESTADO: [ ${isCritical ? '🔴 CRÍTICO' : '🟢 ÓPTIMO'} ]
ARQUITECTO: ${user?.name || 'DESCONOCIDO'}

1. 📉 EVIDENCIA GRÁFICA
(Consultar anexo visual en terminal Hércules)

2. 🩻 LA AUTOPSIA (Análisis Causal)
"${diagnosisText}"

3. 📊 LA VERDAD DE LOS DATOS

Métrica         Valor           Estado
------------------------------------------------
Flujo Neto      ${formatCurrency(analysis.netFlow).padEnd(15)} [${analysis.netFlow >= 0 ? 'Positivo' : 'Negativo'}]
Solvencia       ${(analysis.solvencyRatio.toFixed(2) + '%').padEnd(15)} [${analysis.solvencyRatio > 50 ? 'Seguro' : 'Riesgo'}]
Días Rest       ${(analysis.runwayDays > 1000 ? '9999+' : analysis.runwayDays.toString()).padEnd(15)} [${analysis.runwayDays > 90 ? 'Sin Urgencia' : 'Nivel de Urgencia Alto'}]

ESCENARIOS PROYECTADOS (SIN SIMULACIÓN):
> INERCIA: ${scenarioInertia}
> CORTE: ${scenarioCut}
> EXPANSIÓN: ${scenarioExp}

4. 🔪 PLAN QUIRÚRGICO (Acción Inmediata)
CORTAR: ${formatCurrency(analysis.cutNeeded)} (Para equilibrio)
INYECTAR: ${formatCurrency(analysis.injectionNeeded)} (Para 6 meses de vida)

🔐 SELLO DE INTEGRIDAD CUÁNTICA:
${quantumHash}
Verificado por Sinapptron Prime | Lógica Ejecutada vía Python
`.trim();
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(generatePlainText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const PythonProofCode = `
# Prueba de Origen: Algoritmo Original Python
net_flow = income - expenses

if net_flow < 0:
    monthly_burn = abs(net_flow)
    days_to_zero = int((cash / monthly_burn) * 30)
    cut_needed = monthly_burn
    injection_needed = (monthly_burn * 6) - cash
    injection_needed = max(0, injection_needed)
    status_label = "CRÍTICO"
else:
    days_to_zero = 9999 # Infinito
    status_label = "SOLVENTE"

solvency_ratio = round((cash / debt) * 100, 2)
  `.trim();

  return (
    <div className="flex flex-col items-center w-full min-h-screen font-mono p-2 md:p-8 pb-32 animate-fade-in bg-[#050505] text-white">
      
      <div ref={contentRef} className="print-container w-full max-w-6xl border border-gray-900 bg-[#0A0A0A] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative p-6 md:p-12">
        
        {/* CONTROL BAR (Hidden during Print) */}
        <div className="absolute top-0 right-0 flex border-b border-l border-gray-800 print-hide z-20">
            <button 
                onClick={() => setViewMode('VISUAL')}
                className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === 'VISUAL' ? 'bg-gold text-black' : 'bg-transparent text-gray-500 hover:text-white'}`}
            >
                Dossier Visual
            </button>
            <button 
                onClick={() => setViewMode('TEXT')}
                className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${viewMode === 'TEXT' ? 'bg-gold text-black' : 'bg-transparent text-gray-500 hover:text-white'}`}
            >
                Modo Portapapeles
            </button>
            <button 
                onClick={handlePrint}
                className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors bg-neon/10 text-neon hover:bg-neon hover:text-black border-l border-gray-800"
            >
                EXPORTAR PDF
            </button>
        </div>

        {/* HEADER */}
        <div className="border-b border-gray-800 pb-8 mb-8 mt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 font-sans">
                    REPORTE DE AUDITORÍA <span className="text-gold">SINAPPTRON</span>
                </h1>
                <div className="flex items-center gap-4 text-xs text-gray-500 tracking-widest uppercase font-mono">
                    <span>Expediente: {quantumHash.substring(0, 8).toUpperCase()}</span>
                    <span className="text-gray-700">|</span>
                    <span>Nivel de Seguridad: ROJO</span>
                </div>
            </div>
            <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase mb-1 tracking-widest">Estado General</div>
                <div className="text-2xl tracking-widest font-bold flex items-center justify-end gap-3" style={{ color: statusColor, textShadow: `0 0 15px ${statusColor}40` }}>
                    <span className={`block w-3 h-3 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                    {statusLabel}
                </div>
            </div>
        </div>

        {viewMode === 'VISUAL' ? (
            <div className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* LEFT COLUMN: VISUALS & PROOF */}
                    <div className="space-y-10">
                        {/* 1. EVIDENCIA GRÁFICA */}
                        <section>
                            <h2 className="text-xs font-bold text-gold mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1 h-1 bg-gold"></span> 1. Evidencia Gráfica
                            </h2>
                            <div className="h-64 w-full bg-black/50 border border-gray-800 relative shadow-inner backdrop-blur-sm">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analysis.projectionPoints} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                        <defs>
                                            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={statusColor} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={statusColor} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                        <XAxis dataKey="month" stroke="#444" tick={{fill: '#666', fontSize: 10}} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#444" tick={{fill: '#666', fontSize: 10}} tickFormatter={(v) => `${v/1000}k`} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0a0a0a', border: `1px solid ${statusColor}`, color: '#fff' }}
                                            formatter={(val: number) => formatCurrency(val)}
                                            labelStyle={{color: '#888', textTransform: 'uppercase', fontSize: '10px'}}
                                            itemStyle={{color: statusColor, fontWeight: 'bold'}}
                                        />
                                        <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                                        <Area 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke={statusColor} 
                                            fill="url(#chartFill)"
                                            strokeWidth={2} 
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* PROTOCOLO DE CÁLCULO Y PRUEBA FORENSE */}
                        <section>
                            <h2 className="text-xs font-bold text-gold mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-1 h-1 bg-gold"></span> Prueba Matemática (Cero Simulación)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 border border-gray-800 p-6">
                                {/* COLUMNA: ECUACIONES */}
                                <div className="font-mono text-xs text-gray-400">
                                    <h3 className="text-sm text-gold mb-4 uppercase tracking-widest">Ecuaciones</h3>
                                    <div className="space-y-3">
                                        <p><strong className="text-gray-200">Flujo Neto:</strong><br />Ingresos - Gastos</p>
                                        <p><strong className="text-gray-200">Runway (Días):</strong><br />⌊(Caja / |Flujo|) * 30⌋</p>
                                        <p><strong className="text-gray-200">Solvencia:</strong><br />(Caja / Deuda) * 100</p>
                                    </div>
                                </div>
                                {/* COLUMNA: PRUEBA PYTHON */}
                                <div>
                                     <h3 className="text-sm text-gold mb-4 uppercase tracking-widest">Algoritmo</h3>
                                     <pre className="bg-void p-3 border border-gray-700 text-[9px] text-neon/80 overflow-x-auto"><code>
                                        {PythonProofCode}
                                     </code></pre>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: TEXT & DATA */}
                    <div className="space-y-10">
                        {/* 2. LA AUTOPSIA */}
                        <section>
                            <h2 className="text-xs font-bold text-gold mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                 <span className="w-1 h-1 bg-gold"></span> 2. La Autopsia (Análisis IA)
                            </h2>
                            <div className="bg-void border border-gray-800 p-8 text-sm text-gray-300 leading-relaxed relative overflow-hidden min-h-[200px]">
                                {/* Decorator */}
                                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/30"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/30"></div>

                                {!report ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
                                        <div className="flex items-center gap-3 text-gold mb-4">
                                            <span className="w-2 h-2 bg-gold rounded-full animate-ping"></span>
                                            <span className="text-xs font-bold tracking-[0.2em] animate-pulse">
                                                {LOADING_PHASES[loadingPhaseIndex]}
                                            </span>
                                        </div>
                                        <div className="w-48 h-0.5 bg-gray-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-gold animate-electric w-1/2 mx-auto"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="mb-6 text-white font-sans text-lg italic border-l-2 border-gray-700 pl-6 py-2 animate-fade-in">
                                            "{report.diagnosis}"
                                        </p>
                                        <div className="space-y-4 text-xs font-mono mt-6 pt-6 border-t border-gray-800/50 animate-fade-in">
                                            <div className="grid grid-cols-[100px_1fr] gap-4">
                                                <span className="text-gray-500 font-bold text-right">INERCIA:</span> 
                                                <span className="text-gray-300">{report.scenarios.inertia}</span>
                                            </div>
                                            <div className="grid grid-cols-[100px_1fr] gap-4">
                                                <span className="text-red-500 font-bold text-right">CIRUGÍA:</span> 
                                                <span className="text-gray-300">{report.scenarios.cut}</span>
                                            </div>
                                            <div className="grid grid-cols-[100px_1fr] gap-4">
                                                <span className="text-gold font-bold text-right">EXPANSIÓN:</span> 
                                                <span className="text-gray-300">{report.scenarios.expansion}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* 3. DATA TABLE */}
                        <section>
                            <h2 className="text-xs font-bold text-gold mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                 <span className="w-1 h-1 bg-gold"></span> 3. La Verdad de los Datos
                            </h2>
                            <table className="w-full text-left text-xs font-mono border border-gray-800">
                                <tbody>
                                    <tr className="border-b border-gray-800 bg-white/5">
                                        <td className="p-4 text-gray-400 uppercase tracking-widest">Flujo Neto</td>
                                        <td className={`p-4 text-right font-bold text-lg ${analysis.netFlow >= 0 ? 'text-green-400' : 'text-red-500'}`}>{formatCurrency(analysis.netFlow)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-800">
                                        <td className="p-4 text-gray-400 uppercase tracking-widest">Deuda Total</td>
                                        <td className="p-4 text-right text-white font-bold text-lg">{formatCurrency(data.debt)}</td>
                                    </tr>
                                    <tr className="bg-red-900/10 border-b border-red-900/20">
                                        <td className="p-4 text-red-400 uppercase tracking-widest font-bold">Corte Requerido</td>
                                        <td className="p-4 text-right text-red-400 font-bold text-lg">{formatCurrency(analysis.cutNeeded)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>
                         {/* RISK HEATMAP */}
                        <section>
                            <h2 className="text-xs font-bold text-gold mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                 <span className="w-1 h-1 bg-gold"></span> Mapa de Calor de Riesgo
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className={`p-6 border ${getIntensityColor(analysis.netFlow, 'flow')} flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] bg-opacity-5`}>
                                    <span className="text-[9px] uppercase tracking-widest opacity-70 font-bold mb-2">Liquidez</span>
                                    <span className="text-xl font-bold">{analysis.netFlow >= 0 ? 'POS' : 'NEG'}</span>
                                </div>
                                <div className={`p-6 border ${getIntensityColor(analysis.solvencyRatio, 'solvency')} flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] bg-opacity-5`}>
                                    <span className="text-[9px] uppercase tracking-widest opacity-70 font-bold mb-2">Solvencia</span>
                                    <span className="text-xl font-bold">{Math.round(analysis.solvencyRatio)}%</span>
                                </div>
                                <div className={`p-6 border ${getIntensityColor(analysis.runwayDays, 'runway')} flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] bg-opacity-5`}>
                                    <span className="text-[9px] uppercase tracking-widest opacity-70 font-bold mb-2">Runway</span>
                                    <span className="text-xl font-bold">{analysis.runwayDays > 999 ? '∞' : analysis.runwayDays}d</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* 4. PLAN QUIRÚRGICO (Visible in Visual Mode) */}
                <div className="mt-12 pt-10 border-t border-gray-800">
                    <h2 className="text-xs font-bold text-gold mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                         <span className="w-1 h-1 bg-gold"></span> 4. Plan Quirúrgico
                    </h2>
                    <div className="flex flex-col md:flex-row gap-8 font-mono">
                        {/* CUT CARD */}
                        <div className="flex-1 bg-[#0f0505] border border-red-900/30 p-8 flex items-center justify-between hover:border-red-500/50 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
                            <div className="flex flex-col relative z-10">
                                 <span className="text-red-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">Acción 1: CORTAR</span>
                                 <span className="text-gray-500 text-[10px] uppercase">Objetivo: Punto de Equilibrio</span>
                            </div>
                            <span className="text-white text-3xl font-bold tracking-tighter relative z-10 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                                {formatCurrency(analysis.cutNeeded)}
                            </span>
                        </div>

                        {/* INJECT CARD */}
                        <div className="flex-1 bg-[#050f05] border border-green-900/30 p-8 flex items-center justify-between hover:border-green-500/50 transition-all group relative overflow-hidden">
                             <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors"></div>
                            <div className="flex flex-col relative z-10">
                                 <span className="text-green-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">Acción 2: INYECTAR</span>
                                 <span className="text-gray-500 text-[10px] uppercase">Objetivo: Runway 6 Meses</span>
                            </div>
                            <span className="text-white text-3xl font-bold tracking-tighter relative z-10 drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
                                {formatCurrency(analysis.injectionNeeded)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* FOOTER METADATA */}
                <div className="mt-12 flex justify-between items-end border-t border-gray-900 pt-4 text-[10px] text-gray-600 font-mono">
                    <div className="flex flex-col gap-1">
                        <span>ID_SESION: {quantumHash.substring(0, 16)}</span>
                        <span>ALGORITMO: SHA-256 + GEMINI PRO VISION</span>
                    </div>
                    <div className="text-right print-hide">
                         <span className="text-gold/50">SINAPPTRON PRIME V8.0 // AUDITORÍA FINALIZADA</span>
                         <button onClick={onReset} className="block ml-auto mt-2 text-gray-500 hover:text-white underline decoration-gray-700">
                            NUEVA AUDITORÍA
                         </button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="animate-fade-in w-full flex flex-col h-full">
                {/* TEXT MODE DISPLAY */}
                <div className="flex justify-between items-center mb-4 print-hide">
                     <h2 className="text-xs font-bold text-gold uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1 h-1 bg-gold"></span> Vista de Texto Plano (Raw)
                    </h2>
                    <button 
                        onClick={handleCopy}
                        className={`
                            px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border shadow-[0_0_20px_rgba(0,0,0,0.5)]
                            ${copied ? 'bg-green-600 text-white border-green-500' : 'bg-gold text-black border-gold hover:bg-white hover:text-black'}
                        `}
                    >
                        {copied ? 'COPIADO' : 'COPIAR TODO'}
                    </button>
                </div>
                
                <div className="relative group flex-grow">
                    <textarea 
                        readOnly 
                        value={!report ? "GENERANDO DATOS DEL MOTOR..." : generatePlainText()}
                        className="w-full h-[600px] bg-black border border-gray-800 p-8 font-mono text-xs md:text-sm text-gray-300 focus:outline-none focus:border-gold resize-none shadow-inner leading-relaxed selection:bg-gold selection:text-black"
                        style={{ fontFamily: '"Courier New", Courier, monospace' }}
                    />
                    {/* Scanline overlay for text mode */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none"></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default StrategicDossier;
