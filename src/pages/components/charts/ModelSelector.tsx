import { useTranslation } from 'react-i18next';

import { Box, Chip, Stack, Typography } from '@mui/material';

import type { IPredictionResponse } from '@/types/api';

interface ModelSelectorProps {
  predictions: IPredictionResponse[] | null;
  selectedModels: string[];
  onModelToggle: (modelId: string) => void;
  onSelectAll: () => void;
  getModelColor: (modelId: string) => string;
}

export const ModelSelector = ({
  predictions,
  selectedModels,
  onModelToggle,
  onSelectAll,
  getModelColor
}: ModelSelectorProps) => {
  const { t } = useTranslation();

  if (!predictions || predictions.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          {t('Моделі:')}
        </Typography>
        <Chip
          label={t('Всі')}
          size="small"
          onClick={onSelectAll}
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {predictions.map((p) => {
            const isSelected = selectedModels.includes(p.model_id);
            const color = getModelColor(p.model_id);

            return (
              <Chip
                key={p.model_id}
                label={p.model_id}
                onClick={() => onModelToggle(p.model_id)}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  borderColor: isSelected ? color : undefined,
                  backgroundColor: isSelected ? color : undefined,
                  '&:hover': {
                    backgroundColor: isSelected ? color : undefined,
                    opacity: 0.8
                  }
                }}
              />
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
};
