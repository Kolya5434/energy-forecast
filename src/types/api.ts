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

// Extended conditions for prediction/simulation
export interface IExtendedConditions {
  weather?: IWeatherConditions;
  calendar?: ICalendarConditions;
  time_scenario?: ITimeScenario;
  energy?: IEnergyConditions;
  zone_consumption?: IZoneConsumption;
  is_anomaly?: boolean;
}

export interface IPredictionRequest extends IExtendedConditions {
  model_ids: string[];
  forecast_horizon: number;
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