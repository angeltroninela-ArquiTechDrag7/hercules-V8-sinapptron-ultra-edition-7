
export enum AppScreen {
  BIO_GATE = 'BIO_GATE',
  DATA_INGESTION = 'DATA_INGESTION',
  VISUAL_TRUTH = 'VISUAL_TRUTH',
  STRATEGIC_DOSSIER = 'STRATEGIC_DOSSIER',
  TECH_MANIFESTO = 'TECH_MANIFESTO',
  VPN_AUDITOR = 'VPN_AUDITOR',
}

export interface User {
  id: string;
  name: string;
  pin: string;
}

export interface FinancialData {
  income: number;
  expenses: number;
  debt: number;
  cash: number;
}

export interface AnalysisResult {
  netFlow: number;
  burnRate: number;
  runwayDays: number;
  solvencyRatio: number;
  status: 'CRITICAL' | 'PRECAUTION' | 'OPTIMAL';
  projectionPoints: { month: string; value: number }[];
  cutNeeded: number;
  injectionNeeded: number;
}

export interface DiagnosisReport {
  diagnosis: string;
  scenarios: {
    inertia: string;
    cut: string;
    expansion: string;
  };
  plan: string;
}

export interface SystemNotification {
  id: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: string;
}
