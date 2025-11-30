import axiosInstance from '../../config/axios';
import type { VisualizationRequest, VisualizationResponse } from '../../types/scientific';

export const postVisualization = async (data: VisualizationRequest): Promise<VisualizationResponse> => {
  const response = await axiosInstance.post('/api/scientific/visualize', data);
  return response.data;
};
