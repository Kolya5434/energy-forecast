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

  // Historical data
  historicalData: IHistoricalResponse | null;
  isLoadingHistorical: boolean;
  historicalError: string | null;
  getHistorical: (params?: IHistoricalRequest) => Promise<void>;

  // Features info
  featuresCache: Record<string, IFeaturesResponse>;
  isLoadingFeatures: boolean;
  featuresError: string | null;
  getFeatures: (modelId: string) => Promise<IFeaturesResponse | null>;

  // Patterns
  patternsData: IPatternsResponse | null;
  isLoadingPatterns: boolean;
  patternsError: string | null;
  getPatterns: (params?: IPatternsRequest) => Promise<void>;

  // Anomalies
  anomaliesData: IAnomaliesResponse | null;
  isLoadingAnomalies: boolean;
  anomaliesError: string | null;
  getAnomalies: (params?: IAnomaliesRequest) => Promise<void>;

  // Peaks
  peaksData: IPeaksResponse | null;
  isLoadingPeaks: boolean;
  peaksError: string | null;
  getPeaks: (params?: IPeaksRequest) => Promise<void>;

  // Decomposition
  decompositionData: IDecompositionResponse | null;
  isLoadingDecomposition: boolean;
  decompositionError: string | null;
  getDecomposition: (params?: IDecompositionRequest) => Promise<void>;

  // Compare scenarios
  compareResult: ICompareResponse | null;
  isLoadingCompare: boolean;
  compareError: string | null;
  compareScenarios: (data: ICompareRequest) => Promise<void>;
  clearCompare: () => void;

  // Scientific Analysis - Statistical Tests
  statisticalTestsResult: StatisticalTestResponse | null;
  isLoadingStatisticalTests: boolean;
  statisticalTestsError: string | null;
  runStatisticalTests: (data: StatisticalTestRequest) => Promise<void>;

  // Scientific Analysis - Residual Analysis
  residualAnalysisResult: ResidualAnalysisResponse | null;
  isLoadingResidualAnalysis: boolean;
  residualAnalysisError: string | null;
  runResidualAnalysis: (data: ResidualAnalysisRequest) => Promise<void>;

  // Scientific Analysis - Error Analysis
  errorAnalysisResult: ErrorAnalysisResponse | null;
  isLoadingErrorAnalysis: boolean;
  errorAnalysisError: string | null;
  runErrorAnalysis: (data: ErrorAnalysisRequest) => Promise<void>;

  // Scientific Analysis - Visualization
  visualizationResult: VisualizationResponse | null;
  isLoadingVisualization: boolean;
  visualizationError: string | null;
  generateVisualization: (data: VisualizationRequest) => Promise<void>;

  // Scientific Analysis - LaTeX Export
  latexExportResult: LaTeXExportResponse | null;
  isLoadingLatexExport: boolean;
  latexExportError: string | null;
  exportLatex: (data: LaTeXExportRequest) => Promise<void>;

  // Scientific Analysis - Reproducibility Report
  reproducibilityReportResult: ReproducibilityReportResponse | null;
  isLoadingReproducibilityReport: boolean;
  reproducibilityReportError: string | null;
  getReproducibilityReport: (data?: ReproducibilityReportRequest) => Promise<void>;

  // Scientific Analysis - Model Diagnostics
  modelDiagnosticsResult: ModelDiagnosticsResponse | null;
  isLoadingModelDiagnostics: boolean;
  modelDiagnosticsError: string | null;
  getModelDiagnostics: (modelId: string, testSizeDays?: number) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ApiContext = createContext<IApiContext | undefined>(undefined);

const ApiProvider = ({ children }: { children: ReactNode }) => {
  const [models, setModels] = useState<ModelsApiResponse | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const [predictions, setPredictions] = useState<IPredictionResponse[] | null>(null);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [predictionsError, setPredictionsError] = useState<string | null>(null);

  const [extendedConditions, setExtendedConditionsState] = useState<IExtendedConditions>({});
  const [isConditionsEditMode, setIsConditionsEditMode] = useState(true);

  const [evaluations, setEvaluations] = useState<Record<string, IEvaluationApiResponse>>({});
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const [interpretations, setInterpretations] = useState<Record<string, IShapInterpretationResponse | IInterpretationApiResponse>>({});
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false);
  const [interpretationError, setInterpretationError] = useState<string | null>(null);
  
  const [isLoadingSimulation, setIsLoadingSimulation] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<IPredictionResponse | null>(null);

  const [historicalData, setHistoricalData] = useState<IHistoricalResponse | null>(null);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [historicalError, setHistoricalError] = useState<string | null>(null);

  const [featuresCache, setFeaturesCache] = useState<Record<string, IFeaturesResponse>>({});
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [featuresError, setFeaturesError] = useState<string | null>(null);

  const [patternsData, setPatternsData] = useState<IPatternsResponse | null>(null);
  const [isLoadingPatterns, setIsLoadingPatterns] = useState(false);
  const [patternsError, setPatternsError] = useState<string | null>(null);

  const [anomaliesData, setAnomaliesData] = useState<IAnomaliesResponse | null>(null);
  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(false);
  const [anomaliesError, setAnomaliesError] = useState<string | null>(null);

  const [peaksData, setPeaksData] = useState<IPeaksResponse | null>(null);
  const [isLoadingPeaks, setIsLoadingPeaks] = useState(false);
  const [peaksError, setPeaksError] = useState<string | null>(null);

  const [decompositionData, setDecompositionData] = useState<IDecompositionResponse | null>(null);
  const [isLoadingDecomposition, setIsLoadingDecomposition] = useState(false);
  const [decompositionError, setDecompositionError] = useState<string | null>(null);

  const [compareResult, setCompareResult] = useState<ICompareResponse | null>(null);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Scientific Analysis States
  const [statisticalTestsResult, setStatisticalTestsResult] = useState<StatisticalTestResponse | null>(null);
  const [isLoadingStatisticalTests, setIsLoadingStatisticalTests] = useState(false);
  const [statisticalTestsError, setStatisticalTestsError] = useState<string | null>(null);

  const [residualAnalysisResult, setResidualAnalysisResult] = useState<ResidualAnalysisResponse | null>(null);
  const [isLoadingResidualAnalysis, setIsLoadingResidualAnalysis] = useState(false);
  const [residualAnalysisError, setResidualAnalysisError] = useState<string | null>(null);

  const [errorAnalysisResult, setErrorAnalysisResult] = useState<ErrorAnalysisResponse | null>(null);
  const [isLoadingErrorAnalysis, setIsLoadingErrorAnalysis] = useState(false);
  const [errorAnalysisError, setErrorAnalysisError] = useState<string | null>(null);

  const [visualizationResult, setVisualizationResult] = useState<VisualizationResponse | null>(null);
  const [isLoadingVisualization, setIsLoadingVisualization] = useState(false);
  const [visualizationError, setVisualizationError] = useState<string | null>(null);

  const [latexExportResult, setLatexExportResult] = useState<LaTeXExportResponse | null>(null);
  const [isLoadingLatexExport, setIsLoadingLatexExport] = useState(false);
  const [latexExportError, setLatexExportError] = useState<string | null>(null);

  const [reproducibilityReportResult, setReproducibilityReportResult] =
    useState<ReproducibilityReportResponse | null>(null);
  const [isLoadingReproducibilityReport, setIsLoadingReproducibilityReport] = useState(false);
  const [reproducibilityReportError, setReproducibilityReportError] = useState<string | null>(null);

  const [modelDiagnosticsResult, setModelDiagnosticsResult] = useState<ModelDiagnosticsResponse | null>(null);
  const [isLoadingModelDiagnostics, setIsLoadingModelDiagnostics] = useState(false);
  const [modelDiagnosticsError, setModelDiagnosticsError] = useState<string | null>(null);

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

  const getPredictions = useCallback(async (data: IPredictionRequest) => {
    try {
      setIsLoadingPredictions(true);
      setPredictionsError(null);
      const result = await postPredictions(data);
      setPredictions(result);
    } catch (err) {
      setPredictionsError('Не вдалося отримати прогнози');
      console.error('Error fetching predictions:', err);
    } finally {
      setIsLoadingPredictions(false);
    }
  }, []);

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
  
  const runSimulation = useCallback(async (data: ISimulationRequest) => {
    try {
      setIsLoadingSimulation(true);
      setSimulationError(null);
      const result = await postSimulation(data);
      setSimulationResult(result);
    } catch (err) {
      setSimulationError('Не вдалося запустити симуляцію');
      console.error('Error running simulation:', err);
    } finally {
      setIsLoadingSimulation(false);
    }
  }, []);
  
  const clearSimulation = useCallback(() => {
    setSimulationResult(null);
    setSimulationError(null);
  }, []);
  
  const clearPredictions = () => {
    setPredictions(null);
  };

  const setExtendedConditions = useCallback((conditions: IExtendedConditions) => {
    setExtendedConditionsState(conditions);
  }, []);

  const clearExtendedConditions = useCallback(() => {
    setExtendedConditionsState({});
  }, []);

  const setConditionsEditMode = useCallback((isEdit: boolean) => {
    setIsConditionsEditMode(isEdit);
  }, []);

  const getHistorical = useCallback(async (params?: IHistoricalRequest) => {
    try {
      setIsLoadingHistorical(true);
      setHistoricalError(null);
      const result = await fetchHistorical(params);
      setHistoricalData(result);
    } catch (err) {
      setHistoricalError('Не вдалося завантажити історичні дані');
      console.error('Error fetching historical data:', err);
    } finally {
      setIsLoadingHistorical(false);
    }
  }, []);

  const getFeatures = useCallback(
    async (modelId: string): Promise<IFeaturesResponse | null> => {
      if (featuresCache[modelId]) {
        return featuresCache[modelId];
      }

      try {
        setIsLoadingFeatures(true);
        setFeaturesError(null);
        const result = await fetchFeatures(modelId);
        setFeaturesCache((prev) => ({ ...prev, [modelId]: result }));
        return result;
      } catch (err) {
        setFeaturesError(`Не вдалося отримати ознаки для моделі ${modelId}`);
        console.error('Error fetching features:', err);
        return null;
      } finally {
        setIsLoadingFeatures(false);
      }
    },
    [featuresCache]
  );

  const getPatterns = useCallback(async (params?: IPatternsRequest) => {
    try {
      setIsLoadingPatterns(true);
      setPatternsError(null);
      const result = await fetchPatterns(params);
      setPatternsData(result);
    } catch (err) {
      setPatternsError('Не вдалося завантажити патерни');
      console.error('Error fetching patterns:', err);
    } finally {
      setIsLoadingPatterns(false);
    }
  }, []);

  const getAnomalies = useCallback(async (params?: IAnomaliesRequest) => {
    try {
      setIsLoadingAnomalies(true);
      setAnomaliesError(null);
      const result = await fetchAnomalies(params);
      setAnomaliesData(result);
    } catch (err) {
      setAnomaliesError('Не вдалося завантажити аномалії');
      console.error('Error fetching anomalies:', err);
    } finally {
      setIsLoadingAnomalies(false);
    }
  }, []);

  const getPeaks = useCallback(async (params?: IPeaksRequest) => {
    try {
      setIsLoadingPeaks(true);
      setPeaksError(null);
      const result = await fetchPeaks(params);
      setPeaksData(result);
    } catch (err) {
      setPeaksError('Не вдалося завантажити пікові періоди');
      console.error('Error fetching peaks:', err);
    } finally {
      setIsLoadingPeaks(false);
    }
  }, []);

  const getDecomposition = useCallback(async (params?: IDecompositionRequest) => {
    try {
      setIsLoadingDecomposition(true);
      setDecompositionError(null);
      const result = await fetchDecomposition(params);
      setDecompositionData(result);
    } catch (err) {
      setDecompositionError('Не вдалося завантажити декомпозицію');
      console.error('Error fetching decomposition:', err);
    } finally {
      setIsLoadingDecomposition(false);
    }
  }, []);

  const compareScenarios = useCallback(async (data: ICompareRequest) => {
    try {
      setIsLoadingCompare(true);
      setCompareError(null);
      const result = await postCompare(data);
      setCompareResult(result);
    } catch (err) {
      setCompareError('Не вдалося порівняти сценарії');
      console.error('Error comparing scenarios:', err);
    } finally {
      setIsLoadingCompare(false);
    }
  }, []);

  const clearCompare = useCallback(() => {
    setCompareResult(null);
    setCompareError(null);
  }, []);

  // Scientific Analysis Functions
  const runStatisticalTests = useCallback(async (data: StatisticalTestRequest) => {
    try {
      setIsLoadingStatisticalTests(true);
      setStatisticalTestsError(null);
      const result = await postStatisticalTests(data);
      setStatisticalTestsResult(result);
    } catch (err) {
      setStatisticalTestsError('Не вдалося виконати статистичні тести');
      console.error('Error running statistical tests:', err);
    } finally {
      setIsLoadingStatisticalTests(false);
    }
  }, []);

  const runResidualAnalysis = useCallback(async (data: ResidualAnalysisRequest) => {
    try {
      setIsLoadingResidualAnalysis(true);
      setResidualAnalysisError(null);
      const result = await postResidualAnalysis(data);
      setResidualAnalysisResult(result);
    } catch (err) {
      setResidualAnalysisError('Не вдалося виконати аналіз залишків');
      console.error('Error running residual analysis:', err);
    } finally {
      setIsLoadingResidualAnalysis(false);
    }
  }, []);

  const runErrorAnalysis = useCallback(async (data: ErrorAnalysisRequest) => {
    try {
      setIsLoadingErrorAnalysis(true);
      setErrorAnalysisError(null);
      const result = await postErrorAnalysis(data);
      setErrorAnalysisResult(result);
    } catch (err) {
      setErrorAnalysisError('Не вдалося виконати аналіз помилок');
      console.error('Error running error analysis:', err);
    } finally {
      setIsLoadingErrorAnalysis(false);
    }
  }, []);

  const generateVisualization = useCallback(async (data: VisualizationRequest) => {
    try {
      setIsLoadingVisualization(true);
      setVisualizationError(null);
      const result = await postVisualization(data);
      setVisualizationResult(result);
    } catch (err) {
      setVisualizationError('Не вдалося згенерувати візуалізацію');
      console.error('Error generating visualization:', err);
    } finally {
      setIsLoadingVisualization(false);
    }
  }, []);

  const exportLatex = useCallback(async (data: LaTeXExportRequest) => {
    try {
      setIsLoadingLatexExport(true);
      setLatexExportError(null);
      const result = await postLatexExport(data);
      setLatexExportResult(result);
    } catch (err) {
      setLatexExportError('Не вдалося експортувати в LaTeX');
      console.error('Error exporting LaTeX:', err);
    } finally {
      setIsLoadingLatexExport(false);
    }
  }, []);

  const getReproducibilityReport = useCallback(async (data?: ReproducibilityReportRequest) => {
    try {
      setIsLoadingReproducibilityReport(true);
      setReproducibilityReportError(null);
      const result = await postReproducibilityReport(data);
      setReproducibilityReportResult(result);
    } catch (err) {
      setReproducibilityReportError('Не вдалося отримати звіт про відтворюваність');
      console.error('Error getting reproducibility report:', err);
    } finally {
      setIsLoadingReproducibilityReport(false);
    }
  }, []);

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

  const value = {
    models,
    isLoadingModels,
    modelsError,
    predictions,
    isLoadingPredictions,
    predictionsError,
    getPredictions,
    extendedConditions,
    setExtendedConditions,
    clearExtendedConditions,
    isConditionsEditMode,
    setConditionsEditMode,
    evaluations,
    isLoadingEvaluation,
    evaluationError,
    getEvaluation,
    interpretations,
    isLoadingInterpretation,
    interpretationError,
    getInterpretation,
    clearPredictions,
    simulationResult,
    isLoadingSimulation,
    simulationError,
    runSimulation,
    clearSimulation,
    historicalData,
    isLoadingHistorical,
    historicalError,
    getHistorical,
    featuresCache,
    isLoadingFeatures,
    featuresError,
    getFeatures,
    patternsData,
    isLoadingPatterns,
    patternsError,
    getPatterns,
    anomaliesData,
    isLoadingAnomalies,
    anomaliesError,
    getAnomalies,
    peaksData,
    isLoadingPeaks,
    peaksError,
    getPeaks,
    decompositionData,
    isLoadingDecomposition,
    decompositionError,
    getDecomposition,
    compareResult,
    isLoadingCompare,
    compareError,
    compareScenarios,
    clearCompare,
    // Scientific Analysis
    statisticalTestsResult,
    isLoadingStatisticalTests,
    statisticalTestsError,
    runStatisticalTests,
    residualAnalysisResult,
    isLoadingResidualAnalysis,
    residualAnalysisError,
    runResidualAnalysis,
    errorAnalysisResult,
    isLoadingErrorAnalysis,
    errorAnalysisError,
    runErrorAnalysis,
    visualizationResult,
    isLoadingVisualization,
    visualizationError,
    generateVisualization,
    latexExportResult,
    isLoadingLatexExport,
    latexExportError,
    exportLatex,
    reproducibilityReportResult,
    isLoadingReproducibilityReport,
    reproducibilityReportError,
    getReproducibilityReport,
    modelDiagnosticsResult,
    isLoadingModelDiagnostics,
    modelDiagnosticsError,
    getModelDiagnostics
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export { ApiProvider };
