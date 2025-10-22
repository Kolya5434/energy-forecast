import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Typography,
} from '@mui/material';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';

import { useApi } from '../context/useApi.tsx';
import { ChartTypeSelector } from './ChartTypeSelector.tsx';
import { CHART_MARGIN, COLORS, TOOLTIP_STYLE } from '../shared/constans.ts';
import type { ChartType, ViewMode } from '../types/shared.ts';
import type { IEvaluationApiResponse } from '../types/api.ts';

type MetricKey = keyof IEvaluationApiResponse['accuracy_metrics'] | keyof IEvaluationApiResponse['performance_metrics'];

const metrics: Array<{ key: MetricKey; label: string; format: (v: number | null) => string }> = [
  { key: 'MAE', label: 'MAE', format: (v) => v?.toFixed(4) ?? 'N/A' },
  { key: 'RMSE', label: 'RMSE', format: (v) => v?.toFixed(4) ?? 'N/A' },
  { key: 'R2', label: 'R²', format: (v) => v?.toFixed(4) ?? 'N/A' },
  { key: 'avg_latency_ms', label: 'Latency (ms)', format: (v) => v?.toFixed(2) ?? 'N/A' },
  { key: 'memory_increment_mb', label: 'Memory (MB)', format: (v) => v?.toFixed(2) ?? 'N/A' },
];
type SortableMetricKey = 'MAE' | 'RMSE' | 'R2' | 'avg_latency_ms' | 'memory_increment_mb';

export const EvaluationContent = () => {
  const { models, isLoadingModels, getEvaluation, evaluations, isLoadingEvaluation, evaluationError } = useApi();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [sortBy, setSortBy] = useState<SortableMetricKey>('MAE');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    selectedModels.forEach((modelId) => {
      if (!evaluations[modelId]) {
        getEvaluation(modelId);
      }
    });
  }, [selectedModels, getEvaluation, evaluations]);
  
  useEffect(() => {
    if (models && selectedModels.length === 0) {
      const mlModels = Object.keys(models).filter((id) => models[id].type === 'ml' || models[id].type === 'ensemble');
      setSelectedModels(mlModels);
    }
  }, [models, selectedModels.length]);
  
  const handleModelToggle = (modelId: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== modelId);
      }
      return [...prev, modelId];
    });
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
          ...evaluation.performance_metrics,
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
  
  const getBestWorst = useCallback((metric: SortableMetricKey) => {
    if (combinedMetricsData.length === 0) return { best: null, worst: null };
    
    const values = combinedMetricsData.map((row) => row[metric]).filter((v): v is number => v !== null);
    if(values.length === 0) return { best: null, worst: null };
    
    if (metric === 'R2') {
      return { best: Math.max(...values), worst: Math.min(...values) };
    }
    return { best: Math.min(...values), worst: Math.max(...values) };
  }, [combinedMetricsData]);
  
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
          {isLoadingEvaluation ? 'Завантаження оцінок...' : 'Немає даних для відображення. Виберіть моделі для аналізу.'}
        </Typography>
      );
    }
    
    return (
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Модель</TableCell>
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
                          backgroundColor: isSortedColumn ? (isBest ? 'rgba(102, 187, 106, 0.2)' : isWorst ? 'rgba(239, 83, 80, 0.2)' : 'transparent') : 'transparent',
                          fontWeight: isSortedColumn && isBest ? 'bold' : 'normal',
                          color: isSortedColumn && isBest ? 'success.dark' : isSortedColumn && isWorst ? 'error.dark' : 'text.primary'
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
          {isLoadingEvaluation ? 'Завантаження оцінок...' : 'Немає даних для відображення графіка.'}
        </Typography>
      );
    }
    
    const chartMetrics = metrics.filter(m => m.key !== 'avg_latency_ms' && m.key !== 'memory_increment_mb' && m.key !== 'R2');
    
    const ChartComponent = chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;
    
    return (
      <ResponsiveContainer width="100%" height={500}>
        <ChartComponent data={combinedMetricsData} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="modelId" interval={0} tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend />
          {chartMetrics.map((metric, index) => {
            const key = metric.key as string;
            const color = COLORS[index % COLORS.length];
            if (chartType === 'line') {
              return <Line key={key} type="monotone" dataKey={key} name={metric.label} stroke={color} strokeWidth={2} />;
            }
            if (chartType === 'area') {
              return <Area key={key} type="monotone" dataKey={key} name={metric.label} stroke={color} fill={color} fillOpacity={0.3} strokeWidth={2} />;
            }
            return <Bar key={key} dataKey={key} name={metric.label} fill={color} />;
          })}
        </ChartComponent>
      </ResponsiveContainer>
    );
  }, [combinedMetricsData, chartType, isLoadingEvaluation]);
  
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
                  Моделі:
                </Typography>
                <Chip label="Всі (ML/Ensemble)" size="small" onClick={handleSelectAll} variant="outlined" />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {Object.keys(models)
                    .map((modelId) => {
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
              Таблиця
            </ToggleButton>
            <ToggleButton value="comparison">
              <BarChartIcon fontSize="small" sx={{ mr: 0.5 }} />
              Порівняння
            </ToggleButton>
            {/* <ToggleButton value="errors" disabled>
              <ErrorOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
              Помилки
            </ToggleButton>
            */}
          </ToggleButtonGroup>
          
          {viewMode === 'comparison' && (
            <ChartTypeSelector
              value={chartType}
              onChange={setChartType}
              label="Тип графіка"
              minWidth={200}
              excludeTypes={['vertical-bar', 'stacked-bar', 'stacked-area', 'step', 'composed', 'scatter', 'radar', 'heatmap']}
            />
          )}
        </Stack>
        
        {renderContent()}
      </Paper>
    </Box>
  );
};