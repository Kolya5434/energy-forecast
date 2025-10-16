import axiosInstance from '../config/axios.ts';
import type { IEvaluationApiResponse } from '../types/api.ts';

export const fetchEvaluation = async (modelId: string): Promise<IEvaluationApiResponse> => {
  const response = await axiosInstance.get(`/api/evaluation/${modelId}`);
  return response.data;
};
