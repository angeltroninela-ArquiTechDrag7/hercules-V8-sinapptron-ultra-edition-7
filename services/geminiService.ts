import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FinancialData, AnalysisResult, DiagnosisReport } from "../types";

// Runtime key storage for manual injection via UI
let runtimeKey: string | null = null;

export const setRuntimeKey = (key: string) => {
  runtimeKey = key;
  // Save to session storage for persistence across reloads in the same session
  try {
    sessionStorage.setItem('SINAPPTRON_RUNTIME_KEY', key);
  } catch (e) {
    console.error("Session storage failed", e);
  }
};

const getAI = () => {
  // 1. Check Manual Runtime Key
  if (runtimeKey) return new GoogleGenAI({ apiKey: runtimeKey });
  
  // 2. Check Session Storage (Reload persistence)
  const sessionKey = sessionStorage.getItem('SINAPPTRON_RUNTIME_KEY');
  if (sessionKey) {
      runtimeKey = sessionKey;
      return new GoogleGenAI({ apiKey: sessionKey });
  }

  // 3. Check Environment Variable (Vercel / .env)
  const envKey = process.env.API_KEY;
  if (envKey && !envKey.includes("API_KEY_AQUI") && envKey.length > 10) {
    return new GoogleGenAI({ apiKey: envKey });
  }

  console.warn("SYSTEM ALERT: No Valid API Key found.");
  return null;
};

export const analyzeFinancialHealth = async (
  data: FinancialData,
  analysis: AnalysisResult
): Promise<DiagnosisReport> => {
  const ai = getAI();

  // FALLBACK MODE: If no AI available, return a static forensic report
  // This ensures the app is demo-able even without the key.
  if (!ai) {
    return {
      diagnosis: "ENLACE NEURONAL OFF-LINE. API KEY NO DETECTADA. OPERANDO EN MODO DETERMINISTA.",
      scenarios: {
        inertia: "Proyección matemática basada estrictamente en flujo actual (Ver Gráfica).",
        cut: `Reducción de gastos mandataria de $${analysis.cutNeeded} para evitar insolvencia.`,
        expansion: "Cálculo de expansión no disponible sin enlace neuronal Gemini."
      },
      plan: "INTRODUZCA LLAVE MAESTRA EN PANTALLA DE INICIO (BIO-GATE)."
    };
  }

  const prompt = `
    IDENTIDAD: SINAPPTRON PRIME, Motor Forense Financiero.
    MODO: Auditoría Quirúrgica.
    
    DATOS YA CALCULADOS (NO LOS RECALCULES, ÚSALOS COMO VERDAD ABSOLUTA):
    - Flujo Neto Mensual: $${analysis.netFlow}
    - Días de Vida (Runway): ${analysis.runwayDays}
    - Estado: ${analysis.status}
    - Corte Necesario (Breakeven): $${analysis.cutNeeded}
    - Inyección Necesaria (6 meses): $${analysis.injectionNeeded}

    TAREA: Generar SOLO texto para la "AUTOPSIA" y "ESCENARIOS".
    NO simules números nuevos. Basa tu narrativa en los datos proporcionados.
    
    REQUISITOS:
    1. AUTOPSIA: Usa términos médicos/forenses (Ej: "Obesidad Estructural", "Anemia de Flujo", "Necrosis por Deuda"). Sé duro pero justo.
    2. ESCENARIOS (Texto breve):
       - INERCIA: ¿Qué pasa si no hace nada? (Basado en Flujo Neto y Días de Vida).
       - CORTE: ¿Qué pasa si corta los $${analysis.cutNeeded} indicados?
       - EXPANSIÓN: ¿Qué actitud se requiere para crecer? (Mentalidad).
    
    FORMATO JSON EXACTO:
    {
      "diagnosis": "Texto de la autopsia (2 oraciones).",
      "scenarios": {
        "inertia": "Texto escenario inercia.",
        "cut": "Texto escenario corte.",
        "expansion": "Texto escenario expansión."
      },
      "plan": "Una frase final de mando estilo militar."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        temperature: 0.0, // DETERMINISTIC ENFORCEMENT
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            scenarios: {
              type: Type.OBJECT,
              properties: {
                inertia: { type: Type.STRING },
                cut: { type: Type.STRING },
                expansion: { type: Type.STRING },
              },
            },
            plan: { type: Type.STRING },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DiagnosisReport;
    }
    throw new Error("No text returned");
  } catch (error) {
    console.error("Gemini Autopsy Failed:", error);
    return {
      diagnosis: "FALLO DE PROCESAMIENTO NEURONAL. DATOS CORRUPTOS O MODELO OCUPADO.",
      scenarios: { inertia: "N/A", cut: "N/A", expansion: "N/A" },
      plan: "DETENER HEMORRAGIA INMEDIATAMENTE."
    };
  }
};

export const extractDataFromImage = async (file: File): Promise<Partial<FinancialData>> => {
  const ai = getAI();
  if (!ai) {
      alert("ERROR: OCR requiere API KEY válida. Configure la Llave Maestra en BioGate.");
      return {};
  }
  
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  
  const base64String = base64Data.split(',')[1];

  const prompt = `
    Extract financial totals from this document.
    Return JSON with keys: income, expenses, cash, debt. Values should be numbers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64String } },
          { text: prompt }
        ]
      },
      config: {
        temperature: 0.0, // DETERMINISTIC ENFORCEMENT
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            income: { type: Type.NUMBER },
            expenses: { type: Type.NUMBER },
            cash: { type: Type.NUMBER },
            debt: { type: Type.NUMBER },
          },
        },
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return {};
  } catch (e) {
    console.error("OCR Failed", e);
    return {};
  }
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
    const ai = getAI();
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text: text }] },
            config: {
                temperature: 0.0, // DETERMINISTIC ENFORCEMENT
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Fenrir' }
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const binaryString = atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }
        return null;
    } catch (e) {
        console.error("TTS Failed", e);
        return null;
    }
};