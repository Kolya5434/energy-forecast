import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Chip, Collapse, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import type { IExtendedConditions } from '@/types/api';

interface ConditionItem {
  label: string;
  value: string;
}

interface ConditionsDisplayProps {
  conditions: IExtendedConditions;
  selectedModels?: string[];
  forecastHorizon?: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onClear: () => void;
}

export const ConditionsDisplay = memo(
  ({
    conditions,
    selectedModels,
    forecastHorizon,
    isExpanded,
    onToggleExpand,
    onEdit,
    onClear
  }: ConditionsDisplayProps) => {
    const { t } = useTranslation();

    const conditionItems = useMemo(() => {
      const items: ConditionItem[] = [];

      if (conditions.weather) {
        const w = conditions.weather;
        if (w.temperature !== undefined) items.push({ label: t('Температура (°C)'), value: String(w.temperature) });
        if (w.humidity !== undefined) items.push({ label: t('Вологість (%)'), value: String(w.humidity) });
        if (w.wind_speed !== undefined) items.push({ label: t('Швидкість вітру (м/с)'), value: String(w.wind_speed) });
      }

      if (conditions.calendar) {
        const c = conditions.calendar;
        if (c.is_holiday) items.push({ label: t('Свято'), value: '✓' });
        if (c.is_weekend) items.push({ label: t('Вихідний'), value: '✓' });
      }

      if (conditions.time_scenario) {
        const ts = conditions.time_scenario;
        if (ts.hour !== undefined) items.push({ label: t('Година'), value: String(ts.hour) });
        if (ts.day_of_week !== undefined) items.push({ label: t('День тижня'), value: String(ts.day_of_week) });
        if (ts.day_of_month !== undefined) items.push({ label: t('День місяця'), value: String(ts.day_of_month) });
        if (ts.day_of_year !== undefined) items.push({ label: t('День року'), value: String(ts.day_of_year) });
        if (ts.week_of_year !== undefined) items.push({ label: t('Тиждень року'), value: String(ts.week_of_year) });
        if (ts.month !== undefined) items.push({ label: t('Місяць'), value: String(ts.month) });
        if (ts.quarter !== undefined) items.push({ label: t('Квартал'), value: String(ts.quarter) });
        if (ts.year !== undefined) items.push({ label: t('Рік'), value: String(ts.year) });
      }

      if (conditions.energy) {
        const e = conditions.energy;
        if (e.voltage !== undefined) items.push({ label: t('Напруга (V)'), value: String(e.voltage) });
        if (e.global_reactive_power !== undefined)
          items.push({ label: t('Реактивна потужність'), value: String(e.global_reactive_power) });
        if (e.global_intensity !== undefined)
          items.push({ label: t('Сила струму (A)'), value: String(e.global_intensity) });
      }

      if (conditions.zone_consumption) {
        const z = conditions.zone_consumption;
        if (z.sub_metering_1 !== undefined) items.push({ label: t('Кухня (Wh)'), value: String(z.sub_metering_1) });
        if (z.sub_metering_2 !== undefined) items.push({ label: t('Пральня (Wh)'), value: String(z.sub_metering_2) });
        if (z.sub_metering_3 !== undefined)
          items.push({ label: t('Клімат-контроль (Wh)'), value: String(z.sub_metering_3) });
      }

      if (conditions.is_anomaly) {
        items.push({ label: t('Аномалія'), value: '✓' });
      }

      return items;
    }, [conditions, t]);

    const hasFilledConditions = conditionItems.length > 0;

    return (
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: isExpanded ? 1 : 0, cursor: 'pointer' }}
          onClick={onToggleExpand}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('Обрані фільтри')}:
            </Typography>
            <IconButton size="small">
              <ExpandMoreIcon
                sx={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s'
                }}
              />
            </IconButton>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('Редагувати')}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('Очистити')}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                color="secondary"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Collapse in={isExpanded}>
          {(selectedModels || forecastHorizon !== undefined) && (
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: hasFilledConditions ? 1 : 0 }}>
              {selectedModels && (
                <Chip label={`${t('Моделі: ')}${selectedModels.join(', ')}`} size="small" variant="outlined" />
              )}
              {forecastHorizon !== undefined && (
                <Chip label={`${t('Горизонт (днів)')}: ${forecastHorizon}`} size="small" variant="outlined" />
              )}
            </Stack>
          )}
          {hasFilledConditions && (
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {conditionItems.map((item, index) => (
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
        </Collapse>
      </Box>
    );
  }
);

ConditionsDisplay.displayName = 'ConditionsDisplay';
