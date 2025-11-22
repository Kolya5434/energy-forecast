import axiosInstance from '../config/axios.ts';
import type { IHistoricalRequest, IHistoricalResponse } from '../types/api';

export const fetchHistorical = async (params?: IHistoricalRequest): Promise<IHistoricalResponse> => {
  const response = await axiosInstance.get('/api/historical', { params });
  return response.data;
};
