import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Typography,
  type SelectChangeEvent
} from '@mui/material';

import { LoadingFallback } from '@/components/LoadingFallback';
import { useApi } from '@/context/useApi';
import type { VisualizationRequest, VisualizationType } from '@/types/scientific';

const VISUALIZATION_TYPES: Array<{ value: VisualizationType; label: string; requiresModels: boolean }> = [
  { value: 'comparison', label: 'Порівняння моделей (Radar Chart)', requiresModels: true },
  { value: 'error_distribution', label: 'Розподіл помилок (Box Plot)', requiresModels: true },
  { value: 'forecast', label: 'Прогнози моделей (Line Plot)', requiresModels: true },
  { value: 'residuals', label: 'Аналіз залишків (Q-Q Plot)', requiresModels: true },
  { value: 'temporal_error', label: 'Часові паттерни помилок', requiresModels: true },
  { value: 'feature_importance', label: 'Важливість ознак (Bar Chart)', requiresModels: true },
  { value: 'correlation', label: 'Кореляційна матриця (Heatmap)', requiresModels: true }
];

export const VisualizationsTab = memo(function VisualizationsTab() {
  const { t } = useTranslation();
  const {
    models,
    isLoadingModels,
    visualizationResult,
    isLoadingVisualization,
    visualizationError,
    generateVisualization
  } = useApi();

  const [visualizationType, setVisualizationType] = useState<VisualizationType>('comparison');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [testDays, setTestDays] = useState<number>(30);

  // Get ML models only
  const mlModels = models
    ? Object.entries(models)
        .filter(([, info]) => info.type === 'ml')
        .map(([id]) => id)
    : [];

  const currentVizConfig = VISUALIZATION_TYPES.find((v) => v.value === visualizationType);

  const handleTypeChange = (event: SelectChangeEvent) => {
    setVisualizationType(event.target.value as VisualizationType);
  };

  const handleModelChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedModels(typeof value === 'string' ? value.split(',') : value);
  };

  const handleGenerate = () => {
    const request: VisualizationRequest = {
      visualization_type: visualizationType,
      test_size_days: testDays,
      model_ids: currentVizConfig?.requiresModels && selectedModels.length > 0 ? selectedModels : undefined
    };

    generateVisualization(request);
  };

  const handleDownload = () => {
    if (!visualizationResult) return;

    // Create download link
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${visualizationResult.image_base64}`;
    link.download = `${visualizationType}_${new Date().toISOString().split('T')[0]}.png`;
    link.click();
  };

  const canGenerate = () => {
    if (currentVizConfig?.requiresModels) {
      return selectedModels.length > 0;
    }
    return true;
  };

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('Налаштування візуалізації')}
        </Typography>

        <Stack spacing={2}>
          {/* Visualization Type */}
          <FormControl fullWidth>
            <InputLabel>{t('Тип візуалізації')}</InputLabel>
            <Select value={visualizationType} onChange={handleTypeChange}>
              {VISUALIZATION_TYPES.map((viz) => (
                <MenuItem key={viz.value} value={viz.value}>
                  {t(viz.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Model Selection (conditional) */}
          {currentVizConfig?.requiresModels && (
            <FormControl fullWidth>
              <InputLabel>{t('Виберіть моделі')}</InputLabel>
              <Select
                multiple
                value={selectedModels}
                onChange={handleModelChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                disabled={isLoadingModels}
              >
                {mlModels.map((modelId) => (
                  <MenuItem key={modelId} value={modelId}>
                    <Checkbox checked={selectedModels.indexOf(modelId) > -1} />
                    <ListItemText primary={modelId} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Test Days Slider */}
          <Box>
            <Typography gutterBottom>
              {t('Період даних (днів)')}: {testDays}
            </Typography>
            <Slider
              value={testDays}
              onChange={(_, newValue) => setTestDays(newValue as number)}
              min={7}
              max={90}
              step={1}
              marks={[
                { value: 7, label: '7' },
                { value: 30, label: '30' },
                { value: 60, label: '60' },
                { value: 90, label: '90' }
              ]}
            />
          </Box>

          {/* Generate Button */}
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleGenerate}
            disabled={!canGenerate() || isLoadingVisualization}
            fullWidth
          >
            {t('Згенерувати візуалізацію')}
          </Button>

          {currentVizConfig?.requiresModels && selectedModels.length === 0 && (
            <Alert severity="info">{t('Виберіть принаймні одну модель')}</Alert>
          )}
        </Stack>
      </Paper>

      {/* Loading State */}
      {isLoadingVisualization && <LoadingFallback />}

      {/* Error State */}
      {visualizationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {visualizationError}
        </Alert>
      )}

      {/* Results */}
      {visualizationResult && !isLoadingVisualization && (
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                {VISUALIZATION_TYPES.find((v) => v.value === visualizationResult.visualization_type)?.label}
              </Typography>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload} size="small">
                {t('Завантажити PNG')}
              </Button>
            </Stack>

            {/* Display Image */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default',
                borderRadius: 1,
                p: 2
              }}
            >
              <img
                src={`data:image/png;base64,${visualizationResult.image_base64}`}
                alt={visualizationResult.visualization_type}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            </Box>

            {/* Metadata */}
            {visualizationResult.metadata && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('Метадані')}: {JSON.stringify(visualizationResult.metadata, null, 2)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!visualizationResult && !isLoadingVisualization && !visualizationError && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ImageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">{t('Виберіть тип візуалізації та натисніть "Згенерувати"')}</Typography>
        </Paper>
      )}
    </Box>
  );
});
