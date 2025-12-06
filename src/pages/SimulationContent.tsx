import { useEffect, useMemo, useState } from 'react';
import { Dayjs } from 'dayjs';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ClearIcon from '@mui/icons-material/Clear';
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
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useApi } from '@/context/useApi';
import { clampValue } from '@/helpers/conditionsValidation';
import { SimulationChart, SimulationParametersDisplay } from '@/pages/components/simulation';
import { OPTIONS_SIMULATABLE_FEATURES } from '@/shared/constans';
import type { IFeatureOverride, ISimulationRequest, SimulationChartData } from '@/types/api';

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

const DEFAULT_FORM_VALUES: ISimulationFormInput = {
  selectedModel: '',
  forecastHorizon: 7,
  overrideDate: null,
  overrideFeature: 'day_of_week',
  overrideValue: '',
  temperature: '',
  humidity: '',
  wind_speed: '',
  is_holiday: false,
  is_weekend: false,
  hour: '',
  time_day_of_week: '',
  day_of_month: '',
  time_day_of_year: '',
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
};

// Reusable form field component
interface NumberFieldProps {
  name: keyof ISimulationFormInput;
  label: string;
  placeholder?: string;
  width?: number;
  min?: number;
  max?: number;
  control: ReturnType<typeof useForm<ISimulationFormInput>>['control'];
}

const NumberField = ({ name, label, placeholder, width = 150, min, max, control }: NumberFieldProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        label={label}
        type="number"
        size="small"
        sx={{ width }}
        placeholder={placeholder}
        slotProps={{ htmlInput: { min, max } }}
        onChange={(e) => field.onChange(clampValue(name, e.target.value))}
      />
    )}
  />
);

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

  const { control, handleSubmit, watch, setValue, reset } = useForm<ISimulationFormInput>({
    defaultValues: DEFAULT_FORM_VALUES
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

  const buildSimulationRequest = (data: ISimulationFormInput): ISimulationRequest => {
    const request: ISimulationRequest = {
      model_id: data.selectedModel,
      forecast_horizon: data.forecastHorizon
    };

    // Feature overrides (legacy)
    if (data.overrideDate && data.overrideFeature && data.overrideValue !== '') {
      const featureOverrides: IFeatureOverride[] = [{
        date: data.overrideDate.format('YYYY-MM-DD'),
        features: { [data.overrideFeature]: Number(data.overrideValue) || 0 }
      }];
      request.feature_overrides = featureOverrides;
    }

    // Weather conditions
    const weather: Record<string, number> = {};
    if (data.temperature !== '') weather.temperature = Number(data.temperature);
    if (data.humidity !== '') weather.humidity = Number(data.humidity);
    if (data.wind_speed !== '') weather.wind_speed = Number(data.wind_speed);
    if (Object.keys(weather).length > 0) request.weather = weather;

    // Calendar conditions
    if (data.is_holiday || data.is_weekend) {
      request.calendar = {
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
    if (Object.keys(timeScenario).length > 0) request.time_scenario = timeScenario;

    // Energy conditions
    const energy: Record<string, number> = {};
    if (data.voltage !== '') energy.voltage = Number(data.voltage);
    if (data.global_reactive_power !== '') energy.global_reactive_power = Number(data.global_reactive_power);
    if (data.global_intensity !== '') energy.global_intensity = Number(data.global_intensity);
    if (Object.keys(energy).length > 0) request.energy = energy;

    // Zone consumption
    const zoneConsumption: Record<string, number> = {};
    if (data.sub_metering_1 !== '') zoneConsumption.sub_metering_1 = Number(data.sub_metering_1);
    if (data.sub_metering_2 !== '') zoneConsumption.sub_metering_2 = Number(data.sub_metering_2);
    if (data.sub_metering_3 !== '') zoneConsumption.sub_metering_3 = Number(data.sub_metering_3);
    if (Object.keys(zoneConsumption).length > 0) request.zone_consumption = zoneConsumption;

    // Anomaly flag
    if (data.is_anomaly) request.is_anomaly = true;

    return request;
  };

  const onSubmit: SubmitHandler<ISimulationFormInput> = (data) => {
    if (!predictions) {
      getPredictions({ model_ids: [data.selectedModel], forecast_horizon: data.forecastHorizon });
    }

    const simulationRequest = buildSimulationRequest(data);
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
          <SimulationParametersDisplay
            request={lastSubmittedRequest}
            onEdit={() => setIsEditMode(true)}
            onClear={handleClear}
          />
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

              <NumberField
                name="forecastHorizon"
                label={t('Горизонт (днів)')}
                width={140}
                min={1}
                max={30}
                control={control}
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
                    <NumberField name="temperature" label={t('Температура (°C)')} placeholder="-10...40" width={160} control={control} />
                    <NumberField name="humidity" label={t('Вологість (%)')} placeholder="0-100" width={160} min={0} max={100} control={control} />
                    <NumberField name="wind_speed" label={t('Швидкість вітру (м/с)')} placeholder="≥0" width={180} min={0} control={control} />
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
                        <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label={t('Свято')} />
                      )}
                    />
                    <Controller
                      name="is_weekend"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label={t('Вихідний')} />
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
                    <NumberField name="hour" label={t('Година')} placeholder="0-23" width={120} min={0} max={23} control={control} />
                    <NumberField name="time_day_of_week" label={t('День тижня')} placeholder="0-6" width={130} min={0} max={6} control={control} />
                    <NumberField name="day_of_month" label={t('День місяця')} placeholder="1-31" width={130} min={1} max={31} control={control} />
                    <NumberField name="time_day_of_year" label={t('День року')} placeholder="1-366" width={130} min={1} max={366} control={control} />
                    <NumberField name="week_of_year" label={t('Тиждень року')} placeholder="1-53" width={140} min={1} max={53} control={control} />
                    <NumberField name="month" label={t('Місяць')} placeholder="1-12" width={120} min={1} max={12} control={control} />
                    <NumberField name="quarter" label={t('Квартал')} placeholder="1-4" width={120} min={1} max={4} control={control} />
                    <NumberField name="year" label={t('Рік')} placeholder="≥2000" width={120} min={2000} control={control} />
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
                    <NumberField name="voltage" label={t('Напруга (V)')} placeholder="≥0" min={0} control={control} />
                    <NumberField name="global_reactive_power" label={t('Реактивна потужність')} placeholder="≥0" width={180} min={0} control={control} />
                    <NumberField name="global_intensity" label={t('Сила струму (A)')} placeholder="≥0" width={160} min={0} control={control} />
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
                    <NumberField name="sub_metering_1" label={t('Кухня (Wh)')} placeholder="≥0" min={0} control={control} />
                    <NumberField name="sub_metering_2" label={t('Пральня (Wh)')} placeholder="≥0" min={0} control={control} />
                    <NumberField name="sub_metering_3" label={t('Клімат-контроль (Wh)')} placeholder="≥0" width={180} min={0} control={control} />
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

        <SimulationChart
          chartData={chartData}
          isLoading={isLoadingPredictions || isLoadingSimulation}
        />
      </Paper>
    </Box>
  );
};
