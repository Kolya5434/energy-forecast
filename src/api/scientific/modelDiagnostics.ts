import axiosInstance from '@/config/axios';
import type { ModelDiagnosticsResponse } from '@/types/scientific';

export const fetchModelDiagnostics = async (
  modelId: string,
  testSizeDays: number = 30
): Promise<ModelDiagnosticsResponse> => {
  const response = await axiosInstance.get(`/api/scientific/model-diagnostics/${modelId}`, {
    params: { test_size_days: testSizeDays }
  });
  return response.data;
};
