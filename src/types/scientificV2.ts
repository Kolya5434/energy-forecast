// Scientific Analysis V2 API Types
// Based on new scientific endpoints

// Common metrics interface
interface ModelMetrics {
  mae: number;
  mse: number;
  rmse: number;
  mape: number;
  r2: number;
}

// ============================================
// 1. Uncertainty Quantification
// ============================================
export interface UncertaintyRequest {
  model_ids: string[];
  forecast_horizon?: number; // default: 7, range: 1-30
  n_bootstrap?: number; // default: 100, range: 10-500
  confidence_levels?: number[]; // default: [0.90, 0.95]
  method?: 'bootstrap' | 'conformal' | 'bayesian'; // default: "bootstrap"
}

interface UncertaintyModelResult {
  point_forecast: number[];
  residual_std: number;
  residual_mean: number;
  metrics: ModelMetrics;
}

export interface UncertaintyResponse {
  model_results: Record<string, UncertaintyModelResult | { error: string }>;
  calibration_metrics: Record<string, number>;
  prediction_intervals: Record<string, Record<string, { lower: number[]; upper: number[] }>>;
  metadata: {
    method: string;
    n_bootstrap: number;
    confidence_levels: number[];
    forecast_horizon: number;
    generated_at: string;
  };
}

// ============================================
// 2. Ensemble Analysis
// ============================================
export interface EnsembleAnalysisRequest {
  model_ids: string[]; // min 2 models
  test_size_days?: number; // default: 30, min: 7
  compute_optimal_weights?: boolean; // default: true
}

export interface EnsembleAnalysisResponse {
  diversity_metrics: {
    average_correlation: number;
    disagreement_measure: number;
    q_statistics: Record<string, number>;
    correlation_matrix: Record<string, Record<string, number>>;
  };
  optimal_weights: Record<string, number> | null;
  ensemble_performance: ModelMetrics & {
    simple_average: ModelMetrics;
  };
  individual_performance: Record<string, ModelMetrics>;
  stability_analysis: {
    prediction_std: Record<string, number>;
    cv: Record<string, number>;
  };
  metadata: {
    n_models: number;
    test_size_days: number;
    data_points: number;
    generated_at: string;
  };
}

// ============================================
// 3. Drift Detection
// ============================================
export interface DriftStatusResponse {
  models: Record<
    string,
    | {
        current_mae: number;
        previous_mae: number;
        change_percent: number;
        drift_detected: boolean;
        status: 'ok' | 'warning';
      }
    | { error: string }
  >;
  timestamp: string;
}

export interface DriftAnalysisRequest {
  model_id: string;
  window_size?: number; // default: 30, min: 7
  method?: 'adwin' | 'ddm' | 'page_hinkley'; // default: "adwin"
  sensitivity?: number; // default: 0.01, range: 0.001-0.1
}

interface DriftPoint {
  index: number;
  timestamp: string | null;
  severity: number;
  mean_before?: number;
  mean_after?: number;
  p_value?: number;
  s_value?: number;
  cumsum?: number;
}

export interface DriftAnalysisResponse {
  model_id: string;
  drift_detected: boolean;
  drift_points: DriftPoint[];
  performance_over_time: {
    windows: Array<{
      start_index: number;
      end_index: number;
      start_date: string | null;
      mae: number;
      mse: number;
      rmse: number;
      mape: number;
      r2: number;
    }>;
    overall_trend: 'degrading' | 'stable';
  };
  alert_status: 'ok' | 'info' | 'warning' | 'critical';
  recommendations: string[];
  metadata: {
    method: string;
    window_size: number;
    sensitivity: number;
    data_points_analyzed: number;
    generated_at: string;
  };
}

// ============================================
// 4. Explainability (XAI)
// ============================================
export interface ExplainabilityRequest {
  model_id: string;
  analysis_types?: ('pdp' | 'ice' | 'ale')[]; // default: ["pdp", "ice", "ale"]
  features?: string[] | null; // null = top 10 by importance
  n_samples?: number; // default: 100, range: 10-500
}

export interface ExplainabilityResponse {
  model_id: string;
  pdp_results?: Record<string, { feature_values: number[]; partial_dependence: number[] }>;
  ice_results?: Record<string, { feature_values: number[]; ice_curves: number[][] }>;
  ale_results?: Record<string, { feature_values: number[]; ale_values: number[] }>;
  feature_interactions?: Record<
    string,
    {
      correlation: number;
      interaction_strength: 'low' | 'medium' | 'high';
    }
  >;
  plots?: { pdp?: string }; // base64 PNG
  metadata: {
    n_samples: number;
    features_analyzed: string[];
    analysis_types: string[];
    generated_at: string;
  };
}

export interface PartialDependenceResponse {
  model_id: string;
  feature: string;
  feature_values: number[];
  partial_dependence: number[];
  feature_stats: {
    min: number;
    max: number;
    mean: number;
    std: number;
  };
}

// ============================================
// 5. Horizon Analysis
// ============================================
export interface HorizonAnalysisRequest {
  model_ids: string[];
  max_horizon?: number; // default: 30, range: 7-90
  step?: number; // default: 1, min: 1
  include_skill_scores?: boolean; // default: true
}

export interface HorizonModelResult {
  horizon_metrics: Array<{
    horizon: number;
    mae: number;
    mse: number;
    rmse: number;
    mape: number;
    r2: number;
  }>;
  mae_by_horizon: number[];
  rmse_by_horizon: number[];
  horizons: number[];
}

export interface HorizonAnalysisResponse {
  model_results: Record<string, HorizonModelResult | { error: string }>;
  optimal_horizons: Record<string, number>;
  skill_scores?: Record<
    string,
    {
      vs_persistence: number;
      model_mse: number;
      persistence_mse: number;
    }
  >;
  degradation_rates: Record<string, number>;
  recommendations: Record<string, string>;
  plots?: { degradation?: string }; // base64 PNG
  metadata: {
    max_horizon: number;
    step: number;
    models_analyzed: number;
    generated_at: string;
  };
}

// ============================================
// 6. Forecasting Strategy
// ============================================
export interface ForecastingStrategyRequest {
  model_id: string;
  forecast_horizon?: number; // default: 7, range: 1-30
  strategies?: ('recursive' | 'direct' | 'mimo')[]; // default: all
}

export interface ForecastingStrategyResponse {
  model_id: string;
  strategy_results: Record<
    string,
    {
      final_mae: number;
      error_growth_rate: number;
      cumulative_error: number;
      description: string;
    }
  >;
  error_accumulation: Record<string, number[]>;
  best_strategy: string;
  recommendations: string;
  plots?: { comparison?: string }; // base64 PNG
  metadata: {
    forecast_horizon: number;
    strategies_compared: string[];
    generated_at: string;
  };
}

// ============================================
// 7. Feature Analysis
// ============================================
export interface FeatureAnalysisRequest {
  model_id: string;
  analysis_types?: ('rfe' | 'mutual_info' | 'permutation' | 'correlation' | 'vif')[];
  n_features_to_select?: number; // default: 15, range: 5-50
}

export interface FeatureAnalysisResponse {
  model_id: string;
  rfe_results?: {
    ranking: Record<string, number>;
    selected_features: string[];
  };
  mutual_info_scores?: Record<string, number>;
  permutation_importance?: Record<string, number>;
  correlation_analysis?: {
    target_correlation: Record<string, number>;
    high_correlation_pairs: Array<{
      feature1: string;
      feature2: string;
      correlation: number;
    }>;
  };
  vif_scores?: Record<string, number> | { error: string };
  recommended_features: string[];
  plots?: { importance?: string }; // base64 PNG
  metadata: {
    n_features_total: number;
    n_features_selected: number;
    analysis_types: string[];
    generated_at: string;
  };
}

export interface FeatureSelectionResponse {
  model_id: string;
  method: string;
  selected_features: Array<{ feature: string; importance: number }>;
  total_features: number;
}

// ============================================
// 8. Benchmark
// ============================================
export interface BenchmarkResponse {
  inference_times: Record<
    string,
    {
      avg_ms: number;
      horizon_1: number;
      horizon_7: number;
      horizon_30: number;
    }
  >;
  memory_usage?: Record<string, number>; // MB
  scalability: Record<
    string,
    {
      '100_samples': number;
      '1000_samples': number;
      '10000_samples': number;
      complexity: string; // "O(n)", "O(n log n)", "O(n^2)"
    }
  >;
  pareto_frontier: Array<{
    model_id: string;
    inference_time_ms: number;
    mae: number;
    is_pareto_optimal: boolean;
  }>;
  recommendations: Record<string, string>;
  plots?: { pareto?: string }; // base64 PNG
  metadata: { n_models: number; generated_at: string };
}

export interface ScalabilityTestRequest {
  model_id: string;
  data_sizes?: number[]; // default: [100, 500, 1000, 5000, 10000]
}

export interface ScalabilityTestResponse {
  model_id: string;
  training_times: Record<number, number>; // ms
  inference_times: Record<number, number>; // ms
  memory_usage: Record<number, number>; // MB
  complexity_estimate: string;
  plots?: { scalability?: string }; // base64 PNG
  metadata: { data_sizes_tested: number[]; generated_at: string };
}

// ============================================
// 9. Probabilistic Forecast
// ============================================
export interface ProbabilisticForecastRequest {
  model_ids: string[];
  forecast_horizon?: number; // default: 7, range: 1-30
  quantiles?: number[]; // default: [0.10, 0.25, 0.50, 0.75, 0.90]
  include_crps?: boolean; // default: true
}

export interface ProbabilisticForecastResponse {
  model_results: Record<
    string,
    | {
        point_forecast: number[];
        forecast_dates: string[];
        metrics: ModelMetrics;
      }
    | { error: string }
  >;
  quantile_forecasts: Record<string, Record<string, number[]>>;
  crps_scores?: Record<string, number>;
  pinball_losses?: Record<string, Record<string, number>>;
  calibration_metrics?: Record<string, Record<string, { expected: number; observed: number }>>;
  plots?: { fan_chart?: string }; // base64 PNG
  metadata: {
    forecast_horizon: number;
    quantiles: number[];
    models_analyzed: number;
    generated_at: string;
  };
}

// ============================================
// 10. Transfer Analysis
// ============================================
export interface TransferAnalysisRequest {
  model_ids: string[];
  analysis_type?: 'seasonal' | 'temporal' | 'ood_detection'; // default: "seasonal"
  test_periods?: Array<{ start: string; end: string }> | null;
}

export interface TransferAnalysisResponse {
  model_results: Record<
    string,
    | {
        temporal_analysis?: Record<string, ModelMetrics>;
      }
    | { error: string }
  >;
  seasonal_performance?: Record<
    string,
    {
      winter?: ModelMetrics;
      spring?: ModelMetrics;
      summer?: ModelMetrics;
      autumn?: ModelMetrics;
    }
  >;
  generalization_scores: Record<string, number>; // 0-1, higher = better
  recommendations: Record<string, string>;
  plots?: { seasonal?: string }; // base64 PNG
  metadata: {
    analysis_type: string;
    models_analyzed: number;
    generated_at: string;
  };
}

// ============================================
// 11. Ablation Study
// ============================================
export interface AblationStudyRequest {
  model_id: string;
  ablation_type?: 'feature_groups' | 'components' | 'architecture';
  feature_groups?: Record<string, string[]> | null; // null = auto-detect
}

export interface AblationStudyResponse {
  model_id: string;
  baseline_performance: ModelMetrics;
  ablation_results: Record<
    string,
    {
      mae: number;
      rmse: number;
      mae_increase: number;
      mae_increase_pct: number;
      features_ablated: string[];
    }
  >;
  contribution_scores: Record<string, number>; // % impact
  critical_components: string[]; // groups with >10% impact
  redundant_components: string[]; // groups with <1% impact
  plots?: { ablation?: string }; // base64 PNG
  metadata: {
    ablation_type: string;
    feature_groups_tested: number;
    generated_at: string;
  };
}

// ============================================
// 12. Live Metrics
// ============================================
export interface LiveMetricsResponse {
  current_metrics: Record<string, ModelMetrics>;
  rolling_metrics: Record<
    string,
    {
      mae: number[];
      rmse: number[];
    }
  >;
  alerts: Array<{
    model_id: string;
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    timestamp: string;
  }>;
  system_health: {
    models_loaded: number;
    data_available: boolean;
    cache_status: string;
    api_status: string;
  };
  last_updated: string;
  metadata: { models_monitored: number; rolling_window: number };
}

export interface MetricsStreamMessage {
  timestamp: string;
  metrics: Record<string, ModelMetrics>;
  type: 'metrics_update';
}