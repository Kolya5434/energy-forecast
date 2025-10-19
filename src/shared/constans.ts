import type { IChartTypes } from '../types/shared.ts';

export const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
export const CHART_MARGIN = { top: 5, right: 30, left: 20, bottom: 5 };
export const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(30, 30, 30, 0.8)',
  border: 'none',
  borderRadius: '8px'
};

export const CHART_TYPES = [
  { value: 'line', label: 'Лінійна' },
  { value: 'smooth-line', label: 'Лінійна (згладжена)' },
  { value: 'step', label: 'Ступінчаста' },
  { value: 'area', label: 'Area' },
  { value: 'stacked-area', label: 'Area (стек)' },
  { value: 'bar', label: 'Стовпчаста' },
  { value: 'vertical-bar', label: 'Стовпчаста (горизонтальна)' },
  { value: 'stacked-bar', label: 'Стовпчаста (стек)' },
  { value: 'composed', label: 'Комбінована' },
  { value: 'scatter', label: 'Точкова' },
  { value: 'radar', label: 'Радарна' },
  { value: 'heatmap', label: 'Теплова карта' }
] as IChartTypes[];