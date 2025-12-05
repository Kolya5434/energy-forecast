import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

import {
  fetchAnomalies,
  fetchDecomposition,
  fetchEvaluation,
  fetchFeatures,
  fetchHistorical,
  fetchInterpretation,
  fetchModels,
  fetchPatterns,
  fetchPeaks,
  postCompare,
  postPredictions,
  postSimulation
} from '../api';
import {
  fetchModelDiagnostics,
  postErrorAnalysis,
  postLatexExport,
  postReproducibilityReport,
  postResidualAnalysis,
  postStatisticalTests,
  postVisualization
} from '../api/scientific';
import { useApiState, useCachedApiState } from '../hooks/useApiState';
import type {
  IAnomaliesRequest,
  IAnomaliesResponse,
  ICompareRequest,
  ICompareResponse,
  IDecompositionRequest,
  IDecompositionResponse,
  IEvaluationApiResponse,
  IExtendedConditions,
  IFeaturesResponse,
  IHistoricalRequest,
  IHistoricalResponse,
  IInterpretationApiResponse,
  IPatternsRequest,
  IPatternsResponse,
  IPeaksRequest,
  IPeaksResponse,
  IPredictionRequest,
  IPredictionResponse,
  IShapInterpretationResponse,
  ISimulationRequest,
  ModelsApiResponse
} from '../types/api';
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
} from '../types/scientific';

interface IApiContext {
  models: ModelsApiResponse | null;
  isLoadingModels: boolean;
  modelsError: string | null;

  predictions: IPredictionResponse[] | null;
  isLoadingPredictions: boolean;
  predictionsError: string | null;
  getPredictions: (data: IPredictionRequest) => void;

  extendedConditions: IExtendedConditions;
  setExtendedConditions: (conditions: IExtendedConditions) => void;
  clearExtendedConditions: () => void;

  isConditionsEditMode: boolean;
  setConditionsEditMode: (isEdit: boolean) => void;

  evaluations: Record<string, IEvaluationApiResponse>;
  isLoadingEvaluation: boolean;
  evaluationError: string | null;
  getEvaluation: (modelId: string) => void;

  interpretations: Record<string, IInterpretationApiResponse | IShapInterpretationResponse>;
  isLoadingInterpretation: boolean;
  interpretationError: string | null;
  getInterpretation: (modelId: string) => void;

  simulationResult: IPredictionResponse | null;
  isLoadingSimulation: boolean;
  simulationError: string | null;
  runSimulation: (data: ISimulationRequest) => Promise<void>;
  clearSimulation: () => void;

  clearPredictions: () => void;

  historicalData: IHistoricalResponse | null;
  isLoadingHistorical: boolean;
  historicalError: string | null;
  getHistorical: (params: IHistoricalRequest) => Promise<void>;

  featuresCache: Record<string, IFeaturesResponse>;
  isLoadingFeatures: boolean;
  featuresError: string | null;
  getFeatures: (modelId: string) => Promise<IFeaturesResponse | null>;

  patternsData: IPatternsResponse | null;
  isLoadingPatterns: boolean;
  patternsError: string | null;
  getPatterns: (params: IPatternsRequest) => Promise<void>;

  anomaliesData: IAnomaliesResponse | null;
  isLoadingAnomalies: boolean;
  anomaliesError: string | null;
  getAnomalies: (params: IAnomaliesRequest) => Promise<void>;

  peaksData: IPeaksResponse | null;
  isLoadingPeaks: boolean;
  peaksError: string | null;
  getPeaks: (params: IPeaksRequest) => Promise<void>;

  decompositionData: IDecompositionResponse | null;
  isLoadingDecomposition: boolean;
  decompositionError: string | null;
  getDecomposition: (params: IDecompositionRequest) => Promise<void>;

  compareResult: ICompareResponse | null;
  isLoadingCompare: boolean;
  compareError: string | null;
  compareScenarios: (data: ICompareRequest) => Promise<void>;
  clearCompare: () => void;

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

// eslint-disable-next-line react-refresh/only-export-components
export const ApiContext = createContext<IApiContext | undefined>(undefined);

const ApiProvider = ({ children }: { children: ReactNode }) => {
  // Models - loaded on mount
  const [models, setModels] = useState<ModelsApiResponse | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Extended conditions state
  const [extendedConditions, setExtendedConditionsState] = useState<IExtendedConditions>({});
  const [isConditionsEditMode, setIsConditionsEditMode] = useState(true);

  // Use generic hooks for API states
  const predictions = useApiState<IPredictionResponse[], IPredictionRequest>(
    postPredictions,
    'Не вдалося отримати прогнози'
  );

  const simulation = useApiState<IPredictionResponse, ISimulationRequest>(
    postSimulation,
    'Не вдалося запустити симуляцію'
  );

  const historical = useApiState<IHistoricalResponse, IHistoricalRequest>(
    fetchHistorical,
    'Не вдалося завантажити історичні дані'
  );

  const patterns = useApiState<IPatternsResponse, IPatternsRequest>(
    fetchPatterns,
    'Не вдалося завантажити патерни'
  );

  const anomalies = useApiState<IAnomaliesResponse, IAnomaliesRequest>(
    fetchAnomalies,
    'Не вдалося завантажити аномалії'
  );

  const peaks = useApiState<IPeaksResponse, IPeaksRequest>(
    fetchPeaks,
    'Не вдалося завантажити пікові періоди'
  );

  const decomposition = useApiState<IDecompositionResponse, IDecompositionRequest>(
    fetchDecomposition,
    'Не вдалося завантажити декомпозицію'
  );

  const compare = useApiState<ICompareResponse, ICompareRequest>(
    postCompare,
    'Не вдалося порівняти сценарії'
  );

  // Scientific Analysis
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

  // Cached API states
  const features = useCachedApiState<IFeaturesResponse>(
    fetchFeatures,
    'Не вдалося отримати ознаки для моделі'
  );

  // Evaluations cache (needs custom handling due to existing pattern)
  const [evaluations, setEvaluations] = useState<Record<string, IEvaluationApiResponse>>({});
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  // Interpretations cache
  const [interpretations, setInterpretations] = useState<Record<string, IShapInterpretationResponse | IInterpretationApiResponse>>({});
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [interpretationError, setInterpretationError] = useState<string | null>(null);

  // Model diagnostics (needs custom params handling)
  const [modelDiagnosticsResult, setModelDiagnosticsResult] = useState<ModelDiagnosticsResponse | null>(null);
  const [isLoadingModelDiagnostics, setIsLoadingModelDiagnostics] = useState(false);
  const [modelDiagnosticsError, setModelDiagnosticsError] = useState<string | null>(null);

  // Load models on mount
  useEffect(() => {
    const fetchInitialModels = async () => {
      try {
        setIsLoadingModels(true);
        const data = await fetchModels();
        const filteredModels = Object.entries(data)
          .reduce((acc, [modelId, modelInfo]) => {
            acc[modelId] = modelInfo;
            return acc;
          }, {} as ModelsApiResponse);

        setModels(filteredModels);
      } catch (err) {
        setModelsError('Не вдалося завантажити список моделей');
        console.error('Error fetching models:', err);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchInitialModels();
  }, []);

  // Callbacks for cached data
  const getEvaluation = useCallback(
    async (modelId: string) => {
      if (evaluations[modelId]) return;

      try {
        setIsLoadingEvaluation(true);
        setEvaluationError(null);
        const result = await fetchEvaluation(modelId);
        setEvaluations((prev) => ({ ...prev, [modelId]: result }));
      } catch (err) {
        setEvaluationError(`Не вдалося отримати оцінку для моделі ${modelId}`);
        console.error('Error fetching evaluation:', err);
      } finally {
        setIsLoadingEvaluation(false);
      }
    },
    [evaluations]
  );

  const getInterpretation = useCallback(
    async (modelId: string) => {
      if (interpretations[modelId]) return;

      try {
        setIsLoadingInterpretation(true);
        setInterpretationError(null);
        const result = await fetchInterpretation(modelId);
        if (result) {
          setInterpretations((prev) => ({ ...prev, [modelId]: result }));
        } else {
          throw new Error('Invalid interpretation response format');
        }
      } catch (err) {
        setInterpretationError(`Не вдалося отримати інтерпретацію для моделі ${modelId}`);
        console.error('Error fetching interpretation:', err);
      } finally {
        setIsLoadingInterpretation(false);
      }
    },
    [interpretations]
  );

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

  // Simple callbacks
  const setExtendedConditions = useCallback((conditions: IExtendedConditions) => {
    setExtendedConditionsState(conditions);
  }, []);

  const clearExtendedConditions = useCallback(() => {
    setExtendedConditionsState({});
  }, []);

  const setConditionsEditMode = useCallback((isEdit: boolean) => {
    setIsConditionsEditMode(isEdit);
  }, []);

  const clearPredictions = useCallback(() => {
    predictions.setData(null);
  }, [predictions]);

  const value: IApiContext = {
    // Models
    models,
    isLoadingModels,
    modelsError,

    // Predictions
    predictions: predictions.data,
    isLoadingPredictions: predictions.isLoading,
    predictionsError: predictions.error,
    getPredictions: predictions.execute,
    clearPredictions,

    // Extended conditions
    extendedConditions,
    setExtendedConditions,
    clearExtendedConditions,
    isConditionsEditMode,
    setConditionsEditMode,

    // Evaluations
    evaluations,
    isLoadingEvaluation,
    evaluationError,
    getEvaluation,

    // Interpretations
    interpretations,
    isLoadingInterpretation,
    interpretationError,
    getInterpretation,

    // Simulation
    simulationResult: simulation.data,
    isLoadingSimulation: simulation.isLoading,
    simulationError: simulation.error,
    runSimulation: simulation.execute,
    clearSimulation: simulation.reset,

    // Historical
    historicalData: historical.data,
    isLoadingHistorical: historical.isLoading,
    historicalError: historical.error,
    getHistorical: historical.execute,

    // Features
    featuresCache: features.cache,
    isLoadingFeatures: features.isLoading,
    featuresError: features.error,
    getFeatures: features.get,

    // Patterns
    patternsData: patterns.data,
    isLoadingPatterns: patterns.isLoading,
    patternsError: patterns.error,
    getPatterns: patterns.execute,

    // Anomalies
    anomaliesData: anomalies.data,
    isLoadingAnomalies: anomalies.isLoading,
    anomaliesError: anomalies.error,
    getAnomalies: anomalies.execute,

    // Peaks
    peaksData: peaks.data,
    isLoadingPeaks: peaks.isLoading,
    peaksError: peaks.error,
    getPeaks: peaks.execute,

    // Decomposition
    decompositionData: decomposition.data,
    isLoadingDecomposition: decomposition.isLoading,
    decompositionError: decomposition.error,
    getDecomposition: decomposition.execute,

    // Compare
    compareResult: compare.data,
    isLoadingCompare: compare.isLoading,
    compareError: compare.error,
    compareScenarios: compare.execute,
    clearCompare: compare.reset,

    // Scientific Analysis
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

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export { ApiProvider };
