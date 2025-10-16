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
  };
  performance_metrics: {
    avg_latency_ms: number;
    memory_increment_mb: number;
  };
}

export interface IInterpretationApiResponse {
  model_id: string;
  feature_importance: {
    [feature: string]: number;
  };
}

export interface IShapInterpretationResponse {
  base_value: number;
  prediction_value: number;
  feature_contributions: {
    [feature: string]: number;
  };
}
