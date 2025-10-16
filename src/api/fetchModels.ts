import axiosInstance from '../config/axios.ts';
import type { ModelsApiResponse } from '../types/api';

export const fetchModels = async (): Promise<ModelsApiResponse> => {
  const response = await axiosInstance.get('/api/models');
  return response.data;
};
