import { useEffect, useMemo, useState } from 'react';
import { Dayjs } from 'dayjs';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
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
  // Weather
  temperature: number | string;
  humidity: number | string;
  wind_speed: number | string;
  // Calendar
  is_holiday: boolean;
  is_weekend: boolean;
  // Time scenario
  hour: number | string;
  time_day_of_week: number | string;
  day_of_month: number | string;
  time_day_of_year: number | string;
  week_of_year: number | string;
  month: number | string;
  year: number | string;
  quarter: number | string;
  // Energy
  voltage: number | string;
  global_reactive_power: number | string;
  global_intensity: number | string;
  // Zone consumption
  sub_metering_1: number | string;
  sub_metering_2: number | string;
  sub_metering_3: number | string;
  // Anomaly
  is_anomaly: boolean;
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
    return Object.keys(models).find((id) => models[id]?.type === 'ml' || models[id]?.type === 'ensemble') || '';
  }, [models]);

  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(true);
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<ISimulationRequest | null>(null);

  const handlePanelChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels((prev) => (isExpanded ? [...prev, panel] : prev.filter((p) => p !== panel)));
  };

  // Get filled conditions for display in view mode
  const getFilledConditionsDisplay = () => {
    if (!lastSubmittedRequest) return [];
    const items: { label: string; value: string }[] = [];

    if (lastSubmittedRequest.weather) {
      const w = lastSubmittedRequest.weather;
      if (w.temperature !== undefined) items.push({ label: t('Температура (°C)'), value: String(w.temperature) });
      if (w.humidity !== undefined) items.push({ label: t('Вологість (%)'), value: String(w.humidity) });
      if (w.wind_speed !== undefined) items.push({ label: t('Швидкість вітру (м/с)'), value: String(w.wind_speed) });
    }

    if (lastSubmittedRequest.calendar) {
      const c = lastSubmittedRequest.calendar;
      if (c.is_holiday) items.push({ label: t('Свято'), value: '✓' });
      if (c.is_weekend) items.push({ label: t('Вихідний'), value: '✓' });
    }

    if (lastSubmittedRequest.time_scenario) {
      const ts = lastSubmittedRequest.time_scenario;
      if (ts.hour !== undefined) items.push({ label: t('Година'), value: String(ts.hour) });
      if (ts.day_of_week !== undefined) items.push({ label: t('День тижня'), value: String(ts.day_of_week) });
      if (ts.day_of_month !== undefined) items.push({ label: t('День місяця'), value: String(ts.day_of_month) });
      if (ts.day_of_year !== undefined) items.push({ label: t('День року'), value: String(ts.day_of_year) });
      if (ts.week_of_year !== undefined) items.push({ label: t('Тиждень року'), value: String(ts.week_of_year) });
      if (ts.month !== undefined) items.push({ label: t('Місяць'), value: String(ts.month) });
      if (ts.quarter !== undefined) items.push({ label: t('Квартал'), value: String(ts.quarter) });
      if (ts.year !== undefined) items.push({ label: t('Рік'), value: String(ts.year) });
    }

    if (lastSubmittedRequest.energy) {
      const e = lastSubmittedRequest.energy;
      if (e.voltage !== undefined) items.push({ label: t('Напруга (V)'), value: String(e.voltage) });
      if (e.global_reactive_power !== undefined) items.push({ label: t('Реактивна потужність'), value: String(e.global_reactive_power) });
      if (e.global_intensity !== undefined) items.push({ label: t('Сила струму (A)'), value: String(e.global_intensity) });
    }

    if (lastSubmittedRequest.zone_consumption) {
      const z = lastSubmittedRequest.zone_consumption;
      if (z.sub_metering_1 !== undefined) items.push({ label: t('Кухня (Wh)'), value: String(z.sub_metering_1) });
      if (z.sub_metering_2 !== undefined) items.push({ label: t('Пральня (Wh)'), value: String(z.sub_metering_2) });
      if (z.sub_metering_3 !== undefined) items.push({ label: t('Клімат-контроль (Wh)'), value: String(z.sub_metering_3) });
    }

    if (lastSubmittedRequest.is_anomaly) {
      items.push({ label: t('Аномалія'), value: '✓' });
    }

    if (lastSubmittedRequest.feature_overrides?.length) {
      const fo = lastSubmittedRequest.feature_overrides[0];
      if (fo) {
        items.push({ label: t('Дата зміни'), value: fo.date });
        Object.entries(fo.features).forEach(([key, val]) => {
          items.push({ label: t(key), value: String(val) });
        });
      }
    }

    return items;
  };

  const { control, handleSubmit, watch, setValue, reset } = useForm<ISimulationFormInput>({
    defaultValues: {
      selectedModel: '',
      forecastHorizon: 7,
      overrideDate: null,
      overrideFeature: 'day_of_week',
      overrideValue: '',
      // Weather
      temperature: '',
      humidity: '',
      wind_speed: '',
      // Calendar
      is_holiday: false,
      is_weekend: false,
      // Time scenario
      hour: '',
      time_day_of_week: '',
      day_of_month: '',
      time_day_of_year: '',
      week_of_year: '',
      month: '',
      year: '',
      quarter: '',
      // Energy
      voltage: '',
      global_reactive_power: '',
      global_intensity: '',
      // Zone consumption
      sub_metering_1: '',
      sub_metering_2: '',
      sub_metering_3: '',
      // Anomaly
      is_anomaly: false
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
    if (data.overrideDate && data.overrideFeature && data.overrideValue !== '') {
      featureOverrides.push({
        date: formattedDate,
        features: {
          [data.overrideFeature]: Number(data.overrideValue) || 0
        }
      });
    }

    const simulationRequest: ISimulationRequest = {
      model_id: data.selectedModel,
      forecast_horizon: data.forecastHorizon
    };

    // Feature overrides (legacy)
    if (featureOverrides.length > 0) {
      simulationRequest.feature_overrides = featureOverrides;
    }

    // Weather conditions
    const weather: Record<string, number> = {};
    if (data.temperature !== '') weather.temperature = Number(data.temperature);
    if (data.humidity !== '') weather.humidity = Number(data.humidity);
    if (data.wind_speed !== '') weather.wind_speed = Number(data.wind_speed);
    if (Object.keys(weather).length > 0) {
      simulationRequest.weather = weather;
    }

    // Calendar conditions
    const hasCalendar = data.is_holiday || data.is_weekend;
    if (hasCalendar) {
      simulationRequest.calendar = {
        is_holiday: data.is_holiday || undefined,
        is_weekend: data.is_weekend || undefined
      };
    }

    // Time scenario
    const timeScenario: Record<string, number> = {};
    if (data.hour !== '') timeScenario.hour = Number(data.hour);
    if (data.time_day_of_week !== '') timeScenario.day_of_week = Number(data.time_day_of_week);
    if (data.day_of_month !== '') timeScenario.day_of_month = Number(data.day_of_month);
    if (data.time_day_of_year !== '') timeScenario.day_of_year = Number(data.time_day_of_year);
    if (data.week_of_year !== '') timeScenario.week_of_year = Number(data.week_of_year);
    if (data.month !== '') timeScenario.month = Number(data.month);
    if (data.year !== '') timeScenario.year = Number(data.year);
    if (data.quarter !== '') timeScenario.quarter = Number(data.quarter);
    if (Object.keys(timeScenario).length > 0) {
      simulationRequest.time_scenario = timeScenario;
    }

    // Energy conditions
    const energy: Record<string, number> = {};
    if (data.voltage !== '') energy.voltage = Number(data.voltage);
    if (data.global_reactive_power !== '') energy.global_reactive_power = Number(data.global_reactive_power);
    if (data.global_intensity !== '') energy.global_intensity = Number(data.global_intensity);
    if (Object.keys(energy).length > 0) {
      simulationRequest.energy = energy;
    }

    // Zone consumption
    const zoneConsumption: Record<string, number> = {};
    if (data.sub_metering_1 !== '') zoneConsumption.sub_metering_1 = Number(data.sub_metering_1);
    if (data.sub_metering_2 !== '') zoneConsumption.sub_metering_2 = Number(data.sub_metering_2);
    if (data.sub_metering_3 !== '') zoneConsumption.sub_metering_3 = Number(data.sub_metering_3);
    if (Object.keys(zoneConsumption).length > 0) {
      simulationRequest.zone_consumption = zoneConsumption;
    }

    // Anomaly flag
    if (data.is_anomaly) {
      simulationRequest.is_anomaly = true;
    }

    runSimulation(simulationRequest);
    setLastSubmittedRequest(simulationRequest);
    setIsEditMode(false);
    setExpandedPanels([]);
  };

  const handleClear = () => {
    clearSimulation();
    clearPredictions();
    reset();
    setExpandedPanels([]);
    setIsEditMode(true);
    setLastSubmittedRequest(null);
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

        {/* View mode - show submitted parameters */}
        {!isEditMode && lastSubmittedRequest && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Параметри симуляції')}:
              </Typography>
              <Chip label={`${t('Модель')}: ${lastSubmittedRequest.model_id}`} size="small" />
              <Chip label={`${t('Горизонт (днів)')}: ${lastSubmittedRequest.forecast_horizon}`} size="small" />
              <Tooltip title={t('Редагувати')}>
                <IconButton size="small" onClick={() => setIsEditMode(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            {getFilledConditionsDisplay().length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {getFilledConditionsDisplay().map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.label}: ${item.value}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button variant="outlined" color="secondary" startIcon={<ClearIcon />} onClick={handleClear}>
                {t('Очистити')}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Edit mode - show form */}
        {isEditMode && (
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic settings */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
            <Controller
              name="selectedModel"
              control={control}
              render={({ field }) => (
                <FormControl size="small" sx={{ minWidth: 240 }} disabled={isLoadingModels}>
                  <InputLabel>{t('Модель для симуляції')}</InputLabel>
                  <Select {...field} label={t('Модель для симуляції')}>
                    {models &&
                      Object.keys(models)
                        .filter((id) => models[id]?.type === 'ml' || models[id]?.type === 'ensemble')
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
                  sx={{ width: 140 }}
                  onChange={(e) => field.onChange(Math.max(1, parseInt(e.target.value, 10)))}
                />
              )}
            />

            <Controller
              name="is_anomaly"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label={t('Аномалія')}
                />
              )}
            />
          </Stack>

          {/* Accordion sections */}
          <Box sx={{ mb: 2 }}>
            {/* Weather conditions */}
            <Accordion expanded={expandedPanels.includes('weather')} onChange={handlePanelChange('weather')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t('Погодні умови')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                  <Controller
                    name="temperature"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Температура (°C)')}
                        type="number"
                        size="small"
                        sx={{ width: 160 }}
                        placeholder="-10...40"
                      />
                    )}
                  />
                  <Controller
                    name="humidity"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Вологість (%)')}
                        type="number"
                        size="small"
                        sx={{ width: 160 }}
                        placeholder="0-100"
                        slotProps={{ htmlInput: { min: 0, max: 100 } }}
                      />
                    )}
                  />
                  <Controller
                    name="wind_speed"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Швидкість вітру (м/с)')}
                        type="number"
                        size="small"
                        sx={{ width: 180 }}
                        placeholder="≥0"
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    )}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Calendar conditions */}
            <Accordion expanded={expandedPanels.includes('calendar')} onChange={handlePanelChange('calendar')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t('Календарні умови')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction="row" spacing={3}>
                  <Controller
                    name="is_holiday"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={t('Свято')}
                      />
                    )}
                  />
                  <Controller
                    name="is_weekend"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={t('Вихідний')}
                      />
                    )}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Time scenario */}
            <Accordion expanded={expandedPanels.includes('time')} onChange={handlePanelChange('time')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t('Часовий сценарій')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Controller
                    name="hour"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Година')}
                        type="number"
                        size="small"
                        sx={{ width: 120 }}
                        placeholder="0-23"
                        slotProps={{ htmlInput: { min: 0, max: 23 } }}
                      />
                    )}
                  />
                  <Controller
                    name="time_day_of_week"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('День тижня')}
                        type="number"
                        size="small"
                        sx={{ width: 130 }}
                        placeholder="0-6"
                        slotProps={{ htmlInput: { min: 0, max: 6 } }}
                      />
                    )}
                  />
                  <Controller
                    name="day_of_month"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('День місяця')}
                        type="number"
                        size="small"
                        sx={{ width: 130 }}
                        placeholder="1-31"
                        slotProps={{ htmlInput: { min: 1, max: 31 } }}
                      />
                    )}
                  />
                  <Controller
                    name="time_day_of_year"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('День року')}
                        type="number"
                        size="small"
                        sx={{ width: 130 }}
                        placeholder="1-366"
                        slotProps={{ htmlInput: { min: 1, max: 366 } }}
                      />
                    )}
                  />
                  <Controller
                    name="week_of_year"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Тиждень року')}
                        type="number"
                        size="small"
                        sx={{ width: 140 }}
                        placeholder="1-53"
                        slotProps={{ htmlInput: { min: 1, max: 53 } }}
                      />
                    )}
                  />
                  <Controller
                    name="month"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Місяць')}
                        type="number"
                        size="small"
                        sx={{ width: 120 }}
                        placeholder="1-12"
                        slotProps={{ htmlInput: { min: 1, max: 12 } }}
                      />
                    )}
                  />
                  <Controller
                    name="quarter"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Квартал')}
                        type="number"
                        size="small"
                        sx={{ width: 120 }}
                        placeholder="1-4"
                        slotProps={{ htmlInput: { min: 1, max: 4 } }}
                      />
                    )}
                  />
                  <Controller
                    name="year"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Рік')}
                        type="number"
                        size="small"
                        sx={{ width: 120 }}
                        placeholder="≥2000"
                        slotProps={{ htmlInput: { min: 2000 } }}
                      />
                    )}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Energy conditions */}
            <Accordion expanded={expandedPanels.includes('energy')} onChange={handlePanelChange('energy')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t('Енергетичні параметри')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                  <Controller
                    name="voltage"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Напруга (V)')}
                        type="number"
                        size="small"
                        sx={{ width: 150 }}
                        placeholder="≥0"
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    )}
                  />
                  <Controller
                    name="global_reactive_power"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Реактивна потужність')}
                        type="number"
                        size="small"
                        sx={{ width: 180 }}
                        placeholder="≥0"
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    )}
                  />
                  <Controller
                    name="global_intensity"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Сила струму (A)')}
                        type="number"
                        size="small"
                        sx={{ width: 160 }}
                        placeholder="≥0"
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    )}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Zone consumption */}
            <Accordion expanded={expandedPanels.includes('zone')} onChange={handlePanelChange('zone')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t('Споживання по зонах')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                  <Controller
                    name="sub_metering_1"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Кухня (Wh)')}
                        type="number"
                        size="small"
                        sx={{ width: 150 }}
                        placeholder="≥0"
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    )}
                  />
                  <Controller
                    name="sub_metering_2"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Пральня (Wh)')}
                        type="number"
                        size="small"
                        sx={{ width: 150 }}
                        placeholder="≥0"
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    )}
                  />
                  <Controller
                    name="sub_metering_3"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('Клімат-контроль (Wh)')}
                        type="number"
                        size="small"
                        sx={{ width: 180 }}
                        placeholder="≥0"
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    )}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Legacy feature override */}
            <Accordion expanded={expandedPanels.includes('legacy')} onChange={handlePanelChange('legacy')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t('Ручна зміна ознаки')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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
                      <FormControl size="small" sx={{ minWidth: 200 }}>
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
                      <TextField
                        {...field}
                        label={t('Нове значення')}
                        type="number"
                        size="small"
                        sx={{ width: 140 }}
                      />
                    )}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>

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
        )}

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
                <RechartsTooltip
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
