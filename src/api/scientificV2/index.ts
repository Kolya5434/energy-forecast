import axiosInstance from '@/config/axios.ts';
import type {
  AblationStudyRequest,
  AblationStudyResponse,
  BenchmarkResponse,
  DriftAnalysisRequest,
  DriftAnalysisResponse,
  DriftStatusResponse,
  EnsembleAnalysisRequest,
  EnsembleAnalysisResponse,
  ExplainabilityRequest,
  ExplainabilityResponse,
  FeatureAnalysisRequest,
  FeatureAnalysisResponse,
  FeatureSelectionResponse,
  ForecastingStrategyRequest,
  ForecastingStrategyResponse,
  HorizonAnalysisRequest,
  HorizonAnalysisResponse,
  LiveMetricsResponse,
  PartialDependenceResponse,
  ProbabilisticForecastRequest,
  ProbabilisticForecastResponse,
  ScalabilityTestRequest,
  ScalabilityTestResponse,
  TransferAnalysisRequest,
  TransferAnalysisResponse,
  UncertaintyRequest,
  UncertaintyResponse
} from '@/types/scientificV2';

// 1. Uncertainty Quantification
export const postUncertainty = async (data: UncertaintyRequest): Promise<UncertaintyResponse> => {
  const response = await axiosInstance.post('/api/scientific/uncertainty', data);
  return response.data;
};

// 2. Ensemble Analysis
export const postEnsembleAnalysis = async (data: EnsembleAnalysisRequest): Promise<EnsembleAnalysisResponse> => {
  const response = await axiosInstance.post('/api/scientific/ensemble-analysis', data);
  return response.data;
};

// 3. Drift Detection
export const fetchDriftStatus = async (): Promise<DriftStatusResponse> => {
  const response = await axiosInstance.get('/api/scientific/drift-detection');
  return response.data;
};

export const postDriftAnalysis = async (data: DriftAnalysisRequest): Promise<DriftAnalysisResponse> => {
  const response = await axiosInstance.post('/api/scientific/drift-analysis', data);
  return response.data;
};

// 4. Explainability (XAI)
export const postExplainability = async (data: ExplainabilityRequest): Promise<ExplainabilityResponse> => {
  const response = await axiosInstance.post('/api/scientific/explainability', data);
  return response.data;
};

export const fetchPartialDependence = async (
  modelId: string,
  feature: string,
  nPoints: number = 50
): Promise<PartialDependenceResponse> => {
  const response = await axiosInstance.get(`/api/scientific/partial-dependence/${modelId}`, {
    params: { feature, n_points: nPoints }
  });
  return response.data;
};

// 5. Horizon Analysis
export const postHorizonAnalysis = async (data: HorizonAnalysisRequest): Promise<HorizonAnalysisResponse> => {
  const response = await axiosInstance.post('/api/scientific/horizon-analysis', data);
  return response.data;
};

// 6. Forecasting Strategy
export const postForecastingStrategy = async (data: ForecastingStrategyRequest): Promise<ForecastingStrategyResponse> => {
  const response = await axiosInstance.post('/api/scientific/forecasting-strategy', data);
  return response.data;
};

// 7. Feature Analysis
export const postFeatureAnalysis = async (data: FeatureAnalysisRequest): Promise<FeatureAnalysisResponse> => {
  const response = await axiosInstance.post('/api/scientific/feature-analysis', data);
  return response.data;
};

export const fetchFeatureSelection = async (
  modelId: string,
  method: string = 'importance',
  topN: number = 15
): Promise<FeatureSelectionResponse> => {
  const response = await axiosInstance.get(`/api/scientific/feature-selection/${modelId}`, {
    params: { method, top_n: topN }
  });
  return response.data;
};

// 8. Benchmark
export const fetchBenchmark = async (): Promise<BenchmarkResponse> => {
  const response = await axiosInstance.get('/api/scientific/benchmark');
  return response.data;
};

export const postScalabilityTest = async (data: ScalabilityTestRequest): Promise<ScalabilityTestResponse> => {
  const response = await axiosInstance.post('/api/scientific/scalability-test', data);
  return response.data;
};

// 9. Probabilistic Forecast
export const postProbabilisticForecast = async (data: ProbabilisticForecastRequest): Promise<ProbabilisticForecastResponse> => {
  const response = await axiosInstance.post('/api/scientific/probabilistic-forecast', data);
  return response.data;
};

// 10. Transfer Analysis
export const postTransferAnalysis = async (data: TransferAnalysisRequest): Promise<TransferAnalysisResponse> => {
  const response = await axiosInstance.post('/api/scientific/transfer-analysis', data);
  return response.data;
};

// 11. Ablation Study
export const postAblationStudy = async (data: AblationStudyRequest): Promise<AblationStudyResponse> => {
  const response = await axiosInstance.post('/api/scientific/ablation-study', data);
  return response.data;
};

// 12. Live Metrics
export const fetchLiveMetrics = async (): Promise<LiveMetricsResponse> => {
  const response = await axiosInstance.get('/api/scientific/live-metrics');
  return response.data;
};

// WebSocket URL for metrics stream
export const getMetricsStreamUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_ENDPOINT || '';
  const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
  const wsUrl = baseUrl.replace(/^https?/, wsProtocol);
  return `${wsUrl}/api/scientific/ws/metrics-stream`;
};