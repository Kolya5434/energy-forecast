import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import {
  fetchModelDiagnostics,
  postErrorAnalysis,
  postLatexExport,
  postReproducibilityReport,
  postResidualAnalysis,
  postStatisticalTests,
  postVisualization
} from '@/api/scientific';
import { useApiState } from '@/hooks/useApiState';
import type {
  ErrorAnalysisRequest,
  ErrorAnalysisResponse,
  LaTeXExportRequest,
  LaTeXExportResponse,
  ModelDiagnosticsResponse,
  ReproducibilityReportRequest,
  ReproducibilityReportResponse,
  ResidualAnalysisRequest,
  ResidualAnalysisResponse,
  StatisticalTestRequest,
  StatisticalTestResponse,
  VisualizationRequest,
  VisualizationResponse
} from '@/types/scientific';

interface IScientificContext {
  statisticalTestsResult: StatisticalTestResponse | null;
  isLoadingStatisticalTests: boolean;
  statisticalTestsError: string | null;
  runStatisticalTests: (data: StatisticalTestRequest) => Promise<void>;

  residualAnalysisResult: ResidualAnalysisResponse | null;
  isLoadingResidualAnalysis: boolean;
  residualAnalysisError: string | null;
  runResidualAnalysis: (data: ResidualAnalysisRequest) => Promise<void>;

  errorAnalysisResult: ErrorAnalysisResponse | null;
  isLoadingErrorAnalysis: boolean;
  errorAnalysisError: string | null;
  runErrorAnalysis: (data: ErrorAnalysisRequest) => Promise<void>;

  visualizationResult: VisualizationResponse | null;
  isLoadingVisualization: boolean;
  visualizationError: string | null;
  generateVisualization: (data: VisualizationRequest) => Promise<void>;

  latexExportResult: LaTeXExportResponse | null;
  isLoadingLatexExport: boolean;
  latexExportError: string | null;
  exportLatex: (data: LaTeXExportRequest) => Promise<void>;

  reproducibilityReportResult: ReproducibilityReportResponse | null;
  isLoadingReproducibilityReport: boolean;
  reproducibilityReportError: string | null;
  getReproducibilityReport: (data: ReproducibilityReportRequest) => Promise<void>;

  modelDiagnosticsResult: ModelDiagnosticsResponse | null;
  isLoadingModelDiagnostics: boolean;
  modelDiagnosticsError: string | null;
  getModelDiagnostics: (modelId: string, testSizeDays?: number) => Promise<void>;
}

const ScientificContext = createContext<IScientificContext | undefined>(undefined);

export const ScientificProvider = ({ children }: { children: ReactNode }) => {
  const statisticalTests = useApiState<StatisticalTestResponse, StatisticalTestRequest>(
    postStatisticalTests,
    'Не вдалося виконати статистичні тести'
  );

  const residualAnalysis = useApiState<ResidualAnalysisResponse, ResidualAnalysisRequest>(
    postResidualAnalysis,
    'Не вдалося виконати аналіз залишків'
  );

  const errorAnalysis = useApiState<ErrorAnalysisResponse, ErrorAnalysisRequest>(
    postErrorAnalysis,
    'Не вдалося виконати аналіз помилок'
  );

  const visualization = useApiState<VisualizationResponse, VisualizationRequest>(
    postVisualization,
    'Не вдалося згенерувати візуалізацію'
  );

  const latexExport = useApiState<LaTeXExportResponse, LaTeXExportRequest>(
    postLatexExport,
    'Не вдалося експортувати в LaTeX'
  );

  const reproducibilityReport = useApiState<ReproducibilityReportResponse, ReproducibilityReportRequest>(
    postReproducibilityReport,
    'Не вдалося отримати звіт про відтворюваність'
  );

  // Model diagnostics (needs custom params handling)
  const [modelDiagnosticsResult, setModelDiagnosticsResult] = useState<ModelDiagnosticsResponse | null>(null);
  const [isLoadingModelDiagnostics, setIsLoadingModelDiagnostics] = useState(false);
  const [modelDiagnosticsError, setModelDiagnosticsError] = useState<string | null>(null);

  const getModelDiagnostics = useCallback(async (modelId: string, testSizeDays: number = 30) => {
    try {
      setIsLoadingModelDiagnostics(true);
      setModelDiagnosticsError(null);
      const result = await fetchModelDiagnostics(modelId, testSizeDays);
      setModelDiagnosticsResult(result);
    } catch (err) {
      setModelDiagnosticsError('Не вдалося отримати діагностику моделі');
      console.error('Error getting model diagnostics:', err);
    } finally {
      setIsLoadingModelDiagnostics(false);
    }
  }, []);

  const value: IScientificContext = {
    statisticalTestsResult: statisticalTests.data,
    isLoadingStatisticalTests: statisticalTests.isLoading,
    statisticalTestsError: statisticalTests.error,
    runStatisticalTests: statisticalTests.execute,

    residualAnalysisResult: residualAnalysis.data,
    isLoadingResidualAnalysis: residualAnalysis.isLoading,
    residualAnalysisError: residualAnalysis.error,
    runResidualAnalysis: residualAnalysis.execute,

    errorAnalysisResult: errorAnalysis.data,
    isLoadingErrorAnalysis: errorAnalysis.isLoading,
    errorAnalysisError: errorAnalysis.error,
    runErrorAnalysis: errorAnalysis.execute,

    visualizationResult: visualization.data,
    isLoadingVisualization: visualization.isLoading,
    visualizationError: visualization.error,
    generateVisualization: visualization.execute,

    latexExportResult: latexExport.data,
    isLoadingLatexExport: latexExport.isLoading,
    latexExportError: latexExport.error,
    exportLatex: latexExport.execute,

    reproducibilityReportResult: reproducibilityReport.data,
    isLoadingReproducibilityReport: reproducibilityReport.isLoading,
    reproducibilityReportError: reproducibilityReport.error,
    getReproducibilityReport: reproducibilityReport.execute,

    modelDiagnosticsResult,
    isLoadingModelDiagnostics,
    modelDiagnosticsError,
    getModelDiagnostics
  };

  return <ScientificContext.Provider value={value}>{children}</ScientificContext.Provider>;
};

export const useScientific = () => {
  const context = useContext(ScientificContext);
  if (context === undefined) {
    throw new Error('useScientific must be used within a ScientificProvider');
  }
  return context;
};
