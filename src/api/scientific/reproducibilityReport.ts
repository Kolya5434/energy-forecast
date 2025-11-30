import axiosInstance from '../../config/axios';
import type { ReproducibilityReportRequest, ReproducibilityReportResponse } from '../../types/scientific';

export const postReproducibilityReport = async (
  data?: ReproducibilityReportRequest
): Promise<ReproducibilityReportResponse> => {
  const response = await axiosInstance.post('/api/scientific/reproducibility-report', data || {});
  return response.data;
};
