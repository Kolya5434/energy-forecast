import axiosInstance from '@/config/axios.ts';
import type { IDecompositionRequest, IDecompositionResponse } from '@/types/api';

export const fetchDecomposition = async (params?: IDecompositionRequest): Promise<IDecompositionResponse> => {
  const response = await axiosInstance.get('/api/decomposition', { params });
  return response.data;
};
