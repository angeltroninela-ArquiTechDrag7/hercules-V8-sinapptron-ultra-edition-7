
/**
 * @file mathUtils.ts
 * @description NÚCLEO MATEMÁTICO DETERMINISTA (PORT PYTHON -> TS)
 * Contiene la lógica propietaria de cálculo de proyecciones financieras y solvencia.
 * 
 * @author Richard Felipe Urbina <angeltroninela@gmail.com>
 * @copyright 2025 Richard Felipe Urbina. Todos los derechos reservados.
 * @license PROPIETARIO - Ver archivo LICENSE.md
 * 
 * ADVERTENCIA: PROHIBIDA SU REPRODUCCIÓN, INGENIERÍA INVERSA O USO COMERCIAL 
 * SIN AUTORIZACIÓN EXPRESA DEL AUTOR.
 */

import { FinancialData, AnalysisResult } from '../types';

export const calculateFinancials = (data: FinancialData): AnalysisResult => {
  // 1. DEFINIR VARIABLES & CÁLCULOS LÓGICOS (Python Protocol)
  const netFlow = data.income - data.expenses;
  
  // months = range(0, 7) # Proyección a 6 meses (Current + 6 future months)
  const monthsLabel = ['HOY', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
  const projectionPoints = [];

  // projection = [cash + (net_flow * m) for m in months]
  for (let i = 0; i < 7; i++) {
    projectionPoints.push({
      month: monthsLabel[i],
      value: data.cash + (netFlow * i)
    });
  }

  let status: AnalysisResult['status'] = 'OPTIMAL';
  let burnRate = 0;
  let runwayDays = 9999;
  let cutNeeded = 0;
  let injectionNeeded = 0;

  // Cálculos de Supervivencia
  if (netFlow < 0) {
    burnRate = Math.abs(netFlow);
    
    // days_to_zero = int((cash / monthly_burn) * 30)
    runwayDays = burnRate > 0 ? Math.floor((data.cash / burnRate) * 30) : 0;
    
    cutNeeded = burnRate;
    
    // injection_needed = (monthly_burn * 6) - cash
    // injection_needed = max(0, injection_needed)
    injectionNeeded = (burnRate * 6) - data.cash;
    injectionNeeded = Math.max(0, injectionNeeded);

    // graph_color = '#FF4444' # Rojo Sangre -> Status CRITICAL
    status = 'CRITICAL';
  } else {
    // days_to_zero = 9999 # Infinito
    runwayDays = 9999;
    cutNeeded = 0;
    injectionNeeded = 0;
    
    // graph_color = '#FFD700' # Dorado Lujo -> Status SOLVENTE (OPTIMAL)
    status = 'OPTIMAL';
  }

  // solvency_ratio = round((cash / debt) * 100, 2) if debt > 0 else 100.0
  const solvencyRatio = data.debt > 0 ? (data.cash / data.debt) * 100 : 100.0;

  return {
    netFlow,
    burnRate,
    runwayDays,
    solvencyRatio,
    status,
    projectionPoints,
    cutNeeded,
    injectionNeeded
  };
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};
