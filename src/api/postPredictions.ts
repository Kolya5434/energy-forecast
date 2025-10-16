import axiosInstance from '../config/axios.ts';
import type { IPredictionRequest, IPredictionResponse } from '../types/api.ts';

export const postPredictions = async (data: IPredictionRequest): Promise<IPredictionResponse[]> => {
  const response = await axiosInstance.post('/api/predict', data);
  return response.data;
};
