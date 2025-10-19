import { useCallback, useEffect, useMemo, useState } from 'react';
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

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';

import { useApi } from '../context/useApi.tsx';
import { getHeatmapColor } from '../helpers/utils.ts';
import { CHART_MARGIN, COLORS, TOOLTIP_STYLE } from '../shared/constans.ts';
import type { ChartType, IChartDataPoint } from '../types/shared.ts';
import { ChartTypeSelector } from './ChartTypeSelector.tsx';

export const MainContent = () => {
  const { predictions, isLoadingPredictions, clearPredictions } = useApi();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  useEffect(() => {
    if (predictions) {
      const newModelIds = predictions.map((p) => p.model_id);

      setSelectedModels((prev) => {
        if (prev.length === 0) return newModelIds;

        const modelsToAdd = newModelIds.filter((id) => !prev.includes(id));
        const filteredModels = prev.filter((id) => newModelIds.includes(id));

        if (modelsToAdd.length > 0) return [...filteredModels, ...modelsToAdd];
        if (filteredModels.length === prev.length) return prev;

        return filteredModels;
      });
    } else {
      setSelectedModels([]);
    }
  }, [predictions]);

  const handleModelToggle = useCallback((modelId: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== modelId);
      }
      return [...prev, modelId];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (predictions) {
      setSelectedModels(predictions.map((p) => p.model_id));
    }
  }, [predictions]);

  const handleClearData = useCallback(() => {
    if (clearPredictions) {
      clearPredictions();
      setSelectedModels([]);
      setChartType('line');
    }
  }, [clearPredictions]);

  const modelColors = useMemo(() => {
    if (!predictions) return {};
    return predictions.reduce(
      (acc, p, index) => {
        acc[p.model_id] = COLORS[index % COLORS.length];
        return acc;
      },
      {} as Record<string, string>
    );
  }, [predictions]);

  const getModelColor = useCallback(
    (modelId: string) => {
      return modelColors[modelId] || COLORS[0];
    },
    [modelColors]
  );

  const filteredPredictions = useMemo(() => {
    if (!predictions) return null;
    return predictions.filter((p) => selectedModels.includes(p.model_id));
  }, [predictions, selectedModels]);

  const chartData = useMemo(() => {
    if (!filteredPredictions) return [];

    const dataMap: { [date: string]: IChartDataPoint } = {};

    filteredPredictions.forEach((prediction) => {
      const { model_id, forecast } = prediction;
      Object.entries(forecast).forEach(([date, value]) => {
        if (!dataMap[date]) {
          dataMap[date] = { date };
        }
        dataMap[date][model_id] = value;
      });
    });

    return Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredPredictions]);

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

  const renderLineChart = useCallback(
    (type: 'monotone' | 'step' | 'natural' = 'monotone') => (
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
    ),
    [chartData, filteredPredictions, getModelColor]
  );

  const renderBarChart = useCallback(
    (layout: 'horizontal' | 'vertical' = 'horizontal', stacked = false) => {
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
    },
    [chartData, filteredPredictions, getModelColor]
  );

  const renderAreaChart = useCallback(
    (stacked = false) => (
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
    ),
    [chartData, filteredPredictions, getModelColor]
  );

  const renderComposedChart = useCallback(
    () => (
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
    ),
    [chartData, filteredPredictions, getModelColor]
  );

  const renderScatterChart = useCallback(
    () => (
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
    ),
    [chartData, filteredPredictions, getModelColor]
  );

  const renderRadarChart = useCallback(
    () => (
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
    ),
    [chartData, filteredPredictions, getModelColor]
  );

  const renderHeatmap = useCallback(() => {
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
            Dates: {data[0]?.date} - {data[data.length - 1]?.date}
          </Typography>
          <Typography variant="caption">Models: {modelIds.join(', ')}</Typography>
        </Box>
      </Box>
    );
  }, [heatmapData]);

  const renderChart = useMemo(() => {
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
  }, [
    chartType,
    renderBarChart,
    renderAreaChart,
    renderLineChart,
    renderComposedChart,
    renderScatterChart,
    renderRadarChart,
    renderHeatmap
  ]);

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          height: '100%',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Графік Прогнозів</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {predictions && predictions.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteOutlineIcon />}
                onClick={handleClearData}
              >
                Очистити дані
              </Button>
            )}
            <ChartTypeSelector value={chartType} onChange={setChartType} />
          </Box>
        </Box>

        {predictions && predictions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Моделі:
              </Typography>
              <Chip
                label="Всі"
                size="small"
                onClick={handleSelectAll}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {predictions.map((p) => {
                  const isSelected = selectedModels.includes(p.model_id);
                  const color = getModelColor(p.model_id);

                  return (
                    <Chip
                      key={p.model_id}
                      label={p.model_id}
                      onClick={() => handleModelToggle(p.model_id)}
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      sx={{
                        borderColor: isSelected ? color : undefined,
                        backgroundColor: isSelected ? color : undefined,
                        '&:hover': {
                          backgroundColor: isSelected ? color : undefined,
                          opacity: 0.8
                        }
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }}>
          {isLoadingPredictions ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : !predictions || chartData.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                Виберіть моделі та натисніть "Сформувати прогноз", щоб побачити результат.
              </Typography>
            </Box>
          ) : (
            renderChart
          )}
        </Box>
      </Paper>
    </Box>
  );
};
