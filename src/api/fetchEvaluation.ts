import axiosInstance from '@/config/axios.ts';
import type { IEvaluationApiResponse } from '@/types/api.ts';

export const fetchEvaluation = async (modelId: string): Promise<IEvaluationApiResponse> => {
  const response = await axiosInstance.get(`/api/evaluation/${modelId}`);
  
  response.data.accuracy_metrics.R2 = response.data.accuracy_metrics['R²'];
  delete response.data.accuracy_metrics['R²'];
  
  return response.data;
};
