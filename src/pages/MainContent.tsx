import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Paper, Skeleton, Typography } from '@mui/material';

import { useApi } from '../context/useApi.tsx';
import { COLORS } from '../shared/constans.ts';
import type { ChartType, IChartDataPoint } from '../types/shared.ts';
import { ChartControls } from './components/charts/ChartControls';
import { ChartRenderer } from './components/charts/ChartRenderer';
import { ModelSelector } from './components/charts/ModelSelector';
import classes from './MainContent.module.scss';

export const MainContent = () => {
  const { t } = useTranslation();
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
        acc[p.model_id] = COLORS[index % COLORS.length] || '#8884d8';
        return acc;
      },
      {} as Record<string, string>
    );
  }, [predictions]);

  const getModelColor = useCallback(
    (modelId: string): string => {
      return modelColors[modelId] || COLORS[0] || '#8884d8';
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

  return (
    <Box component="main" className={classes.mainContent}>
      <Paper elevation={0} className={classes.paper}>
        <div className={classes.controlsWrapper}>
          <ChartControls
            chartType={chartType}
            onChartTypeChange={setChartType}
            onClearData={handleClearData}
            showClearButton={!!predictions && predictions.length > 0}
          />

          <ModelSelector
            predictions={predictions}
            selectedModels={selectedModels}
            onModelToggle={handleModelToggle}
            onSelectAll={handleSelectAll}
            getModelColor={getModelColor}
          />
        </div>

        <Box className={classes.chartContainer}>
          {isLoadingPredictions ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : !predictions || chartData.length === 0 ? (
            <Box className={classes.emptyState}>
              <Typography color="text.secondary">
                {t('Виберіть моделі та натисніть "Сформувати прогноз", щоб побачити результат.')}
              </Typography>
            </Box>
          ) : (
            <ChartRenderer
              chartType={chartType}
              chartData={chartData}
              filteredPredictions={filteredPredictions}
              getModelColor={getModelColor}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};
