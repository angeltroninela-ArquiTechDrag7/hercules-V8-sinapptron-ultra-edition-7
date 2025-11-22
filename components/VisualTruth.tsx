
import React, { useEffect, useState, useMemo } from 'react';
import { AnalysisResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '../utils/mathUtils';

interface VisualTruthProps {
  analysis: AnalysisResult;
  onProceed: () => void;
}

const VisualTruth: React.FC<VisualTruthProps> = ({ analysis, onProceed }) => {
  const isPositive = analysis.netFlow >= 0;
  const mainColor = isPositive ? '#00E5FF' : '#FF4444'; // Neon Cyan or Red
  const gradientId = isPositive ? 'cyanGradient' : 'redGradient';
  
  const finalProjectionValue = analysis.projectionPoints[analysis.projectionPoints.length - 1]?.value || 0;

  // SCANNER STATE
  const [scanPercent, setScanPercent] = useState(0);
  const [activeDataPoint, setActiveDataPoint] = useState<{month: string, value: number} | null>(null);

  // Calculate max value for Y-Axis scaling stability
  const maxValue = useMemo(() => Math.max(...analysis.projectionPoints.map(p => p.value)) * 1.2, [analysis]);
  const minValue = useMemo(() => Math.min(...analysis.projectionPoints.map(p => p.value)) * 1.2, [analysis]);

  useEffect(() => {
    let start: number | null = null;
    const duration = 3000; // 3 seconds of precise mechanical scanning

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      const pct = Math.min((progress / duration) * 100, 100);
      
      setScanPercent(pct);

      const totalPoints = analysis.projectionPoints.length;
      const exactIndex = (pct / 100) * (totalPoints - 1);
      const indexFloor = Math.floor(exactIndex);
      
      if (analysis.projectionPoints[indexFloor]) {
          setActiveDataPoint(analysis.projectionPoints[indexFloor]);
      }

      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
          setActiveDataPoint(analysis.projectionPoints[totalPoints - 1]);
      }
    };

    window.requestAnimationFrame(step);
  }, [analysis]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full font-mono p-4 md:p-8 relative animate-fade-in">
      
      <div className="w-full max-w-7xl z-10 flex flex-col h-[85vh]">
        
        <header className="flex justify-between items-end mb-6 border-b border-brand-line pb-4 shrink-0">
            <div>
                <h1 className="text-3xl font-bold text-brand-secondary tracking-tight mb-1">TRAZADO DETERMINISTA</h1>
                <p className="text-brand-text-dim text-xs tracking-[0.3em] uppercase">
                    {scanPercent < 100 ? '/// LEYENDO DATOS CRUDOS...' : '/// PROYECCIÓN MATEMÁTICA FINALIZADA'}
                </p>
            </div>
            <div className={`text-xl font-bold ${isPositive ? 'text-brand-primary' : 'text-danger'} flex items-center gap-4 font-mono`}>
                {scanPercent < 100 && (
                    <div className="text-xs text-brand-text animate-pulse">
                        PROCESANDO {activeDataPoint?.month || 'INIT'}...
                    </div>
                )}
                <div className="flex flex-col items-end">
                    <span className={`text-2xl tracking-tighter ${scanPercent < 100 ? 'opacity-50' : 'opacity-100'}`}>
                        {scanPercent < 100 && activeDataPoint 
                            ? formatCurrency(activeDataPoint.value) 
                            : formatCurrency(finalProjectionValue)}
                    </span>
                </div>
            </div>
        </header>

        <div className="flex-grow w-full bg-brand-bg rounded-none border-l border-b border-brand-line p-0 relative overflow-hidden group">
            
             <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-75"></div>

             <div 
                className="absolute top-0 bottom-0 z-20 pointer-events-none transition-none will-change-transform"
                style={{ 
                    left: `${scanPercent}%`, 
                    opacity: scanPercent >= 100 ? 0 : 1,
                }}
             >
                <div className="absolute top-0 bottom-0 w-[1px]" style={{ backgroundColor: mainColor, boxShadow: `0 0 10px ${mainColor}` }}></div>
                
                <div className="absolute top-1/2 -translate-y-1/2 left-4 bg-brand-bg/80 border border-l-4 p-2 text-[10px] font-mono w-32 shadow-2xl backdrop-blur-md" style={{ borderLeftColor: mainColor }}>
                    <div className="text-brand-text-dim mb-1">SCAN_HEAD_V8</div>
                    <div className="text-brand-secondary font-bold border-b border-brand-line pb-1 mb-1">
                        T: {activeDataPoint?.month}
                    </div>
                    <div style={{ color: mainColor }}>
                        V: {activeDataPoint ? Math.round(activeDataPoint.value).toLocaleString() : '...'}
                    </div>
                </div>

                 <div className="absolute top-1/2 left-[-4px] w-2 h-2 border border-white rounded-full animate-ping"></div>
             </div>

             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analysis.projectionPoints} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF4444" stopOpacity={0}/>
                  </linearGradient>
                  
                  <clipPath id="scan-mask">
                      <rect x="0" y="0" width={`${scanPercent}%`} height="100%" />
                  </clipPath>
                </defs>

                <CartesianGrid strokeDasharray="0" stroke="#1E293B" vertical={false} />
                
                <XAxis 
                    dataKey="month" 
                    stroke="#1E293B" 
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10} 
                />
                
                <YAxis 
                    stroke="#1E293B" 
                    domain={[Math.min(0, minValue), maxValue]} 
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} 
                    tickFormatter={(val) => `${val/1000}k`} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-10} 
                />
                
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" label={{ value: 'PUNTO CERO', fill: '#475569', fontSize: 9, position: 'insideLeft' }} />
                
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={mainColor} 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill={`url(#${gradientId})`}
                  clipPath="url(#scan-mask)"
                  isAnimationActive={false} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
        </div>

        <div className={`mt-6 flex justify-between items-center shrink-0 transition-opacity duration-500 ${scanPercent >= 100 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
             <div className="text-[10px] text-brand-text-dim font-mono">
                <div>MUESTRAS: 7 PUNTOS DE CONTROL</div>
                <div>ALGORITMO: LINEAL SIMPLE</div>
             </div>

             <button
                onClick={onProceed}
                className="group flex items-center gap-4 text-brand-bg bg-brand-primary hover:bg-brand-secondary transition-all px-8 py-4 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
             >
                <span className="text-sm uppercase tracking-[0.2em] font-bold">Abrir Dossier</span>
                <span className="text-lg">→</span>
             </button>
        </div>
      </div>
    </div>
  );
};

export default VisualTruth;