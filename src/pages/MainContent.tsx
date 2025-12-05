import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CategoryIcon from '@mui/icons-material/Category';
import HistoryIcon from '@mui/icons-material/History';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { Box, Paper, Tab, Tabs, Typography, type SelectChangeEvent } from '@mui/material';

import { LoadingFallback } from '../components/LoadingFallback';
import { useApi } from '../context/useApi.tsx';
import { useConditionsForm } from '../hooks/useConditionsForm';
import { COLORS } from '../shared/constans.ts';
import type { ChartType, IChartDataPoint } from '../types/shared.ts';
import { ChartControls } from './components/charts/ChartControls';
import { ChartRenderer } from './components/charts/ChartRenderer';
import { HistoricalChart } from './components/charts/HistoricalChart';
import { ModelSelector } from './components/charts/ModelSelector';
import { ConditionsDisplay, ConditionsForm } from './components/conditions';
import { ForecastControls } from './components/ForecastControls';
import { ModelFeaturesTab } from './components/ModelFeaturesTab';
import classes from './MainContent.module.scss';

export const MainContent = () => {
  const { t } = useTranslation();
  const {
    models,
    isLoadingModels,
    predictions,
    isLoadingPredictions,
    getPredictions,
    clearPredictions,
    setExtendedConditions,
    clearExtendedConditions,
    isConditionsEditMode,
    setConditionsEditMode
  } = useApi();

  // Use shared conditions form hook
  const { formState, expandedPanels, handleInputChange, handlePanelChange, conditions, resetForm } =
    useConditionsForm();

  const [chartType, setChartType] = useState<ChartType>('line');
  const [manuallySelectedModels, setManuallySelectedModels] = useState<string[]>([]);
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [historicalDays, setHistoricalDays] = useState<number>(30);

  // Form controls for prediction request
  const [selectedModelsForRequest, setSelectedModelsForRequest] = useState<string[]>(['XGBoost_Tuned']);
  const [forecastHorizon, setForecastHorizon] = useState<number>(7);

  const handleModelSelectChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedModelsForRequest(typeof value === 'string' ? value.split(',') : value);
  };

  const handleForecast = () => {
    getPredictions({
      model_ids: selectedModelsForRequest,
      forecast_horizon: forecastHorizon,
      ...conditions
    });
    setConditionsEditMode(false);
  };

  // Sync conditions to context when they change
  useEffect(() => {
    setExtendedConditions(conditions);
  }, [conditions, setExtendedConditions]);

  // Compute selected models based on predictions
  const selectedModels = useMemo(() => {
    if (!predictions) return [];

    const newModelIds = predictions.map((p) => p.model_id);

    if (manuallySelectedModels.length === 0) return newModelIds;

    const modelsToAdd = newModelIds.filter((id) => !manuallySelectedModels.includes(id));
    const filteredModels = manuallySelectedModels.filter((id) => newModelIds.includes(id));

    if (modelsToAdd.length > 0) return [...filteredModels, ...modelsToAdd];

    return filteredModels;
  }, [predictions, manuallySelectedModels]);

  const handleModelToggle = useCallback((modelId: string) => {
    setManuallySelectedModels((prev) => {
      if (prev.includes(modelId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== modelId);
      }
      return [...prev, modelId];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (predictions) {
      setManuallySelectedModels(predictions.map((p) => p.model_id));
    }
  }, [predictions]);

  const handleClearData = useCallback(() => {
    if (clearPredictions) {
      clearPredictions();
      setManuallySelectedModels([]);
      setChartType('line');
      clearExtendedConditions();
      resetForm();
      setConditionsEditMode(true);
    }
  }, [clearPredictions, clearExtendedConditions, resetForm, setConditionsEditMode]);

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
        {activeTab === 0 && (
          <div className={classes.controlsWrapper}>
            {isConditionsEditMode ? (
              <ForecastControls
                models={models}
                isLoadingModels={isLoadingModels}
                isLoadingPredictions={isLoadingPredictions}
                selectedModels={selectedModelsForRequest}
                forecastHorizon={forecastHorizon}
                onModelSelectChange={handleModelSelectChange}
                onForecastHorizonChange={setForecastHorizon}
                onForecast={handleForecast}
              />
            ) : null}

            <ChartControls
              chartType={chartType}
              onChartTypeChange={setChartType}
              onClearData={handleClearData}
              showClearButton={!!predictions && predictions.length > 0}
            />

            {activeTab === 0 && (
              <ModelSelector
                predictions={predictions}
                selectedModels={selectedModels}
                onModelToggle={handleModelToggle}
                onSelectAll={handleSelectAll}
                getModelColor={getModelColor}
              />
            )}
          </div>
        )}
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<ShowChartIcon />} iconPosition="start" label={t('Прогноз')} />
          <Tab icon={<HistoryIcon />} iconPosition="start" label={t('Історичні дані')} />
          <Tab icon={<CategoryIcon />} iconPosition="start" label={t('Ознаки моделі')} />
        </Tabs>

        {/* Tab 0: Forecast */}
        {activeTab === 0 && (
          <>
            {/* Extended conditions - View or Edit mode */}
            {isConditionsEditMode ? (
              <ConditionsForm
                formState={formState}
                onInputChange={handleInputChange}
                expandedPanels={expandedPanels}
                onPanelChange={handlePanelChange}
                showAnomalyInCalendar
              />
            ) : (
              <ConditionsDisplay
                conditions={conditions}
                selectedModels={selectedModelsForRequest}
                forecastHorizon={forecastHorizon}
                isExpanded={filtersExpanded}
                onToggleExpand={() => setFiltersExpanded(!filtersExpanded)}
                onEdit={() => setConditionsEditMode(true)}
                onClear={handleClearData}
              />
            )}

            <Box className={classes.chartContainer}>
              {isLoadingPredictions ? (
                <LoadingFallback />
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
          </>
        )}

        {/* Tab 1: Historical */}
        {activeTab === 1 && <HistoricalChart days={historicalDays} onDaysChange={setHistoricalDays} />}

        {/* Tab 2: Model Features */}
        {activeTab === 2 && <ModelFeaturesTab />}
      </Paper>
    </Box>
  );
};
