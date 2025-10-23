import type { IChartTypes, ISelectOption } from '../types/shared.ts';

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

export const DEFAULT_OPTIONS_SELECT = [
  { value: 10, label: 'Топ-10' },
  { value: 15, label: 'Топ-15' },
  { value: 20, label: 'Топ-20' },
  { value: 30, label: 'Топ-30' },
  { value: 999, label: 'Всі' }
] as ISelectOption[];

export const TOOLTIP_STYLE_ERRORS = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid #444',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#000',
  fontSize: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
}
