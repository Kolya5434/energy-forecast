import axiosInstance from '@/config/axios';
import type { ErrorAnalysisRequest, ErrorAnalysisResponse } from '@/types/scientific';

export const postErrorAnalysis = async (data: ErrorAnalysisRequest): Promise<ErrorAnalysisResponse> => {
  const response = await axiosInstance.post('/api/scientific/error-analysis', data);
  return response.data;
};
