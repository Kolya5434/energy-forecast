import { useEffect, useMemo } from 'react';
import { Dayjs } from 'dayjs';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import ClearIcon from '@mui/icons-material/Clear';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useApi } from '../context/useApi';
import { COLORS, OPTIONS_SIMULATABLE_FEATURES } from '../shared/constans.ts';
import type { IFeatureOverride, ISimulationRequest, SimulationChartData } from '../types/api';

interface ISimulationFormInput {
  selectedModel: string;
  forecastHorizon: number;
  overrideDate: Dayjs | null;
  overrideFeature: string;
  overrideValue: number | string;
}

export const SimulationContent = () => {
  const { t } = useTranslation();
  const {
    models,
    isLoadingModels,
    predictions,
    getPredictions,
    isLoadingPredictions,
    simulationResult,
    isLoadingSimulation,
    simulationError,
    runSimulation,
    clearSimulation,
    clearPredictions
  } = useApi();

  const firstMlModel = useMemo(() => {
    if (!models) return '';
    return Object.keys(models).find((id) => models[id].type === 'ml' || models[id].type === 'ensemble') || '';
  }, [models]);

  const { control, handleSubmit, watch, setValue } = useForm<ISimulationFormInput>({
    defaultValues: {
      selectedModel: '',
      forecastHorizon: 7,
      overrideDate: null,
      overrideFeature: 'day_of_week',
      overrideValue: 6
    }
  });

  const selectedModel = watch('selectedModel');
  const forecastHorizon = watch('forecastHorizon');

  useEffect(() => {
    if (firstMlModel) {
      setValue('selectedModel', firstMlModel);
    }
  }, [firstMlModel, setValue]);

  useEffect(() => {
    if (selectedModel) {
      getPredictions({ model_ids: [selectedModel], forecast_horizon: forecastHorizon });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, forecastHorizon]);

  const onSubmit: SubmitHandler<ISimulationFormInput> = (data) => {
    if (!predictions) {
      getPredictions({ model_ids: [data.selectedModel], forecast_horizon: data.forecastHorizon });
    }

    const featureOverrides: IFeatureOverride[] = [];
    const formattedDate = data.overrideDate ? data.overrideDate.format('YYYY-MM-DD') : '';
    if (data.overrideDate && data.overrideFeature) {
      featureOverrides.push({
        date: formattedDate,
        features: {
          [data.overrideFeature]: Number(data.overrideValue) || 0
        }
      });
    }

    const simulationRequest: ISimulationRequest = {
      model_id: data.selectedModel,
      forecast_horizon: data.forecastHorizon,
      feature_overrides: featureOverrides
    };

    runSimulation(simulationRequest);
  };

  const handleClear = () => {
    clearSimulation();
    clearPredictions();
  };

  const chartData = useMemo(() => {
    const dataMap: Record<string, SimulationChartData> = {};

    const basePrediction = predictions?.find((p) => p.model_id === selectedModel);
    if (basePrediction) {
      Object.entries(basePrediction.forecast).forEach(([date, value]) => {
        dataMap[date] = { date, baseForecast: value };
      });
    }

    if (simulationResult && simulationResult.model_id === selectedModel) {
      Object.entries(simulationResult.forecast).forEach(([date, value]) => {
        if (!dataMap[date]) {
          dataMap[date] = { date };
        }
        dataMap[date].simulatedForecast = value;
      });
    }

    return Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [predictions, simulationResult, selectedModel]);

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 2, pt: 0, overflowY: 'auto' }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, minHeight: '100%', backgroundColor: 'background.paper' }}>
        <Typography variant="h5">{t('Симуляція сценаріїв (What-If)')}</Typography>
        <Divider sx={{ my: 2 }} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            <Controller
              name="selectedModel"
              control={control}
              render={({ field }) => (
                <FormControl size="small" sx={{ minWidth: 240 }} disabled={isLoadingModels}>
                  <InputLabel>{t('Модель для симуляції')}</InputLabel>
                  <Select {...field} label={t('Модель для симуляції')}>
                    {models &&
                      Object.keys(models)
                        .filter((id) => models[id].type === 'ml' || models[id].type === 'ensemble')
                        .map((modelId) => (
                          <MenuItem key={modelId} value={modelId}>
                            {modelId}
                          </MenuItem>
                        ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="forecastHorizon"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('Горизонт (днів)')}
                  type="number"
                  size="small"
                  onChange={(e) => field.onChange(Math.max(1, parseInt(e.target.value, 10)))}
                />
              )}
            />

            <Controller
              name="overrideDate"
              control={control}
              render={({ field }) => (
                <DatePicker {...field} label={t('Дата зміни')} slotProps={{ textField: { size: 'small' } }} />
              )}
            />

            <Controller
              name="overrideFeature"
              control={control}
              render={({ field }) => (
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel>{t('Ознака для зміни')}</InputLabel>
                  <Select {...field} label={t('Ознака для зміни')}>
                    {OPTIONS_SIMULATABLE_FEATURES.map((feature) => (
                      <MenuItem key={feature.value} value={feature.value}>
                        {t(feature.label)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="overrideValue"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t('Нове значення')} type="number" size="small" placeholder="6" />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              disabled={isLoadingPredictions || isLoadingSimulation}
            >
              {t('Запустити симуляцію')}
            </Button>
            <Button variant="outlined" color="secondary" startIcon={<ClearIcon />} onClick={handleClear}>
              {t('Очистити')}
            </Button>
          </Stack>
        </form>

        {simulationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {simulationError}
          </Alert>
        )}

        <Box sx={{ height: 400 }}>
          {isLoadingPredictions || isLoadingSimulation ? (
            <Skeleton variant="rectangular" width="100%" height={400} />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="baseForecast"
                  name={t('Базовий Прогноз')}
                  stroke={COLORS[0]}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="simulatedForecast"
                  name={t('Симульований Прогноз')}
                  stroke={COLORS[1]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary">{t('Задайте параметри та запустіть симуляцію.')}</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
