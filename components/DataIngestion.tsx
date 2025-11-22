
import React, { useState } from 'react';
import { FinancialData } from '../types';
import { extractDataFromImage } from '../services/geminiService';

interface DataIngestionProps {
  onComplete: (data: FinancialData) => void;
  onOpenVpnAuditor: () => void;
}

const DataIngestion: React.FC<DataIngestionProps> = ({ onComplete, onOpenVpnAuditor }) => {
  const [data, setData] = useState<FinancialData>({
    income: 0,
    expenses: 0,
    debt: 0,
    cash: 0
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof FinancialData, value: string) => {
    const num = parseFloat(value) || 0;
    setData(prev => ({ ...prev, [field]: num }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const extracted = await extractDataFromImage(file);
    setData(prev => ({ ...prev, ...extracted }));
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full font-mono p-8 animate-fade-in">
      
      <div className="w-full max-w-3xl relative">
        {/* Header */}
        <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-brand-secondary mb-2 tracking-tight">LA MISIÓN DE LOS NÚMEROS</h2>
            <p className="text-brand-text-dim text-sm tracking-widest uppercase">Alimentar Núcleo de Procesamiento</p>
        </div>

        {/* Cyber Panel */}
        <div className="cyber-panel rounded-lg p-12 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"></div>

             {/* AI Button */}
            <div className="absolute top-6 right-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                 <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
                 <span className="text-[10px] text-brand-text group-hover:text-brand-primary transition-colors uppercase">Subir Documento (IA)</span>
                 <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            
            {loading && <div className="absolute inset-0 bg-brand-bg/90 z-20 flex items-center justify-center text-brand-primary animate-pulse text-sm">ANALIZANDO...</div>}

            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {['income', 'expenses', 'debt', 'cash'].map((field) => (
                        <div key={field} className="group relative">
                            <input
                                type="number"
                                value={data[field as keyof FinancialData] || ''}
                                onChange={(e) => handleInputChange(field as keyof FinancialData, e.target.value)}
                                className="block w-full bg-transparent border-b border-brand-line py-2 text-2xl text-brand-secondary focus:border-brand-primary focus:outline-none transition-colors text-right"
                                placeholder="0"
                            />
                            <label className="absolute left-0 top-3 text-xs text-brand-text-dim uppercase tracking-widest group-focus-within:text-brand-primary transition-all duration-300 group-focus-within:-translate-y-6 pointer-events-none">
                                {field === 'income' ? 'Ingresos' : field === 'expenses' ? 'Gastos' : field === 'debt' ? 'Deuda Total' : 'Caja Actual'}
                            </label>
                        </div>
                    ))}
                </div>

                <div className="text-center pt-4 flex flex-col items-center gap-4">
                    <button
                        type="submit"
                        className="bg-brand-primary/10 text-brand-primary border border-brand-primary/50 px-12 py-4 rounded-full hover:bg-brand-primary hover:text-brand-bg transition-all duration-300 uppercase text-sm font-bold tracking-[0.2em] shadow-[0_0_25px_rgba(0,229,255,0.1)] w-full md:w-auto"
                    >
                        Ejecutar Cálculo de Flujo
                    </button>
                    <button
                        type="button"
                        onClick={onOpenVpnAuditor}
                        className="text-brand-text-dim text-[10px] uppercase tracking-widest hover:text-brand-primary transition-colors"
                    >
                       Acceder a Módulo de Auditoría VPN →
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default DataIngestion;