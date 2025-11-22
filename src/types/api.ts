export interface IModelInfo {
  type: 'classical' | 'ml' | 'dl' | 'ensemble';
  granularity: 'daily' | 'hourly';
  feature_set: 'none' | 'simple' | 'full' | 'base_scaled';
  description: string;
  supports_conditions: boolean;
  supports_simulation: boolean;
  avg_latency_ms: number | null;
  memory_increment_mb: number | null;
}

export type ModelsApiResponse = Record<string, IModelInfo>;

// Condition interfaces (shared between prediction and simulation)
export interface IWeatherConditions {
  temperature?: number;      // °C
  humidity?: number;         // 0-100
  wind_speed?: number;       // м/с, ≥0
}

export interface ICalendarConditions {
  is_holiday?: boolean;
  is_weekend?: boolean;
}

export interface ITimeScenario {
  hour?: number;             // 0-23
  day_of_week?: number;      // 0-6 (0=Пн)
  day_of_month?: number;     // 1-31
  day_of_year?: number;      // 1-366
  week_of_year?: number;     // 1-53
  month?: number;            // 1-12
  year?: number;             // ≥2000
  quarter?: number;          // 1-4
}

export interface IEnergyConditions {
  voltage?: number;                // V, ≥0
  global_reactive_power?: number;  // ≥0
  global_intensity?: number;       // A, ≥0
}

export interface IZoneConsumption {
  sub_metering_1?: number;   // Кухня (Wh), ≥0
  sub_metering_2?: number;   // Пральня (Wh), ≥0
  sub_metering_3?: number;   // Клімат (Wh), ≥0
}

// Lag overrides for prediction/simulation
export interface ILagOverrides {
  lag_1?: number;     // Споживання 1 год тому (kW)
  lag_2?: number;     // Споживання 2 год тому
  lag_3?: number;     // Споживання 3 год тому
  lag_24?: number;    // Споживання добу тому
  lag_48?: number;    // Споживання 2 доби тому
  lag_168?: number;   // Споживання тиждень тому
}

// Volatility scenario for prediction/simulation
export interface IVolatilityScenario {
  roll_mean_3?: number;    // Середнє за 3 год
  roll_std_3?: number;     // Волатильність за 3 год
  roll_mean_24?: number;   // Середнє за добу
  roll_std_24?: number;    // Волатильність за добу
  roll_mean_168?: number;  // Середнє за тиждень
  roll_std_168?: number;   // Волатильність за тиждень
}

// Extended conditions for prediction/simulation
export interface IExtendedConditions {
  weather?: IWeatherConditions;
  calendar?: ICalendarConditions;
  time_scenario?: ITimeScenario;
  energy?: IEnergyConditions;
  zone_consumption?: IZoneConsumption;
  lag_overrides?: ILagOverrides;
  volatility?: IVolatilityScenario;
  is_anomaly?: boolean;
}

export interface IPredictionRequest extends IExtendedConditions {
  model_ids: string[];
  forecast_horizon: number;
  include_confidence?: boolean;  // для майбутнього
  include_patterns?: boolean;    // для майбутнього
}

export interface IConditionsApplied extends IExtendedConditions {
  feature_overrides?: IFeatureOverride[];
}

export interface IPredictionResponse {
  model_id: string;
  forecast: {
    [date: string]: number;
  };
  metadata: {
    latency_ms: number;
    error?: string;
    conditions_applied?: IConditionsApplied;
    simulated?: boolean;
  };
}

interface IResidualOverTime {
  date: string;
  residual: number;
}

interface IMonthlyErrorStats {
  month: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

interface IScatterData {
  actual: number;
  predicted: number;
}

export interface IEvaluationApiResponse {
  model_id: string;
  accuracy_metrics: {
    MAE: number;
    RMSE: number;
    R2: number;
    'Explained Variance': number;
    'MAPE (%)': number | null;
  };
  performance_metrics: {
    avg_latency_ms: number;
    memory_increment_mb: number;
  };
  error_analysis?: {
    residuals_over_time: IResidualOverTime[];
    monthly_errors: IMonthlyErrorStats[];
    scatter_data: IScatterData[];
  };
}

export interface IInterpretationApiResponse {
  feature_importance: {
    [feature: string]: number;
  };
}

interface ShapData {
  base_value: number;
  prediction_value: number;
  feature_contributions: Record<string, number>;
}

export interface IShapInterpretationResponse {
  base_value: number;
  prediction_value: number;
  feature_contributions: {
    [feature: string]: number;
  };
  shap_values: ShapData
}

export interface IFeatureOverride {
  date: string;
  features: {
    [featureName: string]: number;
  };
}

export interface ISimulationRequest {
  model_id: string;
  forecast_horizon: number;
  feature_overrides?: IFeatureOverride[];
  weather?: IWeatherConditions;
  calendar?: ICalendarConditions;
  time_scenario?: ITimeScenario;
  energy?: IEnergyConditions;
  zone_consumption?: IZoneConsumption;
  lag_overrides?: ILagOverrides;
  volatility?: IVolatilityScenario;
  is_anomaly?: boolean;
}
export interface SimulationChartData {
  date: string;
  baseForecast?: number;
  simulatedForecast?: number;
}

// Historical API types
export interface IHistoricalRequest {
  days?: number;           // 1-365, default 30
  granularity?: 'daily' | 'hourly';
  include_stats?: boolean;
}

export interface IHistoricalResponse {
  granularity: 'daily' | 'hourly';
  period_days: number;
  data_points: number;
  date_range: {
    start: string;
    end: string;
  };
  values: Record<string, number>;
  statistics?: {
    min: number;
    max: number;
    mean: number;
    std: number;
    median: number;
  };
}

// Features API types
export interface IAvailableConditions {
  weather?: string[];
  calendar?: string[];
  time?: string[];
  energy?: string[];
  zone_consumption?: string[];
  anomaly?: string[];
}

export interface IFeaturesResponse {
  model_id: string;
  type: string;
  granularity: string;
  feature_set: string;
  supports_conditions: boolean;
  feature_names?: string[];
  feature_count?: number;
  available_conditions?: IAvailableConditions;
  note?: string;
}

// ============================================
// Patterns API types
// ============================================
export type PatternPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface IPatternsRequest {
  period?: PatternPeriod;
}

export interface IPatternStats {
  mean: number;
  std: number;
  min: number;
  max: number;
}

export interface IPatternsResponse {
  period: PatternPeriod;
  pattern: Record<string, IPatternStats>;
  peak_hour?: number;
  off_peak_hour?: number;
  peak_to_offpeak_ratio?: number;
}

// ============================================
// Anomalies API types
// ============================================
export interface IAnomaliesRequest {
  threshold?: number;        // 1.5-3.0, default 2.0
  days?: number;             // default 30
  include_details?: boolean; // default true
}

export interface IAnomalyGroup {
  count: number;
  dates: string[];
  max_value?: number;
  min_value?: number;
}

export interface IAnomaliesResponse {
  threshold: number;
  anomaly_count: number;
  anomaly_percentage: number;
  high_anomalies: IAnomalyGroup;
  low_anomalies: IAnomalyGroup;
  anomalies_by_hour: Record<string, number>;
  anomalies_by_day: Record<string, number>;
}

// ============================================
// Peaks API types
// ============================================
export interface IPeaksRequest {
  top_n?: number;                        // default 10
  granularity?: 'hourly' | 'daily';
}

export interface IPeakValue {
  date: string;
  value: number;
}

export interface IPeakConsumption {
  top_peaks: IPeakValue[];
  max_value: number;
  max_date: string;
}

export interface ILowConsumption {
  top_lows: IPeakValue[];
  min_value: number;
  min_date: string;
}

export interface IPeakHours {
  morning_peak: number;
  evening_peak: number;
  off_peak: number;
}

export interface IPeaksResponse {
  peak_consumption: IPeakConsumption;
  low_consumption: ILowConsumption;
  peak_hours: IPeakHours;
  hourly_averages: Record<string, number>;
}

// ============================================
// Decomposition API types
// ============================================
export interface IDecompositionRequest {
  period?: number;  // 24 (добова), 168 (тижнева), 12, 48
}

export interface IDecompositionSummary {
  trend_strength: number;
  seasonal_strength: number;
  residual_std: number;
  seasonal_amplitude: number;
}

export interface IDecompositionResponse {
  period: number;
  period_description: string;
  components: {
    trend: Record<string, number>;
    seasonal: Record<string, number>;
    residual: Record<string, number>;
  };
  summary: IDecompositionSummary;
}

// ============================================
// Compare Scenarios API types
// ============================================
export interface IScenarioDefinition {
  name: string;
  weather?: IWeatherConditions;
  calendar?: ICalendarConditions;
  time_scenario?: ITimeScenario;
  energy?: IEnergyConditions;
  zone_consumption?: IZoneConsumption;
  lag_overrides?: ILagOverrides;
  volatility?: IVolatilityScenario;
  is_anomaly?: boolean;
}

export interface ICompareRequest {
  model_id: string;
  forecast_horizon: number;
  scenarios: IScenarioDefinition[];
}

export interface IScenarioResult {
  name: string;
  forecast: Record<string, number>;
  total_consumption: number;
  avg_daily: number;
  difference_from_baseline?: number;
  difference_percent?: number;
}

export interface ICompareResponse {
  model_id: string;
  baseline: IScenarioResult;
  scenarios: IScenarioResult[];
  metadata: {
    forecast_horizon: number;
    scenarios_count: number;
    latency_ms: number;
  };
}