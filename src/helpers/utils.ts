import type { IInterpretationApiResponse, IShapInterpretationResponse } from '../types/api.ts';
import type { ExportTypes } from '../types/shared.ts';

export const getHeatmapColor = (value: number, min: number, max: number) => {
  const normalized = (value - min) / (max - min);
  const hue = (1 - normalized) * 240; // Blue (240) to Red (0)
  return `hsl(${hue}, 70%, 50%)`;
};

export function isFeatureImportanceResponse(
  data: IInterpretationApiResponse | IShapInterpretationResponse | undefined
): data is IInterpretationApiResponse {
  return (
    !!data && typeof data === 'object' && 'feature_importance' in data && typeof data.feature_importance === 'object'
  );
}

export const handleExport = (format: ExportTypes) => {
  alert(`Експорт у формат ${format} буде реалізовано.`);
};