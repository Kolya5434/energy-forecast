import type { IInterpretationApiResponse, IShapInterpretationResponse } from '../types/api.ts';
import axiosInstance from '../config/axios.ts';

export const fetchInterpretation = async (modelId: string): Promise<IInterpretationApiResponse | IShapInterpretationResponse> => {
  const response = await axiosInstance.get(`/api/interpret/${modelId}`);
  return response.data;
};