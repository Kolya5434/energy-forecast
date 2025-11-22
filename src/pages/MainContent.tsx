import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  type SelectChangeEvent,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

import { useApi } from '../context/useApi.tsx';
import { COLORS } from '../shared/constans.ts';
import type { IExtendedConditions } from '../types/api.ts';
import type { ChartType, IChartDataPoint } from '../types/shared.ts';
import { ChartControls } from './components/charts/ChartControls';
import { ChartRenderer } from './components/charts/ChartRenderer';
import { ModelSelector } from './components/charts/ModelSelector';
import classes from './MainContent.module.scss';

export const MainContent = () => {
  const { t } = useTranslation();
  const { models, isLoadingModels, predictions, isLoadingPredictions, getPredictions, clearPredictions, extendedConditions, setExtendedConditions, clearExtendedConditions, isConditionsEditMode, setConditionsEditMode } = useApi();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [expandedPanels, setExpandedPanels] = useState<string[]>([]);

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
      ...extendedConditions
    });
    setConditionsEditMode(false);
  };

  // Local form state
  const [formState, setFormState] = useState({
    temperature: '',
    humidity: '',
    wind_speed: '',
    is_holiday: false,
    is_weekend: false,
    hour: '',
    day_of_week: '',
    day_of_month: '',
    day_of_year: '',
    week_of_year: '',
    month: '',
    year: '',
    quarter: '',
    voltage: '',
    global_reactive_power: '',
    global_intensity: '',
    sub_metering_1: '',
    sub_metering_2: '',
    sub_metering_3: '',
    is_anomaly: false
  });

  const handlePanelChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels((prev) => (isExpanded ? [...prev, panel] : prev.filter((p) => p !== panel)));
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Sync form state to context when values change
  useEffect(() => {
    const conditions: IExtendedConditions = {};

    // Weather
    const weather: Record<string, number> = {};
    if (formState.temperature !== '') weather.temperature = Number(formState.temperature);
    if (formState.humidity !== '') weather.humidity = Number(formState.humidity);
    if (formState.wind_speed !== '') weather.wind_speed = Number(formState.wind_speed);
    if (Object.keys(weather).length > 0) conditions.weather = weather;

    // Calendar
    if (formState.is_holiday || formState.is_weekend) {
      conditions.calendar = {
        is_holiday: formState.is_holiday || undefined,
        is_weekend: formState.is_weekend || undefined
      };
    }

    // Time scenario
    const timeScenario: Record<string, number> = {};
    if (formState.hour !== '') timeScenario.hour = Number(formState.hour);
    if (formState.day_of_week !== '') timeScenario.day_of_week = Number(formState.day_of_week);
    if (formState.day_of_month !== '') timeScenario.day_of_month = Number(formState.day_of_month);
    if (formState.day_of_year !== '') timeScenario.day_of_year = Number(formState.day_of_year);
    if (formState.week_of_year !== '') timeScenario.week_of_year = Number(formState.week_of_year);
    if (formState.month !== '') timeScenario.month = Number(formState.month);
    if (formState.year !== '') timeScenario.year = Number(formState.year);
    if (formState.quarter !== '') timeScenario.quarter = Number(formState.quarter);
    if (Object.keys(timeScenario).length > 0) conditions.time_scenario = timeScenario;

    // Energy
    const energy: Record<string, number> = {};
    if (formState.voltage !== '') energy.voltage = Number(formState.voltage);
    if (formState.global_reactive_power !== '') energy.global_reactive_power = Number(formState.global_reactive_power);
    if (formState.global_intensity !== '') energy.global_intensity = Number(formState.global_intensity);
    if (Object.keys(energy).length > 0) conditions.energy = energy;

    // Zone consumption
    const zoneConsumption: Record<string, number> = {};
    if (formState.sub_metering_1 !== '') zoneConsumption.sub_metering_1 = Number(formState.sub_metering_1);
    if (formState.sub_metering_2 !== '') zoneConsumption.sub_metering_2 = Number(formState.sub_metering_2);
    if (formState.sub_metering_3 !== '') zoneConsumption.sub_metering_3 = Number(formState.sub_metering_3);
    if (Object.keys(zoneConsumption).length > 0) conditions.zone_consumption = zoneConsumption;

    // Anomaly
    if (formState.is_anomaly) conditions.is_anomaly = true;

    setExtendedConditions(conditions);
  }, [formState, setExtendedConditions]);

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
      clearExtendedConditions();
      setFormState({
        temperature: '',
        humidity: '',
        wind_speed: '',
        is_holiday: false,
        is_weekend: false,
        hour: '',
        day_of_week: '',
        day_of_month: '',
        day_of_year: '',
        week_of_year: '',
        month: '',
        year: '',
        quarter: '',
        voltage: '',
        global_reactive_power: '',
        global_intensity: '',
        sub_metering_1: '',
        sub_metering_2: '',
        sub_metering_3: '',
        is_anomaly: false
      });
      setExpandedPanels([]);
      setConditionsEditMode(true);
    }
  }, [clearPredictions, clearExtendedConditions, setConditionsEditMode]);

  // Check if there are any filled conditions
  const hasFilledConditions = useMemo(() => {
    return Object.keys(extendedConditions).length > 0;
  }, [extendedConditions]);

  // Get filled conditions for display
  const getFilledConditionsDisplay = useCallback(() => {
    const items: { label: string; value: string }[] = [];

    if (extendedConditions.weather) {
      const w = extendedConditions.weather;
      if (w.temperature !== undefined) items.push({ label: t('Температура (°C)'), value: String(w.temperature) });
      if (w.humidity !== undefined) items.push({ label: t('Вологість (%)'), value: String(w.humidity) });
      if (w.wind_speed !== undefined) items.push({ label: t('Швидкість вітру (м/с)'), value: String(w.wind_speed) });
    }

    if (extendedConditions.calendar) {
      const c = extendedConditions.calendar;
      if (c.is_holiday) items.push({ label: t('Свято'), value: '✓' });
      if (c.is_weekend) items.push({ label: t('Вихідний'), value: '✓' });
    }

    if (extendedConditions.time_scenario) {
      const ts = extendedConditions.time_scenario;
      if (ts.hour !== undefined) items.push({ label: t('Година'), value: String(ts.hour) });
      if (ts.day_of_week !== undefined) items.push({ label: t('День тижня'), value: String(ts.day_of_week) });
      if (ts.day_of_month !== undefined) items.push({ label: t('День місяця'), value: String(ts.day_of_month) });
      if (ts.day_of_year !== undefined) items.push({ label: t('День року'), value: String(ts.day_of_year) });
      if (ts.week_of_year !== undefined) items.push({ label: t('Тиждень року'), value: String(ts.week_of_year) });
      if (ts.month !== undefined) items.push({ label: t('Місяць'), value: String(ts.month) });
      if (ts.quarter !== undefined) items.push({ label: t('Квартал'), value: String(ts.quarter) });
      if (ts.year !== undefined) items.push({ label: t('Рік'), value: String(ts.year) });
    }

    if (extendedConditions.energy) {
      const e = extendedConditions.energy;
      if (e.voltage !== undefined) items.push({ label: t('Напруга (V)'), value: String(e.voltage) });
      if (e.global_reactive_power !== undefined) items.push({ label: t('Реактивна потужність'), value: String(e.global_reactive_power) });
      if (e.global_intensity !== undefined) items.push({ label: t('Сила струму (A)'), value: String(e.global_intensity) });
    }

    if (extendedConditions.zone_consumption) {
      const z = extendedConditions.zone_consumption;
      if (z.sub_metering_1 !== undefined) items.push({ label: t('Кухня (Wh)'), value: String(z.sub_metering_1) });
      if (z.sub_metering_2 !== undefined) items.push({ label: t('Пральня (Wh)'), value: String(z.sub_metering_2) });
      if (z.sub_metering_3 !== undefined) items.push({ label: t('Клімат-контроль (Wh)'), value: String(z.sub_metering_3) });
    }

    if (extendedConditions.is_anomaly) {
      items.push({ label: t('Аномалія'), value: '✓' });
    }

    return items;
  }, [extendedConditions, t]);

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
          {isConditionsEditMode ? (
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel>{t('Вибір моделей')}</InputLabel>
                <Select
                  multiple
                  value={selectedModelsForRequest}
                  onChange={handleModelSelectChange}
                  input={<OutlinedInput label={t('Вибір моделей')} />}
                  disabled={isLoadingModels}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {models &&
                    Object.keys(models).map((modelId) => (
                      <MenuItem key={modelId} value={modelId}>
                        <Checkbox checked={selectedModelsForRequest.includes(modelId)} />
                        {modelId}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <TextField
                label={t('Горизонт (днів)')}
                type="number"
                size="small"
                value={forecastHorizon}
                onChange={(e) => setForecastHorizon(Math.max(1, parseInt(e.target.value, 10) || 1))}
                sx={{ width: 130 }}
                slotProps={{ htmlInput: { min: 1, max: 30 } }}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={handleForecast}
                disabled={isLoadingPredictions || selectedModelsForRequest.length === 0}
              >
                {t('Сформувати прогноз')}
              </Button>
            </Stack>
          ) : null}

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

        {/* Extended conditions - View or Edit mode */}
        {isConditionsEditMode ? (
          <Box sx={{ mb: 2 }}>
            {/* Weather conditions */}
            <Accordion expanded={expandedPanels.includes('weather')} onChange={handlePanelChange('weather')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{t('Погодні умови')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
                  <TextField
                    value={formState.temperature}
                    onChange={handleInputChange('temperature')}
                    label={t('Температура (°C)')}
                    type="number"
                    size="small"
                    sx={{ width: 160 }}
                    placeholder="-10...40"
                  />
                  <TextField
                    value={formState.humidity}
                    onChange={handleInputChange('humidity')}
                    label={t('Вологість (%)')}
                    type="number"
                    size="small"
                    sx={{ width: 160 }}
                    placeholder="0-100"
                    slotProps={{ htmlInput: { min: 0, max: 100 } }}
                  />
                  <TextField
                    value={formState.wind_speed}
                    onChange={handleInputChange('wind_speed')}
                    label={t('Швидкість вітру (м/с)')}
                    type="number"
                    size="small"
                    sx={{ width: 180 }}
                    placeholder="≥0"
                    slotProps={{ htmlInput: { min: 0 } }}
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
                  <FormControlLabel
                    control={<Checkbox checked={formState.is_holiday} onChange={handleInputChange('is_holiday')} />}
                    label={t('Свято')}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={formState.is_weekend} onChange={handleInputChange('is_weekend')} />}
                    label={t('Вихідний')}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={formState.is_anomaly} onChange={handleInputChange('is_anomaly')} />}
                    label={t('Аномалія')}
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
                <TextField
                  value={formState.hour}
                  onChange={handleInputChange('hour')}
                  label={t('Година')}
                  type="number"
                  size="small"
                  sx={{ width: 120 }}
                  placeholder="0-23"
                  slotProps={{ htmlInput: { min: 0, max: 23 } }}
                />
                <TextField
                  value={formState.day_of_week}
                  onChange={handleInputChange('day_of_week')}
                  label={t('День тижня')}
                  type="number"
                  size="small"
                  sx={{ width: 130 }}
                  placeholder="0-6"
                  slotProps={{ htmlInput: { min: 0, max: 6 } }}
                />
                <TextField
                  value={formState.day_of_month}
                  onChange={handleInputChange('day_of_month')}
                  label={t('День місяця')}
                  type="number"
                  size="small"
                  sx={{ width: 130 }}
                  placeholder="1-31"
                  slotProps={{ htmlInput: { min: 1, max: 31 } }}
                />
                <TextField
                  value={formState.day_of_year}
                  onChange={handleInputChange('day_of_year')}
                  label={t('День року')}
                  type="number"
                  size="small"
                  sx={{ width: 130 }}
                  placeholder="1-366"
                  slotProps={{ htmlInput: { min: 1, max: 366 } }}
                />
                <TextField
                  value={formState.week_of_year}
                  onChange={handleInputChange('week_of_year')}
                  label={t('Тиждень року')}
                  type="number"
                  size="small"
                  sx={{ width: 140 }}
                  placeholder="1-53"
                  slotProps={{ htmlInput: { min: 1, max: 53 } }}
                />
                <TextField
                  value={formState.month}
                  onChange={handleInputChange('month')}
                  label={t('Місяць')}
                  type="number"
                  size="small"
                  sx={{ width: 120 }}
                  placeholder="1-12"
                  slotProps={{ htmlInput: { min: 1, max: 12 } }}
                />
                <TextField
                  value={formState.quarter}
                  onChange={handleInputChange('quarter')}
                  label={t('Квартал')}
                  type="number"
                  size="small"
                  sx={{ width: 120 }}
                  placeholder="1-4"
                  slotProps={{ htmlInput: { min: 1, max: 4 } }}
                />
                <TextField
                  value={formState.year}
                  onChange={handleInputChange('year')}
                  label={t('Рік')}
                  type="number"
                  size="small"
                  sx={{ width: 120 }}
                  placeholder="≥2000"
                  slotProps={{ htmlInput: { min: 2000 } }}
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
                <TextField
                  value={formState.voltage}
                  onChange={handleInputChange('voltage')}
                  label={t('Напруга (V)')}
                  type="number"
                  size="small"
                  sx={{ width: 150 }}
                  placeholder="≥0"
                  slotProps={{ htmlInput: { min: 0 } }}
                />
                <TextField
                  value={formState.global_reactive_power}
                  onChange={handleInputChange('global_reactive_power')}
                  label={t('Реактивна потужність')}
                  type="number"
                  size="small"
                  sx={{ width: 180 }}
                  placeholder="≥0"
                  slotProps={{ htmlInput: { min: 0 } }}
                />
                <TextField
                  value={formState.global_intensity}
                  onChange={handleInputChange('global_intensity')}
                  label={t('Сила струму (A)')}
                  type="number"
                  size="small"
                  sx={{ width: 160 }}
                  placeholder="≥0"
                  slotProps={{ htmlInput: { min: 0 } }}
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
                <TextField
                  value={formState.sub_metering_1}
                  onChange={handleInputChange('sub_metering_1')}
                  label={t('Кухня (Wh)')}
                  type="number"
                  size="small"
                  sx={{ width: 150 }}
                  placeholder="≥0"
                  slotProps={{ htmlInput: { min: 0 } }}
                />
                <TextField
                  value={formState.sub_metering_2}
                  onChange={handleInputChange('sub_metering_2')}
                  label={t('Пральня (Wh)')}
                  type="number"
                  size="small"
                  sx={{ width: 150 }}
                  placeholder="≥0"
                  slotProps={{ htmlInput: { min: 0 } }}
                />
                <TextField
                  value={formState.sub_metering_3}
                  onChange={handleInputChange('sub_metering_3')}
                  label={t('Клімат-контроль (Wh)')}
                  type="number"
                  size="small"
                  sx={{ width: 180 }}
                  placeholder="≥0"
                  slotProps={{ htmlInput: { min: 0 } }}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
          </Box>
        ) : (
          /* View mode - show all selected filters as chips */
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('Обрані фільтри')}:
              </Typography>
              <Tooltip title={t('Редагувати')}>
                <IconButton size="small" onClick={() => setConditionsEditMode(true)} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: hasFilledConditions ? 1 : 0 }}>
              <Chip label={`${t('Моделі: ')}${selectedModelsForRequest.join(', ')}`} size="small" variant="outlined" />
              <Chip label={`${t('Горизонт (днів)')}: ${forecastHorizon}`} size="small" variant="outlined" />
            </Stack>
            {hasFilledConditions && (
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {getFilledConditionsDisplay().map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.label}: ${item.value}`}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}

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
