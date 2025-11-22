import axiosInstance from '../config/axios.ts';
import type { IPatternsRequest, IPatternsResponse } from '../types/api';

export const fetchPatterns = async (params?: IPatternsRequest): Promise<IPatternsResponse> => {
  const response = await axiosInstance.get('/api/patterns', { params });
  return response.data;
};
