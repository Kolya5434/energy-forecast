import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { CHART_MARGIN, TOOLTIP_STYLE } from '../../../shared/constans';
import type { ChartType } from '../../../types/shared';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface FeatureImportanceChartProps {
  chartData: ChartDataPoint[];
  chartType: ChartType;
}

export const FeatureImportanceChart = ({ chartData, chartType }: FeatureImportanceChartProps) => {
  const { t } = useTranslation();

  const renderBarChart = useCallback(
    (layout: 'horizontal' | 'vertical' = 'horizontal') => {
      const isVertical = layout === 'vertical';

      return (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart data={chartData} margin={CHART_MARGIN} layout={isVertical ? 'vertical' : undefined}>
            <CartesianGrid strokeDasharray="3 3" />
            {isVertical ? (
              <>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} interval={0} tick={{ fontSize: 11 }} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: t('Важливість'), angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
              </>
            )}
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(100, 100, 100, 0.1)' }} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="value" name={t('Важливість ознаки')} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    },
    [chartData, t]
  );

  const renderLineChart = useCallback(() => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 11 }} />
          <YAxis label={{ value: t('Важливість'), angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Line type="monotone" dataKey="value" name={t('Важливість ознаки')} stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [chartData, t]);

  const renderScatterChart = useCallback(() => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 11 }} />
          <YAxis label={{ value: t('Важливість'), angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Scatter name={t('Важливість ознаки')} dataKey="value" fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }, [chartData, t]);

  const renderRadarChart = useCallback(() => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={90} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Radar name={t('Важливість ознаки')} dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    );
  }, [chartData, t]);

  if (chartData.length === 0) return null;

  switch (chartType) {
    case 'bar':
      return renderBarChart('horizontal');
    case 'vertical-bar':
      return renderBarChart('vertical');
    case 'line':
    case 'smooth-line':
      return renderLineChart();
    case 'scatter':
      return renderScatterChart();
    case 'radar':
      return renderRadarChart();
    default:
      return renderBarChart('horizontal');
  }
};