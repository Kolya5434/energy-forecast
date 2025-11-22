import axiosInstance from '../config/axios.ts';
import type { ICompareRequest, ICompareResponse } from '../types/api';

export const postCompare = async (data: ICompareRequest): Promise<ICompareResponse> => {
  const response = await axiosInstance.post('/api/compare', data);
  return response.data;
};
