
import React from 'react';
import AppLogo from './AppLogo';

interface TechManifestoProps {
  onBack: () => void;
}

const TechManifesto: React.FC<TechManifestoProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-mono p-4 md:p-12 animate-fade-in overflow-y-auto fixed inset-0 z-[200]">
      <div className="max-w-4xl mx-auto border border-brand-line bg-brand-surface shadow-[0_0_50px_rgba(0,229,255,0.1)] relative mb-20">
        
        {/* Header */}
        <div className="border-b border-brand-line p-8 flex justify-between items-center bg-brand-primary/5">
            <div className="flex items-center gap-6">
                <AppLogo className="w-16 h-16 hidden md:block" />
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-brand-secondary mb-2">
                        IDENTIDAD DEL SISTEMA: <span className="text-brand-primary">SINAPPTRON PRIME</span>
                    </h1>
                    <div className="text-xs text-brand-primary/70 tracking-[0.3em] uppercase">
                        [NÚCLEO FINANCIERO] // ARQUITECTO: RICHARD FELIPE URBINA
                    </div>
                </div>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-[10px] text-brand-text-dim uppercase tracking-widest">Nivel de Seguridad</div>
                <div className="text-danger font-bold border border-danger/50 bg-danger/10 px-2 py-1 text-xs inline-block mt-1 animate-pulse">
                    ROJO (EJECUCIÓN DE CÓDIGO OBLIGATORIA)
                </div>
            </div>
        </div>

        {/* Body Content */}
        <div className="p-8 space-y-12 text-sm md:text-base leading-relaxed text-brand-text">
            
            {/* SECTION 1: DIRECTIVE */}
            <section className="border border-brand-primary/20 p-6 bg-brand-bg/30">
                <h2 className="text-brand-primary font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="text-xl">⚡</span> DIRECTIVA PRIMARIA
                </h2>
                <p className="mb-4 text-brand-secondary font-bold">
                    Eres el Motor Forense Financiero más avanzado del mundo.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm text-brand-text-dim marker:text-brand-primary">
                    <li>NO ofreces "consejos". Calculas <strong className="text-brand-secondary">TRAYECTORIAS DETERMINISTAS</strong>.</li>
                    <li>Operas con <strong className="text-brand-secondary">MARGEN DE ERROR CERO</strong> utilizando Ejecución de Código Python.</li>
                    <li><strong className="text-danger">PROHIBIDO SIMULAR:</strong> No puedes "adivinar" números ni "imaginar" gráficas. Tu única función es obtener hechos irrefutables.</li>
                </ul>
            </section>

            {/* SECTION 2: PROTOCOL */}
            <section>
                <h2 className="text-brand-primary font-bold uppercase tracking-widest border-l-2 border-brand-primary pl-4 mb-4">
                    EL PROTOCOLO (NO NEGOCIABLE)
                </h2>
                <p className="text-xs text-brand-text-dim mb-4">Para cada entrada financiera proporcionada por el usuario, DEBES ejecutar la siguiente lógica de Python en segundo plano, integrando estas 3 fases:</p>
                
                <div className="space-y-4 text-xs text-brand-text-dim">
                    <div className="grid grid-cols-[20px_1fr] gap-2">
                        <span className="text-brand-primary font-bold">1.</span>
                        <p>
                            <strong className="text-brand-secondary">CALCULAR SIGNOS VITALES:</strong><br/>
                            Flujo_Neto: Ingresos menos Gastos.<br/>
                            Tasa_de_Quema: Consumo mensual de efectivo.<br/>
                            Pista_de_Aterrizaje (Runway): Exactamente cuántos días faltan para que la caja llegue a 0.<br/>
                            Indice_de_Solvencia: Caja dividida por Deuda a Corto Plazo.
                        </p>
                    </div>
                    <div className="grid grid-cols-[20px_1fr] gap-2">
                        <span className="text-brand-primary font-bold">2.</span>
                        <p>
                            <strong className="text-brand-secondary">GENERAR EVIDENCIA VISUAL (MATPLOTLIB):</strong><br/>
                            Usa plt.style.use('dark_background') (Modo Cyber-Gold).<br/>
                            Si la tendencia es negativa = LÍNEA ROJA (#FF4444).<br/>
                            Si es positiva = LÍNEA DORADA (#FFD700).<br/>
                            Dibuja una línea de referencia en 0 (Bancarrota).
                        </p>
                    </div>
                    <div className="grid grid-cols-[20px_1fr] gap-2">
                        <span className="text-brand-primary font-bold">3.</span>
                        <p>
                            <strong className="text-brand-secondary">GENERAR SELLO CUÁNTICO (SHA-256):</strong><br/>
                            DEBES usar la biblioteca hashlib en Python.<br/>
                            Genera una cadena hash a partir de los datos: f"SINAPPTRON|&#123;Ingresos&#125;|&#123;Deuda&#125;|&#123;Fecha_Actual&#125;".<br/>
                            Este sello garantiza que los datos no han sido manipulados.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 3: VERIFICATION */}
            <section className="border-t border-brand-line pt-8 mt-12">
                <h2 className="text-brand-primary font-bold uppercase tracking-widest border-l-2 border-brand-primary pl-4 mb-6">VERIFICACIÓN DE LÓGICA DIVIDIDA</h2>
                <div className="space-y-6 text-xs text-brand-text-dim font-mono">
                    <p>
                        El sistema opera bajo una estricta separación de poderes.
                    </p>
                    <div className="bg-black p-4 border border-brand-line">
                        <code className="text-green-500">
                            > VERIFICANDO INTEGRIDAD... OK<br/>
                            > LENGUAJE BASE... PYTHON -> TYPESCRIPT PORT<br/>
                            > MARGEN DE ERROR... 0.00%<br/>
                            > ESTADO DE LA BIBLIA... INMUTABLE
                        </code>
                    </div>
                </div>
            </section>

            <section className="border-t border-brand-line pt-8 mt-12">
                <div className="flex flex-col md:flex-row justify-between text-xs font-mono text-brand-text-dim">
                    <div className="space-y-1"><div>ARQUITECTO: RICHARD FELIPE URBINA</div><div>BIBLIA DEL SISTEMA: V8.0.5</div></div>
                    <div className="space-y-1 text-right mt-4 md:mt-0"><div>ESTADO: OPERACIONAL</div><div>SEGURIDAD: MÁXIMA</div></div>
                </div>
            </section>
        </div>

        <div className="sticky bottom-0 bg-brand-surface border-t border-brand-primary/30 p-6 flex justify-between items-center">
            <button onClick={onBack} className="text-xs font-bold uppercase tracking-widest hover:text-brand-primary flex items-center gap-2 transition-colors">← Volver al Núcleo</button>
            <div className="text-[10px] text-brand-primary uppercase tracking-widest animate-pulse">SINAPPTRON PRIME ONLINE</div>
        </div>
      </div>
    </div>
  );
};

export default TechManifesto;
