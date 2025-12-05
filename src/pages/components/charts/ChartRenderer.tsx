import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
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

import { Box, Typography } from '@mui/material';

import { getHeatmapColor } from '@/helpers/utils';
import { CHART_MARGIN, TOOLTIP_STYLE } from '@/shared/constans';
import type { ChartType, IChartDataPoint } from '@/types/shared';
import type { IPredictionResponse } from '@/types/api';

interface ChartRendererProps {
  chartType: ChartType;
  chartData: IChartDataPoint[];
  filteredPredictions: IPredictionResponse[] | null;
  getModelColor: (modelId: string) => string;
}

export const ChartRenderer = memo(({ chartType, chartData, filteredPredictions, getModelColor }: ChartRendererProps) => {
  const { t } = useTranslation();

  const heatmapData = useMemo(() => {
    if (!filteredPredictions || chartData.length === 0) {
      return { data: [], min: 0, max: 0, modelIds: [] };
    }

    const modelIds = filteredPredictions.map((p) => p.model_id);
    const allValues: number[] = [];

    chartData.forEach((point) => {
      modelIds.forEach((modelId) => {
        const value = point[modelId];
        if (typeof value === 'number') allValues.push(value);
      });
    });

    return {
      data: chartData,
      min: Math.min(...allValues),
      max: Math.max(...allValues),
      modelIds
    };
  }, [filteredPredictions, chartData]);

  const renderLineChart = (type: 'monotone' | 'step' | 'natural' = 'monotone') => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend />
        {filteredPredictions?.map((p) => (
          <Line
            key={p.model_id}
            type={type}
            dataKey={p.model_id}
            stroke={getModelColor(p.model_id)}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = (layout: 'horizontal' | 'vertical' = 'horizontal', stacked = false) => {
    const isVertical = layout === 'vertical';

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={CHART_MARGIN} layout={isVertical ? 'vertical' : undefined}>
          <CartesianGrid strokeDasharray="3 3" />
          {isVertical ? (
            <>
              <XAxis type="number" />
              <YAxis dataKey="date" type="category" />
            </>
          ) : (
            <>
              <XAxis dataKey="date" />
              <YAxis />
            </>
          )}
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend />
          {filteredPredictions?.map((p) => (
            <Bar
              key={p.model_id}
              dataKey={p.model_id}
              fill={getModelColor(p.model_id)}
              stackId={stacked ? 'a' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderAreaChart = (stacked = false) => (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend />
        {filteredPredictions?.map((p) => {
          const color = getModelColor(p.model_id);
          return (
            <Area
              key={p.model_id}
              type="monotone"
              dataKey={p.model_id}
              stroke={color}
              fill={color}
              fillOpacity={stacked ? 0.6 : 0.3}
              strokeWidth={2}
              stackId={stacked ? '1' : undefined}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderComposedChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend />
        {filteredPredictions?.map((p, index) => {
          const color = getModelColor(p.model_id);
          return index % 2 === 0 ? (
            <Line key={p.model_id} type="monotone" dataKey={p.model_id} stroke={color} strokeWidth={2} />
          ) : (
            <Bar key={p.model_id} dataKey={p.model_id} fill={color} />
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart data={chartData} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
        <Legend />
        {filteredPredictions?.map((p) => (
          <Scatter key={p.model_id} name={p.model_id} dataKey={p.model_id} fill={getModelColor(p.model_id)} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="date" />
        <PolarRadiusAxis />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend />
        {filteredPredictions?.map((p) => (
          <Radar
            key={p.model_id}
            name={p.model_id}
            dataKey={p.model_id}
            stroke={getModelColor(p.model_id)}
            fill={getModelColor(p.model_id)}
            fillOpacity={0.3}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );

  const renderHeatmap = () => {
    const { data, min, max, modelIds } = heatmapData;
    if (data.length === 0) return null;

    const cellWidth = 100 / data.length;
    const cellHeight = 100 / modelIds.length;

    return (
      <Box sx={{ width: '100%', height: '100%', position: 'relative', overflowX: 'auto' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {modelIds.map((modelId, rowIndex) =>
            data.map((point, colIndex) => {
              const value = point[modelId];
              if (typeof value !== 'number') return null;

              return (
                <rect
                  key={`${modelId}-${colIndex}`}
                  x={colIndex * cellWidth}
                  y={rowIndex * cellHeight}
                  width={cellWidth}
                  height={cellHeight}
                  fill={getHeatmapColor(value, min, max)}
                  stroke="#fff"
                  strokeWidth="0.1"
                >
                  <title>{`${modelId}: ${value.toFixed(2)} (${point.date})`}</title>
                </rect>
              );
            })
          )}
        </svg>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', px: 2 }}>
          <Typography variant="caption">
            {t('Dates')}: {data[0]?.date} - {data[data.length - 1]?.date}
          </Typography>
          <Typography variant="caption">
            {t('Models')}: {modelIds.join(', ')}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart('horizontal', false);
      case 'vertical-bar':
        return renderBarChart('vertical', false);
      case 'stacked-bar':
        return renderBarChart('horizontal', true);
      case 'area':
        return renderAreaChart(false);
      case 'stacked-area':
        return renderAreaChart(true);
      case 'step':
        return renderLineChart('step');
      case 'smooth-line':
        return renderLineChart('natural');
      case 'composed':
        return renderComposedChart();
      case 'scatter':
        return renderScatterChart();
      case 'radar':
        return renderRadarChart();
      case 'heatmap':
        return renderHeatmap();
      case 'line':
      default:
        return renderLineChart('monotone');
    }
  };

  return <>{renderChart()}</>;
});

ChartRenderer.displayName = 'ChartRenderer';