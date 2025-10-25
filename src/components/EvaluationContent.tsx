import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import BarChartIcon from '@mui/icons-material/BarChart';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TableChartIcon from '@mui/icons-material/TableChart';
import {
  Box,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

import { useApi } from '../context/useApi.tsx';
import { CHART_MARGIN, COLORS, TOOLTIP_STYLE_ERRORS } from '../shared/constans.ts';
import type { IEvaluationApiResponse } from '../types/api.ts';
import type { ChartType, ViewMode } from '../types/shared.ts';
import { ChartTypeSelector } from './ChartTypeSelector.tsx';

type MetricKey = keyof IEvaluationApiResponse['accuracy_metrics'] | keyof IEvaluationApiResponse['performance_metrics'];

const metrics: Array<{ key: MetricKey; label: string; format: (v: number | null) => string }> = [
  { key: 'MAE', label: 'MAE', format: (v) => v?.toFixed(4) ?? 'N/A' },
  { key: 'RMSE', label: 'RMSE', format: (v) => v?.toFixed(4) ?? 'N/A' },
  { key: 'R2', label: 'R²', format: (v) => v?.toFixed(4) ?? 'N/A' },
  { key: 'avg_latency_ms', label: 'Latency (ms)', format: (v) => v?.toFixed(2) ?? 'N/A' },
  { key: 'memory_increment_mb', label: 'Memory (MB)', format: (v) => v?.toFixed(2) ?? 'N/A' }
];
type SortableMetricKey = 'MAE' | 'RMSE' | 'R2' | 'avg_latency_ms' | 'memory_increment_mb';

export const EvaluationContent = () => {
  const { t } = useTranslation();
  const { models, isLoadingModels, getEvaluation, evaluations, isLoadingEvaluation, evaluationError } = useApi();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [sortBy, setSortBy] = useState<SortableMetricKey>('MAE');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectionCache, setSelectionCache] = useState<string[]>([]);

  useEffect(() => {
    selectedModels.forEach((modelId) => {
      if (!evaluations[modelId]) {
        getEvaluation(modelId);
      }
    });
  }, [selectedModels, getEvaluation, evaluations]);

  useEffect(() => {
    if (models && selectedModels.length === 0) {
      const firstMlModel = Object.keys(models).find((id) => models[id].type === 'ml');
      if (firstMlModel) {
        setSelectedModels([firstMlModel]);
      }
    }
  }, [models, selectedModels.length]);

  useEffect(() => {
    if (viewMode === 'errors') {
      if (selectedModels.length > 1) {
        setSelectionCache(selectedModels);
        setSelectedModels([selectedModels[0]]);
      }
    } else {
      if (selectionCache.length > 0) {
        setSelectedModels(selectionCache);
        setSelectionCache([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleModelToggle = (modelId: string) => {
    setSelectionCache([]);

    if (viewMode === 'errors') {
      setSelectedModels([modelId]);
    } else {
      setSelectedModels((prev) => {
        if (prev.includes(modelId)) {
          if (prev.length === 1) return prev;
          return prev.filter((id) => id !== modelId);
        }
        return [...prev, modelId];
      });
    }
  };

  const handleSelectAll = () => {
    if (models) {
      const allModels = Object.keys(models).filter((id) => models[id].type === 'ml' || models[id].type === 'ensemble');
      setSelectedModels(allModels);
    }
  };

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const combinedMetricsData = useMemo(() => {
    return selectedModels
      .map((modelId) => {
        const evaluation = evaluations[modelId];
        if (!evaluation) return null;
        return {
          modelId,
          ...evaluation.accuracy_metrics,
          ...evaluation.performance_metrics
        };
      })
      .filter((row): row is Exclude<typeof row, null> => row !== null);
  }, [selectedModels, evaluations]);

  const sortedTableData = useMemo(() => {
    return combinedMetricsData.sort((a, b) => {
      const aValue = a[sortBy] ?? 0;
      const bValue = b[sortBy] ?? 0;
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [combinedMetricsData, sortBy, sortOrder]);

  const getBestWorst = useCallback(
    (metric: SortableMetricKey) => {
      if (combinedMetricsData.length === 0) return { best: null, worst: null };

      const values = combinedMetricsData.map((row) => row[metric]).filter((v): v is number => v !== null);
      if (values.length === 0) return { best: null, worst: null };

      if (metric === 'R2') {
        return { best: Math.max(...values), worst: Math.min(...values) };
      }
      return { best: Math.min(...values), worst: Math.max(...values) };
    },
    [combinedMetricsData]
  );

  const handleSort = (metric: SortableMetricKey) => {
    if (sortBy === metric) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(metric);
      setSortOrder(metric === 'R2' ? 'desc' : 'asc');
    }
  };

  const renderMetricsTable = useCallback(() => {
    if (sortedTableData.length === 0) {
      return (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {isLoadingEvaluation
            ? t('Завантаження оцінок...')
            : t('Немає даних для відображення. Виберіть моделі для аналізу.')}
        </Typography>
      );
    }

    return (
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('Модель')}</TableCell>
              {metrics.map((metric) => (
                <TableCell
                  key={metric.key}
                  align="right"
                  sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                  onClick={() => handleSort(metric.key as SortableMetricKey)}
                >
                  {metric.label} {sortBy === metric.key && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTableData.map((row) => {
              const { best, worst } = getBestWorst(sortBy);
              const isBest = row[sortBy] === best;
              const isWorst = row[sortBy] === worst;

              return (
                <TableRow key={row.modelId} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{row.modelId}</TableCell>
                  {metrics.map((metric) => {
                    const value = row[metric.key as SortableMetricKey];
                    const isSortedColumn = metric.key === sortBy;

                    return (
                      <TableCell
                        key={metric.key}
                        align="right"
                        sx={{
                          backgroundColor: isSortedColumn
                            ? isBest
                              ? 'rgba(102, 187, 106, 0.2)'
                              : isWorst
                                ? 'rgba(239, 83, 80, 0.2)'
                                : 'transparent'
                            : 'transparent',
                          fontWeight: isSortedColumn && isBest ? 'bold' : 'normal',
                          color:
                            isSortedColumn && isBest
                              ? 'success.dark'
                              : isSortedColumn && isWorst
                                ? 'error.dark'
                                : 'text.primary'
                        }}
                      >
                        {metric.format(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [sortedTableData, sortBy, sortOrder, isLoadingEvaluation, getBestWorst]);

  const renderComparisonChart = useCallback(() => {
    if (combinedMetricsData.length === 0) {
      return (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {isLoadingEvaluation ? t('Завантаження оцінок...') : t('Немає даних для відображення графіка.')}
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
            const color = COLORS[index % COLORS.length];
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
  }, [combinedMetricsData, chartType, isLoadingEvaluation]);

  const renderErrorAnalysis = useCallback(() => {
    const selectedModelId = selectedModels[0];
    if (!selectedModelId) {
      return (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {t('Будь ласка, виберіть одну модель для аналізу помилок.')}
        </Typography>
      );
    }
    if (selectedModels.length > 1) {
      return (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {t('Будь ласка, виберіть **тільки одну** модель для аналізу помилок.')}
        </Typography>
      );
    }

    const evaluation = evaluations[selectedModelId];

    if (!evaluation || !evaluation.error_analysis) {
      if (isLoadingEvaluation) return <Skeleton variant="rectangular" width="100%" height={400} />;
      return (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          {t('Дані аналізу помилок недоступні для цієї моделі.')}
        </Typography>
      );
    }

    const { residuals_over_time, monthly_errors, scatter_data } = evaluation.error_analysis;

    const minValue = Math.min(...scatter_data.map((d) => Math.min(d.actual, d.predicted)));
    const maxValue = Math.max(...scatter_data.map((d) => Math.max(d.actual, d.predicted)));

    return (
      <Stack spacing={4} sx={{ mt: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('Помилки (залишки) моделі у часі')}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={residuals_over_time} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: t('Помилка'), angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE_ERRORS} />
              <Legend />
              <Line
                type="monotone"
                dataKey="residual"
                name={t('Залишок')}
                stroke="#ff8042"
                strokeWidth={2}
                dot={false}
              />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" label={t('Zero')} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            {t('Розподіл помилок по місяцях (Box Plot)')}
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthly_errors} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" name={t('Місяць')} />
              <YAxis label={{ value: t('Помилка'), angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE_ERRORS} />
              <Legend />
              <Bar dataKey="q1" fill="#90caf9" name="Q1" stackId="a" strokeWidth={0} />
              <Bar
                dataKey={(entry) => entry.q3 - entry.q1}
                fill="#1976d2"
                name={t('IQR (Q1-Q3)')}
                stackId="a"
                strokeWidth={0}
              />
              <Scatter dataKey="median" fill="#d32f2f" name={t('Median')} shape="diamond" />
              <Scatter dataKey="min" fill="#f44336" name={t('Min')} shape="cross" />
              <Scatter dataKey="max" fill="#f44336" name={t('Max')} shape="cross" />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            {t('Фактичні vs Прогнозовані значення')}
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ ...CHART_MARGIN, right: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="actual"
                type="number"
                name={t('Фактичні')}
                label={{ value: t('Фактичні'), position: 'bottom', offset: -5 }}
                domain={[minValue, maxValue]}
              />
              <YAxis
                dataKey="predicted"
                type="number"
                name={t('Прогнозовані')}
                label={{ value: t('Прогнозовані'), angle: -90, position: 'insideLeft' }}
                domain={[minValue, maxValue]}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE_ERRORS}
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: number) => value.toFixed(2)}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '10px' }} />
              <Scatter name={t('Точки даних')} data={scatter_data} fill="#8884d8" fillOpacity={0.6} shape="circle" />
              <ReferenceLine
                segment={[
                  { x: minValue, y: minValue },
                  { x: maxValue, y: maxValue }
                ]}
                stroke="#ff5252"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: t('Ідеальна лінія'), position: 'insideTopRight', fill: '#ff5252' }}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {t('* Червона пунктирна лінія показує ідеальний прогноз (фактичні = прогнозовані)')}
          </Typography>
        </Box>
      </Stack>
    );
  }, [selectedModels, evaluations, isLoadingEvaluation, t]);

  const renderContent = () => {
    if (isLoadingEvaluation && combinedMetricsData.length === 0) {
      return <Skeleton variant="rectangular" width="100%" height={400} />;
    }

    if (evaluationError && combinedMetricsData.length === 0) {
      return (
        <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
          {evaluationError}
        </Typography>
      );
    }

    switch (viewMode) {
      case 'table':
        return renderMetricsTable();
      case 'comparison':
        return renderComparisonChart();
      case 'errors':
        return renderErrorAnalysis();
      default:
        return renderMetricsTable();
    }
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 0, overflowY: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, minHeight: '100%', backgroundColor: 'background.paper' }}>
        {/*TODO: need to add export button for metrics_comparison.xlsx */}
        {/*<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>*/}
        {/*  <Typography variant="h5">Оцінка та порівняння моделей</Typography>*/}
        {/*  <Stack direction="row" spacing={1}>*/}
        {/*    <Button*/}
        {/*      variant="outlined"*/}
        {/*      startIcon={<DownloadIcon />}*/}
        {/*      // onClick={() => exportChartData('xlsx', combinedMetricsData, 'metrics_comparison')}*/}
        {/*      disabled={combinedMetricsData.length === 0}*/}
        {/*    >*/}
        {/*      Export*/}
        {/*    </Button>*/}
        {/*  </Stack>*/}
        {/*</Box>*/}
        <Divider sx={{ mb: 3 }} />

        {isLoadingModels ? (
          <Skeleton variant="text" width="100%" height={40} />
        ) : (
          models && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  {viewMode === 'errors' ? t('Модель: ') : t('Моделі: ')}
                </Typography>
                {viewMode !== 'errors' ? (
                  <Chip label={t('Всі (ML/Ensemble)')} size="small" onClick={handleSelectAll} variant="outlined" />
                ) : null}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {Object.keys(models).map((modelId) => {
                    const isSelected = selectedModels.includes(modelId);
                    return (
                      <Chip
                        key={modelId}
                        label={modelId}
                        onClick={() => handleModelToggle(modelId)}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        size="small"
                      />
                    );
                  })}
                </Stack>
              </Box>
            </Box>
          )
        )}

        <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} size="small">
            <ToggleButton value="table">
              <TableChartIcon fontSize="small" sx={{ mr: 0.5 }} />
              {t('Таблиця')}
            </ToggleButton>
            <ToggleButton value="comparison">
              <BarChartIcon fontSize="small" sx={{ mr: 0.5 }} />
              {t('Порівняння')}
            </ToggleButton>
            <ToggleButton value="errors">
              <ErrorOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
              {t('Помилки')}
            </ToggleButton>
          </ToggleButtonGroup>

          {viewMode === 'comparison' && (
            <ChartTypeSelector
              value={chartType}
              onChange={setChartType}
              label={t('Тип графіка')}
              minWidth={200}
              excludeTypes={[
                'vertical-bar',
                'stacked-bar',
                'stacked-area',
                'step',
                'composed',
                'scatter',
                'radar',
                'heatmap'
              ]}
            />
          )}
        </Stack>

        {renderContent()}
      </Paper>
    </Box>
  );
};
