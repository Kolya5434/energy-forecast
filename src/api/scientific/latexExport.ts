import axiosInstance from '../../config/axios';
import type { LaTeXExportRequest, LaTeXExportResponse } from '../../types/scientific';

export const postLatexExport = async (data: LaTeXExportRequest): Promise<LaTeXExportResponse> => {
  const response = await axiosInstance.post('/api/scientific/latex-export', data);
  return response.data;
};
