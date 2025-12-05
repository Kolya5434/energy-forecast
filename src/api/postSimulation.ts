import axiosInstance from '@/config/axios';
import type { ISimulationRequest, IPredictionResponse } from '@/types/api';

export const postSimulation = async (data: ISimulationRequest): Promise<IPredictionResponse> => {
  const response = await axiosInstance.post('/api/simulate', data);
  return response.data;
};