export type ChartType =
  | 'line'
  | 'bar'
  | 'area'
  | 'composed'
  | 'scatter'
  | 'radar'
  | 'stacked-bar'
  | 'stacked-area'
  | 'step'
  | 'smooth-line'
  | 'vertical-bar'
  | 'heatmap';

export interface IChartDataPoint {
  date: string;
  [modelId: string]: string | number;
}
export type View = 'forecast' | 'interpretation' | 'shap_force_plot';

export type ExportTypes = 'xlsx' | 'docx' | 'pdf';

export interface IChartTypes {
  value: ChartType;
  label: string;
}

export interface ISelectOption {
  value: number | string;
  label: string;
}

export type ViewMode = 'chart' | 'table';
