import axiosInstance from '@/config/axios';
import type { StatisticalTestRequest, StatisticalTestResponse } from '@/types/scientific';

export const postStatisticalTests = async (data: StatisticalTestRequest): Promise<StatisticalTestResponse> => {
  const response = await axiosInstance.post('/api/scientific/statistical-tests', data);
  return response.data;
};
