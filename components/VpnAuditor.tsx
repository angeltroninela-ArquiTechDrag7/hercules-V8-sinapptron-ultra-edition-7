
import React, { useState } from 'react';

interface VpnAuditorProps {
    onBack: () => void;
}

interface VpnInputs {
    investment: number;
    cashFlow: number;
    rate: number;
    periods: number;
}

interface VpnResult {
    npv: number;
    calculationSteps: string[];
    totalPresentValue: number;
}

const VpnAuditor: React.FC<VpnAuditorProps> = ({ onBack }) => {
    const [inputs, setInputs] = useState<VpnInputs>({
        investment: 100000,
        cashFlow: 30000,
        rate: 0.10,
        periods: 5
    });
    const [result, setResult] = useState<VpnResult | null>(null);

    const handleInputChange = (field: keyof VpnInputs, value: string) => {
        const numValue = parseFloat(value);
        if (field === 'rate') {
             setInputs(prev => ({ ...prev, [field]: numValue / 100 }));
        } else {
             setInputs(prev => ({ ...prev, [field]: numValue }));
        }
    };

    const calculateNpv = () => {
        let presentValueOfFlows = 0;
        const calculationSteps: string[] = [];
        for (let t = 1; t <= inputs.periods; t++) {
            const presentValue = inputs.cashFlow / Math.pow(1 + inputs.rate, t);
            presentValueOfFlows += presentValue;
            calculationSteps.push(`Año ${t}: $${presentValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        }
        const finalNpv = presentValueOfFlows - inputs.investment;
        setResult({
            npv: finalNpv,
            calculationSteps,
            totalPresentValue: presentValueOfFlows,
        });
    };

    const isProfitable = result ? result.npv > 0 : false;
    const resultColor = isProfitable ? '#00FF00' : '#FF4444';

    return (
        <div className="min-h-screen w-full font-mono p-4 md:p-8 animate-fade-in bg-black text-gray-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gold/30 pb-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Módulo de Auditoría VPN</h1>
                        <p className="text-xs text-gold uppercase tracking-widest">Valor Presente Neto (Cero Simulación)</p>
                    </div>
                    <button onClick={onBack} className="text-xs font-bold uppercase tracking-widest hover:text-gold transition-colors">← Volver a Ingesta</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Input Column */}
                    <div className="lg:col-span-1 bg-[#050505] border border-gray-800 p-8 shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gold/20"></div>
                        <h2 className="text-lg text-gold font-bold mb-6 border-b border-gold/20 pb-3">1. Variables de Inversión</h2>
                        <div className="space-y-6">
                            {Object.keys(inputs).map(key => (
                                <div key={key} className="group">
                                    <label className="text-xs text-gray-500 uppercase tracking-widest">{
                                        {investment: 'Inversión Inicial (I₀)', cashFlow: 'Flujo Anual (CF)', rate: 'Tasa de Descuento (r) %', periods: 'Periodos (n)'}[key]
                                    }</label>
                                    <input
                                        type="number"
                                        step={key === 'rate' ? '0.1' : '1000'}
                                        value={key === 'rate' ? inputs[key as keyof VpnInputs] * 100 : inputs[key as keyof VpnInputs]}
                                        onChange={e => handleInputChange(key as keyof VpnInputs, e.target.value)}
                                        className="w-full bg-transparent border-b border-gray-700 focus:border-gold focus:outline-none text-white text-xl p-2 mt-1 text-right font-mono"
                                    />
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={calculateNpv}
                            className="w-full mt-10 bg-gold/10 border border-gold text-gold font-bold uppercase tracking-widest py-3 hover:bg-gold hover:text-black transition-all"
                        >
                            Ejecutar Auditoría
                        </button>
                    </div>

                    {/* Result Column - THE MATPLOTLIB STYLE VISUAL */}
                    <div className="lg:col-span-2 bg-black border border-gray-800 p-0 relative flex flex-col min-h-[500px]">
                        {!result ? (
                             <div className="flex items-center justify-center h-full text-gray-600 text-center p-8">
                                 <p className="text-xs tracking-widest">ESPERANDO DATOS PARA EJECUTAR EL PROTOCOLO DE CÁLCULO FORENSE...</p>
                             </div>
                        ) : (
                            <div className="animate-fade-in relative w-full h-full p-8 flex flex-col items-center justify-center bg-black select-none">
                                {/* Mimicking Matplotlib Output */}
                                
                                {/* A. TÍTULO */}
                                <div className="absolute top-8 text-center">
                                    <h2 className="text-[#FFD700] font-bold text-lg tracking-wide">AUDITORÍA FINANCIERA: EVIDENCIA MATEMÁTICA</h2>
                                </div>

                                {/* B. LA FÓRMULA MADRE */}
                                <div className="absolute top-24 text-center">
                                    <div className="text-white text-2xl font-serif italic tracking-wider">
                                        VPN = ∑ <span className="text-sm">CF<sub className="text-gray-400">t</sub> / (1 + r)<sup className="text-gray-400">t</sup></span> - I<sub className="text-gray-400">0</sub>
                                    </div>
                                </div>

                                {/* C. SUSTITUCIÓN DE DATOS */}
                                <div className="absolute top-36 text-center">
                                    <p className="text-[#AAAAAA] text-xs font-mono">
                                        Datos: I₀=${inputs.investment.toLocaleString()}, CF=${inputs.cashFlow.toLocaleString()}, r={inputs.rate*100}%, n={inputs.periods}
                                    </p>
                                </div>

                                {/* D. DESGLOSE DEL CÁLCULO */}
                                <div className="absolute top-48 left-12 font-mono text-left">
                                    <h3 className="text-[#FFD700] text-xs font-bold mb-2">DESGLOSE DE EJECUCIÓN:</h3>
                                    <div className="space-y-1">
                                        {result.calculationSteps.map((step, idx) => (
                                            <p key={idx} className="text-white text-xs">{step}</p>
                                        ))}
                                        <p className="text-[#FF4444] text-xs">(-) Inversión: -${inputs.investment.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                    </div>
                                </div>

                                {/* E. RESULTADO FINAL */}
                                <div className="absolute bottom-16 text-center">
                                    <div 
                                        className="text-2xl font-bold px-6 py-3 rounded border border-[#FFD700] bg-[#111]"
                                        style={{ color: resultColor }}
                                    >
                                        RESULTADO VPN = ${result.npv.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </div>
                                </div>

                                {/* F. SELLO DE VALIDACIÓN */}
                                <div className="absolute bottom-4 right-4 text-right">
                                    <p className="text-[#555] text-[8px] uppercase tracking-widest">GENERADO POR SINAPPTRON PRIME | LÓGICA VERIFICADA</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VpnAuditor;
