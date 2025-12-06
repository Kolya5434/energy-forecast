import type { IEvaluationApiResponse } from './api';

// Scientific Analysis API Types

// Statistical Tests
export interface StatisticalTestRequest {
  model_ids: string[];
  test_size_days: number;
}

export interface PairwiseTest {
  t_test: {
    statistic: number;
    p_value: number;
    significant: boolean;
  };
  wilcoxon_test: {
    statistic: number;
    p_value: number;
    significant: boolean;
  };
  effect_size: {
    cohens_d: number;
    interpretation: 'negligible' | 'small' | 'medium' | 'large';
  };
  mean_error_diff: number;
  better_model: string;
}

export interface StatisticalTestResponse {
  num_models: number;
  sample_size: number;
  pairwise_tests: Record<string, PairwiseTest>;
  friedman_test?: {
    statistic: number;
    p_value: number;
    significant: boolean;
    interpretation: string;
  };
}

// Residual Analysis
export interface ResidualAnalysisRequest {
  model_id: string;
  test_size_days: number;
  include_plots: boolean;
}

export interface ResidualAnalysisResponse {
  model_id: string;
  basic_statistics: {
    mean: number;
    std: number;
    min: number;
    max: number;
    median: number;
    q25: number;
    q75: number;
    iqr: number;
  };
  normality: {
    shapiro_wilk: {
      statistic: number;
      p_value: number;
      is_normal: boolean;
    };
    kolmogorov_smirnov: {
      statistic: number;
      p_value: number;
      is_normal: boolean;
    };
    skewness: number;
    kurtosis: number;
  };
  autocorrelation: Record<string, number | null>;
  heteroscedasticity: {
    bin_variances: number[];
    variance_ratio: number | null;
    is_homoscedastic: boolean | null;
  };
  percentiles: Record<string, number>;
  plots?: Record<string, string>; // base64 images
}

// Error Analysis
export interface ErrorAnalysisRequest {
  model_id: string;
  test_size_days: number;
  include_temporal: boolean;
  include_plots: boolean;
}

export interface ErrorAnalysisResponse {
  model_id: string;
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
    r2: number;
  };
  error_distribution: {
    histogram: Record<string, number>;
    bin_edges: number[];
  };
  temporal_patterns?: {
    hourly?: Record<string, { mean_error: number; std_error: number }>;
    daily?: Record<string, { mean_error: number; std_error?: number }>;
    monthly?: Record<string, { mean_error: number; std_error?: number }>;
  };
  large_errors?: Array<{
    timestamp: string;
    actual: number;
    predicted: number;
    error: number;
  }>;
  plots?: Record<string, string>;
}

// Visualization
export type VisualizationType =
  | 'residuals'
  | 'error_distribution'
  | 'comparison'
  | 'forecast'
  | 'temporal_error'
  | 'feature_importance'
  | 'correlation';

export interface VisualizationRequest {
  visualization_type: VisualizationType;
  model_ids?: string[];
  test_size_days: number;
  parameters?: Record<string, unknown>;
}

export interface VisualizationResponse {
  visualization_type: string;
  image_base64: string;
  format: 'png';
  metadata?: Record<string, unknown>;
}

// LaTeX Export
export type LaTeXExportType = 'metrics_table' | 'statistical_tests' | 'feature_importance' | 'full_document';

export interface LaTeXExportRequest {
  export_type: LaTeXExportType;
  model_ids?: string[];
  include_methodology?: boolean;
  title?: string;
  author?: string;
  abstract?: string;
}

export interface LaTeXExportResponse {
  export_type: string;
  latex_code: string;
  bibliography?: string;
  compilation_instructions?: string;
}

// Reproducibility Report
export interface ReproducibilityReportRequest {
  include_git?: boolean;
  include_system?: boolean;
  include_packages?: boolean;
  format?: 'json' | 'markdown';
}

export interface ReproducibilityReportResponse {
  metadata: {
    report_type: string;
    generated_at: string;
  };
  system_information: {
    platform: Record<string, string>;
    python: Record<string, string>;
    hardware: Record<string, string | number>;
  };
  software_environment: {
    package_versions: Record<string, string>;
    git_information?: Record<string, string>;
  };
  reproducibility_instructions: Record<string, string>;
  markdown_report?: string;
  json_report?: Record<string, unknown>;
}

// Model Diagnostics
export interface ModelDiagnosticsResponse {
  model_id: string;
  test_size_days: number;
  residual_analysis: ResidualAnalysisResponse;
  error_analysis: ErrorAnalysisResponse;
  evaluation: IEvaluationApiResponse;
}
