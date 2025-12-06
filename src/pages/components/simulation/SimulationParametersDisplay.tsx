import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import type { ISimulationRequest } from '@/types/api';

interface SimulationParametersDisplayProps {
  request: ISimulationRequest;
  onEdit: () => void;
  onClear: () => void;
}

export const SimulationParametersDisplay = memo(({ request, onEdit, onClear }: SimulationParametersDisplayProps) => {
  const { t } = useTranslation();

  const filledConditions = useMemo(() => {
    const items: { label: string; value: string }[] = [];

    if (request.weather) {
      const w = request.weather;
      if (w.temperature !== undefined) items.push({ label: t('Температура (°C)'), value: String(w.temperature) });
      if (w.humidity !== undefined) items.push({ label: t('Вологість (%)'), value: String(w.humidity) });
      if (w.wind_speed !== undefined) items.push({ label: t('Швидкість вітру (м/с)'), value: String(w.wind_speed) });
    }

    if (request.calendar) {
      const c = request.calendar;
      if (c.is_holiday) items.push({ label: t('Свято'), value: '✓' });
      if (c.is_weekend) items.push({ label: t('Вихідний'), value: '✓' });
    }

    if (request.time_scenario) {
      const ts = request.time_scenario;
      if (ts.hour !== undefined) items.push({ label: t('Година'), value: String(ts.hour) });
      if (ts.day_of_week !== undefined) items.push({ label: t('День тижня'), value: String(ts.day_of_week) });
      if (ts.day_of_month !== undefined) items.push({ label: t('День місяця'), value: String(ts.day_of_month) });
      if (ts.day_of_year !== undefined) items.push({ label: t('День року'), value: String(ts.day_of_year) });
      if (ts.week_of_year !== undefined) items.push({ label: t('Тиждень року'), value: String(ts.week_of_year) });
      if (ts.month !== undefined) items.push({ label: t('Місяць'), value: String(ts.month) });
      if (ts.quarter !== undefined) items.push({ label: t('Квартал'), value: String(ts.quarter) });
      if (ts.year !== undefined) items.push({ label: t('Рік'), value: String(ts.year) });
    }

    if (request.energy) {
      const e = request.energy;
      if (e.voltage !== undefined) items.push({ label: t('Напруга (V)'), value: String(e.voltage) });
      if (e.global_reactive_power !== undefined) items.push({ label: t('Реактивна потужність'), value: String(e.global_reactive_power) });
      if (e.global_intensity !== undefined) items.push({ label: t('Сила струму (A)'), value: String(e.global_intensity) });
    }

    if (request.zone_consumption) {
      const z = request.zone_consumption;
      if (z.sub_metering_1 !== undefined) items.push({ label: t('Кухня (Wh)'), value: String(z.sub_metering_1) });
      if (z.sub_metering_2 !== undefined) items.push({ label: t('Пральня (Wh)'), value: String(z.sub_metering_2) });
      if (z.sub_metering_3 !== undefined) items.push({ label: t('Клімат-контроль (Wh)'), value: String(z.sub_metering_3) });
    }

    if (request.is_anomaly) {
      items.push({ label: t('Аномалія'), value: '✓' });
    }

    if (request.feature_overrides?.length) {
      const fo = request.feature_overrides[0];
      if (fo) {
        items.push({ label: t('Дата зміни'), value: fo.date });
        Object.entries(fo.features).forEach(([key, val]) => {
          items.push({ label: t(key), value: String(val) });
        });
      }
    }

    return items;
  }, [request, t]);

  return (
    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, border: 1, borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {t('Параметри симуляції')}:
        </Typography>
        <Chip label={`${t('Модель')}: ${request.model_id}`} size="small" />
        <Chip label={`${t('Горизонт (днів)')}: ${request.forecast_horizon}`} size="small" />
        <Tooltip title={t('Редагувати')}>
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      {filledConditions.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {filledConditions.map((item, index) => (
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
        <Button variant="outlined" color="secondary" startIcon={<ClearIcon />} onClick={onClear}>
          {t('Очистити')}
        </Button>
      </Stack>
    </Box>
  );
});

SimulationParametersDisplay.displayName = 'SimulationParametersDisplay';
