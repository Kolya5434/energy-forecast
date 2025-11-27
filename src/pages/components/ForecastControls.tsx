import { useTranslation } from 'react-i18next';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SpeedIcon from '@mui/icons-material/Speed';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  type SelectChangeEvent
} from '@mui/material';

import type { ModelsApiResponse } from '../../types/api';

interface ForecastControlsProps {
  models: ModelsApiResponse | null;
  isLoadingModels: boolean;
  isLoadingPredictions: boolean;
  selectedModels: string[];
  forecastHorizon: number;
  onModelSelectChange: (event: SelectChangeEvent<string[]>) => void;
  onForecastHorizonChange: (horizon: number) => void;
  onForecast: () => void;
}

export const ForecastControls = ({
  models,
  isLoadingModels,
  isLoadingPredictions,
  selectedModels,
  forecastHorizon,
  onModelSelectChange,
  onForecastHorizonChange,
  onForecast
}: ForecastControlsProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
      <FormControl size="small" sx={{ minWidth: 250 }}>
        <InputLabel>{t('Вибір моделей')}</InputLabel>
        <Select
          multiple
          value={selectedModels}
          onChange={onModelSelectChange}
          input={<OutlinedInput label={t('Вибір моделей')} />}
          disabled={isLoadingModels}
          renderValue={(selected) => selected.join(', ')}
        >
          {models &&
            Object.keys(models).map((modelId) => {
              const info = models[modelId];
              return (
                <MenuItem key={modelId} value={modelId}>
                  <Checkbox checked={selectedModels.includes(modelId)} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <span>{modelId}</span>
                    {info?.avg_latency_ms !== null && info?.avg_latency_ms !== undefined && (
                      <Chip
                        size="small"
                        icon={<SpeedIcon sx={{ fontSize: 14 }} />}
                        label={`${info.avg_latency_ms.toFixed(0)}ms`}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>

      <TextField
        label={t('Горизонт (днів)')}
        type="number"
        size="small"
        value={forecastHorizon}
        onChange={(e) => onForecastHorizonChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
        sx={{ width: 130 }}
        slotProps={{ htmlInput: { min: 1, max: 30 } }}
      />

      <Button
        variant="contained"
        color="primary"
        startIcon={<PlayArrowIcon />}
        onClick={onForecast}
        disabled={isLoadingPredictions || selectedModels.length === 0}
      >
        {t('Сформувати прогноз')}
      </Button>
    </Stack>
  );
};
