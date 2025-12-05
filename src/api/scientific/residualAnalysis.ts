import axiosInstance from '@/config/axios';
import type { ResidualAnalysisRequest, ResidualAnalysisResponse } from '@/types/scientific';

export const postResidualAnalysis = async (data: ResidualAnalysisRequest): Promise<ResidualAnalysisResponse> => {
  const response = await axiosInstance.post('/api/scientific/residual-analysis', data);
  return response.data;
};
