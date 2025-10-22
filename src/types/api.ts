export interface IModelInfo {
  description: string;
  type: 'classical' | 'ml' | 'dl' | 'ensemble';
}

export type ModelsApiResponse = Record<string, IModelInfo>;

export interface IPredictionRequest {
  model_ids: string[];
  forecast_horizon: number;
}

export interface IPredictionResponse {
  model_id: string;
  forecast: {
    [date: string]: number;
  };
  metadata: {
    latency_ms: number;
  };
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
  interpretation?: {
    feature_importance: {
      [feature: string]: number;
    };
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
