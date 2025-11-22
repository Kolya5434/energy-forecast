import axiosInstance from '../config/axios.ts';
import type { IPeaksRequest, IPeaksResponse } from '../types/api';

export const fetchPeaks = async (params?: IPeaksRequest): Promise<IPeaksResponse> => {
  const response = await axiosInstance.get('/api/peaks', { params });
  return response.data;
};
