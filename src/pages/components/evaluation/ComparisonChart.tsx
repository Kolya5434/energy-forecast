import { useTranslation } from 'react-i18next';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Typography } from '@mui/material';

import { CHART_MARGIN, COLORS, TOOLTIP_STYLE_ERRORS } from '../../../shared/constans';
import type { ChartType } from '../../../types/shared';

interface MetricConfig {
  key: string;
  label: string;
  format: (v: number | null) => string;
}

interface ComparisonChartProps {
  combinedMetricsData: Array<Record<string, number | string | null>>;
  chartType: ChartType;
  metrics: MetricConfig[];
  isLoading: boolean;
}

export const ComparisonChart = ({ combinedMetricsData, chartType, metrics, isLoading }: ComparisonChartProps) => {
  const { t } = useTranslation();

  if (combinedMetricsData.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
        {isLoading ? t('Завантаження оцінок...') : t('Немає даних для відображення графіка.')}
      </Typography>
    );
  }

  const chartMetrics = metrics.filter(
    (m) => m.key !== 'avg_latency_ms' && m.key !== 'memory_increment_mb' && m.key !== 'R2'
  );

  const ChartComponent = chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ChartComponent data={combinedMetricsData} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="modelId" interval={0} tick={{ fontSize: 11 }} />
        <YAxis />
        <Tooltip contentStyle={TOOLTIP_STYLE_ERRORS} />
        <Legend />
        {chartMetrics.map((metric, index) => {
          const key = metric.key as string;
          const color = COLORS[index % COLORS.length] || '#8884d8';
          if (chartType === 'line') {
            return (
              <Line key={key} type="monotone" dataKey={key} name={metric.label} stroke={color} strokeWidth={2} />
            );
          }
          if (chartType === 'area') {
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={metric.label}
                stroke={color}
                fill={color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            );
          }
          return <Bar key={key} dataKey={key} name={metric.label} fill={color} />;
        })}
      </ChartComponent>
    </ResponsiveContainer>
  );
};