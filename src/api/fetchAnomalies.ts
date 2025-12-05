import axiosInstance from '@/config/axios.ts';
import type { IAnomaliesRequest, IAnomaliesResponse } from '@/types/api';

export const fetchAnomalies = async (params?: IAnomaliesRequest): Promise<IAnomaliesResponse> => {
  const response = await axiosInstance.get('/api/anomalies', { params });
  return response.data;
};
