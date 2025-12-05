import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BarChartIcon from '@mui/icons-material/BarChart';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TableChartIcon from '@mui/icons-material/TableChart';
import { Box, Chip, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { useApi } from '@/context/useApi.tsx';
import {
  exportEvaluationToDOCX,
  exportEvaluationToPDF_Quick,
  exportEvaluationToXLSX
} from '@/helpers/exportEvaluationUtils.ts';
import type { IEvaluationApiResponse } from '@/types/api.ts';
import type { ChartType, ViewMode } from '@/types/shared.ts';
import { ChartTypeSelector } from './ChartTypeSelector.tsx';
import { ComparisonChart } from './components/evaluation/ComparisonChart';
import { ErrorAnalysis } from './components/evaluation/ErrorAnalysis';
import { ExportButtons } from './components/evaluation/ExportButtons';
import { MetricsTable } from './components/evaluation/MetricsTable';
import classes from './EvaluationContent.module.scss';

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

  // Initialize with first ML model when models are available
  const initialModel = useMemo(() => {
    if (!models) return [];
    const firstMlModel = Object.keys(models).find((id) => models[id]?.type === 'ml');
    return firstMlModel ? [firstMlModel] : [];
  }, [models]);

  const [selectedModels, setSelectedModels] = useState<string[]>(() => initialModel);
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

  const handleViewModeChange = useCallback((_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      const oldMode = viewMode;
      setViewMode(newMode);

      // Handle selection cache when switching between modes
      if (newMode === 'errors' && selectedModels.length > 1) {
        setSelectionCache(selectedModels);
        setSelectedModels([selectedModels[0] || '']);
      } else if (oldMode === 'errors' && newMode !== 'errors' && selectionCache.length > 0) {
        setSelectedModels(selectionCache);
        setSelectionCache([]);
      }
    }
  }, [viewMode, selectedModels, selectionCache]);

  const prepareExportData = () => {
    return combinedMetricsData.map((row) => ({
      modelId: row.modelId as string,
      MAE: row.MAE as number | null,
      RMSE: row.RMSE as number | null,
      'R²': row['R2'] as number | null,
      'Explained Variance': row['Explained Variance'] as number | null,
      'MAPE (%)': row['MAPE (%)'] as number | null,
      avg_latency_ms: row.avg_latency_ms as number | null,
      memory_increment_mb: row.memory_increment_mb as number | null
    }));
  };

  const handleExportExcel = async () => {
    const exportData = prepareExportData();
    await exportEvaluationToXLSX(exportData, true);
  };

  const handleExportPDF = async () => {
    const exportData = prepareExportData();
    await exportEvaluationToPDF_Quick(exportData, true);
  };

  const handleExportWord = async () => {
    const exportData = prepareExportData();
    await exportEvaluationToDOCX(exportData, true);
  };

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
      const allModels = Object.keys(models).filter((id) => models[id]?.type === 'ml' || models[id]?.type === 'ensemble');
      setSelectedModels(allModels);
    }
  };

  const combinedMetricsData = selectedModels
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

  const sortedTableData = useMemo(() => {
    return combinedMetricsData.sort((a, b) => {
      const aValue = (a[sortBy] as number) ?? 0;
      const bValue = (b[sortBy] as number) ?? 0;
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [combinedMetricsData, sortBy, sortOrder]);

  const getBestWorst = useCallback(
    (metric: string) => {
      if (combinedMetricsData.length === 0) return { best: null, worst: null };

      const values = combinedMetricsData.map((row) => row[metric as SortableMetricKey]).filter((v): v is number => v !== null && v !== undefined);
      if (values.length === 0) return { best: null, worst: null };

      if (metric === 'R2') {
        return { best: Math.max(...values), worst: Math.min(...values) };
      }
      return { best: Math.min(...values), worst: Math.max(...values) };
    },
    [combinedMetricsData]
  );

  const handleSort = (metric: string) => {
    if (sortBy === metric) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(metric as SortableMetricKey);
      setSortOrder(metric === 'R2' ? 'desc' : 'asc');
    }
  };

  const renderContent = () => {
    if (isLoadingEvaluation && combinedMetricsData.length === 0) {
      return <LoadingFallback />;
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
        return (
          <MetricsTable
            sortedTableData={sortedTableData}
            metrics={metrics}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            getBestWorst={getBestWorst}
            isLoading={isLoadingEvaluation}
          />
        );
      case 'comparison':
        return (
          <ComparisonChart
            combinedMetricsData={combinedMetricsData}
            chartType={chartType}
            metrics={metrics}
            isLoading={isLoadingEvaluation}
          />
        );
      case 'errors':
        return (
          <ErrorAnalysis
            selectedModelId={selectedModels[0] || ''}
            evaluation={evaluations[selectedModels[0] || '']}
            isLoading={isLoadingEvaluation}
          />
        );
      default:
        return (
          <MetricsTable
            sortedTableData={sortedTableData}
            metrics={metrics}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            getBestWorst={getBestWorst}
            isLoading={isLoadingEvaluation}
          />
        );
    }
  };

  return (
    <Box component="main" className={classes.evaluationContent}>
      <Paper elevation={0} className={classes.paper}>
        <ExportButtons
          onExportExcel={handleExportExcel}
          onExportWord={handleExportWord}
          onExportPDF={handleExportPDF}
          disabled={combinedMetricsData.length === 0}
        />

        {isLoadingModels ? (
          <LoadingFallback />
        ) : (
          models && (
            <Box className={classes.modelSelector}>
              <Box className={classes.chipContainer}>
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

        <Stack className={classes.controls}>
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