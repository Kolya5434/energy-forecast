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
