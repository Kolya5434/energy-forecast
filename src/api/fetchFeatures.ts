import axiosInstance from '@/config/axios.ts';
import type { IFeaturesResponse } from '@/types/api';

export const fetchFeatures = async (modelId: string): Promise<IFeaturesResponse> => {
  const response = await axiosInstance.get(`/api/features/${modelId}`);
  return response.data;
};
