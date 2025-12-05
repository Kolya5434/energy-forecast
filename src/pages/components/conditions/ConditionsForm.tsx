import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material';

import type { ConditionsFormState } from '@/hooks/useConditionsForm';

interface ConditionsFormProps {
  formState: ConditionsFormState;
  onInputChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  expandedPanels: string[];
  onPanelChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  showAnomalyInCalendar?: boolean;
}

export const ConditionsForm = memo(
  ({ formState, onInputChange, expandedPanels, onPanelChange, showAnomalyInCalendar = false }: ConditionsFormProps) => {
    const { t } = useTranslation();

    return (
      <Box sx={{ mb: 2 }}>
        {/* Weather conditions */}
        <Accordion expanded={expandedPanels.includes('weather')} onChange={onPanelChange('weather')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('Погодні умови')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
              <TextField
                value={formState.temperature}
                onChange={onInputChange('temperature')}
                label={t('Температура (°C)')}
                type="number"
                size="small"
                sx={{ width: 160 }}
                placeholder="-10...40"
              />
              <TextField
                value={formState.humidity}
                onChange={onInputChange('humidity')}
                label={t('Вологість (%)')}
                type="number"
                size="small"
                sx={{ width: 160 }}
                placeholder="0-100"
                slotProps={{ htmlInput: { min: 0, max: 100 } }}
              />
              <TextField
                value={formState.wind_speed}
                onChange={onInputChange('wind_speed')}
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
        <Accordion expanded={expandedPanels.includes('calendar')} onChange={onPanelChange('calendar')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('Календарні умови')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" spacing={3}>
              <FormControlLabel
                control={<Checkbox checked={formState.is_holiday} onChange={onInputChange('is_holiday')} />}
                label={t('Свято')}
              />
              <FormControlLabel
                control={<Checkbox checked={formState.is_weekend} onChange={onInputChange('is_weekend')} />}
                label={t('Вихідний')}
              />
              {showAnomalyInCalendar && (
                <FormControlLabel
                  control={<Checkbox checked={formState.is_anomaly} onChange={onInputChange('is_anomaly')} />}
                  label={t('Аномалія')}
                />
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Time scenario */}
        <Accordion expanded={expandedPanels.includes('time')} onChange={onPanelChange('time')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('Часовий сценарій')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                value={formState.hour}
                onChange={onInputChange('hour')}
                label={t('Година')}
                type="number"
                size="small"
                sx={{ width: 120 }}
                placeholder="0-23"
                slotProps={{ htmlInput: { min: 0, max: 23 } }}
              />
              <TextField
                value={formState.day_of_week}
                onChange={onInputChange('day_of_week')}
                label={t('День тижня')}
                type="number"
                size="small"
                sx={{ width: 130 }}
                placeholder="0-6"
                slotProps={{ htmlInput: { min: 0, max: 6 } }}
              />
              <TextField
                value={formState.day_of_month}
                onChange={onInputChange('day_of_month')}
                label={t('День місяця')}
                type="number"
                size="small"
                sx={{ width: 130 }}
                placeholder="1-31"
                slotProps={{ htmlInput: { min: 1, max: 31 } }}
              />
              <TextField
                value={formState.day_of_year}
                onChange={onInputChange('day_of_year')}
                label={t('День року')}
                type="number"
                size="small"
                sx={{ width: 130 }}
                placeholder="1-366"
                slotProps={{ htmlInput: { min: 1, max: 366 } }}
              />
              <TextField
                value={formState.week_of_year}
                onChange={onInputChange('week_of_year')}
                label={t('Тиждень року')}
                type="number"
                size="small"
                sx={{ width: 140 }}
                placeholder="1-53"
                slotProps={{ htmlInput: { min: 1, max: 53 } }}
              />
              <TextField
                value={formState.month}
                onChange={onInputChange('month')}
                label={t('Місяць')}
                type="number"
                size="small"
                sx={{ width: 120 }}
                placeholder="1-12"
                slotProps={{ htmlInput: { min: 1, max: 12 } }}
              />
              <TextField
                value={formState.quarter}
                onChange={onInputChange('quarter')}
                label={t('Квартал')}
                type="number"
                size="small"
                sx={{ width: 120 }}
                placeholder="1-4"
                slotProps={{ htmlInput: { min: 1, max: 4 } }}
              />
              <TextField
                value={formState.year}
                onChange={onInputChange('year')}
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
        <Accordion expanded={expandedPanels.includes('energy')} onChange={onPanelChange('energy')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('Енергетичні параметри')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
              <TextField
                value={formState.voltage}
                onChange={onInputChange('voltage')}
                label={t('Напруга (V)')}
                type="number"
                size="small"
                sx={{ width: 150 }}
                placeholder="≥0"
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <TextField
                value={formState.global_reactive_power}
                onChange={onInputChange('global_reactive_power')}
                label={t('Реактивна потужність')}
                type="number"
                size="small"
                sx={{ width: 180 }}
                placeholder="≥0"
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <TextField
                value={formState.global_intensity}
                onChange={onInputChange('global_intensity')}
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
        <Accordion expanded={expandedPanels.includes('zone')} onChange={onPanelChange('zone')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('Споживання по зонах')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
              <TextField
                value={formState.sub_metering_1}
                onChange={onInputChange('sub_metering_1')}
                label={t('Кухня (Wh)')}
                type="number"
                size="small"
                sx={{ width: 150 }}
                placeholder="≥0"
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <TextField
                value={formState.sub_metering_2}
                onChange={onInputChange('sub_metering_2')}
                label={t('Пральня (Wh)')}
                type="number"
                size="small"
                sx={{ width: 150 }}
                placeholder="≥0"
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <TextField
                value={formState.sub_metering_3}
                onChange={onInputChange('sub_metering_3')}
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
    );
  }
);

ConditionsForm.displayName = 'ConditionsForm';
